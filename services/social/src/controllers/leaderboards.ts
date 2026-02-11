import { Request, Response } from 'express';
import { z } from 'zod';

const leaderboardTypes = ['global', 'friends', 'classroom'] as const;
const timeframes = ['weekly', 'monthly', 'all_time'] as const;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  level: number;
  persona: string;
  difficulty: string;
}

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const partnerId = req.user!.partnerId;
  const type = req.params.type;
  const timeframe = (req.query.timeframe as string) || 'weekly';
  const classroomId = req.query.classroomId as string | undefined;
  const metric = (req.query.metric as string) || 'net_worth';
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  if (!leaderboardTypes.includes(type as any)) {
    res.status(400).json({ error: `Invalid leaderboard type. Must be one of: ${leaderboardTypes.join(', ')}` });
    return;
  }

  // Stub: query leaderboard_snapshots or compute from games table
  // ALWAYS filter by partner_id for multi-tenant isolation
  // For 'friends' type: join with friendships table
  // For 'classroom' type: filter by classroom_members
  const entries: LeaderboardEntry[] = [];

  res.json({
    type,
    timeframe,
    metric,
    partnerId: partnerId || null,
    classroomId: classroomId || null,
    entries,
    total: 0,
    limit,
    offset,
    userRank: null,
  });
}
