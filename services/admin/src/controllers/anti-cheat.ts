import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

// Anti-cheat detection rules from edge-cases.md §6
export interface AntiCheatFlag {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export const DETECTION_RULES = {
  XP_VELOCITY: {
    name: 'XP Velocity Anomaly',
    description: 'Player earned more XP than theoretically possible in a single game day',
    maxXpPerDay: 195, // 25 * 4 * 1.5 * 1.3
    severity: 'medium' as const,
  },
  COIN_VELOCITY: {
    name: 'Coin Velocity Anomaly',
    description: 'Player earned more coins than expected in a single game day',
    maxCoinsPerDay: 100,
    severity: 'medium' as const,
  },
  LEVEL_SPEED: {
    name: 'Level Speed Anomaly',
    description: 'Player completed a level faster than minimum possible days',
    severity: 'high' as const,
  },
  BALANCE_ANOMALY: {
    name: 'Balance Anomaly',
    description: 'Net worth increased by more than 50% in one game month without identifiable source',
    severity: 'high' as const,
  },
  RAPID_REDEMPTION: {
    name: 'Rapid Redemption After IAP',
    description: 'Large coin purchase followed by immediate redemption',
    severity: 'medium' as const,
  },
  MULTI_ACCOUNT: {
    name: 'Multi-Account Detected',
    description: 'Same device ID linked to multiple accounts with coin redemptions',
    severity: 'high' as const,
  },
};

export function checkXpVelocity(xpEarnedInDay: number): boolean {
  return xpEarnedInDay > DETECTION_RULES.XP_VELOCITY.maxXpPerDay;
}

export function checkCoinVelocity(coinsEarnedInDay: number): boolean {
  return coinsEarnedInDay > DETECTION_RULES.COIN_VELOCITY.maxCoinsPerDay;
}

export async function getFlaggedAccounts(req: Request, res: Response): Promise<void> {
  const status = (req.query.status as string) || 'open';
  const severity = req.query.severity as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  // Stub: query anti_cheat_flags table
  res.json({ flags: [], total: 0, limit, offset, filters: { status, severity } });
}

export async function resolveFlag(req: Request, res: Response): Promise<void> {
  const flagId = req.params.id;
  const body = z.object({
    resolution: z.enum(['dismissed', 'warned', 'suspended', 'banned']),
    notes: z.string().optional(),
  }).parse(req.body);

  // Stub: update flag, potentially update user status
  res.json({
    id: flagId,
    status: 'resolved',
    resolution: body.resolution,
    notes: body.notes,
    resolvedBy: req.user!.sub,
    resolvedAt: new Date().toISOString(),
  });
}
