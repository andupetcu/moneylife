import { registerSchema, loginSchema, refreshSchema, socialAuthSchema, forgotPasswordSchema, resetPasswordSchema } from '../../src/validators';

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        displayName: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'securepass123',
        displayName: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
        displayName: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty display name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        displayName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        displayName: 'Test',
        dateOfBirth: '2000-01-15',
        locale: 'en',
        timezone: 'UTC',
        deviceId: 'device-123',
        platform: 'ios',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        displayName: 'Test',
        dateOfBirth: '01/15/2000',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid platform', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass123',
        displayName: 'Test',
        platform: 'windows',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password over 128 chars', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'a'.repeat(129),
        displayName: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'pass123' });
      expect(result.success).toBe(true);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(false);
    });

    it('should accept with device info', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'pass123',
        deviceId: 'dev-1',
        platform: 'android',
        appVersion: '1.0.0',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('refreshSchema', () => {
    it('should accept valid refresh token', () => {
      const result = refreshSchema.safeParse({ refreshToken: 'some-token-value' });
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const result = refreshSchema.safeParse({ refreshToken: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('socialAuthSchema', () => {
    it('should accept google auth', () => {
      const result = socialAuthSchema.safeParse({ provider: 'google', idToken: 'token123' });
      expect(result.success).toBe(true);
    });

    it('should accept apple auth', () => {
      const result = socialAuthSchema.safeParse({ provider: 'apple', idToken: 'token123' });
      expect(result.success).toBe(true);
    });

    it('should reject unknown provider', () => {
      const result = socialAuthSchema.safeParse({ provider: 'facebook', idToken: 'token123' });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'notanemail' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid token and password', () => {
      const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'newsecure123' });
      expect(result.success).toBe(true);
    });

    it('should reject short new password', () => {
      const result = resetPasswordSchema.safeParse({ token: 'abc123', newPassword: 'short' });
      expect(result.success).toBe(false);
    });
  });
});
