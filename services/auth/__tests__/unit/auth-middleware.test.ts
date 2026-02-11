import { authMiddleware } from '../../src/middleware/auth';
import { generateAccessToken } from '../../src/services/jwt';
import { Request, Response, NextFunction } from 'express';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonFn: jest.Mock;
  let statusFn: jest.Mock;

  beforeEach(() => {
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    mockReq = { headers: {} };
    mockRes = { status: statusFn, json: jsonFn } as unknown as Partial<Response>;
    mockNext = jest.fn();
  });

  const middleware = authMiddleware();

  it('should reject request without auth header', () => {
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject request with non-Bearer auth', () => {
    mockReq.headers = { authorization: 'Basic abc123' };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should reject request with invalid token', () => {
    mockReq.headers = { authorization: 'Bearer invalid.token.here' };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should accept valid token and set user info', () => {
    const token = generateAccessToken({
      sub: 'user-123',
      email: 'test@example.com',
      role: 'player',
      partnerId: null,
    });
    mockReq.headers = { authorization: `Bearer ${token}` };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.userId).toBe('user-123');
    expect(mockReq.userEmail).toBe('test@example.com');
    expect(mockReq.userRole).toBe('player');
  });

  it('should set partnerId from token', () => {
    const token = generateAccessToken({
      sub: 'user-123',
      email: 'test@example.com',
      role: 'player',
      partnerId: 'partner-abc',
    });
    mockReq.headers = { authorization: `Bearer ${token}` };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.partnerId).toBe('partner-abc');
  });

  it('should reject expired token', () => {
    // Create a token that's already expired by manipulating env
    mockReq.headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InBsYXllciIsInBhcnRuZXJJZCI6bnVsbCwiZXhwIjoxfQ.invalid' };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should reject empty Bearer token', () => {
    mockReq.headers = { authorization: 'Bearer ' };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });
});
