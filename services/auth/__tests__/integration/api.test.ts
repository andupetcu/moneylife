import request from 'supertest';
import { createApp } from '../../src/index';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

process.env.NODE_ENV = 'test';

// Mock pg Pool
const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockRelease = jest.fn();
const mockPool = {
  query: mockQuery,
  connect: mockConnect.mockResolvedValue({ query: mockQuery, release: mockRelease }),
} as unknown as Pool;

function resetMocks(): void {
  mockQuery.mockReset();
  mockConnect.mockReset();
  mockRelease.mockReset();
  mockConnect.mockResolvedValue({ query: mockQuery, release: mockRelease });
}

let testPasswordHash: string;

beforeAll(async () => {
  testPasswordHash = await bcrypt.hash('testpass123', 4); // use 4 rounds for speed in tests
});

describe('Auth Integration Tests', () => {
  const app = createApp(mockPool);

  beforeEach(() => {
    resetMocks();
  });

  describe('GET /health', () => {
    it('should return health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('auth');
    });

    it('should include timestamp', async () => {
      const res = await request(app).get('/health');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      // No X-Api-Key header = no partner context query
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // findUserByEmail - not found
        .mockResolvedValueOnce({ rows: [{ id: 'new-user-id', email: 'test@example.com', display_name: 'Test', role: 'player', partner_id: null }] }) // createUser
        .mockResolvedValueOnce({ rows: [] }) // insert session
        .mockResolvedValueOnce({ rows: [] }); // trackDevice (upsert)

      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'securepass123', displayName: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe('new-user-id');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return user info in response', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'a@b.com', display_name: 'AB', role: 'player', partner_id: null }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/register')
        .send({ email: 'a@b.com', password: 'securepass123', displayName: 'AB' });

      expect(res.body.user.email).toBe('a@b.com');
      expect(res.body.user.displayName).toBe('AB');
    });

    it('should return 409 for existing user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'existing', email: 'test@example.com' }] });

      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'securepass123', displayName: 'Test' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('USER_ALREADY_EXISTS');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'bad', password: 'securepass123', displayName: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'short', displayName: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing displayName', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'securepass123' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty body', async () => {
      const res = await request(app).post('/register').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /login', () => {
    const makeValidUser = () => ({
      id: 'user-1',
      email: 'test@example.com',
      password_hash: testPasswordHash,
      display_name: 'Test',
      role: 'player',
      status: 'active',
      partner_id: null,
    });

    it('should login with valid credentials', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [makeValidUser()] }) // findUserByEmail
        .mockResolvedValueOnce({ rows: [] }) // insert session
        .mockResolvedValueOnce({ rows: [] }); // trackDevice

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'testpass123' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.id).toBe('user-1');
    });

    it('should return user details on login', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [makeValidUser()] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'testpass123' });

      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.displayName).toBe('Test');
      expect(res.body.user.role).toBe('player');
    });

    it('should return 401 for wrong password', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeValidUser()] });

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return same error for non-existent user (no enumeration)', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@example.com', password: 'somepassword' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should use same error message for wrong password and nonexistent user', async () => {
      // Wrong password
      mockQuery.mockResolvedValueOnce({ rows: [makeValidUser()] });
      const res1 = await request(app).post('/login').send({ email: 'test@example.com', password: 'wrong' });

      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res2 = await request(app).post('/login').send({ email: 'none@test.com', password: 'pass' });

      expect(res1.body.message).toBe(res2.body.message);
    });

    it('should reject suspended user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ ...makeValidUser(), status: 'suspended' }] });

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'testpass123' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app).post('/login').send({ password: 'somepassword' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app).post('/login').send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /refresh', () => {
    it('should reject invalid refresh token', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing refresh token', async () => {
      const res = await request(app).post('/refresh').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for empty refresh token', async () => {
      const res = await request(app).post('/refresh').send({ refreshToken: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /forgot-password', () => {
    it('should always return 202 for nonexistent email', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).post('/forgot-password').send({ email: 'nonexistent@example.com' });
      expect(res.status).toBe(202);
    });

    it('should return 202 for existing user', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'user-1' }] })
        .mockResolvedValueOnce({ rows: [] }); // insert token

      const res = await request(app).post('/forgot-password').send({ email: 'test@example.com' });
      expect(res.status).toBe(202);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app).post('/forgot-password').send({ email: 'notanemail' });
      expect(res.status).toBe(400);
    });

    it('should return same response regardless of email existence', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res1 = await request(app).post('/forgot-password').send({ email: 'a@b.com' });

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'u1' }] }).mockResolvedValueOnce({ rows: [] });
      const res2 = await request(app).post('/forgot-password').send({ email: 'c@d.com' });

      expect(res1.status).toBe(res2.status);
      expect(res1.body.message).toBe(res2.body.message);
    });
  });

  describe('POST /reset-password', () => {
    it('should reject invalid token', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).post('/reset-password').send({ token: 'invalid', newPassword: 'newsecure123' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for short new password', async () => {
      const res = await request(app).post('/reset-password').send({ token: 'some-token', newPassword: 'short' });
      expect(res.status).toBe(400);
    });

    it('should reset password with valid token', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'reset-1', user_id: 'user-1' }] }) // find reset token
        .mockResolvedValueOnce({ rows: [] }) // update password
        .mockResolvedValueOnce({ rows: [] }) // mark token used
        .mockResolvedValueOnce({ rows: [] }); // revoke sessions

      const res = await request(app)
        .post('/reset-password')
        .send({ token: 'valid-token', newPassword: 'newsecure123' });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /me', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /logout', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).post('/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /social-auth', () => {
    it('should reject invalid provider', async () => {
      const res = await request(app).post('/social-auth').send({ provider: 'facebook', idToken: 'token' });
      expect(res.status).toBe(400);
    });

    it('should reject invalid token format', async () => {
      const res = await request(app).post('/social-auth').send({ provider: 'google', idToken: 'invalid-format' });
      expect(res.status).toBe(401);
    });

    it('should create new user for valid social auth', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // findUserBySocialProvider - not found
        .mockResolvedValueOnce({ rows: [{ id: 'social-user', email: 'social@test.com', display_name: 'Social User', role: 'player', partner_id: null }] }) // createUser
        .mockResolvedValueOnce({ rows: [] }) // insert session
        .mockResolvedValueOnce({ rows: [] }); // trackDevice

      const res = await request(app)
        .post('/social-auth')
        .send({ provider: 'google', idToken: 'test_12345_social@test.com_Social User' });

      expect(res.status).toBe(201);
      expect(res.body.isNew).toBe(true);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should login existing social user', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'existing-social', email: 'social@test.com', display_name: 'Social', role: 'player', partner_id: null }] }) // findUserBySocialProvider - found
        .mockResolvedValueOnce({ rows: [] }) // insert session
        .mockResolvedValueOnce({ rows: [] }); // trackDevice

      const res = await request(app)
        .post('/social-auth')
        .send({ provider: 'google', idToken: 'test_12345_social@test.com_Social User' });

      expect(res.status).toBe(200);
      expect(res.body.isNew).toBe(false);
    });

    it('should reject missing idToken', async () => {
      const res = await request(app).post('/social-auth').send({ provider: 'google' });
      expect(res.status).toBe(400);
    });
  });
});
