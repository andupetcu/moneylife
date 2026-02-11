import { Request, Response } from 'express';
import { Pool } from 'pg';
import { loginSchema } from '../validators.js';
import { verifyPassword } from '../services/password.js';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshExpiresAt } from '../services/jwt.js';
import { findUserByEmail } from '../models/user.js';
import { trackDevice } from '../services/device.js';

// Generic error message to prevent user enumeration
const INVALID_CREDENTIALS_MSG = 'Invalid email or password';

export function loginController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password, deviceId, platform, appVersion } = parsed.data;

    try {
      const user = await findUserByEmail(pool, email);
      if (!user || !user.password_hash) {
        res.status(401).json({ code: 'INVALID_CREDENTIALS', message: INVALID_CREDENTIALS_MSG });
        return;
      }

      if (user.status !== 'active') {
        res.status(401).json({ code: 'INVALID_CREDENTIALS', message: INVALID_CREDENTIALS_MSG });
        return;
      }

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ code: 'INVALID_CREDENTIALS', message: INVALID_CREDENTIALS_MSG });
        return;
      }

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
      });

      const refreshToken = generateRefreshToken();
      const refreshHash = hashToken(refreshToken);

      await pool.query(
        'INSERT INTO sessions (user_id, refresh_token_hash, device_id, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5)',
        [user.id, refreshHash, deviceId ?? null, req.ip, getRefreshExpiresAt()],
      );

      await trackDevice(pool, user.id, { deviceId, platform, appVersion });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          partnerId: user.partner_id,
        },
      });
    } catch (err) {
      console.error('Login error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Login failed' });
    }
  };
}
