import { hashPassword, verifyPassword } from '../../src/services/password';

describe('Password Service', () => {
  it('should hash a password', async () => {
    const hash = await hashPassword('testpass123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('testpass123');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('should verify correct password', async () => {
    const hash = await hashPassword('testpass123');
    const result = await verifyPassword('testpass123', hash);
    expect(result).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hash = await hashPassword('testpass123');
    const result = await verifyPassword('wrongpass', hash);
    expect(result).toBe(false);
  });

  it('should produce different hashes for same password', async () => {
    const hash1 = await hashPassword('testpass123');
    const hash2 = await hashPassword('testpass123');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty password', async () => {
    const hash = await hashPassword('');
    expect(hash).toBeDefined();
  });

  it('should handle long password', async () => {
    const longPass = 'a'.repeat(72); // bcrypt max
    const hash = await hashPassword(longPass);
    const result = await verifyPassword(longPass, hash);
    expect(result).toBe(true);
  });
});
