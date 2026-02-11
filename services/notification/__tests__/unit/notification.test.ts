import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/index';
import { createBillReminder, createStreakWarning } from '../../src/controllers/push';
import { sendEmail, sendWelcomeEmail, sendWeeklyDigest } from '../../src/controllers/email';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = createApp();
const token = jwt.sign({ sub: 'user-1', email: 'test@test.com', role: 'player', partnerId: null }, JWT_SECRET, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${token}` };

describe('Notification API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('notification');
  });

  it('GET /notifications returns notifications', async () => {
    const res = await request(app).get('/notifications').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notifications');
    expect(res.body).toHaveProperty('unreadCount');
  });

  it('PUT /notifications/:id/read marks notification read', async () => {
    const res = await request(app).put('/notifications/n1/read').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it('PUT /notifications/read-all marks all read', async () => {
    const res = await request(app).put('/notifications/read-all').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('updatedCount');
  });

  it('GET /notifications/preferences returns preferences', async () => {
    const res = await request(app).get('/notifications/preferences').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pushEnabled');
    expect(res.body).toHaveProperty('emailDigest');
  });

  it('PUT /notifications/preferences updates preferences', async () => {
    const res = await request(app).put('/notifications/preferences').set(auth).send({ pushEnabled: false, emailDigest: 'never' });
    expect(res.status).toBe(200);
    expect(res.body.pushEnabled).toBe(false);
    expect(res.body.emailDigest).toBe('never');
  });

  it('PUT /notifications/preferences validates input', async () => {
    const res = await request(app).put('/notifications/preferences').set(auth).send({ emailDigest: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('POST /notifications/send creates notification', async () => {
    const res = await request(app).post('/notifications/send').set(auth).send({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'reward',
      title: 'Badge earned!',
      body: 'You earned the First Saver badge.',
      channels: ['push', 'in_app'],
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('deliveryStatus');
    expect(res.body.deliveryStatus.push).toBe('queued');
    expect(res.body.deliveryStatus.inApp).toBe('delivered');
  });

  it('POST /notifications/send validates required fields', async () => {
    const res = await request(app).post('/notifications/send').set(auth).send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('requires auth for all endpoints', async () => {
    expect((await request(app).get('/notifications')).status).toBe(401);
    expect((await request(app).put('/notifications/n1/read')).status).toBe(401);
    expect((await request(app).get('/notifications/preferences')).status).toBe(401);
  });
});

describe('Scheduled Notifications', () => {
  it('creates bill reminder scheduled 24h before due date', () => {
    const reminder = createBillReminder('user-1', 'Rent', '2026-03-01T00:00:00Z', 800);
    expect(reminder.type).toBe('bill_reminder');
    expect(reminder.status).toBe('pending');
    expect(new Date(reminder.scheduledFor).getTime()).toBeLessThan(new Date('2026-03-01T00:00:00Z').getTime());
    expect(reminder.body).toContain('Rent');
    expect(reminder.body).toContain('800');
  });

  it('creates streak warning before grace period ends', () => {
    const warning = createStreakWarning('user-1', 15, '2026-02-10T10:00:00Z');
    expect(warning.type).toBe('streak');
    expect(warning.title).toContain('15-day');
    expect(warning.status).toBe('pending');
  });
});

describe('Email Service', () => {
  it('sends welcome email', async () => {
    const result = await sendWelcomeEmail('test@example.com', 'Test User');
    expect(result).toBe(true);
  });

  it('sends weekly digest', async () => {
    const result = await sendWeeklyDigest('test@example.com', { xpEarned: 500, coinsEarned: 100, badgesEarned: 2, streakDays: 7 });
    expect(result).toBe(true);
  });

  it('returns false for unknown template', async () => {
    const result = await sendEmail('test@example.com', 'nonexistent' as any, {});
    expect(result).toBe(false);
  });
});
