// packages/simulation-engine/__tests__/scenarios.test.ts

import {
  createRng, randomInt, randomFloat, randomPick,
  weightedRandomPick, weightedRandomSample,
  normalDistribution, selectDailyScenarios,
} from '../src/scenarios';

describe('Scenarios & RNG', () => {
  describe('createRng', () => {
    it('should be deterministic — same seed = same sequence', () => {
      const rng1 = createRng('test-seed');
      const rng2 = createRng('test-seed');
      const seq1 = Array.from({ length: 10 }, () => rng1());
      const seq2 = Array.from({ length: 10 }, () => rng2());
      expect(seq1).toEqual(seq2);
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = createRng('seed-a');
      const rng2 = createRng('seed-b');
      const v1 = rng1();
      const v2 = rng2();
      expect(v1).not.toBe(v2);
    });

    it('should produce values between 0 and 1', () => {
      const rng = createRng('test');
      for (let i = 0; i < 100; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it('should produce varied distribution', () => {
      const rng = createRng('distribution-test');
      const values = Array.from({ length: 1000 }, () => rng());
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      // Should be roughly centered around 0.5
      expect(avg).toBeGreaterThan(0.4);
      expect(avg).toBeLessThan(0.6);
    });
  });

  describe('randomInt', () => {
    it('should produce integers in range', () => {
      const rng = createRng('int-test');
      for (let i = 0; i < 50; i++) {
        const v = randomInt(rng, 1, 10);
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(10);
        expect(Number.isInteger(v)).toBe(true);
      }
    });

    it('should handle min === max', () => {
      const rng = createRng('same');
      expect(randomInt(rng, 5, 5)).toBe(5);
    });
  });

  describe('randomFloat', () => {
    it('should produce floats in range', () => {
      const rng = createRng('float-test');
      for (let i = 0; i < 50; i++) {
        const v = randomFloat(rng, 2.0, 5.0);
        expect(v).toBeGreaterThanOrEqual(2.0);
        expect(v).toBeLessThan(5.0);
      }
    });
  });

  describe('randomPick', () => {
    it('should pick from array', () => {
      const rng = createRng('pick-test');
      const arr = ['a', 'b', 'c'];
      for (let i = 0; i < 20; i++) {
        expect(arr).toContain(randomPick(rng, arr));
      }
    });
  });

  describe('weightedRandomPick', () => {
    it('should heavily favor highest weight', () => {
      const rng = createRng('weighted');
      const items = ['rare', 'common'];
      const weights = [1, 99];
      let commonCount = 0;
      for (let i = 0; i < 100; i++) {
        if (weightedRandomPick(rng, items, weights) === 'common') commonCount++;
      }
      expect(commonCount).toBeGreaterThan(80);
    });

    it('should return only item when single', () => {
      const rng = createRng('single');
      expect(weightedRandomPick(rng, ['only'], [1])).toBe('only');
    });
  });

  describe('weightedRandomSample', () => {
    it('should return requested count', () => {
      const rng = createRng('sample');
      const result = weightedRandomSample(rng, ['a', 'b', 'c', 'd'], [1, 1, 1, 1], 2);
      expect(result).toHaveLength(2);
    });

    it('should not have duplicates', () => {
      const rng = createRng('no-dup');
      const result = weightedRandomSample(rng, ['a', 'b', 'c', 'd'], [1, 1, 1, 1], 3);
      expect(new Set(result).size).toBe(3);
    });

    it('should return all items if count >= length', () => {
      const rng = createRng('all');
      const result = weightedRandomSample(rng, ['a', 'b'], [1, 1], 5);
      expect(result).toHaveLength(2);
    });
  });

  describe('normalDistribution', () => {
    it('should produce clamped values', () => {
      const rng = createRng('normal');
      for (let i = 0; i < 100; i++) {
        const v = normalDistribution(rng, 0.007, 0.03, -0.30, 0.30);
        expect(v).toBeGreaterThanOrEqual(-0.30);
        expect(v).toBeLessThanOrEqual(0.30);
      }
    });

    it('should average near mean', () => {
      const rng = createRng('mean-test');
      const values = Array.from({ length: 1000 }, () => normalDistribution(rng, 0.5, 0.1, 0, 1));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      expect(avg).toBeCloseTo(0.5, 1);
    });
  });

  describe('selectDailyScenarios', () => {
    const scenarios = [
      { id: '1', category: 'food', personaTags: ['young_adult'], levelRange: [1, 8] as [number, number], frequencyWeight: 3 },
      { id: '2', category: 'shopping', personaTags: ['young_adult'], levelRange: [1, 8] as [number, number], frequencyWeight: 3 },
      { id: '3', category: 'health', personaTags: ['teen'], levelRange: [1, 8] as [number, number], frequencyWeight: 3 },
      { id: '4', category: 'career', personaTags: ['young_adult'], levelRange: [4, 8] as [number, number], frequencyWeight: 3 },
    ];

    it('should filter by persona', () => {
      const rng = createRng('filter-persona');
      const result = selectDailyScenarios(rng, scenarios, {
        persona: 'young_adult',
        level: 2,
        recentCardIds: [],
        recentCategories: new Map(),
      }, 3);
      expect(result.every((s) => s.personaTags.includes('young_adult'))).toBe(true);
    });

    it('should filter by level', () => {
      const rng = createRng('filter-level');
      const result = selectDailyScenarios(rng, scenarios, {
        persona: 'young_adult',
        level: 2,
        recentCardIds: [],
        recentCategories: new Map(),
      }, 10);
      // Should not include career (level 4+)
      expect(result.find((s) => s.id === '4')).toBeUndefined();
    });

    it('should filter out recent cards', () => {
      const rng = createRng('filter-recent');
      const result = selectDailyScenarios(rng, scenarios, {
        persona: 'young_adult',
        level: 5,
        recentCardIds: ['1', '2'],
        recentCategories: new Map(),
      }, 10);
      expect(result.find((s) => s.id === '1')).toBeUndefined();
      expect(result.find((s) => s.id === '2')).toBeUndefined();
    });

    it('should return empty for no eligible', () => {
      const rng = createRng('no-eligible');
      const result = selectDailyScenarios(rng, scenarios, {
        persona: 'parent',
        level: 1,
        recentCardIds: [],
        recentCategories: new Map(),
      }, 3);
      expect(result).toHaveLength(0);
    });

    it('should be deterministic', () => {
      const filter = { persona: 'young_adult', level: 5, recentCardIds: [] as string[], recentCategories: new Map<string, number>() };
      const r1 = selectDailyScenarios(createRng('det'), scenarios, filter, 2);
      const r2 = selectDailyScenarios(createRng('det'), scenarios, filter, 2);
      expect(r1.map((s) => s.id)).toEqual(r2.map((s) => s.id));
    });
  });
});
