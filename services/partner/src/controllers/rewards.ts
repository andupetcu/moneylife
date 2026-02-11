import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

const addRewardSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  coinCost: z.number().int().min(1),
  category: z.string(),
  fulfillmentType: z.enum(['instant_digital', 'async_digital', 'physical']),
  stock: z.number().int().min(-1).default(-1), // -1 = unlimited
});

export async function addPartnerReward(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  const body = addRewardSchema.parse(req.body);
  const item = {
    id: uuid(),
    partnerId,
    ...body,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(item);
}

export async function getPartnerRewards(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;
  // Stub: query reward_catalog_items where partner_id = partnerId
  res.json({ partnerId, items: [], total: 0, limit, offset });
}
