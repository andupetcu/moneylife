// Economy service — coin balance management, anti-abuse, tier perks

export type AchievementTier = 'rookie' | 'money_aware' | 'budget_detective' | 'savings_champion' | 'investment_strategist' | 'wealth_builder' | 'financial_advisor';

const TIER_THRESHOLDS: { tier: AchievementTier; minXp: number; coinBonus: number }[] = [
  { tier: 'financial_advisor', minXp: 85000, coinBonus: 0.20 },
  { tier: 'wealth_builder', minXp: 55000, coinBonus: 0.15 },
  { tier: 'investment_strategist', minXp: 30000, coinBonus: 0.10 },
  { tier: 'savings_champion', minXp: 15000, coinBonus: 0.05 },
  { tier: 'budget_detective', minXp: 5000, coinBonus: 0 },
  { tier: 'money_aware', minXp: 1000, coinBonus: 0 },
  { tier: 'rookie', minXp: 0, coinBonus: 0 },
];

export function getTier(totalXp: number): { tier: AchievementTier; coinBonus: number } {
  for (const t of TIER_THRESHOLDS) {
    if (totalXp >= t.minXp) return { tier: t.tier, coinBonus: t.coinBonus };
  }
  return { tier: 'rookie', coinBonus: 0 };
}

export function applyTierBonus(baseCoins: number, totalXp: number): number {
  const { coinBonus } = getTier(totalXp);
  return Math.round(baseCoins * (1 + coinBonus));
}

export function applyStreakMultiplier(baseAmount: number, multiplier: number): number {
  return Math.round(baseAmount * multiplier);
}

// Redemption anti-abuse rate limits
export interface RedemptionLimits {
  daily: { maxRedemptions: number; maxCoins: number };
  monthly: { maxRedemptions: number; maxCoins: number };
}

export const DEFAULT_REDEMPTION_LIMITS: RedemptionLimits = {
  daily: { maxRedemptions: 5, maxCoins: 5000 },
  monthly: { maxRedemptions: 20, maxCoins: 20000 },
};

export function checkRedemptionLimits(
  todayRedemptions: number,
  todayCoinsSpent: number,
  monthRedemptions: number,
  monthCoinsSpent: number,
  cost: number,
  limits: RedemptionLimits = DEFAULT_REDEMPTION_LIMITS,
): { allowed: boolean; reason?: string } {
  if (todayRedemptions >= limits.daily.maxRedemptions) {
    return { allowed: false, reason: 'Daily redemption limit reached' };
  }
  if (todayCoinsSpent + cost > limits.daily.maxCoins) {
    return { allowed: false, reason: 'Daily coin spend limit reached' };
  }
  if (monthRedemptions >= limits.monthly.maxRedemptions) {
    return { allowed: false, reason: 'Monthly redemption limit reached' };
  }
  if (monthCoinsSpent + cost > limits.monthly.maxCoins) {
    return { allowed: false, reason: 'Monthly coin spend limit reached' };
  }
  return { allowed: true };
}

// Fulfillment state machine
export type FulfillmentStatus = 'pending' | 'processing' | 'fulfilled' | 'confirmed' | 'failed' | 'refunded' | 'disputed' | 'resolved';

const VALID_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  pending: ['processing', 'failed'],
  processing: ['fulfilled', 'failed'],
  fulfilled: ['confirmed', 'disputed'],
  confirmed: [],
  failed: ['refunded'],
  refunded: [],
  disputed: ['resolved', 'refunded'],
  resolved: [],
};

export function canTransition(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
