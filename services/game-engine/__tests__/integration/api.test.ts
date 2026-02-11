import request from 'supertest';
import { createApp } from '../../src/index';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

function makeToken(userId: string = 'user-1'): string {
  return jwt.sign({ sub: userId, email: 'test@example.com', role: 'player', partnerId: null }, JWT_SECRET, { expiresIn: '15m' });
}

const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockRelease = jest.fn();
const mockClientQuery = jest.fn();
const mockPool = {
  query: mockQuery,
  connect: mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  }),
} as unknown as Pool;

function resetMocks(): void {
  mockQuery.mockReset();
  mockConnect.mockReset();
  mockClientQuery.mockReset();
  mockRelease.mockReset();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
}

describe('Game Engine Integration Tests', () => {
  const app = createApp(mockPool);
  const token = makeToken();

  beforeEach(() => resetMocks());

  describe('GET /health', () => {
    it('should return health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('game-engine');
    });
  });

  describe('POST /games', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).post('/games').send({ persona: 'teen', difficulty: 'easy', currencyCode: 'USD' });
      expect(res.status).toBe(401);
    });

    it('should reject invalid persona', async () => {
      const res = await request(app)
        .post('/games')
        .set('Authorization', `Bearer ${token}`)
        .send({ persona: 'invalid', difficulty: 'easy', currencyCode: 'USD' });
      expect(res.status).toBe(400);
    });

    it('should create game with valid input', async () => {
      mockClientQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'game-new', user_id: 'user-1', persona: 'young_adult', difficulty: 'normal', currency_code: 'USD', status: 'active', current_level: 1, total_xp: 0, total_coins: 0 }] }) // INSERT game
        .mockResolvedValueOnce({}) // INSERT account 1
        .mockResolvedValueOnce({}) // INSERT account 2
        .mockResolvedValueOnce({}); // COMMIT

      mockQuery.mockResolvedValueOnce({ rows: [
        { id: 'acc-1', type: 'checking', name: 'Checking', balance: '200000', interest_rate: '0.0001', credit_limit: null, status: 'active' },
        { id: 'acc-2', type: 'savings', name: 'Savings', balance: '50000', interest_rate: '0.025', credit_limit: null, status: 'active' },
      ] }); // findAccountsByGameId

      const res = await request(app)
        .post('/games')
        .set('Authorization', `Bearer ${token}`)
        .send({ persona: 'young_adult', difficulty: 'normal', currencyCode: 'USD' });

      expect(res.status).toBe(201);
      expect(res.body.gameId).toBe('game-new');
      expect(res.body.initialState.accounts).toHaveLength(2);
    });
  });

  describe('GET /games/:id', () => {
    const gameRow = {
      id: 'game-1',
      user_id: 'user-1',
      partner_id: null,
      persona: 'young_adult',
      difficulty: 'normal',
      region: 'us',
      currency_code: 'USD',
      current_game_date: new Date('2026-01-15'),
      current_level: 1,
      total_xp: 100,
      total_coins: 50,
      chi_score: 650,
      chi_payment_history: 70,
      chi_utilization: 80,
      chi_credit_age: 30,
      chi_credit_mix: 30,
      chi_new_inquiries: 100,
      budget_score: 50,
      net_worth: '200000',
      monthly_income: '350000',
      streak_current: 3,
      state_version: '1',
      status: 'active',
      deleted_at: null,
    };

    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/games/game-1');
      expect(res.status).toBe(401);
    });

    it('should return 404 for nonexistent game', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // findGameById
      const res = await request(app).get('/games/game-1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should return 403 for another users game', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ ...gameRow, user_id: 'other-user' }] });
      const res = await request(app).get('/games/game-1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should return game state', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [gameRow] }) // findGameById
        .mockResolvedValueOnce({ rows: [{ id: 'acc-1', type: 'checking', name: 'Checking', balance: '200000', interest_rate: '0.0001', credit_limit: null, status: 'active' }] }) // accounts
        .mockResolvedValueOnce({ rows: [] }); // pending cards

      const res = await request(app).get('/games/game-1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('game-1');
      expect(res.body.persona).toBe('young_adult');
      expect(res.body.accounts).toHaveLength(1);
      expect(res.body.currentDate.year).toBe(2026);
    });
  });

  describe('POST /games/:id/actions', () => {
    it('should reject without idempotency key', async () => {
      const res = await request(app)
        .post('/games/game-1/actions')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'advance_day' });
      expect(res.status).toBe(400);
    });

    it('should reject invalid action type', async () => {
      const res = await request(app)
        .post('/games/game-1/actions')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'invalid', idempotencyKey: '550e8400-e29b-41d4-a716-446655440000' });
      expect(res.status).toBe(400);
    });

    it('should return cached response for duplicate idempotency key', async () => {
      const cached = { success: true, newState: {}, events: [], rewards: [] };
      mockQuery
        .mockResolvedValueOnce({ rows: [{ response: cached }] }); // idempotency check

      const res = await request(app)
        .post('/games/game-1/actions')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'advance_day', idempotencyKey: '550e8400-e29b-41d4-a716-446655440000' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(cached);
    });

    it('should return 404 for nonexistent game', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // no idempotency hit
        .mockResolvedValueOnce({ rows: [] }); // game not found

      const res = await request(app)
        .post('/games/game-1/actions')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'advance_day', idempotencyKey: '550e8400-e29b-41d4-a716-446655440000' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /games/:id/cards', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/games/game-1/cards');
      expect(res.status).toBe(401);
    });

    it('should return 404 for nonexistent game', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get('/games/game-1/cards').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should return pending cards', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] })
        .mockResolvedValueOnce({ rows: [
          { id: 'pc-1', card_id: 'DC-YA-FOOD-001', title: 'Meal Prep', description: 'desc', category: 'groceries', options: '[]', presented_game_date: '2026-01-15', expires_game_date: '2026-01-18', status: 'pending' },
        ] });

      const res = await request(app).get('/games/game-1/cards').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.cards).toHaveLength(1);
      expect(res.body.cards[0].cardId).toBe('DC-YA-FOOD-001');
    });
  });

  describe('GET /games/:id/monthly-report/:year/:month', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/games/game-1/monthly-report/2026/1');
      expect(res.status).toBe(401);
    });

    it('should return 404 for nonexistent report', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] }) // game
        .mockResolvedValueOnce({ rows: [] }); // no report

      const res = await request(app).get('/games/game-1/monthly-report/2026/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should reject invalid month', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] });

      const res = await request(app).get('/games/game-1/monthly-report/2026/13').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('should return report', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] })
        .mockResolvedValueOnce({ rows: [{
          game_id: 'game-1', game_month: '2026-01-01',
          income_total: '350000', expense_total: '200000', savings_change: '50000',
          investment_change: '0', debt_change: '0', net_worth: '250000',
          chi_score: 650, budget_score: 75, xp_earned: 200, coins_earned: 50,
          highlights: ['Paid all bills on time'],
        }] });

      const res = await request(app).get('/games/game-1/monthly-report/2026/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.income).toBe(350000);
      expect(res.body.budgetScore).toBe(75);
    });
  });

  describe('GET /games/:id/transactions', () => {
    it('should reject unauthenticated', async () => {
      const res = await request(app).get('/games/game-1/transactions');
      expect(res.status).toBe(401);
    });

    it('should return transactions', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] })
        .mockResolvedValueOnce({ rows: [
          { id: 'tx-1', game_date: '2026-01-15', type: 'income', category: 'salary', amount: '350000', balance_after: '550000', description: 'Monthly salary', is_automated: true },
        ] });

      const res = await request(app).get('/games/game-1/transactions').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.transactions).toHaveLength(1);
      expect(res.body.transactions[0].amount).toBe(350000);
    });

    it('should respect limit parameter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/games/game-1/transactions?limit=10').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(10);
    });

    it('should cap limit at 100', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'game-1', user_id: 'user-1', deleted_at: null }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/games/game-1/transactions?limit=500').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
    });
  });
});
