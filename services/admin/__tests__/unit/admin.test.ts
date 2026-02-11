import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/index';
import { checkXpVelocity, checkCoinVelocity, DETECTION_RULES } from '../../src/controllers/anti-cheat';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = createApp();
const adminToken = jwt.sign({ sub: 'admin-1', email: 'admin@test.com', role: 'system_admin', partnerId: null }, JWT_SECRET, { expiresIn: '1h' });
const playerToken = jwt.sign({ sub: 'user-1', email: 'user@test.com', role: 'player', partnerId: null }, JWT_SECRET, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${adminToken}` };

describe('Admin API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('admin');
  });

  it('rejects non-admin for all admin routes', async () => {
    const res = await request(app).get('/admin/users').set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
  });

  describe('GET /admin/users', () => {
    it('returns user list', async () => {
      const res = await request(app).get('/admin/users').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('total');
    });

    it('supports search', async () => {
      const res = await request(app).get('/admin/users?q=test&limit=5').set(auth);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('returns user details', async () => {
      const res = await request(app).get('/admin/users/u1').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('totalXp');
    });
  });

  describe('PUT /admin/users/:id', () => {
    it('updates user role', async () => {
      const res = await request(app).put('/admin/users/u1').set(auth).send({ role: 'teacher' });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('teacher');
    });
  });

  describe('PUT /admin/users/:id/suspend', () => {
    it('suspends user with reason', async () => {
      const res = await request(app).put('/admin/users/u1/suspend').set(auth).send({ reason: 'Anti-cheat violation' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('suspended');
      expect(res.body.reason).toBe('Anti-cheat violation');
    });

    it('requires reason', async () => {
      const res = await request(app).put('/admin/users/u1/suspend').set(auth).send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin/games', () => {
    it('returns games list', async () => {
      const res = await request(app).get('/admin/games').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('games');
    });
  });

  describe('GET /admin/games/:id', () => {
    it('returns full game state', async () => {
      const res = await request(app).get('/admin/games/g1').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accounts');
    });
  });

  describe('PUT /admin/games/:id/reset', () => {
    it('resets game with reason', async () => {
      const res = await request(app).put('/admin/games/g1/reset').set(auth).send({ reason: 'Debug request', resetTo: 'level_start' });
      expect(res.status).toBe(200);
      expect(res.body.resetTo).toBe('level_start');
      expect(res.body.resetBy).toBe('admin-1');
    });
  });

  describe('GET /admin/analytics', () => {
    it('returns analytics', async () => {
      const res = await request(app).get('/admin/analytics').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalUsers');
    });
  });

  describe('GET /admin/anti-cheat/flagged', () => {
    it('returns flagged accounts', async () => {
      const res = await request(app).get('/admin/anti-cheat/flagged').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('flags');
    });
  });

  describe('PUT /admin/anti-cheat/:id/resolve', () => {
    it('resolves flag', async () => {
      const res = await request(app).put('/admin/anti-cheat/f1/resolve').set(auth).send({ resolution: 'dismissed', notes: 'False positive' });
      expect(res.status).toBe(200);
      expect(res.body.resolution).toBe('dismissed');
      expect(res.body.resolvedBy).toBe('admin-1');
    });

    it('validates resolution type', async () => {
      const res = await request(app).put('/admin/anti-cheat/f1/resolve').set(auth).send({ resolution: 'invalid' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin/system/health', () => {
    it('returns system health', async () => {
      const res = await request(app).get('/admin/system/health').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('services');
      expect(res.body).toHaveProperty('uptime');
    });
  });
});

describe('Anti-Cheat Detection Rules', () => {
  it('flags XP velocity above threshold', () => {
    expect(checkXpVelocity(200)).toBe(true);
    expect(checkXpVelocity(195)).toBe(false);
    expect(checkXpVelocity(100)).toBe(false);
  });

  it('flags coin velocity above threshold', () => {
    expect(checkCoinVelocity(150)).toBe(true);
    expect(checkCoinVelocity(100)).toBe(false);
    expect(checkCoinVelocity(50)).toBe(false);
  });

  it('has correct XP max per day', () => {
    // 25 (max card XP) × 4 (max cards) × 1.5 (max streak) × 1.3 (hard difficulty)
    expect(DETECTION_RULES.XP_VELOCITY.maxXpPerDay).toBe(195);
  });

  it('defines all expected detection rules', () => {
    expect(DETECTION_RULES).toHaveProperty('XP_VELOCITY');
    expect(DETECTION_RULES).toHaveProperty('COIN_VELOCITY');
    expect(DETECTION_RULES).toHaveProperty('LEVEL_SPEED');
    expect(DETECTION_RULES).toHaveProperty('BALANCE_ANOMALY');
    expect(DETECTION_RULES).toHaveProperty('RAPID_REDEMPTION');
    expect(DETECTION_RULES).toHaveProperty('MULTI_ACCOUNT');
  });
});
