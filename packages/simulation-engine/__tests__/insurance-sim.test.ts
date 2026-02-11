// packages/simulation-engine/__tests__/insurance-sim.test.ts

import {
  createPolicy, processMonthlyPremium, processClaim,
  calculateRenewalPremium, renewPolicy, fileClaimAndUpdate,
  isPolicyLapsed, calculateReinstatementCost,
} from '../src/insurance-sim';

describe('Insurance Simulation', () => {
  describe('createPolicy', () => {
    it('should create an active policy', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      expect(policy.isActive).toBe(true);
      expect(policy.monthlyPremium).toBe(15000);
      expect(policy.deductible).toBe(50000);
      expect(policy.coverageRate).toBe(0.80);
      expect(policy.monthsActive).toBe(0);
      expect(policy.claimsThisYear).toBe(0);
    });
  });

  describe('processMonthlyPremium', () => {
    it('should increment months when paid', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      const updated = processMonthlyPremium(policy, true);
      expect(updated.monthsActive).toBe(1);
      expect(updated.monthsUnpaid).toBe(0);
      expect(updated.isActive).toBe(true);
    });

    it('should track unpaid months', () => {
      let policy = createPolicy('health', 15000, 50000, 0.80);
      policy = processMonthlyPremium(policy, false);
      expect(policy.monthsUnpaid).toBe(1);
      expect(policy.isActive).toBe(true);
    });

    it('should lapse after 3 unpaid months', () => {
      let policy = createPolicy('health', 15000, 50000, 0.80);
      policy = processMonthlyPremium(policy, false);
      policy = processMonthlyPremium(policy, false);
      policy = processMonthlyPremium(policy, false);
      expect(policy.isActive).toBe(false);
    });

    it('should reset unpaid counter when paid', () => {
      let policy = createPolicy('health', 15000, 50000, 0.80);
      policy = processMonthlyPremium(policy, false);
      policy = processMonthlyPremium(policy, false);
      policy = processMonthlyPremium(policy, true);
      expect(policy.monthsUnpaid).toBe(0);
      expect(policy.isActive).toBe(true);
    });
  });

  describe('processClaim', () => {
    it('should cover claim on active policy', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      const result = processClaim(policy, 200000);
      // Deductible: 50000, After: 150000, Insurance: 120000, Player: 50000 + 30000 = 80000
      expect(result.covered).toBe(true);
      expect(result.deductiblePaid).toBe(50000);
      expect(result.insurancePaid).toBe(120000);
      expect(result.playerPays).toBe(80000);
    });

    it('should not cover claim on lapsed policy', () => {
      const policy = { ...createPolicy('health', 15000, 50000, 0.80), isActive: false };
      const result = processClaim(policy, 200000);
      expect(result.covered).toBe(false);
      expect(result.playerPays).toBe(200000);
    });

    it('should handle claim < deductible', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      const result = processClaim(policy, 30000);
      expect(result.deductiblePaid).toBe(30000);
      expect(result.insurancePaid).toBe(0);
      expect(result.playerPays).toBe(30000);
    });

    it('should handle claim = deductible', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      const result = processClaim(policy, 50000);
      expect(result.deductiblePaid).toBe(50000);
      expect(result.insurancePaid).toBe(0);
      expect(result.playerPays).toBe(50000);
    });

    it('should handle large claim', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      const result = processClaim(policy, 1000000);
      // Deductible: 50000, After: 950000, Insurance: 760000, Player: 50000 + 190000 = 240000
      expect(result.insurancePaid).toBe(760000);
      expect(result.playerPays).toBe(240000);
      expect(result.deductiblePaid + result.insurancePaid + (result.playerPays - result.deductiblePaid)).toBe(1000000);
    });
  });

  describe('calculateRenewalPremium', () => {
    it('should not increase with no claims', () => {
      const policy = createPolicy('auto', 8000, 25000, 0.80);
      expect(calculateRenewalPremium(policy)).toBe(8000);
    });

    it('should increase 10% per claim', () => {
      const policy = { ...createPolicy('auto', 8000, 25000, 0.80), claimsThisYear: 1 };
      expect(calculateRenewalPremium(policy)).toBe(8800);
    });

    it('should increase 20% for 2 claims', () => {
      const policy = { ...createPolicy('auto', 8000, 25000, 0.80), claimsThisYear: 2 };
      expect(calculateRenewalPremium(policy)).toBe(9600);
    });
  });

  describe('renewPolicy', () => {
    it('should reset claims and update premium', () => {
      const policy = { ...createPolicy('auto', 8000, 25000, 0.80), claimsThisYear: 2 };
      const renewed = renewPolicy(policy);
      expect(renewed.claimsThisYear).toBe(0);
      expect(renewed.monthlyPremium).toBe(9600);
      expect(renewed.basePremium).toBe(9600);
    });
  });

  describe('fileClaimAndUpdate', () => {
    it('should increment claim count', () => {
      const policy = createPolicy('health', 15000, 50000, 0.80);
      const { result, updatedPolicy } = fileClaimAndUpdate(policy, 200000);
      expect(result.covered).toBe(true);
      expect(updatedPolicy.claimsThisYear).toBe(1);
    });

    it('should not increment for lapsed policy', () => {
      const policy = { ...createPolicy('health', 15000, 50000, 0.80), isActive: false };
      const { result, updatedPolicy } = fileClaimAndUpdate(policy, 200000);
      expect(result.covered).toBe(false);
      expect(updatedPolicy.claimsThisYear).toBe(0);
    });
  });

  describe('isPolicyLapsed', () => {
    it('should detect active', () => {
      expect(isPolicyLapsed(createPolicy('health', 15000, 50000, 0.80))).toBe(false);
    });

    it('should detect lapsed', () => {
      expect(isPolicyLapsed({ ...createPolicy('health', 15000, 50000, 0.80), isActive: false })).toBe(true);
    });
  });

  describe('calculateReinstatementCost', () => {
    it('should return 0 for active policy', () => {
      expect(calculateReinstatementCost(createPolicy('health', 15000, 50000, 0.80))).toBe(0);
    });

    it('should calculate overdue + 10% fee', () => {
      const policy = {
        ...createPolicy('health', 10000, 50000, 0.80),
        isActive: false,
        monthsUnpaid: 3,
      };
      // 3 * 10000 = 30000 + 10% = 33000
      expect(calculateReinstatementCost(policy)).toBe(33000);
    });
  });
});
