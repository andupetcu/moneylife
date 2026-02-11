import { Request, Response } from 'express';
import { Pool } from 'pg';
import { socialAuthSchema } from '../validators.js';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshExpiresAt } from '../services/jwt.js';
import { findUserBySocialProvider, createUser } from '../models/user.js';
import { trackDevice } from '../services/device.js';

/**
 * Social auth: Google / Apple.
 * In production, idToken would be verified against provider's public keys.
 * For now, we decode it as a stub.
 */
export function socialAuthController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = socialAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { provider, idToken, deviceId, platform, appVersion } = parsed.data;

    try {
      // Stub: in production, verify token with provider
      const socialProfile = decodeSocialToken(provider, idToken);
      if (!socialProfile) {
        res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid social auth token' });
        return;
      }

      let user = await findUserBySocialProvider(pool, provider, socialProfile.id);
      let isNew = false;

      if (!user) {
        user = await createUser(pool, {
          email: socialProfile.email,
          passwordHash: null,
          displayName: socialProfile.name,
          partnerId: req.partnerId,
          socialProvider: provider,
          socialProviderId: socialProfile.id,
        });
        isNew = true;
      }

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
      });

      const refreshToken = generateRefreshToken();
      await pool.query(
        'INSERT INTO sessions (user_id, refresh_token_hash, device_id, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5)',
        [user.id, hashToken(refreshToken), deviceId ?? null, req.ip, getRefreshExpiresAt()],
      );

      await trackDevice(pool, user.id, { deviceId, platform, appVersion });

      res.status(isNew ? 201 : 200).json({
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role },
        isNew,
      });
    } catch (err) {
      console.error('Social auth error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Social authentication failed' });
    }
  };
}

interface SocialProfile { id: string; email: string; name: string; }

function decodeSocialToken(_provider: string, idToken: string): SocialProfile | null {
  // Stub implementation - in production, verify JWT against Google/Apple certs
  try {
    // For testing: accept tokens in format "test_<id>_<email>_<name>"
    if (idToken.startsWith('test_')) {
      const parts = idToken.split('_');
      if (parts.length >= 4) {
        return { id: parts[1], email: parts[2], name: parts.slice(3).join('_') };
      }
    }
    return null;
  } catch {
    return null;
  }
}
