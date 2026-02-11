// packages/simulation-engine/__tests__/interest.test.ts

import {
  apyToMonthlyRate,
  calculateSavingsInterest,
  calculateDailyCreditCardInterest,
  calculateMonthlyCreditCardInterest,
  calculateAmortizationPayment,
  splitLoanPayment,
  generateAmortizationSchedule,
  calculateCompoundInterest,
  calculateSimpleInterest,
  calculateOverdraftDailyInterest,
  bankersRound,
  calculateMinimumPayment,
} from '../src/interest';

describe('Interest Calculations', () => {
  describe('bankersRound', () => {
    it('should round normal values', () => {
      expect(bankersRound(2.3)).toBe(2);
      expect(bankersRound(2.7)).toBe(3);
      expect(bankersRound(0)).toBe(0);
    });

    it('should round .5 to even (banker\'s rounding)', () => {
      expect(bankersRound(0.5)).toBe(0);
      expect(bankersRound(1.5)).toBe(2);
      expect(bankersRound(2.5)).toBe(2);
      expect(bankersRound(3.5)).toBe(4);
    });

    it('should handle negative values', () => {
      expect(bankersRound(-2.3)).toBe(-2);
      expect(bankersRound(-2.7)).toBe(-3);
    });

    it('should handle large values', () => {
      expect(bankersRound(1000000.4)).toBe(1000000);
      expect(bankersRound(1000000.6)).toBe(1000001);
    });
  });

  describe('apyToMonthlyRate', () => {
    it('should convert 2.5% APY', () => {
      const monthly = apyToMonthlyRate(0.025);
      // (1.025)^(1/12) - 1 ≈ 0.002060
      expect(monthly).toBeCloseTo(0.002060, 4);
    });

    it('should return 0 for 0% APY', () => {
      expect(apyToMonthlyRate(0)).toBe(0);
    });

    it('should convert 5% APY', () => {
      const monthly = apyToMonthlyRate(0.05);
      expect(monthly).toBeCloseTo(0.004074, 4);
    });
  });

  describe('calculateSavingsInterest', () => {
    it('should calculate interest for 10,000 at 2.5% APY', () => {
      // As per docs: Balance=10,000 (1,000,000 cents), APY=2.5%
      // monthly_rate = 0.002060, interest = 1,000,000 * 0.002060 = 2060 cents = $20.60
      const interest = calculateSavingsInterest(1000000, 0.025);
      expect(interest).toBeCloseTo(2060, -1); // Allow small rounding
    });

    it('should return 0 for zero balance', () => {
      expect(calculateSavingsInterest(0, 0.025)).toBe(0);
    });

    it('should return 0 for zero rate', () => {
      expect(calculateSavingsInterest(1000000, 0)).toBe(0);
    });

    it('should return 0 for negative balance', () => {
      expect(calculateSavingsInterest(-1000, 0.025)).toBe(0);
    });

    it('should scale linearly with balance', () => {
      const interest1 = calculateSavingsInterest(100000, 0.025);
      const interest2 = calculateSavingsInterest(200000, 0.025);
      expect(interest2).toBeCloseTo(interest1 * 2, 0);
    });
  });

  describe('calculateDailyCreditCardInterest', () => {
    it('should calculate daily interest for 19.99% APR on $50 balance', () => {
      // 5000 cents, DPR = 0.1999/365 = 0.000547671
      // daily_interest = 5000 * 0.000547671 = 2.738 ≈ 3 cents
      const daily = calculateDailyCreditCardInterest(500000, 0.1999);
      // 500000 * 0.1999/365 = 273.8 ≈ 274
      expect(daily).toBe(274);
    });

    it('should return 0 for zero balance', () => {
      expect(calculateDailyCreditCardInterest(0, 0.1999)).toBe(0);
    });

    it('should return 0 for negative balance (credit)', () => {
      expect(calculateDailyCreditCardInterest(-1000, 0.1999)).toBe(0);
    });

    it('should return 0 for zero APR', () => {
      expect(calculateDailyCreditCardInterest(5000, 0)).toBe(0);
    });
  });

  describe('calculateMonthlyCreditCardInterest', () => {
    it('should calculate monthly interest', () => {
      // ADB=500000, APR=0.1999, 30 days
      const interest = calculateMonthlyCreditCardInterest(500000, 0.1999, 30);
      // 500000 * (0.1999/365) * 30 = 8214 cents
      expect(interest).toBeCloseTo(8214, -1);
    });

    it('should return 0 for zero ADB', () => {
      expect(calculateMonthlyCreditCardInterest(0, 0.1999, 30)).toBe(0);
    });

    it('should return 0 for zero days', () => {
      expect(calculateMonthlyCreditCardInterest(500000, 0.1999, 0)).toBe(0);
    });
  });

  describe('calculateAmortizationPayment', () => {
    it('should calculate auto loan payment correctly', () => {
      // From docs: $20,000 (2,000,000 cents), 6.5% APR, 48 months
      // Expected: $473.89/month = 47389 cents
      const payment = calculateAmortizationPayment(2000000, 0.065, 48);
      expect(payment).toBeCloseTo(47389, -2);
    });

    it('should return 0 for zero principal', () => {
      expect(calculateAmortizationPayment(0, 0.065, 48)).toBe(0);
    });

    it('should return 0 for zero term', () => {
      expect(calculateAmortizationPayment(1000000, 0.065, 0)).toBe(0);
    });

    it('should handle zero interest rate', () => {
      const payment = calculateAmortizationPayment(1200000, 0, 12);
      expect(payment).toBe(100000); // 1,200,000 / 12
    });

    it('should handle small loans', () => {
      const payment = calculateAmortizationPayment(10000, 0.055, 12);
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeLessThan(10000);
    });

    it('should handle large mortgages', () => {
      // 180,000 (18,000,000 cents), 4.5% APR, 360 months
      const payment = calculateAmortizationPayment(18000000, 0.045, 360);
      expect(payment).toBeGreaterThan(80000);
      expect(payment).toBeLessThan(120000);
    });
  });

  describe('splitLoanPayment', () => {
    it('should split payment into interest and principal', () => {
      const result = splitLoanPayment(2000000, 0.065, 47389);
      // interest = 2000000 * (0.065/12) = 10833
      expect(result.interest).toBeCloseTo(10833, -1);
      expect(result.principal).toBeCloseTo(47389 - 10833, -1);
    });

    it('should have interest + principal = payment', () => {
      const result = splitLoanPayment(2000000, 0.065, 47389);
      expect(result.interest + result.principal).toBe(47389);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate correct number of entries', () => {
      const schedule = generateAmortizationSchedule(100000, 0.05, 12);
      expect(schedule).toHaveLength(12);
    });

    it('should end with zero remaining balance', () => {
      const schedule = generateAmortizationSchedule(100000, 0.05, 12);
      expect(schedule[schedule.length - 1].remaining).toBe(0);
    });

    it('should have decreasing remaining balance', () => {
      const schedule = generateAmortizationSchedule(1000000, 0.065, 48);
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].remaining).toBeLessThan(schedule[i - 1].remaining);
      }
    });

    it('should have increasing principal portion over time', () => {
      const schedule = generateAmortizationSchedule(1000000, 0.065, 48);
      // In a standard amortization, principal increases over time
      expect(schedule[schedule.length - 2].principal).toBeGreaterThan(schedule[0].principal);
    });

    it('should have decreasing interest portion over time', () => {
      const schedule = generateAmortizationSchedule(1000000, 0.065, 48);
      expect(schedule[schedule.length - 2].interest).toBeLessThan(schedule[0].interest);
    });
  });

  describe('calculateCompoundInterest', () => {
    it('should calculate compound interest correctly', () => {
      // 100,000 cents at 5% for 1 year, monthly compounding
      const result = calculateCompoundInterest(100000, 0.05, 12, 1);
      // A = 100000 * (1 + 0.05/12)^12 ≈ 105116
      expect(result).toBeCloseTo(105116, -1);
    });

    it('should handle zero principal', () => {
      expect(calculateCompoundInterest(0, 0.05, 12, 1)).toBe(0);
    });

    it('should exceed simple interest', () => {
      const compound = calculateCompoundInterest(100000, 0.1, 12, 5);
      const simple = 100000 + calculateSimpleInterest(100000, 0.1, 5);
      expect(compound).toBeGreaterThan(simple);
    });
  });

  describe('calculateSimpleInterest', () => {
    it('should calculate simple interest', () => {
      // 100,000 cents at 5% for 1 year = 5,000
      expect(calculateSimpleInterest(100000, 0.05, 1)).toBe(5000);
    });

    it('should scale with time', () => {
      const i1 = calculateSimpleInterest(100000, 0.05, 1);
      const i2 = calculateSimpleInterest(100000, 0.05, 2);
      expect(i2).toBe(i1 * 2);
    });
  });

  describe('calculateOverdraftDailyInterest', () => {
    it('should calculate daily overdraft interest at 18% APR', () => {
      // |balance| * (0.18 / 365)
      // 50000 * 0.000493 = 24.66 ≈ 25
      const daily = calculateOverdraftDailyInterest(-50000, 0.18);
      expect(daily).toBe(25);
    });

    it('should work with positive input (takes absolute value)', () => {
      const daily = calculateOverdraftDailyInterest(50000, 0.18);
      expect(daily).toBe(25);
    });

    it('should return 0 for zero balance', () => {
      expect(calculateOverdraftDailyInterest(0, 0.18)).toBe(0);
    });
  });

  describe('calculateMinimumPayment', () => {
    it('should use floor when balance is large', () => {
      // MAX(2500, 0.02 * 500000) = MAX(2500, 10000) = 10000
      expect(calculateMinimumPayment(500000, 2500, 0.02)).toBe(10000);
    });

    it('should use floor when percentage is too low', () => {
      // MAX(2500, 0.02 * 100000) = MAX(2500, 2000) = 2500
      expect(calculateMinimumPayment(100000, 2500, 0.02)).toBe(2500);
    });

    it('should return full balance when balance < floor', () => {
      expect(calculateMinimumPayment(1000, 2500, 0.02)).toBe(1000);
    });

    it('should return 0 for zero balance', () => {
      expect(calculateMinimumPayment(0, 2500, 0.02)).toBe(0);
    });

    it('should return 0 for negative balance', () => {
      expect(calculateMinimumPayment(-5000, 2500, 0.02)).toBe(0);
    });
  });
});
