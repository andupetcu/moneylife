// packages/simulation-engine/src/validators.ts
// Anti-cheat validation

import type { GameDate } from '@moneylife/shared-types';

export interface ValidationResult {
  valid: boolean;
  flags: string[];
}

/**
 * Validate that XP earned doesn't exceed theoretical maximum.
 * max_xp_per_day = 25 (max card XP) * 4 (max cards) * 1.5 (max streak) * 1.3 (hard difficulty)
 *                = 195 XP/day theoretical max
 */
export function validateDailyXp(xpEarned: number): ValidationResult {
  const MAX_XP_PER_DAY = 195;
  const flags: string[] = [];
  if (xpEarned > MAX_XP_PER_DAY) {
    flags.push(`impossible_xp: earned ${xpEarned} XP in one day (max ${MAX_XP_PER_DAY})`);
  }
  return { valid: flags.length === 0, flags };
}

/**
 * Validate daily coin earnings.
 * max_coins_per_day = 10 * 4 + 5 = 45 coins/day (excluding level-up/badges)
 */
export function validateDailyCoins(coinsEarned: number, excludeLevelUp: boolean = true): ValidationResult {
  const MAX_COINS_PER_DAY = excludeLevelUp ? 100 : 45;
  const flags: string[] = [];
  if (coinsEarned > MAX_COINS_PER_DAY) {
    flags.push(`impossible_coins: earned ${coinsEarned} coins in one day (max ${MAX_COINS_PER_DAY})`);
  }
  return { valid: flags.length === 0, flags };
}

/**
 * Validate minimum days to complete a level.
 * Level 1: 500 / 195 ≈ 3 days minimum
 */
export function validateLevelSpeed(
  level: number,
  gameDaysPlayed: number,
): ValidationResult {
  const xpRequired = [500, 1500, 3000, 5000, 8000, 12000, 18000, 25000];
  const MAX_XP_PER_DAY = 195;
  const flags: string[] = [];

  if (level >= 1 && level <= 8) {
    const minDays = Math.ceil(xpRequired[level - 1] / MAX_XP_PER_DAY);
    if (gameDaysPlayed < minDays) {
      flags.push(`level_speed: completed level ${level} in ${gameDaysPlayed} days (min ${minDays})`);
    }
  }

  return { valid: flags.length === 0, flags };
}

/**
 * Validate net worth change is reasonable.
 * Flag if net worth increased by > 50% in one game month without identifiable source.
 */
export function validateNetWorthChange(
  previousNetWorth: number,
  currentNetWorth: number,
): ValidationResult {
  const flags: string[] = [];
  if (previousNetWorth > 0) {
    const changePercent = (currentNetWorth - previousNetWorth) / previousNetWorth;
    if (changePercent > 0.5) {
      flags.push(`net_worth_anomaly: increased by ${(changePercent * 100).toFixed(1)}% in one month`);
    }
  }
  return { valid: flags.length === 0, flags };
}

/**
 * Validate Credit Health Index change.
 * Flag if CHI increased by > 50 in one month.
 */
export function validateChiChange(
  previousChi: number,
  currentChi: number,
): ValidationResult {
  const flags: string[] = [];
  const change = currentChi - previousChi;
  if (change > 50) {
    flags.push(`abnormal_chi_increase: increased by ${change} in one month`);
  }
  return { valid: flags.length === 0, flags };
}

/**
 * Validate action rate limiting.
 * Minimum 10 seconds between day advances.
 * Maximum 50 day-advances per real-world hour.
 */
export function validateActionRate(
  actionTimestamps: number[],
  now: number,
): ValidationResult {
  const flags: string[] = [];

  // Check minimum interval (10 seconds)
  if (actionTimestamps.length >= 2) {
    const lastTwo = actionTimestamps.slice(-2);
    const interval = lastTwo[1] - lastTwo[0];
    if (interval < 10000) {
      flags.push(`rate_limit: actions too fast (${interval}ms apart, min 10000ms)`);
    }
  }

  // Check max per hour
  const oneHourAgo = now - 3600000;
  const actionsInLastHour = actionTimestamps.filter((t) => t >= oneHourAgo).length;
  if (actionsInLastHour > 50) {
    flags.push(`burst_limit: ${actionsInLastHour} actions in last hour (max 50)`);
  }

  return { valid: flags.length === 0, flags };
}

/**
 * Validate that a transfer amount is within limits.
 */
export function validateTransferAmount(
  amount: number,
  fromBalance: number,
  maxTransferAmount: number = 10000000,
): ValidationResult {
  const flags: string[] = [];

  if (amount <= 0) {
    flags.push('invalid_amount: transfer amount must be positive');
  }
  if (amount > maxTransferAmount) {
    flags.push(`max_transfer: amount ${amount} exceeds max ${maxTransferAmount}`);
  }
  if (amount > fromBalance) {
    flags.push(`insufficient_funds: amount ${amount} exceeds balance ${fromBalance}`);
  }

  return { valid: flags.length === 0, flags };
}

/**
 * Run all validators and aggregate flags.
 */
export function runAllValidations(checks: ValidationResult[]): ValidationResult {
  const allFlags = checks.flatMap((c) => c.flags);
  return { valid: allFlags.length === 0, flags: allFlags };
}
