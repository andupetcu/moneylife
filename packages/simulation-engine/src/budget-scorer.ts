// packages/simulation-engine/src/budget-scorer.ts
// Budget scoring algorithm (0-100)

import { bankersRound } from './interest.js';

export interface BudgetCategory {
  category: string;
  budgeted: number;
  spent: number;
}

/**
 * Calculate the score for a single budget category.
 */
export function calculateCategoryScore(budgeted: number, spent: number): number {
  if (budgeted === 0 && spent === 0) {
    return 100;
  }
  if (budgeted === 0 && spent > 0) {
    return 0; // Unbudgeted spending
  }

  const ratio = spent / budgeted;

  if (ratio <= 1.0) {
    // Under budget
    if (ratio >= 0.8) return 100;
    if (ratio >= 0.5) return 90;
    return 75; // Significantly under budget (over-allocated)
  }

  // Over budget
  const overage = ratio - 1.0;
  return Math.max(0, bankersRound(100 - overage * 200));
  // 10% over = 80, 25% over = 50, 50%+ over = 0
}

/**
 * Calculate the monthly budget score as a weighted average.
 * Weight per category = budgeted amount / total budget.
 */
export function calculateBudgetScore(categories: BudgetCategory[]): number {
  if (categories.length === 0) return 0;

  const totalBudget = categories.reduce((sum, c) => sum + c.budgeted, 0);
  if (totalBudget === 0) {
    // No budget set but spending happened?
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    return totalSpent > 0 ? 0 : 100;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const cat of categories) {
    const score = calculateCategoryScore(cat.budgeted, cat.spent);
    const weight = cat.budgeted / totalBudget;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  // Handle unbudgeted spending categories (budgeted=0 but spent>0)
  const unbudgetedCategories = categories.filter((c) => c.budgeted === 0 && c.spent > 0);
  if (unbudgetedCategories.length > 0) {
    const unbudgetedSpent = unbudgetedCategories.reduce((s, c) => s + c.spent, 0);
    const unbudgetedWeight = unbudgetedSpent / (totalBudget + unbudgetedSpent);
    // Unbudgeted spending gets a score of 0
    weightedSum = weightedSum * (1 - unbudgetedWeight);
    totalWeight = 1; // Normalize
  }

  if (totalWeight === 0) return 100;

  return bankersRound(weightedSum / totalWeight);
}

/**
 * Get XP and coin rewards based on budget score.
 */
export function getBudgetRewards(score: number): { xp: number; coins: number } {
  if (score >= 90) return { xp: 50, coins: 25 };
  if (score >= 75) return { xp: 30, coins: 10 };
  if (score >= 60) return { xp: 15, coins: 5 };
  if (score >= 40) return { xp: 5, coins: 0 };
  return { xp: 0, coins: 0 };
}

/**
 * Check if budget follows the 50/30/20 rule (within 5% tolerance).
 */
export function follows503020Rule(
  income: number,
  needsSpent: number,
  wantsSpent: number,
  savingsSpent: number,
): boolean {
  if (income <= 0) return false;
  const needsPct = needsSpent / income;
  const wantsPct = wantsSpent / income;
  const savingsPct = savingsSpent / income;

  return (
    Math.abs(needsPct - 0.5) <= 0.05 &&
    Math.abs(wantsPct - 0.3) <= 0.05 &&
    Math.abs(savingsPct - 0.2) <= 0.05
  );
}
