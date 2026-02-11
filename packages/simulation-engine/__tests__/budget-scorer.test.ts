// packages/simulation-engine/__tests__/budget-scorer.test.ts

import {
  calculateCategoryScore,
  calculateBudgetScore,
  getBudgetRewards,
  follows503020Rule,
} from '../src/budget-scorer';

describe('Budget Scorer', () => {
  describe('calculateCategoryScore', () => {
    it('should return 100 for both zero', () => {
      expect(calculateCategoryScore(0, 0)).toBe(100);
    });

    it('should return 0 for unbudgeted spending', () => {
      expect(calculateCategoryScore(0, 5000)).toBe(0);
    });

    it('should return 100 for spending 80-100% of budget', () => {
      expect(calculateCategoryScore(10000, 9000)).toBe(100);
      expect(calculateCategoryScore(10000, 10000)).toBe(100);
      expect(calculateCategoryScore(10000, 8000)).toBe(100);
    });

    it('should return 90 for spending 50-79% of budget', () => {
      expect(calculateCategoryScore(10000, 6000)).toBe(90);
      expect(calculateCategoryScore(10000, 5000)).toBe(90);
    });

    it('should return 75 for spending <50% of budget', () => {
      expect(calculateCategoryScore(10000, 3000)).toBe(75);
      expect(calculateCategoryScore(10000, 0)).toBe(75);
    });

    it('should penalize overspending', () => {
      // 10% over: 100 - 0.1*200 = 80
      expect(calculateCategoryScore(10000, 11000)).toBe(80);
      // 25% over: 100 - 0.25*200 = 50
      expect(calculateCategoryScore(10000, 12500)).toBe(50);
      // 50% over: 100 - 0.5*200 = 0
      expect(calculateCategoryScore(10000, 15000)).toBe(0);
      // Over 50%: capped at 0
      expect(calculateCategoryScore(10000, 20000)).toBe(0);
    });
  });

  describe('calculateBudgetScore', () => {
    it('should return 0 for empty categories', () => {
      expect(calculateBudgetScore([])).toBe(0);
    });

    it('should return 100 for perfect adherence', () => {
      const score = calculateBudgetScore([
        { category: 'rent', budgeted: 80000, spent: 80000 },
        { category: 'food', budgeted: 30000, spent: 28000 },
      ]);
      expect(score).toBe(100);
    });

    it('should weight by budget amount', () => {
      const score = calculateBudgetScore([
        { category: 'rent', budgeted: 80000, spent: 80000 },     // 100, weight ~0.73
        { category: 'food', budgeted: 30000, spent: 45000 },     // 0, weight ~0.27
      ]);
      // 100 * 0.727 + 0 * 0.273 ≈ 73
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThan(80);
    });

    it('should handle all categories under budget', () => {
      const score = calculateBudgetScore([
        { category: 'rent', budgeted: 80000, spent: 80000 },
        { category: 'food', budgeted: 30000, spent: 25000 },
        { category: 'transport', budgeted: 15000, spent: 12000 },
      ]);
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('should handle all categories over budget', () => {
      const score = calculateBudgetScore([
        { category: 'rent', budgeted: 80000, spent: 120000 },
        { category: 'food', budgeted: 30000, spent: 60000 },
      ]);
      expect(score).toBe(0);
    });

    it('should handle unbudgeted spending categories', () => {
      const score = calculateBudgetScore([
        { category: 'rent', budgeted: 80000, spent: 80000 },
        { category: 'unexpected', budgeted: 0, spent: 20000 },
      ]);
      expect(score).toBeLessThan(100);
    });
  });

  describe('getBudgetRewards', () => {
    it('should return top rewards for 90+', () => {
      expect(getBudgetRewards(95)).toEqual({ xp: 50, coins: 25 });
    });

    it('should return good rewards for 75-89', () => {
      expect(getBudgetRewards(80)).toEqual({ xp: 30, coins: 10 });
    });

    it('should return some rewards for 60-74', () => {
      expect(getBudgetRewards(65)).toEqual({ xp: 15, coins: 5 });
    });

    it('should return minimal for 40-59', () => {
      expect(getBudgetRewards(50)).toEqual({ xp: 5, coins: 0 });
    });

    it('should return nothing for <40', () => {
      expect(getBudgetRewards(30)).toEqual({ xp: 0, coins: 0 });
    });
  });

  describe('follows503020Rule', () => {
    it('should detect correct allocation', () => {
      expect(follows503020Rule(100000, 50000, 30000, 20000)).toBe(true);
    });

    it('should allow 5% tolerance', () => {
      expect(follows503020Rule(100000, 54000, 28000, 18000)).toBe(true);
    });

    it('should reject bad allocation', () => {
      expect(follows503020Rule(100000, 70000, 20000, 10000)).toBe(false);
    });

    it('should reject zero income', () => {
      expect(follows503020Rule(0, 0, 0, 0)).toBe(false);
    });
  });
});
