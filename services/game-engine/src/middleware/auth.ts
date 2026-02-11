import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

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
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing authorization header' });
      return;
    }
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { sub: string; email: string; role: string; partnerId: string | null };
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
