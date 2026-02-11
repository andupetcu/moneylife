import {
  getStreakMultiplier,
  processStreakAction,
  activateStreakShield,
  StreakState,
} from '../../src/services/streak-tracker';

describe('Streak Tracker', () => {
  const baseState: StreakState = {
    currentStreak: 0,
    longestStreak: 0,
    streakStartDate: null,
    lastActionDate: null,
    freezeTokens: 0,
    streakShieldActive: false,
    streakShieldExpiresAt: null,
  };

  describe('getStreakMultiplier', () => {
    it('returns 1.0 for days 0-6', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(6)).toBe(1.0);
    });

    it('returns 1.1 for days 7-13', () => {
      expect(getStreakMultiplier(7)).toBe(1.1);
      expect(getStreakMultiplier(13)).toBe(1.1);
    });

    it('returns 1.2 for days 14-29', () => {
      expect(getStreakMultiplier(14)).toBe(1.2);
      expect(getStreakMultiplier(29)).toBe(1.2);
    });

    it('returns 1.3 for days 30-59', () => {
      expect(getStreakMultiplier(30)).toBe(1.3);
      expect(getStreakMultiplier(59)).toBe(1.3);
    });

    it('returns 1.4 for days 60-89', () => {
      expect(getStreakMultiplier(60)).toBe(1.4);
      expect(getStreakMultiplier(89)).toBe(1.4);
    });

    it('returns 1.5 (max) for days 90+', () => {
      expect(getStreakMultiplier(90)).toBe(1.5);
      expect(getStreakMultiplier(365)).toBe(1.5);
    });
  });

  describe('processStreakAction', () => {
    it('starts a new streak on first action', () => {
      const result = processStreakAction(baseState, new Date('2026-01-01T10:00:00Z'), 'UTC');
      expect(result.newState.currentStreak).toBe(1);
      expect(result.newState.longestStreak).toBe(1);
      expect(result.streakBroken).toBe(false);
    });

    it('increments streak on next day action', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 5,
        longestStreak: 5,
        lastActionDate: '2026-01-05T10:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      const result = processStreakAction(state, new Date('2026-01-06T10:00:00Z'), 'UTC');
      expect(result.newState.currentStreak).toBe(6);
      expect(result.streakBroken).toBe(false);
    });

    it('does not increment on same day action', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 5,
        longestStreak: 5,
        lastActionDate: '2026-01-05T10:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      const result = processStreakAction(state, new Date('2026-01-05T15:00:00Z'), 'UTC');
      expect(result.newState.currentStreak).toBe(5);
    });

    it('breaks streak when grace period exceeded', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 10,
        longestStreak: 10,
        lastActionDate: '2026-01-05T10:00:00Z',
        streakStartDate: '2025-12-27T10:00:00Z',
      };
      // 3 days later — well past 23+24 hour grace
      const result = processStreakAction(state, new Date('2026-01-08T10:00:00Z'), 'UTC');
      expect(result.streakBroken).toBe(true);
      expect(result.newState.currentStreak).toBe(1);
    });

    it('maintains streak within grace period', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 5,
        longestStreak: 5,
        lastActionDate: '2026-01-05T23:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      // Next day, 22 hours later (within 23+24 hour window)
      const result = processStreakAction(state, new Date('2026-01-06T21:00:00Z'), 'UTC');
      expect(result.streakBroken).toBe(false);
      expect(result.newState.currentStreak).toBe(6);
    });

    it('extends grace period with streak shield', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 30,
        longestStreak: 30,
        lastActionDate: '2026-01-05T10:00:00Z',
        streakStartDate: '2025-12-07T10:00:00Z',
        streakShieldActive: true,
        streakShieldExpiresAt: '2026-02-04T10:00:00Z',
      };
      // 2 days later — past 23h+24h but within 48h+24h
      const result = processStreakAction(state, new Date('2026-01-07T15:00:00Z'), 'UTC');
      expect(result.streakBroken).toBe(false);
      expect(result.newState.currentStreak).toBe(31);
      expect(result.newState.streakShieldActive).toBe(false);
    });

    it('updates longest streak when current exceeds it', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 10,
        longestStreak: 10,
        lastActionDate: '2026-01-10T10:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      const result = processStreakAction(state, new Date('2026-01-11T10:00:00Z'), 'UTC');
      expect(result.newState.longestStreak).toBe(11);
    });

    it('reaches 7-day milestone', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 6,
        longestStreak: 6,
        lastActionDate: '2026-01-06T10:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      const result = processStreakAction(state, new Date('2026-01-07T10:00:00Z'), 'UTC');
      expect(result.milestonesReached.length).toBe(1);
      expect(result.milestonesReached[0].days).toBe(7);
      expect(result.milestonesReached[0].xpReward).toBe(25);
      expect(result.milestonesReached[0].coinReward).toBe(10);
    });

    it('reaches 30-day milestone with badge', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 29,
        longestStreak: 29,
        lastActionDate: '2026-01-29T10:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      const result = processStreakAction(state, new Date('2026-01-30T10:00:00Z'), 'UTC');
      expect(result.milestonesReached.some((m) => m.days === 30)).toBe(true);
      expect(result.milestonesReached.find((m) => m.days === 30)?.badgeId).toBe('BDG-ENGAGE-046');
    });

    it('returns correct multiplier', () => {
      const state: StreakState = {
        ...baseState,
        currentStreak: 7,
        longestStreak: 7,
        lastActionDate: '2026-01-07T10:00:00Z',
        streakStartDate: '2026-01-01T10:00:00Z',
      };
      const result = processStreakAction(state, new Date('2026-01-08T10:00:00Z'), 'UTC');
      expect(result.multiplier).toBe(1.1);
    });
  });

  describe('activateStreakShield', () => {
    it('activates shield when tokens available', () => {
      const state: StreakState = { ...baseState, freezeTokens: 2 };
      const { newState, success } = activateStreakShield(state, 50);
      expect(success).toBe(true);
      expect(newState.freezeTokens).toBe(1);
      expect(newState.streakShieldActive).toBe(true);
    });

    it('fails when no tokens available', () => {
      const state: StreakState = { ...baseState, freezeTokens: 0 };
      const { success } = activateStreakShield(state, 50);
      expect(success).toBe(false);
    });
  });
});
