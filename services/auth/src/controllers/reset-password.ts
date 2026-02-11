import { Request, Response } from 'express';
import { Pool } from 'pg';
import { resetPasswordSchema } from '../validators.js';
import { hashPassword } from '../services/password.js';
import crypto from 'crypto';

export function resetPasswordController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input' });
      return;
    }

    const { token, newPassword } = parsed.data;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    try {
      const result = await pool.query(
        'SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()',
        [tokenHash],
      );

      if (result.rows.length === 0) {
        res.status(400).json({ code: 'TOKEN_INVALID', message: 'Invalid or expired reset token' });
        return;
      }

      const resetRecord = result.rows[0];
      const passwordHash = await hashPassword(newPassword);

      // Update password and mark token as used
      await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, resetRecord.user_id]);
      await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRecord.id]);

      // Revoke all sessions for security
      await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [resetRecord.user_id]);

      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
      console.error('Reset password error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Password reset failed' });
    }
  };
}
