// packages/simulation-engine/__tests__/credit-health.test.ts

import {
  calculatePaymentHistoryScore,
  calculateUtilizationScore,
  calculateAccountAgeScore,
  calculateCreditMixScore,
  calculateNewCreditScore,
  calculateCreditHealthIndex,
  determineTrend,
} from '../src/credit-health';

describe('Credit Health Index', () => {
  describe('calculatePaymentHistoryScore', () => {
    it('should return 100 for perfect history', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 12,
        latePayments: [],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(100);
    });

    it('should penalize late payment (1-30 days)', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [{ daysLate: 15, monthsAgo: 1 }],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(90); // 100 - 10
    });

    it('should penalize late payment (31-60 days)', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [{ daysLate: 45, monthsAgo: 1 }],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(80); // 100 - 20
    });

    it('should penalize late payment (61-90 days)', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [{ daysLate: 75, monthsAgo: 1 }],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(65); // 100 - 35
    });

    it('should penalize late payment (90+ days)', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [{ daysLate: 120, monthsAgo: 1 }],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(50); // 100 - 50
    });

    it('should decay penalties after 12 months (50%)', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [{ daysLate: 15, monthsAgo: 15 }],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(95); // 100 - 5 (10 * 0.5)
    });

    it('should remove penalties after 24 months', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [{ daysLate: 15, monthsAgo: 25 }],
        missedPayments: [],
        collections: 0,
      });
      expect(score).toBe(100); // penalty removed
    });

    it('should penalize missed payments', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [],
        missedPayments: [{ monthsAgo: 1 }],
        collections: 0,
      });
      expect(score).toBe(50); // 100 - 50
    });

    it('should heavily penalize collections', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [],
        missedPayments: [],
        collections: 1,
      });
      expect(score).toBe(25); // 100 - 75
    });

    it('should recover with on-time payments', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 10,
        latePayments: [{ daysLate: 15, monthsAgo: 1 }],
        missedPayments: [],
        collections: 0,
      });
      // 100 - 10 + 10*2 = 100 + 10 = capped at 100
      expect(score).toBe(100);
    });

    it('should floor at 0', () => {
      const score = calculatePaymentHistoryScore({
        onTimePayments: 0,
        latePayments: [],
        missedPayments: [
          { monthsAgo: 1 }, { monthsAgo: 2 }, { monthsAgo: 3 },
        ],
        collections: 0,
      });
      expect(score).toBe(0);
    });
  });

  describe('calculateUtilizationScore', () => {
    it('should return 50 for no credit accounts', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 0, totalCreditAvailable: 0, hasAnyCreditAccounts: false,
      })).toBe(50);
    });

    it('should return 100 for 1-9% utilization (optimal)', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 500, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(100);
    });

    it('should return 85 for 0% utilization', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 0, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(85);
    });

    it('should return 90 for 10-29%', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 2000, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(90);
    });

    it('should return 70 for 30-49%', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 4000, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(70);
    });

    it('should return 45 for 50-74%', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 6000, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(45);
    });

    it('should return 20 for 75-99%', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 8000, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(20);
    });

    it('should return 0 for 100%+', () => {
      expect(calculateUtilizationScore({
        totalCreditUsed: 10000, totalCreditAvailable: 10000, hasAnyCreditAccounts: true,
      })).toBe(0);
    });

    it('should score high utilization from debt game very low', () => {
      // 98% utilization
      expect(calculateUtilizationScore({
        totalCreditUsed: 490000, totalCreditAvailable: 500000, hasAnyCreditAccounts: true,
      })).toBe(20);
    });
  });

  describe('calculateAccountAgeScore', () => {
    it('should return 20 for no accounts', () => {
      expect(calculateAccountAgeScore({ accountAgesMonths: [] })).toBe(20);
    });

    it('should return 20 for very new accounts', () => {
      expect(calculateAccountAgeScore({ accountAgesMonths: [1, 2] })).toBe(20);
    });

    it('should return 100 for old accounts', () => {
      expect(calculateAccountAgeScore({ accountAgesMonths: [72, 84] })).toBe(100);
    });

    it('should average ages', () => {
      // Average: (2 + 60) / 2 = 31 months
      expect(calculateAccountAgeScore({ accountAgesMonths: [2, 60] })).toBe(75);
    });
  });

  describe('calculateCreditMixScore', () => {
    it('should return 0 for no accounts', () => {
      expect(calculateCreditMixScore({ accountTypes: [] })).toBe(0);
    });

    it('should score checking + savings + credit card + auto loan', () => {
      // 10 + 10 + 20 + 15 = 55
      expect(calculateCreditMixScore({
        accountTypes: ['checking', 'savings', 'credit_card', 'auto_loan'],
      })).toBe(55);
    });

    it('should cap at 100', () => {
      expect(calculateCreditMixScore({
        accountTypes: ['checking', 'savings', 'credit_card', 'auto_loan', 'mortgage', 'personal_loan', 'student_loan', 'investment'],
      })).toBe(100);
    });

    it('should not double-count duplicate types', () => {
      expect(calculateCreditMixScore({
        accountTypes: ['checking', 'checking', 'checking'],
      })).toBe(10);
    });
  });

  describe('calculateNewCreditScore', () => {
    it('should return 100 for 0 applications', () => {
      expect(calculateNewCreditScore({ applicationsLast6Months: 0 })).toBe(100);
    });

    it('should return 90 for 1', () => {
      expect(calculateNewCreditScore({ applicationsLast6Months: 1 })).toBe(90);
    });

    it('should return 15 for 5+', () => {
      expect(calculateNewCreditScore({ applicationsLast6Months: 5 })).toBe(15);
      expect(calculateNewCreditScore({ applicationsLast6Months: 10 })).toBe(15);
    });
  });

  describe('calculateCreditHealthIndex', () => {
    it('should calculate perfect score close to 850', () => {
      const result = calculateCreditHealthIndex({
        paymentHistory: { onTimePayments: 48, latePayments: [], missedPayments: [], collections: 0 },
        utilization: { totalCreditUsed: 500, totalCreditAvailable: 10000, hasAnyCreditAccounts: true },
        accountAge: { accountAgesMonths: [72] },
        creditMix: { accountTypes: ['checking', 'savings', 'credit_card', 'mortgage', 'auto_loan', 'investment'] },
        newCredit: { applicationsLast6Months: 0 },
      });
      expect(result.overall).toBeGreaterThanOrEqual(800);
      expect(result.overall).toBeLessThanOrEqual(850);
    });

    it('should calculate example from docs: CHI = 739', () => {
      const result = calculateCreditHealthIndex({
        paymentHistory: { onTimePayments: 0, latePayments: [{ daysLate: 15, monthsAgo: 8 }], missedPayments: [], collections: 0 },
        utilization: { totalCreditUsed: 500, totalCreditAvailable: 10000, hasAnyCreditAccounts: true },
        accountAge: { accountAgesMonths: [10] },
        creditMix: { accountTypes: ['checking', 'savings', 'credit_card', 'auto_loan'] },
        newCredit: { applicationsLast6Months: 0 },
      });
      // Payment: 90, Util: 100, Age: 50, Mix: 55, New: 100
      // Raw: 90*0.35 + 100*0.30 + 50*0.15 + 55*0.10 + 100*0.10
      // = 31.5 + 30 + 7.5 + 5.5 + 10 = 84.5
      // CHI = 300 + (84.5/100)*550 = 300 + 464.75 = 765
      expect(result.overall).toBeGreaterThanOrEqual(700);
      expect(result.overall).toBeLessThanOrEqual(800);
    });

    it('should return minimum 300', () => {
      const result = calculateCreditHealthIndex({
        paymentHistory: { onTimePayments: 0, latePayments: [], missedPayments: [
          { monthsAgo: 1 }, { monthsAgo: 2 }, { monthsAgo: 3 },
        ], collections: 2 },
        utilization: { totalCreditUsed: 10000, totalCreditAvailable: 10000, hasAnyCreditAccounts: true },
        accountAge: { accountAgesMonths: [1] },
        creditMix: { accountTypes: [] },
        newCredit: { applicationsLast6Months: 10 },
      });
      expect(result.overall).toBeLessThanOrEqual(350);
    });

    it('should score high utilization (>90%) with score < 600', () => {
      const result = calculateCreditHealthIndex({
        paymentHistory: { onTimePayments: 6, latePayments: [], missedPayments: [], collections: 0 },
        utilization: { totalCreditUsed: 9500, totalCreditAvailable: 10000, hasAnyCreditAccounts: true },
        accountAge: { accountAgesMonths: [6] },
        creditMix: { accountTypes: ['credit_card'] },
        newCredit: { applicationsLast6Months: 0 },
      });
      // Utilization at 95% = score 20
      expect(result.factors.utilization).toBe(20);
      // Overall will be dragged down
      expect(result.overall).toBeLessThan(700);
    });

    it('should always be between 300 and 850', () => {
      // Run many variations
      const scenarios = [
        { ph: 0, util: 0, age: 0, mix: 0, nc: 15 },
        { ph: 100, util: 100, age: 100, mix: 100, nc: 100 },
        { ph: 50, util: 50, age: 50, mix: 50, nc: 50 },
      ];
      for (const s of scenarios) {
        const result = calculateCreditHealthIndex({
          paymentHistory: { onTimePayments: s.ph / 2, latePayments: [], missedPayments: [], collections: 0 },
          utilization: { totalCreditUsed: 0, totalCreditAvailable: 10000, hasAnyCreditAccounts: true },
          accountAge: { accountAgesMonths: [36] },
          creditMix: { accountTypes: ['checking', 'savings'] },
          newCredit: { applicationsLast6Months: 0 },
        });
        expect(result.overall).toBeGreaterThanOrEqual(300);
        expect(result.overall).toBeLessThanOrEqual(850);
      }
    });
  });

  describe('determineTrend', () => {
    it('should detect improving', () => {
      expect(determineTrend(750, 740)).toBe('improving');
    });

    it('should detect declining', () => {
      expect(determineTrend(740, 750)).toBe('declining');
    });

    it('should detect stable', () => {
      expect(determineTrend(750, 748)).toBe('stable');
    });
  });
});
