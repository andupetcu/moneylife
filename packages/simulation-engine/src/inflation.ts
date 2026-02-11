// packages/simulation-engine/src/inflation.ts
// Monthly inflation engine

import { bankersRound } from './interest.js';

/**
 * Calculate monthly inflation rate from annual rate.
 */
export function annualToMonthlyInflation(annualRate: number): number {
  return annualRate / 12;
}

/**
 * Apply monthly inflation to a base cost.
 * new_price = old_price * (1 + monthly_inflation_rate)
 * Returns integer (smallest currency unit).
 */
export function applyMonthlyInflation(baseCost: number, annualInflationRate: number): number {
  const monthlyRate = annualToMonthlyInflation(annualInflationRate);
  return bankersRound(baseCost * (1 + monthlyRate));
}

/**
 * Apply cumulative inflation over multiple months.
 * new_price = old_price * (1 + monthly_rate)^months
 */
export function applyCumulativeInflation(
  baseCost: number,
  annualInflationRate: number,
  months: number,
): number {
  if (months <= 0) return baseCost;
  const monthlyRate = annualToMonthlyInflation(annualInflationRate);
  return bankersRound(baseCost * Math.pow(1 + monthlyRate, months));
}

/**
 * Calculate cumulative inflation factor.
 */
export function cumulativeInflationFactor(annualRate: number, months: number): number {
  const monthlyRate = annualToMonthlyInflation(annualRate);
  return Math.pow(1 + monthlyRate, months);
}

/**
 * Apply inflation to a set of recurring bills.
 * Returns new bill amounts.
 */
export function inflateRecurringBills(
  bills: Array<{ name: string; amount: number }>,
  annualInflationRate: number,
): Array<{ name: string; amount: number }> {
  return bills.map((bill) => ({
    name: bill.name,
    amount: applyMonthlyInflation(bill.amount, annualInflationRate),
  }));
}

/**
 * Get inflation rate based on difficulty mode.
 */
export function getInflationRate(difficulty: 'easy' | 'normal' | 'hard'): number {
  const rates: Record<string, number> = {
    easy: 0.015,
    normal: 0.03,
    hard: 0.05,
  };
  return rates[difficulty] ?? 0.03;
}
