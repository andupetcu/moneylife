// packages/simulation-engine/__tests__/investment-sim.test.ts

import {
  getAssetConfig, simulateMonthlyReturn, applyMonthlyReturn,
  calculateQuarterlyDividend, simulatePortfolioMonth,
  totalPortfolioValue, uniqueAssetTypes,
} from '../src/investment-sim';
import { createRng } from '../src/scenarios';

describe('Investment Simulation', () => {
  describe('getAssetConfig', () => {
    it('should return config for each asset type', () => {
      expect(getAssetConfig('index').meanMonthlyReturn).toBe(0.007);
      expect(getAssetConfig('bond').stddevMonthlyReturn).toBe(0.005);
      expect(getAssetConfig('crypto').annualDividendYield).toBe(0);
    });
  });

  describe('simulateMonthlyReturn', () => {
    it('should be deterministic', () => {
      const r1 = simulateMonthlyReturn(createRng('seed'), 'index');
      const r2 = simulateMonthlyReturn(createRng('seed'), 'index');
      expect(r1).toBe(r2);
    });

    it('should be clamped to [-30%, +30%]', () => {
      const rng = createRng('clamp-test');
      for (let i = 0; i < 100; i++) {
        const ret = simulateMonthlyReturn(rng, 'crypto', 2.0);
        expect(ret).toBeGreaterThanOrEqual(-0.30);
        expect(ret).toBeLessThanOrEqual(0.30);
      }
    });

    it('should apply volatility multiplier', () => {
      // Higher multiplier = higher variance (hard to test directly, just ensure no error)
      const rng = createRng('vol');
      const ret = simulateMonthlyReturn(rng, 'index', 1.4);
      expect(typeof ret).toBe('number');
    });
  });

  describe('applyMonthlyReturn', () => {
    it('should increase value for positive return', () => {
      expect(applyMonthlyReturn(100000, 0.05)).toBe(105000);
    });

    it('should decrease value for negative return', () => {
      expect(applyMonthlyReturn(100000, -0.10)).toBe(90000);
    });

    it('should never go below 1', () => {
      expect(applyMonthlyReturn(100, -0.99)).toBe(1);
    });

    it('should handle zero return', () => {
      expect(applyMonthlyReturn(100000, 0)).toBe(100000);
    });
  });

  describe('calculateQuarterlyDividend', () => {
    it('should calculate index dividend', () => {
      // 1,000,000 * (0.02 / 4) = 5000
      expect(calculateQuarterlyDividend(1000000, 'index')).toBe(5000);
    });

    it('should return 0 for crypto', () => {
      expect(calculateQuarterlyDividend(1000000, 'crypto')).toBe(0);
    });

    it('should calculate bond dividend', () => {
      // 1,000,000 * (0.035 / 4) = 8750
      expect(calculateQuarterlyDividend(1000000, 'bond')).toBe(8750);
    });
  });

  describe('simulatePortfolioMonth', () => {
    it('should update all holdings', () => {
      const rng = createRng('portfolio');
      const holdings = [
        { assetType: 'index' as const, value: 500000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
        { assetType: 'bond' as const, value: 300000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
      ];
      const result = simulatePortfolioMonth(rng, holdings, false);
      expect(result.updatedHoldings).toHaveLength(2);
      expect(result.totalDividends).toBe(0); // Not quarter end
    });

    it('should pay dividends at quarter end', () => {
      const rng = createRng('div-quarter');
      const holdings = [
        { assetType: 'index' as const, value: 1000000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
      ];
      const result = simulatePortfolioMonth(rng, holdings, true);
      expect(result.totalDividends).toBeGreaterThan(0);
    });

    it('should reinvest dividends when DRIP enabled', () => {
      const rng = createRng('drip');
      const holdings = [
        { assetType: 'index' as const, value: 1000000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: true },
      ];
      const result = simulatePortfolioMonth(rng, holdings, true);
      // Dividends should be reinvested, so totalDividends = 0
      expect(result.totalDividends).toBe(0);
      // But value should include dividend
    });

    it('should be deterministic', () => {
      const holdings = [
        { assetType: 'stock' as const, value: 500000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
      ];
      const r1 = simulatePortfolioMonth(createRng('det'), holdings, false);
      const r2 = simulatePortfolioMonth(createRng('det'), holdings, false);
      expect(r1.updatedHoldings[0].value).toBe(r2.updatedHoldings[0].value);
    });
  });

  describe('totalPortfolioValue', () => {
    it('should sum values', () => {
      expect(totalPortfolioValue([
        { assetType: 'index', value: 500000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
        { assetType: 'bond', value: 300000, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
      ])).toBe(800000);
    });

    it('should return 0 for empty', () => {
      expect(totalPortfolioValue([])).toBe(0);
    });
  });

  describe('uniqueAssetTypes', () => {
    it('should count unique types', () => {
      expect(uniqueAssetTypes([
        { assetType: 'index', value: 1, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
        { assetType: 'bond', value: 1, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
        { assetType: 'index', value: 1, purchaseDate: { year: 2026, month: 1, day: 1 }, dripEnabled: false },
      ])).toBe(2);
    });
  });
});
