import { Request, Response } from 'express';
import { z } from 'zod';

export async function searchGames(req: Request, res: Response): Promise<void> {
  const userId = req.query.userId as string | undefined;
  const status = req.query.status as string | undefined;
  const partnerId = req.query.partnerId as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  // Stub: query games table with filters
  res.json({ games: [], total: 0, limit, offset });
}

export async function getGame(req: Request, res: Response): Promise<void> {
  const gameId = req.params.id;
  // Stub: return full game state for admin debugging
  res.json({
    id: gameId,
    userId: 'user-1',
    persona: 'young_adult',
    difficulty: 'normal',
    currentLevel: 1,
    totalXp: 0,
    totalCoins: 0,
    status: 'active',
    accounts: [],
    transactions: [],
    createdAt: new Date().toISOString(),
  });
}

export async function resetGame(req: Request, res: Response): Promise<void> {
  const gameId = req.params.id;
  const { reason, resetTo } = z.object({
    reason: z.string().min(1),
    resetTo: z.enum(['level_start', 'game_start']).default('level_start'),
  }).parse(req.body);

  // Stub: reset game state, log admin action
  res.json({
    id: gameId,
    resetTo,
    reason,
    resetAt: new Date().toISOString(),
    resetBy: req.user!.sub,
  });
}
