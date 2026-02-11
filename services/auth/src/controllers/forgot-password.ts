import { Request, Response } from 'express';
import { Pool } from 'pg';
import { forgotPasswordSchema } from '../validators.js';
import { findUserByEmail } from '../models/user.js';
import crypto from 'crypto';

export function forgotPasswordController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input' });
      return;
    }

    // Always return 202 to prevent user enumeration
    try {
      const user = await findUserByEmail(pool, parsed.data.email);
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await pool.query(
          'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
          [user.id, tokenHash, expiresAt],
        );

        // In production: send email with reset link containing `token`
        // Never log the actual token
      }
    } catch (err) {
      console.error('Forgot password error:', (err as Error).message);
    }

    res.status(202).json({ message: 'If an account exists with that email, a reset link has been sent' });
  };
}
