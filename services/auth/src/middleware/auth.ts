import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: string;
      partnerId?: string | null;
    }
  }
}

export function authMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' });
      return;
    }

    const token = header.slice(7);
    try {
      const payload = verifyAccessToken(token);
      req.userId = payload.sub;
      req.userEmail = payload.email;
      req.userRole = payload.role;
      req.partnerId = payload.partnerId;
      next();
    } catch {
      res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid or expired token' });
    }
  };
}
