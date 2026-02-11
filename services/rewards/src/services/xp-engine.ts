// XP earning rules based on rewards-system.md §1.1

export interface XpRule {
  action: string;
  baseXp: number;
  conditions?: string;
  frequencyCap?: string;
}

export const XP_RULES: Record<string, XpRule> = {
  CARD_DECISION_ANY: { action: 'complete_decision_card', baseXp: 5, frequencyCap: 'per_card' },
  CARD_DECISION_OPTIMAL: { action: 'complete_decision_card_optimal', baseXp: 20, frequencyCap: 'per_card' },
  CARD_DECISION_GOOD: { action: 'complete_decision_card_good', baseXp: 12, frequencyCap: 'per_card' },
  PAY_BILL_ON_TIME: { action: 'pay_bill_on_time', baseXp: 10, frequencyCap: 'per_bill_month' },
  PAY_CC_FULL: { action: 'pay_credit_card_full', baseXp: 20, frequencyCap: '1_per_month' },
  PAY_CC_MINIMUM: { action: 'pay_credit_card_minimum', baseXp: 8, frequencyCap: '1_per_month' },
  SAVINGS_DEPOSIT: { action: 'savings_deposit', baseXp: 5, frequencyCap: '3_per_day' },
  REACH_SAVINGS_GOAL_SMALL: { action: 'savings_goal_small', baseXp: 50 },
  REACH_SAVINGS_GOAL_MEDIUM: { action: 'savings_goal_medium', baseXp: 100 },
  REACH_SAVINGS_GOAL_LARGE: { action: 'savings_goal_large', baseXp: 200 },
  INVESTMENT_PURCHASE: { action: 'investment_purchase', baseXp: 10, frequencyCap: '2_per_day' },
  REBALANCE_PORTFOLIO: { action: 'rebalance_portfolio', baseXp: 15, frequencyCap: '1_per_month' },
  SETUP_AUTOPAY: { action: 'setup_autopay', baseXp: 20, frequencyCap: 'once_per_account' },
  CREATE_BUDGET: { action: 'create_budget', baseXp: 25, frequencyCap: 'one_time' },
  ADJUST_BUDGET: { action: 'adjust_budget', baseXp: 5, frequencyCap: '1_per_month' },
  BUDGET_ADHERENCE_90: { action: 'budget_adherence_90', baseXp: 50, frequencyCap: '1_per_month' },
  BUDGET_ADHERENCE_75: { action: 'budget_adherence_75', baseXp: 30, frequencyCap: '1_per_month' },
  ADVANCE_DAY: { action: 'advance_day', baseXp: 3, frequencyCap: 'per_day' },
  COMPLETE_WEEKLY_CHALLENGE: { action: 'weekly_challenge', baseXp: 75 },
  COMPLETE_MONTHLY_CHALLENGE: { action: 'monthly_challenge', baseXp: 350 },
  HANDLE_EMERGENCY_INSURED: { action: 'emergency_insured', baseXp: 25 },
  HANDLE_EMERGENCY_SAVINGS: { action: 'emergency_savings', baseXp: 50 },
  HANDLE_EMERGENCY_DEBT: { action: 'emergency_debt', baseXp: 10 },
  FILE_TAXES: { action: 'file_taxes', baseXp: 100, frequencyCap: '1_per_year' },
  COMPLETE_LEVEL: { action: 'complete_level', baseXp: 250 }, // multiplied by level
  TUTORIAL_STEP: { action: 'tutorial_step', baseXp: 15, frequencyCap: 'one_time_each' },
  FIRST_ACTION_OF_DAY: { action: 'first_action_day', baseXp: 5, frequencyCap: '1_per_real_day' },
  REVIEW_MONTHLY_REPORT: { action: 'review_monthly_report', baseXp: 10, frequencyCap: '1_per_month' },
  OPEN_NEW_ACCOUNT_TYPE: { action: 'open_account_type', baseXp: 20, frequencyCap: 'once_per_type' },
  PAY_OFF_LOAN: { action: 'pay_off_loan', baseXp: 200 },
  MAINTAIN_CHI_750_3M: { action: 'maintain_chi_750', baseXp: 150, frequencyCap: '1_per_quarter' },
  RECOVER_BANKRUPTCY: { action: 'recover_bankruptcy', baseXp: 200 },
};

export function getXpForAction(actionType: string, context?: { level?: number }): number {
  const rule = XP_RULES[actionType];
  if (!rule) return 0;

  if (actionType === 'COMPLETE_LEVEL' && context?.level) {
    return rule.baseXp * context.level;
  }

  return rule.baseXp;
}
