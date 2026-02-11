import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/index';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = createApp();

function makeToken(payload: Record<string, unknown> = {}): string {
  return jwt.sign(
    { sub: 'user-1', email: 'test@test.com', role: 'player', partnerId: null, ...payload },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
}

describe('Rewards API Integration', () => {
  describe('GET /health', () => {
    it('returns 200 with service info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('rewards');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /rewards/summary', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app).get('/rewards/summary');
      expect(res.status).toBe(401);
    });

    it('returns summary for authenticated user', async () => {
      const res = await request(app)
        .get('/rewards/summary')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('userId', 'user-1');
      expect(res.body).toHaveProperty('totalXp');
      expect(res.body).toHaveProperty('totalCoins');
      expect(res.body).toHaveProperty('tier');
      expect(res.body).toHaveProperty('streakMultiplier');
    });

    it('includes partner context when present', async () => {
      const res = await request(app)
        .get('/rewards/summary')
        .set('Authorization', `Bearer ${makeToken({ partnerId: 'partner-1' })}`);
      expect(res.status).toBe(200);
      expect(res.body.partnerId).toBe('partner-1');
    });
  });

  describe('GET /rewards/badges', () => {
    it('returns badge catalog', async () => {
      const res = await request(app)
        .get('/rewards/badges')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.badges).toBeInstanceOf(Array);
      expect(res.body.badges.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('earnedCount');
      expect(res.body).toHaveProperty('totalCount');
    });

    it('filters hidden badges by default', async () => {
      const res = await request(app)
        .get('/rewards/badges')
        .set('Authorization', `Bearer ${makeToken()}`);
      const hiddenBadges = res.body.badges.filter((b: any) => b.hidden);
      // Hidden badges not earned should not appear
      expect(hiddenBadges.length).toBe(0);
    });

    it('includes hidden badges when requested', async () => {
      const res = await request(app)
        .get('/rewards/badges?includeHidden=true')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.body.badges.length).toBeGreaterThan(60);
    });
  });

  describe('GET /rewards/streaks', () => {
    it('returns streak state', async () => {
      const res = await request(app)
        .get('/rewards/streaks')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('currentStreak');
      expect(res.body).toHaveProperty('longestStreak');
      expect(res.body).toHaveProperty('multiplier');
    });
  });

  describe('GET /rewards/catalog', () => {
    it('returns reward catalog', async () => {
      const res = await request(app)
        .get('/rewards/catalog')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
    });

    it('respects pagination', async () => {
      const res = await request(app)
        .get('/rewards/catalog?limit=5&offset=0')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.limit).toBe(5);
    });
  });

  describe('GET /rewards/history', () => {
    it('returns coin history', async () => {
      const res = await request(app)
        .get('/rewards/history')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('entries');
      expect(res.body).toHaveProperty('total');
    });
  });

  describe('POST /rewards/redeem', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/rewards/redeem')
        .send({ catalogItemId: '550e8400-e29b-41d4-a716-446655440000', idempotencyKey: '550e8400-e29b-41d4-a716-446655440001' });
      expect(res.status).toBe(401);
    });

    it('validates request body', async () => {
      const res = await request(app)
        .post('/rewards/redeem')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ catalogItemId: 'not-a-uuid' });
      expect(res.status).toBe(400);
    });

    it('accepts valid redemption request', async () => {
      const res = await request(app)
        .post('/rewards/redeem')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({
          catalogItemId: '550e8400-e29b-41d4-a716-446655440000',
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440001',
        });
      // Will return 201 (stub) since coin balance check passes with 0 cost
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'pending');
    });
  });

  describe('Auth middleware', () => {
    it('rejects expired tokens', async () => {
      const token = jwt.sign(
        { sub: 'user-1', email: 'test@test.com', role: 'player' },
        JWT_SECRET,
        { expiresIn: '-1h' },
      );
      const res = await request(app)
        .get('/rewards/summary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
    });

    it('rejects invalid tokens', async () => {
      const res = await request(app)
        .get('/rewards/summary')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('rejects missing Bearer prefix', async () => {
      const res = await request(app)
        .get('/rewards/summary')
        .set('Authorization', makeToken());
      expect(res.status).toBe(401);
    });
  });
});
