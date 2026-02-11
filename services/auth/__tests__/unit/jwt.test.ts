import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
} from '../../src/services/jwt';

describe('JWT Service', () => {
  const payload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'player',
    partnerId: null,
  };

  it('should generate a valid access token', () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should verify a valid access token', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('player');
    expect(decoded.partnerId).toBeNull();
  });

  it('should throw on invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('should throw on tampered token', () => {
    const token = generateAccessToken(payload);
    const tampered = token.slice(0, -5) + 'xxxxx';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('should generate unique refresh tokens', () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();
    expect(token1).not.toBe(token2);
  });

  it('should generate refresh token of sufficient length', () => {
    const token = generateRefreshToken();
    expect(token.length).toBeGreaterThanOrEqual(64);
  });

  it('should hash tokens consistently', () => {
    const token = 'test-refresh-token';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different tokens', () => {
    const hash1 = hashToken('token-1');
    const hash2 = hashToken('token-2');
    expect(hash1).not.toBe(hash2);
  });

  it('should include partnerId in token', () => {
    const token = generateAccessToken({ ...payload, partnerId: 'partner-123' });
    const decoded = verifyAccessToken(token);
    expect(decoded.partnerId).toBe('partner-123');
  });

  it('should handle all roles', () => {
    for (const role of ['player', 'teacher', 'partner_admin', 'system_admin']) {
      const token = generateAccessToken({ ...payload, role });
      const decoded = verifyAccessToken(token);
      expect(decoded.role).toBe(role);
    }
  });
});
