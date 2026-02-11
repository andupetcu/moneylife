import { Request, Response } from 'express';
import { Pool } from 'pg';
import { findUserById } from '../models/user.js';

export function meController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await findUserById(pool, req.userId!);
      if (!user) {
        res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        dateOfBirth: user.date_of_birth,
        timezone: user.timezone,
        locale: user.locale,
        role: user.role,
        partnerId: user.partner_id,
        createdAt: user.created_at,
      });
    } catch (err) {
      console.error('Me error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch user' });
    }
  };
}
