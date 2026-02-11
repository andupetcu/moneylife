// Streak tracking — rewards-system.md §3

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastActionDate: string | null;
  freezeTokens: number;
  streakShieldActive: boolean;
  streakShieldExpiresAt: string | null;
}

export interface StreakUpdateResult {
  newState: StreakState;
  streakBroken: boolean;
  milestonesReached: StreakMilestone[];
  multiplier: number;
}

export interface StreakMilestone {
  days: number;
  name: string;
  xpReward: number;
  coinReward: number;
  badgeId?: string;
}

const MILESTONES: StreakMilestone[] = [
  { days: 7, name: '1 Week', xpReward: 25, coinReward: 10 },
  { days: 14, name: '2 Weeks', xpReward: 50, coinReward: 20 },
  { days: 30, name: '1 Month', xpReward: 100, coinReward: 50, badgeId: 'BDG-ENGAGE-046' },
  { days: 60, name: '2 Months', xpReward: 150, coinReward: 75, badgeId: 'BDG-ENGAGE-047' },
  { days: 90, name: '3 Months', xpReward: 200, coinReward: 100, badgeId: 'BDG-ENGAGE-048' },
  { days: 180, name: '6 Months', xpReward: 500, coinReward: 250, badgeId: 'BDG-ENGAGE-049' },
  { days: 365, name: '1 Year', xpReward: 1000, coinReward: 500 },
];

const GRACE_PERIOD_HOURS = 23;
const SHIELD_GRACE_HOURS = 48;

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 90) return 1.5;
  if (streakDays >= 60) return 1.4;
  if (streakDays >= 30) return 1.3;
  if (streakDays >= 14) return 1.2;
  if (streakDays >= 7) return 1.1;
  return 1.0;
}

export function processStreakAction(
  state: StreakState,
  actionTimestamp: Date,
  userTimezone: string,
): StreakUpdateResult {
  const now = actionTimestamp;
  const result: StreakUpdateResult = {
    newState: { ...state },
    streakBroken: false,
    milestonesReached: [],
    multiplier: 1.0,
  };

  if (!state.lastActionDate) {
    // First action ever
    result.newState.currentStreak = 1;
    result.newState.longestStreak = Math.max(1, state.longestStreak);
    result.newState.streakStartDate = now.toISOString();
    result.newState.lastActionDate = now.toISOString();
    result.multiplier = 1.0;
    return result;
  }

  const lastAction = new Date(state.lastActionDate);
  const hoursSinceLastAction = (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60);

  const graceHours = state.streakShieldActive ? SHIELD_GRACE_HOURS : GRACE_PERIOD_HOURS;

  // Same calendar day — no streak increment
  if (isSameDay(lastAction, now, userTimezone)) {
    result.newState.lastActionDate = now.toISOString();
    result.multiplier = getStreakMultiplier(state.currentStreak);
    return result;
  }

  // Within grace period — streak continues
  if (hoursSinceLastAction <= graceHours + 24) {
    result.newState.currentStreak = state.currentStreak + 1;
    result.newState.lastActionDate = now.toISOString();
    result.newState.longestStreak = Math.max(result.newState.currentStreak, state.longestStreak);

    if (state.streakShieldActive) {
      result.newState.streakShieldActive = false;
      result.newState.streakShieldExpiresAt = null;
    }

    // Check milestones
    for (const m of MILESTONES) {
      if (state.currentStreak < m.days && result.newState.currentStreak >= m.days) {
        result.milestonesReached.push(m);
      }
    }

    result.multiplier = getStreakMultiplier(result.newState.currentStreak);
    return result;
  }

  // Streak broken
  result.streakBroken = true;
  result.newState.currentStreak = 1;
  result.newState.streakStartDate = now.toISOString();
  result.newState.lastActionDate = now.toISOString();
  result.newState.streakShieldActive = false;
  result.newState.streakShieldExpiresAt = null;
  result.multiplier = 1.0;

  return result;
}

export function activateStreakShield(state: StreakState, cost: number): { newState: StreakState; success: boolean } {
  if (state.freezeTokens < 1) {
    return { newState: state, success: false };
  }
  return {
    newState: {
      ...state,
      freezeTokens: state.freezeTokens - 1,
      streakShieldActive: true,
      streakShieldExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    success: true,
  };
}

function isSameDay(a: Date, b: Date, _timezone: string): boolean {
  // Simplified — in production, use timezone-aware comparison
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}
