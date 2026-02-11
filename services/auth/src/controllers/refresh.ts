import { Request, Response } from 'express';
import { Pool } from 'pg';
import { refreshSchema } from '../validators.js';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshExpiresAt } from '../services/jwt.js';
import { findUserById } from '../models/user.js';

export function refreshController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input' });
      return;
    }

    const { refreshToken } = parsed.data;
    const tokenHash = hashToken(refreshToken);

    try {
      const sessionResult = await pool.query(
        'SELECT * FROM sessions WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
        [tokenHash],
      );

      if (sessionResult.rows.length === 0) {
        res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid or expired refresh token' });
        return;
      }

      const session = sessionResult.rows[0];
      const user = await findUserById(pool, session.user_id);
      if (!user || user.status !== 'active') {
        res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid or expired refresh token' });
        return;
      }

      // Rotate refresh token: revoke old, issue new
      await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE id = $1', [session.id]);

      const newRefreshToken = generateRefreshToken();
      const newRefreshHash = hashToken(newRefreshToken);

      await pool.query(
        'INSERT INTO sessions (user_id, refresh_token_hash, device_id, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5)',
        [user.id, newRefreshHash, session.device_id, req.ip, getRefreshExpiresAt()],
      );

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
      });

      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
      console.error('Refresh error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Token refresh failed' });
    }
  };
}
