import { Request, Response } from 'express';
import { getStreakMultiplier, StreakState } from '../services/streak-tracker';

export async function getStreaks(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;

  // Stub: query streaks table
  const state: StreakState = {
    currentStreak: 0,
    longestStreak: 0,
    streakStartDate: null,
    lastActionDate: null,
    freezeTokens: 0,
    streakShieldActive: false,
    streakShieldExpiresAt: null,
  };

  res.json({
    userId,
    ...state,
    multiplier: getStreakMultiplier(state.currentStreak),
  });
}
