import { Request, Response } from 'express';
import { Pool } from 'pg';
import { registerSchema } from '../validators.js';
import { hashPassword } from '../services/password.js';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshExpiresAt } from '../services/jwt.js';
import { createUser, findUserByEmail } from '../models/user.js';
import { trackDevice } from '../services/device.js';

export function registerController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, displayName, dateOfBirth, locale, timezone, deviceId, platform, appVersion } = parsed.data;

    try {
      const existing = await findUserByEmail(pool, email);
      if (existing) {
        res.status(409).json({ code: 'USER_ALREADY_EXISTS', message: 'An account with this email already exists' });
        return;
      }

      const passwordHash = await hashPassword(password);
      const user = await createUser(pool, {
        email,
        passwordHash,
        displayName,
        dateOfBirth,
        locale,
        timezone,
        partnerId: req.partnerId,
      });

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

      res.status(201).json({
        userId: user.id,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Registration error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Registration failed' });
    }
  };
}
