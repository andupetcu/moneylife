import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/index';
import { categorizeTransaction, generateInsight, getProviderForCountry } from '../../src/controllers/mirror-mode';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = createApp();
const token = jwt.sign({ sub: 'user-1', email: 'test@test.com', role: 'player', partnerId: null }, JWT_SECRET, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${token}` };

describe('Banking API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('banking');
  });

  describe('POST /banking/link', () => {
    it('creates Plaid link token', async () => {
      const res = await request(app).post('/banking/link').set(auth).send({});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('linkToken');
      expect(res.body).toHaveProperty('expiration');
    });
  });

  describe('POST /banking/callback', () => {
    it('exchanges public token', async () => {
      const res = await request(app).post('/banking/callback').set(auth).send({
        publicToken: 'public-sandbox-xxx',
        institutionName: 'Chase',
      });
      expect(res.status).toBe(201);
      expect(res.body.provider).toBe('plaid');
      expect(res.body.status).toBe('active');
    });
  });

  describe('POST /banking/truelayer/auth', () => {
    it('generates auth URL', async () => {
      const res = await request(app).post('/banking/truelayer/auth').set(auth).send({});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('authUrl');
      expect(res.body).toHaveProperty('state');
    });
  });

  describe('POST /banking/truelayer/callback', () => {
    it('exchanges code', async () => {
      const res = await request(app).post('/banking/truelayer/callback').set(auth).send({ code: 'auth-code', state: 'state-1' });
      expect(res.status).toBe(201);
      expect(res.body.provider).toBe('truelayer');
    });
  });

  describe('POST /banking/saltedge/connect', () => {
    it('creates connect session', async () => {
      const res = await request(app).post('/banking/saltedge/connect').set(auth).send({});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('connectUrl');
    });
  });

  describe('GET /banking/accounts', () => {
    it('returns accounts', async () => {
      const res = await request(app).get('/banking/accounts').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accounts');
    });
  });

  describe('GET /banking/transactions', () => {
    it('returns transactions', async () => {
      const res = await request(app).get('/banking/transactions').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('transactions');
    });
  });

  describe('DELETE /banking/accounts/:id', () => {
    it('disconnects account', async () => {
      const res = await request(app).delete('/banking/accounts/acc-1').set(auth);
      expect(res.status).toBe(204);
    });
  });

  describe('GET /banking/mirror-comparison', () => {
    it('returns mirror comparison', async () => {
      const res = await request(app).get('/banking/mirror-comparison?gameId=g1&month=2026-01').set(auth);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('comparisons');
      expect(res.body).toHaveProperty('insights');
    });
  });
});

describe('Transaction Categorization', () => {
  it('categorizes Starbucks as food', () => {
    expect(categorizeTransaction('STARBUCKS #12345')).toBe('food');
  });

  it('categorizes UBER TRIP as transport', () => {
    expect(categorizeTransaction('UBER TRIP')).toBe('transport');
  });

  it('categorizes UBER EATS as food', () => {
    expect(categorizeTransaction('UBER *EATS')).toBe('food');
  });

  it('categorizes NETFLIX as subscriptions', () => {
    expect(categorizeTransaction('NETFLIX.COM')).toBe('subscriptions');
  });

  it('categorizes gym as health', () => {
    expect(categorizeTransaction('PLANET FITNESS MEMBERSHIP')).toBe('health');
  });

  it('categorizes Amazon as shopping', () => {
    expect(categorizeTransaction('AMAZON.COM')).toBe('shopping');
  });

  it('categorizes gas station as transport', () => {
    expect(categorizeTransaction('SHELL OIL 12345')).toBe('transport');
  });

  it('returns uncategorized for unknown merchant', () => {
    expect(categorizeTransaction('RANDOM STORE XYZ')).toBe('uncategorized');
  });

  it('uses merchant name over description', () => {
    expect(categorizeTransaction('Random description', 'Starbucks')).toBe('food');
  });
});

describe('Mirror Mode Insights', () => {
  it('generates overspending insight', () => {
    const insight = generateInsight('food', 300, 450);
    expect(insight).toContain('more');
    expect(insight).toContain('food');
  });

  it('generates positive insight', () => {
    const insight = generateInsight('transport', 200, 100);
    expect(insight).toContain('Great');
    expect(insight).toContain('less');
  });

  it('generates aligned insight', () => {
    const insight = generateInsight('housing', 800, 850);
    expect(insight).toContain('aligned');
  });

  it('handles zero amounts', () => {
    expect(generateInsight('food', 0, 100)).toBe('');
    expect(generateInsight('food', 100, 0)).toBe('');
  });
});

describe('Provider Fallback', () => {
  it('returns plaid first for US', () => {
    expect(getProviderForCountry('US')[0]).toBe('plaid');
  });

  it('returns truelayer first for GB', () => {
    expect(getProviderForCountry('GB')[0]).toBe('truelayer');
  });

  it('returns salt_edge for unsupported country', () => {
    expect(getProviderForCountry('ZZ')).toEqual(['salt_edge']);
  });

  it('returns salt_edge for Romania', () => {
    expect(getProviderForCountry('RO')).toEqual(['salt_edge']);
  });
});
