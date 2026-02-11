import {
  evaluateCondition,
  evaluateBadges,
  BADGE_CATALOG,
  PlayerMetrics,
  BadgeCondition,
} from '../../src/services/badge-engine';

describe('Badge Engine', () => {
  describe('BADGE_CATALOG', () => {
    it('contains 65 badges (60 + 5 hidden)', () => {
      expect(BADGE_CATALOG.length).toBe(65);
    });

    it('has unique IDs', () => {
      const ids = BADGE_CATALOG.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('has 5 hidden badges', () => {
      expect(BADGE_CATALOG.filter((b) => b.hidden).length).toBe(5);
    });

    it('has badges in all categories', () => {
      const categories = new Set(BADGE_CATALOG.map((b) => b.category));
      expect(categories).toContain('savings');
      expect(categories).toContain('credit');
      expect(categories).toContain('budget');
      expect(categories).toContain('investment');
      expect(categories).toContain('life_event');
      expect(categories).toContain('engagement');
      expect(categories).toContain('progression');
    });

    it('has all four rarities', () => {
      const rarities = new Set(BADGE_CATALOG.map((b) => b.rarity));
      expect(rarities).toContain('common');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('epic');
      expect(rarities).toContain('legendary');
    });

    it('all badges have positive coin rewards', () => {
      for (const badge of BADGE_CATALOG) {
        expect(badge.coinReward).toBeGreaterThan(0);
      }
    });

    it('all badges have positive xp rewards', () => {
      for (const badge of BADGE_CATALOG) {
        expect(badge.xpReward).toBeGreaterThan(0);
      }
    });

    it('legendary badges give 100 coins', () => {
      const legendaries = BADGE_CATALOG.filter((b) => b.rarity === 'legendary');
      for (const badge of legendaries) {
        expect(badge.coinReward).toBe(100);
      }
    });
  });

  describe('evaluateCondition', () => {
    it('evaluates threshold condition — met', () => {
      const condition: BadgeCondition = { type: 'threshold', metric: 'savings_deposits', value: 1 };
      expect(evaluateCondition(condition, { savings_deposits: 1 })).toBe(true);
      expect(evaluateCondition(condition, { savings_deposits: 5 })).toBe(true);
    });

    it('evaluates threshold condition — not met', () => {
      const condition: BadgeCondition = { type: 'threshold', metric: 'savings_deposits', value: 5 };
      expect(evaluateCondition(condition, { savings_deposits: 3 })).toBe(false);
    });

    it('evaluates streak condition', () => {
      const condition: BadgeCondition = { type: 'streak', metric: 'play_days', value: 7 };
      expect(evaluateCondition(condition, { play_days: 7 })).toBe(true);
      expect(evaluateCondition(condition, { play_days: 6 })).toBe(false);
    });

    it('evaluates event condition', () => {
      const condition: BadgeCondition = { type: 'event', metric: 'create_budget' };
      expect(evaluateCondition(condition, { create_budget: true })).toBe(true);
      expect(evaluateCondition(condition, { create_budget: false })).toBe(false);
      expect(evaluateCondition(condition, {})).toBe(false);
    });

    it('evaluates compound AND condition', () => {
      const condition: BadgeCondition = {
        type: 'compound',
        operator: 'and',
        conditions: [
          { type: 'threshold', metric: 'chi_score', value: 750 },
          { type: 'streak', metric: 'chi_750_months', value: 6 },
        ],
      };
      expect(evaluateCondition(condition, { chi_score: 800, chi_750_months: 6 })).toBe(true);
      expect(evaluateCondition(condition, { chi_score: 800, chi_750_months: 5 })).toBe(false);
      expect(evaluateCondition(condition, { chi_score: 700, chi_750_months: 6 })).toBe(false);
    });

    it('evaluates compound OR condition', () => {
      const condition: BadgeCondition = {
        type: 'compound',
        operator: 'or',
        conditions: [
          { type: 'event', metric: 'event_a' },
          { type: 'event', metric: 'event_b' },
        ],
      };
      expect(evaluateCondition(condition, { event_a: true })).toBe(true);
      expect(evaluateCondition(condition, { event_b: true })).toBe(true);
      expect(evaluateCondition(condition, {})).toBe(false);
    });

    it('returns false for missing metric', () => {
      expect(evaluateCondition({ type: 'threshold', metric: 'x', value: 1 }, {})).toBe(false);
    });

    it('returns false for unknown condition type', () => {
      expect(evaluateCondition({ type: 'unknown' as any }, {})).toBe(false);
    });
  });

  describe('evaluateBadges', () => {
    it('returns newly earned badges', () => {
      const metrics: PlayerMetrics = { savings_deposits: 1 };
      const earned = new Set<string>();
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.some((b) => b.id === 'BDG-SAVINGS-001')).toBe(true);
    });

    it('does not return already earned badges', () => {
      const metrics: PlayerMetrics = { savings_deposits: 1 };
      const earned = new Set(['BDG-SAVINGS-001']);
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.some((b) => b.id === 'BDG-SAVINGS-001')).toBe(false);
    });

    it('returns multiple badges at once', () => {
      const metrics: PlayerMetrics = {
        savings_deposits: 1,
        create_budget: true,
        first_investment: true,
      };
      const earned = new Set<string>();
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.length).toBeGreaterThanOrEqual(3);
    });

    it('evaluates hidden badges', () => {
      const metrics: PlayerMetrics = { charity_donations: 5 };
      const earned = new Set<string>();
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.some((b) => b.id === 'BDG-HIDDEN-H5')).toBe(true);
    });

    it('returns empty array when no new badges earned', () => {
      const metrics: PlayerMetrics = {};
      const earned = new Set<string>();
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.length).toBe(0);
    });

    it('handles compound badge conditions', () => {
      const metrics: PlayerMetrics = {
        chi_score: 800,
        chi_750_months: 6,
      };
      const earned = new Set<string>();
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.some((b) => b.id === 'BDG-CREDIT-014')).toBe(true);
    });

    it('does not award compound badge when partial conditions met', () => {
      const metrics: PlayerMetrics = {
        chi_score: 800,
        chi_750_months: 3, // need 6
      };
      const earned = new Set<string>();
      const newBadges = evaluateBadges(metrics, earned);
      expect(newBadges.some((b) => b.id === 'BDG-CREDIT-014')).toBe(false);
    });
  });
});
