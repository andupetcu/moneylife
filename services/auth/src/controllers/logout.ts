import { Request, Response } from 'express';
import { Pool } from 'pg';

export function logoutController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      // Revoke all sessions for this user
      await pool.query(
        'UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
        [req.userId],
      );
      res.status(204).send();
    } catch (err) {
      console.error('Logout error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Logout failed' });
    }
  };
}
