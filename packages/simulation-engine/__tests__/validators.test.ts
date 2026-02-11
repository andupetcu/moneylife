// packages/simulation-engine/__tests__/validators.test.ts

import {
  validateDailyXp, validateDailyCoins, validateLevelSpeed,
  validateNetWorthChange, validateChiChange,
  validateActionRate, validateTransferAmount, runAllValidations,
} from '../src/validators';

describe('Validators (Anti-Cheat)', () => {
  describe('validateDailyXp', () => {
    it('should pass for normal XP', () => {
      expect(validateDailyXp(100).valid).toBe(true);
    });

    it('should flag impossible XP', () => {
      const result = validateDailyXp(200);
      expect(result.valid).toBe(false);
      expect(result.flags[0]).toContain('impossible_xp');
    });

    it('should pass at exact max', () => {
      expect(validateDailyXp(195).valid).toBe(true);
    });
  });

  describe('validateDailyCoins', () => {
    it('should pass for normal coins', () => {
      expect(validateDailyCoins(30).valid).toBe(true);
    });

    it('should flag excessive coins', () => {
      expect(validateDailyCoins(150).valid).toBe(false);
    });
  });

  describe('validateLevelSpeed', () => {
    it('should pass for normal speed', () => {
      expect(validateLevelSpeed(1, 10).valid).toBe(true);
    });

    it('should flag impossibly fast level 1', () => {
      // Level 1 = 500 XP, max 195/day = min 3 days
      expect(validateLevelSpeed(1, 2).valid).toBe(false);
    });

    it('should flag impossibly fast level 8', () => {
      // Level 8 = 25000 XP, max 195/day = min 129 days
      expect(validateLevelSpeed(8, 50).valid).toBe(false);
    });

    it('should pass at minimum days', () => {
      expect(validateLevelSpeed(1, 3).valid).toBe(true);
    });
  });

  describe('validateNetWorthChange', () => {
    it('should pass for normal change', () => {
      expect(validateNetWorthChange(100000, 110000).valid).toBe(true);
    });

    it('should flag >50% increase', () => {
      const result = validateNetWorthChange(100000, 200000);
      expect(result.valid).toBe(false);
      expect(result.flags[0]).toContain('net_worth_anomaly');
    });

    it('should pass for negative change', () => {
      expect(validateNetWorthChange(100000, 50000).valid).toBe(true);
    });

    it('should handle zero previous', () => {
      expect(validateNetWorthChange(0, 100000).valid).toBe(true);
    });
  });

  describe('validateChiChange', () => {
    it('should pass for normal change', () => {
      expect(validateChiChange(700, 720).valid).toBe(true);
    });

    it('should flag >50 point increase', () => {
      const result = validateChiChange(600, 660);
      expect(result.valid).toBe(false);
    });

    it('should pass for decrease', () => {
      expect(validateChiChange(700, 600).valid).toBe(true);
    });
  });

  describe('validateActionRate', () => {
    it('should pass for normal timing', () => {
      const now = 1000000;
      const timestamps = [now - 60000, now - 30000];
      expect(validateActionRate(timestamps, now).valid).toBe(true);
    });

    it('should flag too-fast actions', () => {
      const now = 1000000;
      const timestamps = [now - 5000, now - 1000];
      const result = validateActionRate(timestamps, now);
      expect(result.valid).toBe(false);
      expect(result.flags[0]).toContain('rate_limit');
    });

    it('should flag too many actions per hour', () => {
      const now = 1000000;
      const timestamps = Array.from({ length: 51 }, (_, i) => now - (51 - i) * 60000);
      const result = validateActionRate(timestamps, now);
      expect(result.valid).toBe(false);
      expect(result.flags[0]).toContain('burst_limit');
    });
  });

  describe('validateTransferAmount', () => {
    it('should pass for valid transfer', () => {
      expect(validateTransferAmount(1000, 5000).valid).toBe(true);
    });

    it('should flag zero amount', () => {
      expect(validateTransferAmount(0, 5000).valid).toBe(false);
    });

    it('should flag negative amount', () => {
      expect(validateTransferAmount(-100, 5000).valid).toBe(false);
    });

    it('should flag exceeding balance', () => {
      const result = validateTransferAmount(10000, 5000);
      expect(result.valid).toBe(false);
      expect(result.flags[0]).toContain('insufficient_funds');
    });

    it('should flag exceeding max', () => {
      const result = validateTransferAmount(20000000, 50000000, 10000000);
      expect(result.valid).toBe(false);
      expect(result.flags[0]).toContain('max_transfer');
    });
  });

  describe('runAllValidations', () => {
    it('should aggregate flags', () => {
      const result = runAllValidations([
        { valid: false, flags: ['flag1'] },
        { valid: true, flags: [] },
        { valid: false, flags: ['flag2', 'flag3'] },
      ]);
      expect(result.valid).toBe(false);
      expect(result.flags).toHaveLength(3);
    });

    it('should pass when all pass', () => {
      const result = runAllValidations([
        { valid: true, flags: [] },
        { valid: true, flags: [] },
      ]);
      expect(result.valid).toBe(true);
      expect(result.flags).toHaveLength(0);
    });
  });
});
