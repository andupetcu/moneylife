// Coin earning rules based on rewards-system.md §1.2

export interface CoinRule {
  action: string;
  coins: number;
  conditions?: string;
  frequencyCap?: string;
}

export const COIN_RULES: Record<string, CoinRule> = {
  CARD_DECISION_SMART: { action: 'card_smart', coins: 6, frequencyCap: 'per_card' },
  CARD_DECISION_ANY: { action: 'card_any', coins: 1, frequencyCap: 'per_card' },
  COMPLETE_DAILY_CARDS: { action: 'daily_cards', coins: 5, frequencyCap: '1_per_real_day' },
  DAILY_LOGIN_DAY1: { action: 'daily_login_1', coins: 1 },
  DAILY_LOGIN_DAY2_6: { action: 'daily_login_2_6', coins: 2 },
  DAILY_LOGIN_DAY7_PLUS: { action: 'daily_login_7', coins: 3 },
  WEEKLY_CHALLENGE: { action: 'weekly_challenge', coins: 35 },
  MONTHLY_CHALLENGE: { action: 'monthly_challenge', coins: 175 },
  LEVEL_UP: { action: 'level_up', coins: 100 }, // multiplied by level
  BADGE_COMMON: { action: 'badge_common', coins: 10 },
  BADGE_RARE: { action: 'badge_rare', coins: 25 },
  BADGE_EPIC: { action: 'badge_epic', coins: 50 },
  BADGE_LEGENDARY: { action: 'badge_legendary', coins: 100 },
  REFERRAL: { action: 'referral', coins: 200, frequencyCap: 'max_10' },
  PERFECT_BUDGET_MONTH: { action: 'perfect_budget', coins: 50, frequencyCap: '1_per_month' },
  CHI_750_3M: { action: 'chi_750_3m', coins: 100, frequencyCap: '1_per_quarter' },
  CLASSROOM_CHALLENGE_WINNER: { action: 'classroom_winner', coins: 125 },
  H2H_WIN: { action: 'h2h_win', coins: 50 },
  H2H_LOSS: { action: 'h2h_loss', coins: 15 },
  FIRST_GAME_COMPLETION: { action: 'first_completion', coins: 1000, frequencyCap: 'once' },
};

export function getCoinsForAction(actionType: string, context?: { level?: number; streakDays?: number }): number {
  const rule = COIN_RULES[actionType];
  if (!rule) return 0;

  let coins = rule.coins;
  if (actionType === 'LEVEL_UP' && context?.level) {
    coins = rule.coins * context.level;
  }
  return coins;
}

// Daily login coins based on streak length
export function getDailyLoginCoins(streakDays: number): number {
  if (streakDays >= 7) return 3;
  if (streakDays >= 2) return 2;
  return 1;
}
