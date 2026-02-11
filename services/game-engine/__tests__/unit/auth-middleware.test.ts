import { authMiddleware } from '../../src/middleware/auth';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

describe('Game Engine Auth Middleware', () => {
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

  const mw = authMiddleware();

  it('should reject without auth header', () => {
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should accept valid JWT', () => {
    const token = jwt.sign({ sub: 'u1', email: 'a@b.com', role: 'player', partnerId: null }, JWT_SECRET, { expiresIn: 900 });
    mockReq.headers = { authorization: `Bearer ${token}` };
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.userId).toBe('u1');
  });

  it('should reject tampered JWT', () => {
    const token = jwt.sign({ sub: 'u1' }, 'wrong-secret');
    mockReq.headers = { authorization: `Bearer ${token}` };
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should extract partnerId', () => {
    const token = jwt.sign({ sub: 'u1', email: 'a@b.com', role: 'player', partnerId: 'p1' }, JWT_SECRET, { expiresIn: 900 });
    mockReq.headers = { authorization: `Bearer ${token}` };
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.partnerId).toBe('p1');
  });

  it('should reject malformed token', () => {
    mockReq.headers = { authorization: 'Bearer not.a.valid.jwt' };
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should reject missing Bearer prefix', () => {
    const token = jwt.sign({ sub: 'u1' }, JWT_SECRET);
    mockReq.headers = { authorization: token };
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(statusFn).toHaveBeenCalledWith(401);
  });

  it('should extract email and role', () => {
    const token = jwt.sign({ sub: 'u1', email: 'test@test.com', role: 'teacher', partnerId: null }, JWT_SECRET, { expiresIn: 900 });
    mockReq.headers = { authorization: `Bearer ${token}` };
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.userEmail).toBe('test@test.com');
    expect(mockReq.userRole).toBe('teacher');
  });
});
