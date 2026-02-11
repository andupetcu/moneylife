import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/index';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = createApp();

const adminToken = jwt.sign({ sub: 'admin-1', email: 'admin@test.com', role: 'system_admin', partnerId: null }, JWT_SECRET, { expiresIn: '1h' });
const partnerAdminToken = jwt.sign({ sub: 'padmin-1', email: 'padmin@test.com', role: 'partner_admin', partnerId: 'partner-1' }, JWT_SECRET, { expiresIn: '1h' });
const playerToken = jwt.sign({ sub: 'user-1', email: 'user@test.com', role: 'player', partnerId: null }, JWT_SECRET, { expiresIn: '1h' });

describe('Partner API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('partner');
  });

  describe('POST /partners', () => {
    it('creates partner as system admin', async () => {
      const res = await request(app).post('/partners').set('Authorization', `Bearer ${adminToken}`).send({
        name: 'Test Bank', slug: 'test-bank', contactEmail: 'admin@testbank.com',
      });
      expect(res.status).toBe(201);
      expect(res.body.slug).toBe('test-bank');
    });

    it('rejects non-admin', async () => {
      const res = await request(app).post('/partners').set('Authorization', `Bearer ${playerToken}`).send({
        name: 'Test', slug: 'test', contactEmail: 'a@b.com',
      });
      expect(res.status).toBe(403);
    });

    it('validates slug format', async () => {
      const res = await request(app).post('/partners').set('Authorization', `Bearer ${adminToken}`).send({
        name: 'Test', slug: 'Invalid Slug!', contactEmail: 'a@b.com',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /partners/:id', () => {
    it('returns partner info', async () => {
      const res = await request(app).get('/partners/p1').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('p1');
    });
  });

  describe('PUT /partners/:id/theme', () => {
    it('updates theme as partner admin', async () => {
      const res = await request(app).put('/partners/p1/theme').set('Authorization', `Bearer ${partnerAdminToken}`).send({
        primaryColor: '#FF0000', coinName: 'StarPoints',
      });
      expect(res.status).toBe(200);
      expect(res.body.theme.primaryColor).toBe('#FF0000');
      expect(res.body.theme.coinName).toBe('StarPoints');
    });

    it('rejects invalid color format', async () => {
      const res = await request(app).put('/partners/p1/theme').set('Authorization', `Bearer ${partnerAdminToken}`).send({
        primaryColor: 'red',
      });
      expect(res.status).toBe(400);
    });

    it('rejects player role', async () => {
      const res = await request(app).put('/partners/p1/theme').set('Authorization', `Bearer ${playerToken}`).send({
        primaryColor: '#FF0000',
      });
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /partners/:id/features', () => {
    it('updates feature flags', async () => {
      const res = await request(app).put('/partners/p1/features').set('Authorization', `Bearer ${partnerAdminToken}`).send({
        features: { enable_mirror_mode: true, enable_investments: true },
      });
      expect(res.status).toBe(200);
      expect(res.body.features.enable_mirror_mode).toBe(true);
    });
  });

  describe('GET /partners/:id/features', () => {
    it('returns feature flags', async () => {
      const res = await request(app).get('/partners/p1/features').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('features');
      expect(res.body.features).toHaveProperty('enable_classroom_mode');
    });
  });

  describe('GET /partners/:id/analytics', () => {
    it('returns analytics for partner admin', async () => {
      const res = await request(app).get('/partners/p1/analytics').set('Authorization', `Bearer ${partnerAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('engagement');
      expect(res.body).toHaveProperty('rewards');
    });

    it('rejects player role', async () => {
      const res = await request(app).get('/partners/p1/analytics').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /partners/:id/rewards', () => {
    it('adds reward item', async () => {
      const res = await request(app).post('/partners/p1/rewards').set('Authorization', `Bearer ${partnerAdminToken}`).send({
        name: '$10 Coffee Card', coinCost: 960, category: 'gift_card', fulfillmentType: 'instant_digital',
      });
      expect(res.status).toBe(201);
      expect(res.body.partnerId).toBe('p1');
    });
  });

  describe('GET /partners/:id/rewards', () => {
    it('returns partner rewards', async () => {
      const res = await request(app).get('/partners/p1/rewards').set('Authorization', `Bearer ${playerToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
    });
  });
});
