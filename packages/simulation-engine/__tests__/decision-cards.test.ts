// packages/simulation-engine/__tests__/decision-cards.test.ts

import {
  generateDecisionCard, processCardDecision,
  getCardsPerDay, calculateCardRewards,
} from '../src/decision-cards';
import { createRng } from '../src/scenarios';

describe('Decision Cards', () => {
  const scenario = {
    id: 'DC-001',
    category: 'groceries',
    title: 'Weekly Grocery Run',
    description: 'Time to buy groceries.',
    stakeLevel: 'low',
    options: [
      { id: 'A', label: 'Premium', cost: 8000, xp: 5, coins: 2 },
      { id: 'B', label: 'Regular', cost: 4000, xp: 10, coins: 5 },
      { id: 'C', label: 'Budget', cost: 2500, xp: 15, coins: 8 },
    ],
  };

  describe('generateDecisionCard', () => {
    it('should generate a card from scenario', () => {
      const rng = createRng('card-gen');
      const card = generateDecisionCard(scenario, { year: 2026, month: 1, day: 5 }, rng);
      expect(card.id).toBe('DC-001');
      expect(card.options).toHaveLength(3);
      expect(card.expiresOnDay).toEqual({ year: 2026, month: 1, day: 8 });
      expect(card.isBonus).toBe(false);
    });

    it('should set isBonus when specified', () => {
      const rng = createRng('bonus');
      const card = generateDecisionCard(scenario, { year: 2026, month: 1, day: 1 }, rng, true);
      expect(card.isBonus).toBe(true);
    });

    it('should apply cost variance when present', () => {
      const varScenario = {
        ...scenario,
        options: [{ id: 'A', label: 'Variable', cost: 5000, xp: 5, coins: 2, costVariance: [3000, 7000] as [number, number] }],
      };
      const rng = createRng('variance');
      const card = generateDecisionCard(varScenario, { year: 2026, month: 1, day: 1 }, rng);
      const cost = Math.abs(card.options[0].consequences[0]?.amount ?? 0);
      expect(cost).toBeGreaterThanOrEqual(3000);
      expect(cost).toBeLessThanOrEqual(7000);
    });
  });

  describe('processCardDecision', () => {
    it('should process a valid decision', () => {
      const rng = createRng('process');
      const card = generateDecisionCard(scenario, { year: 2026, month: 1, day: 5 }, rng);
      const balances = new Map([['checking-1', 500000]]);
      const { option, balanceChanges } = processCardDecision(
        card, 'B', balances, 'checking-1', 'game-1', { year: 2026, month: 1, day: 5 },
      );
      expect(option.id).toBe('B');
      expect(balances.get('checking-1')).toBeLessThan(500000);
    });

    it('should throw for invalid option', () => {
      const rng = createRng('bad-opt');
      const card = generateDecisionCard(scenario, { year: 2026, month: 1, day: 5 }, rng);
      const balances = new Map([['checking-1', 500000]]);
      expect(() =>
        processCardDecision(card, 'Z', balances, 'checking-1', 'game-1', { year: 2026, month: 1, day: 5 }),
      ).toThrow('not found');
    });

    it('should allow overdraft (no balance check in card processing)', () => {
      const rng = createRng('overdraft');
      const card = generateDecisionCard(scenario, { year: 2026, month: 1, day: 5 }, rng);
      const balances = new Map([['checking-1', 100]]);
      // Should not throw even with insufficient funds
      processCardDecision(card, 'A', balances, 'checking-1', 'game-1', { year: 2026, month: 1, day: 5 });
      expect(balances.get('checking-1')!).toBeLessThan(0);
    });
  });

  describe('getCardsPerDay', () => {
    it('should return 1 for level 1', () => {
      const rng = createRng('cards-l1');
      expect(getCardsPerDay(1, rng)).toBe(1);
    });

    it('should return at least base for any level', () => {
      const rng = createRng('cards-base');
      for (let level = 1; level <= 8; level++) {
        const count = getCardsPerDay(level, createRng(`cards-${level}`));
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(4);
      }
    });

    it('should be deterministic', () => {
      const c1 = getCardsPerDay(5, createRng('det'));
      const c2 = getCardsPerDay(5, createRng('det'));
      expect(c1).toBe(c2);
    });
  });

  describe('calculateCardRewards', () => {
    it('should apply all modifiers to XP', () => {
      const option = { id: 'A', label: 'X', description: 'X', consequences: [], xpReward: 10, coinReward: 5 };
      const result = calculateCardRewards(option, 1.2, 1.3, 1.0);
      // 10 * 1.2 * 1.3 * 1.0 = 15.6 → 16
      expect(result.xp).toBe(16);
    });

    it('should not modify coins', () => {
      const option = { id: 'A', label: 'X', description: 'X', consequences: [], xpReward: 10, coinReward: 5 };
      const result = calculateCardRewards(option, 1.2, 1.3, 1.0);
      expect(result.coins).toBe(5);
    });

    it('should handle 1.0 modifiers', () => {
      const option = { id: 'A', label: 'X', description: 'X', consequences: [], xpReward: 20, coinReward: 10 };
      const result = calculateCardRewards(option, 1.0, 1.0, 1.0);
      expect(result.xp).toBe(20);
      expect(result.coins).toBe(10);
    });
  });
});
