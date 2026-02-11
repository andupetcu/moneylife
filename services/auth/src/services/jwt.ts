import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY ?? '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  partnerId: string | null;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: parseDuration(JWT_EXPIRY) / 1000 });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

export function getRefreshExpiresAt(): Date {
  const ms = parseDuration(JWT_REFRESH_EXPIRY);
  return new Date(Date.now() + ms);
}

function parseDuration(dur: string): number {
  const match = dur.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const val = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return val * (multipliers[unit] ?? 86400000);
}
