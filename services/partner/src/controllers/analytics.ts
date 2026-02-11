import { Request, Response } from 'express';

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  const from = req.query.from as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = req.query.to as string || new Date().toISOString();

  // Stub: aggregate analytics from games, users, rewards tables
  // ALWAYS filter by partner_id
  res.json({
    partnerId,
    period: { from, to },
    users: {
      total: 0,
      active: 0,
      new: 0,
      dau: 0,
      wau: 0,
      mau: 0,
    },
    engagement: {
      avgSessionLength: 0,
      avgDaysPlayed: 0,
      retention: { d1: 0, d7: 0, d30: 0, d90: 0 },
    },
    progression: {
      levelDistribution: {},
      avgChiScore: 0,
      avgBudgetScore: 0,
    },
    rewards: {
      totalRedemptions: 0,
      totalCoinsRedeemed: 0,
      topItems: [],
    },
  });
}
