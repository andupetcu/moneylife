import {
  getTier,
  applyTierBonus,
  applyStreakMultiplier,
  checkRedemptionLimits,
  canTransition,
  DEFAULT_REDEMPTION_LIMITS,
} from '../../src/services/economy';

describe('Economy Service', () => {
  describe('getTier', () => {
    it('returns rookie for 0 XP', () => {
      expect(getTier(0).tier).toBe('rookie');
    });

    it('returns money_aware for 1000 XP', () => {
      expect(getTier(1000).tier).toBe('money_aware');
    });

    it('returns budget_detective for 5000 XP', () => {
      expect(getTier(5000).tier).toBe('budget_detective');
    });

    it('returns savings_champion for 15000 XP', () => {
      expect(getTier(15000).tier).toBe('savings_champion');
      expect(getTier(15000).coinBonus).toBe(0.05);
    });

    it('returns investment_strategist for 30000 XP', () => {
      expect(getTier(30000).tier).toBe('investment_strategist');
      expect(getTier(30000).coinBonus).toBe(0.10);
    });

    it('returns wealth_builder for 55000 XP', () => {
      expect(getTier(55000).tier).toBe('wealth_builder');
      expect(getTier(55000).coinBonus).toBe(0.15);
    });

    it('returns financial_advisor for 85000 XP', () => {
      expect(getTier(85000).tier).toBe('financial_advisor');
      expect(getTier(85000).coinBonus).toBe(0.20);
    });

    it('returns correct tier at exact boundary', () => {
      expect(getTier(999).tier).toBe('rookie');
      expect(getTier(1000).tier).toBe('money_aware');
    });
  });

  describe('applyTierBonus', () => {
    it('returns base coins for rookie tier', () => {
      expect(applyTierBonus(100, 0)).toBe(100);
    });

    it('applies 5% bonus for savings_champion', () => {
      expect(applyTierBonus(100, 15000)).toBe(105);
    });

    it('applies 20% bonus for financial_advisor', () => {
      expect(applyTierBonus(100, 85000)).toBe(120);
    });

    it('rounds to nearest integer', () => {
      expect(applyTierBonus(33, 15000)).toBe(35); // 33 * 1.05 = 34.65 → 35
    });
  });

  describe('applyStreakMultiplier', () => {
    it('applies multiplier correctly', () => {
      expect(applyStreakMultiplier(100, 1.0)).toBe(100);
      expect(applyStreakMultiplier(100, 1.5)).toBe(150);
      expect(applyStreakMultiplier(10, 1.3)).toBe(13);
    });
  });

  describe('checkRedemptionLimits', () => {
    it('allows redemption within limits', () => {
      const result = checkRedemptionLimits(0, 0, 0, 0, 100);
      expect(result.allowed).toBe(true);
    });

    it('blocks when daily redemption limit reached', () => {
      const result = checkRedemptionLimits(5, 0, 0, 0, 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Daily redemption');
    });

    it('blocks when daily coin limit exceeded', () => {
      const result = checkRedemptionLimits(0, 4900, 0, 0, 200);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Daily coin');
    });

    it('blocks when monthly redemption limit reached', () => {
      const result = checkRedemptionLimits(0, 0, 20, 0, 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Monthly redemption');
    });

    it('blocks when monthly coin limit exceeded', () => {
      const result = checkRedemptionLimits(0, 0, 0, 19900, 200);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Monthly coin');
    });
  });

  describe('canTransition', () => {
    it('allows pending → processing', () => {
      expect(canTransition('pending', 'processing')).toBe(true);
    });

    it('allows pending → failed', () => {
      expect(canTransition('pending', 'failed')).toBe(true);
    });

    it('allows processing → fulfilled', () => {
      expect(canTransition('processing', 'fulfilled')).toBe(true);
    });

    it('allows failed → refunded', () => {
      expect(canTransition('failed', 'refunded')).toBe(true);
    });

    it('allows fulfilled → disputed', () => {
      expect(canTransition('fulfilled', 'disputed')).toBe(true);
    });

    it('disallows confirmed → anything', () => {
      expect(canTransition('confirmed', 'pending')).toBe(false);
      expect(canTransition('confirmed', 'refunded')).toBe(false);
    });

    it('disallows refunded → anything', () => {
      expect(canTransition('refunded', 'pending')).toBe(false);
    });

    it('disallows backwards transitions', () => {
      expect(canTransition('fulfilled', 'pending')).toBe(false);
      expect(canTransition('processing', 'pending')).toBe(false);
    });
  });
});
