// packages/simulation-engine/src/insurance-sim.ts
// Insurance simulation (premiums, claims, deductibles)

import { bankersRound } from './interest.js';

export type InsuranceType = 'health' | 'auto' | 'renters' | 'homeowners' | 'life' | 'disability';

export interface InsurancePolicy {
  type: InsuranceType;
  monthlyPremium: number;
  deductible: number;
  coverageRate: number; // 0.80 = 80% coverage after deductible
  isActive: boolean;
  monthsActive: number;
  monthsUnpaid: number;
  claimsThisYear: number;
  basePremium: number; // Original premium before claim increases
}

export interface ClaimResult {
  covered: boolean;
  deductiblePaid: number;
  insurancePaid: number;
  playerPays: number;
  policyStillActive: boolean;
}

/**
 * Create a new insurance policy with default values.
 */
export function createPolicy(
  type: InsuranceType,
  monthlyPremium: number,
  deductible: number,
  coverageRate: number,
): InsurancePolicy {
  return {
    type,
    monthlyPremium,
    deductible,
    coverageRate,
    isActive: true,
    monthsActive: 0,
    monthsUnpaid: 0,
    claimsThisYear: 0,
    basePremium: monthlyPremium,
  };
}

/**
 * Process premium payment for a month.
 * Returns the premium amount due, or lapse info.
 */
export function processMonthlyPremium(
  policy: InsurancePolicy,
  paid: boolean,
): InsurancePolicy {
  const updated = { ...policy };
  updated.monthsActive += 1;

  if (!paid) {
    updated.monthsUnpaid += 1;
    // Policy lapses after 30 days (roughly 1 month)
    if (updated.monthsUnpaid >= 3) {
      updated.isActive = false;
    }
  } else {
    updated.monthsUnpaid = 0;
  }

  return updated;
}

/**
 * Process an insurance claim.
 * total_cost: the total cost of the event
 * Returns how much the player pays vs insurance.
 */
export function processClaim(
  policy: InsurancePolicy,
  totalCost: number,
): ClaimResult {
  if (!policy.isActive) {
    return {
      covered: false,
      deductiblePaid: 0,
      insurancePaid: 0,
      playerPays: totalCost,
      policyStillActive: false,
    };
  }

  const deductiblePaid = Math.min(policy.deductible, totalCost);
  const afterDeductible = totalCost - deductiblePaid;
  const insurancePaid = bankersRound(afterDeductible * policy.coverageRate);
  const playerPays = deductiblePaid + (afterDeductible - insurancePaid);

  return {
    covered: true,
    deductiblePaid,
    insurancePaid,
    playerPays,
    policyStillActive: true,
  };
}

/**
 * Calculate renewed premium after claims.
 * Each claim increases premium by 10%.
 */
export function calculateRenewalPremium(policy: InsurancePolicy): number {
  const claimIncrease = policy.claimsThisYear * 0.10;
  return bankersRound(policy.basePremium * (1 + claimIncrease));
}

/**
 * Process annual renewal — reset claims, adjust premium.
 */
export function renewPolicy(policy: InsurancePolicy): InsurancePolicy {
  const newPremium = calculateRenewalPremium(policy);
  return {
    ...policy,
    monthlyPremium: newPremium,
    basePremium: newPremium,
    claimsThisYear: 0,
  };
}

/**
 * Process a claim and update the policy's claim count.
 */
export function fileClaimAndUpdate(
  policy: InsurancePolicy,
  totalCost: number,
): { result: ClaimResult; updatedPolicy: InsurancePolicy } {
  const result = processClaim(policy, totalCost);
  const updatedPolicy = {
    ...policy,
    claimsThisYear: result.covered ? policy.claimsThisYear + 1 : policy.claimsThisYear,
  };
  return { result, updatedPolicy };
}

/**
 * Check if a policy has lapsed.
 */
export function isPolicyLapsed(policy: InsurancePolicy): boolean {
  return !policy.isActive;
}

/**
 * Calculate reinstatement cost (overdue premiums + 10% fee).
 */
export function calculateReinstatementCost(policy: InsurancePolicy): number {
  if (policy.isActive) return 0;
  const overduePremiums = policy.monthsUnpaid * policy.monthlyPremium;
  const fee = bankersRound(overduePremiums * 0.10);
  return overduePremiums + fee;
}
