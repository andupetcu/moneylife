import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  locale: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  referralCode: z.string().max(20).optional(),
  deviceId: z.string().max(255).optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  appVersion: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
  deviceId: z.string().max(255).optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  appVersion: z.string().max(20).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const socialAuthSchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken: z.string().min(1),
  deviceId: z.string().max(255).optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  appVersion: z.string().max(20).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
