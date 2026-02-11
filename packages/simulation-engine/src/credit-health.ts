// packages/simulation-engine/src/credit-health.ts
// Credit Health Index (300-850 scale)

import { bankersRound } from './interest.js';

export interface CreditHealthInput {
  /** On-time payments, late payments, missed payments history */
  paymentHistory: {
    onTimePayments: number;
    latePayments: Array<{ daysLate: number; monthsAgo: number }>;
    missedPayments: Array<{ monthsAgo: number }>;
    collections: number;
  };
  /** Credit utilization */
  utilization: {
    totalCreditUsed: number;
    totalCreditAvailable: number;
    hasAnyCreditAccounts: boolean;
  };
  /** Account age in months */
  accountAge: {
    accountAgesMonths: number[];
  };
  /** Credit mix */
  creditMix: {
    accountTypes: string[];
  };
  /** New credit inquiries in last 6 game months */
  newCredit: {
    applicationsLast6Months: number;
  };
}

export interface CreditHealthResult {
  overall: number;
  factors: {
    paymentHistory: number;
    utilization: number;
    accountAge: number;
    creditMix: number;
    newCredit: number;
  };
}

const CHI_MIN = 300;
const CHI_MAX = 850;
const CHI_RANGE = CHI_MAX - CHI_MIN;

const WEIGHTS = {
  paymentHistory: 0.35,
  utilization: 0.30,
  accountAge: 0.15,
  creditMix: 0.10,
  newCredit: 0.10,
};

/**
 * Calculate payment history sub-score (0-100).
 */
export function calculatePaymentHistoryScore(input: CreditHealthInput['paymentHistory']): number {
  let score = 100;

  for (const late of input.latePayments) {
    let penalty: number;
    if (late.daysLate <= 30) {
      penalty = 10;
    } else if (late.daysLate <= 60) {
      penalty = 20;
    } else if (late.daysLate <= 90) {
      penalty = 35;
    } else {
      penalty = 50;
    }

    // Penalties decay: 50% reduction after 12 months, removed after 24
    if (late.monthsAgo >= 24) {
      penalty = 0;
    } else if (late.monthsAgo >= 12) {
      penalty = Math.floor(penalty * 0.5);
    }

    score -= penalty;
  }

  for (const missed of input.missedPayments) {
    let penalty = 50;
    if (missed.monthsAgo >= 24) {
      penalty = 0;
    } else if (missed.monthsAgo >= 12) {
      penalty = 25;
    }
    score -= penalty;
  }

  score -= input.collections * 75;

  // Recovery from on-time payments: +2 per on-time payment (up to max 100)
  score += input.onTimePayments * 2;

  return clamp(score, 0, 100);
}

/**
 * Calculate credit utilization sub-score (0-100).
 */
export function calculateUtilizationScore(input: CreditHealthInput['utilization']): number {
  if (!input.hasAnyCreditAccounts) {
    return 50; // Neutral
  }

  if (input.totalCreditAvailable <= 0) {
    return 50;
  }

  const ratio = input.totalCreditUsed / input.totalCreditAvailable;

  if (ratio <= 0) return 85;
  if (ratio < 0.10) return 100;
  if (ratio < 0.30) return 90;
  if (ratio < 0.50) return 70;
  if (ratio < 0.75) return 45;
  if (ratio < 1.0) return 20;
  return 0; // 100%+
}

/**
 * Calculate credit age sub-score (0-100).
 */
export function calculateAccountAgeScore(input: CreditHealthInput['accountAge']): number {
  if (input.accountAgesMonths.length === 0) {
    return 20;
  }

  const avg =
    input.accountAgesMonths.reduce((a, b) => a + b, 0) / input.accountAgesMonths.length;

  if (avg <= 3) return 20;
  if (avg <= 6) return 35;
  if (avg <= 12) return 50;
  if (avg <= 24) return 65;
  if (avg <= 36) return 75;
  if (avg <= 60) return 85;
  return 100;
}

/**
 * Calculate credit mix sub-score (0-100).
 */
export function calculateCreditMixScore(input: CreditHealthInput['creditMix']): number {
  const pointsByType: Record<string, number> = {
    checking: 10,
    savings: 10,
    credit_card: 20,
    student_loan: 15,
    auto_loan: 15,
    mortgage: 20,
    personal_loan: 10,
    investment: 5,
  };

  const uniqueTypes = new Set(input.accountTypes);
  let total = 0;
  for (const type of uniqueTypes) {
    total += pointsByType[type] ?? 0;
  }

  return Math.min(100, total);
}

/**
 * Calculate new credit inquiries sub-score (0-100).
 */
export function calculateNewCreditScore(input: CreditHealthInput['newCredit']): number {
  const apps = input.applicationsLast6Months;
  if (apps === 0) return 100;
  if (apps === 1) return 90;
  if (apps === 2) return 75;
  if (apps === 3) return 55;
  if (apps === 4) return 35;
  return 15;
}

/**
 * Calculate the full Credit Health Index.
 */
export function calculateCreditHealthIndex(input: CreditHealthInput): CreditHealthResult {
  const factors = {
    paymentHistory: calculatePaymentHistoryScore(input.paymentHistory),
    utilization: calculateUtilizationScore(input.utilization),
    accountAge: calculateAccountAgeScore(input.accountAge),
    creditMix: calculateCreditMixScore(input.creditMix),
    newCredit: calculateNewCreditScore(input.newCredit),
  };

  const rawScore =
    factors.paymentHistory * WEIGHTS.paymentHistory +
    factors.utilization * WEIGHTS.utilization +
    factors.accountAge * WEIGHTS.accountAge +
    factors.creditMix * WEIGHTS.creditMix +
    factors.newCredit * WEIGHTS.newCredit;

  const overall = clamp(
    bankersRound(CHI_MIN + (rawScore / 100) * CHI_RANGE),
    CHI_MIN,
    CHI_MAX,
  );

  return { overall, factors };
}

/**
 * Determine CHI trend by comparing current to previous.
 */
export function determineTrend(
  currentChi: number,
  previousChi: number,
): 'improving' | 'stable' | 'declining' {
  const diff = currentChi - previousChi;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
