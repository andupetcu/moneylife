import { Request, Response } from 'express';
import { BADGE_CATALOG } from '../services/badge-engine';

export async function getUserBadges(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const includeHidden = req.query.includeHidden === 'true';

  // Stub: query user_badges table
  const earned: string[] = [];

  const badges = BADGE_CATALOG
    .filter((b) => !b.hidden || includeHidden || earned.includes(b.id))
    .map((b) => ({
      ...b,
      earned: earned.includes(b.id),
      earnedAt: null,
    }));

  res.json({ userId, badges, earnedCount: earned.length, totalCount: BADGE_CATALOG.length });
}
