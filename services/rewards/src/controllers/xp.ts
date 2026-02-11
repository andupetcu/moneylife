import { Request, Response } from 'express';
import { getXpForAction, XP_RULES } from '../services/xp-engine';
import { getTier } from '../services/economy';
import { getStreakMultiplier } from '../services/streak-tracker';

// In production these would query the database
// For now, return structured responses matching the API contract

export async function getSummary(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const partnerId = req.user!.partnerId;

  // Stub: in production, query xp_ledger, coin_ledger, user_badges, streaks tables
  const summary = {
    userId,
    partnerId: partnerId || null,
    totalXp: 0,
    levelXp: 0,
    currentLevel: 1,
    totalCoins: 0,
    tier: getTier(0),
    streakDays: 0,
    streakMultiplier: getStreakMultiplier(0),
    badgeCount: 0,
    recentRewards: [] as Array<{ type: string; amount: number; reason: string; timestamp: string }>,
  };

  res.json(summary);
}

export function getXpRules(_req: Request, res: Response): void {
  const rules = Object.entries(XP_RULES).map(([key, rule]) => ({
    id: key,
    ...rule,
    sampleXp: getXpForAction(key),
  }));
  res.json({ rules });
}
