import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

export function createRateLimiter(maxRequests: number, windowMs: number): RequestHandler {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return ((_req, _res, next) => next()) as RequestHandler;
  }

  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? 'unknown',
    handler: (_req, res) => {
      res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      });
    },
  }) as unknown as RequestHandler;
}
