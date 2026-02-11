// packages/simulation-engine/__tests__/inflation.test.ts

import {
  annualToMonthlyInflation,
  applyMonthlyInflation,
  applyCumulativeInflation,
  cumulativeInflationFactor,
  inflateRecurringBills,
  getInflationRate,
} from '../src/inflation';

describe('Inflation Engine', () => {
  describe('annualToMonthlyInflation', () => {
    it('should divide by 12', () => {
      expect(annualToMonthlyInflation(0.03)).toBeCloseTo(0.0025, 4);
    });

    it('should handle 0', () => {
      expect(annualToMonthlyInflation(0)).toBe(0);
    });
  });

  describe('applyMonthlyInflation', () => {
    it('should apply 3% annual to 100000', () => {
      // 100000 * (1 + 0.03/12) = 100000 * 1.0025 = 100250
      expect(applyMonthlyInflation(100000, 0.03)).toBe(100250);
    });

    it('should not change with 0 inflation', () => {
      expect(applyMonthlyInflation(100000, 0)).toBe(100000);
    });

    it('should handle small amounts', () => {
      // 100 * 1.0025 = 100.25 → rounds to 100
      expect(applyMonthlyInflation(100, 0.03)).toBe(100);
    });
  });

  describe('applyCumulativeInflation', () => {
    it('should compound over months', () => {
      // 100000 at 3% annual for 12 months
      const result = applyCumulativeInflation(100000, 0.03, 12);
      // 100000 * (1.0025)^12 ≈ 103042
      expect(result).toBeCloseTo(103042, -2);
    });

    it('should handle 0 months', () => {
      expect(applyCumulativeInflation(100000, 0.03, 0)).toBe(100000);
    });

    it('should increase cost over time', () => {
      const m6 = applyCumulativeInflation(100000, 0.05, 6);
      const m12 = applyCumulativeInflation(100000, 0.05, 12);
      expect(m12).toBeGreaterThan(m6);
      expect(m6).toBeGreaterThan(100000);
    });
  });

  describe('cumulativeInflationFactor', () => {
    it('should calculate factor', () => {
      expect(cumulativeInflationFactor(0.03, 12)).toBeCloseTo(1.0304, 3);
    });

    it('should be 1.0 at 0 months', () => {
      expect(cumulativeInflationFactor(0.03, 0)).toBe(1);
    });
  });

  describe('inflateRecurringBills', () => {
    it('should inflate all bills', () => {
      const bills = [
        { name: 'Rent', amount: 80000 },
        { name: 'Utilities', amount: 10000 },
      ];
      const inflated = inflateRecurringBills(bills, 0.03);
      expect(inflated[0].amount).toBeGreaterThan(80000);
      expect(inflated[1].amount).toBeGreaterThan(10000);
      expect(inflated[0].name).toBe('Rent');
    });
  });

  describe('getInflationRate', () => {
    it('should return correct rates per difficulty', () => {
      expect(getInflationRate('easy')).toBe(0.015);
      expect(getInflationRate('normal')).toBe(0.03);
      expect(getInflationRate('hard')).toBe(0.05);
    });
  });
});
