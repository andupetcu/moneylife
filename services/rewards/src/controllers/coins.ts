import { Request, Response } from 'express';

export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  // Stub: query coin_ledger table with partner_id filtering
  res.json({
    userId,
    entries: [],
    total: 0,
    limit,
    offset,
  });
}
