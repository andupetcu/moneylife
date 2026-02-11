import { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error-handler';
import { checkRedemptionLimits, canTransition } from '../services/economy';

const redeemSchema = z.object({
  catalogItemId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  deliveryEmail: z.string().email().optional(),
  deliveryAddress: z
    .object({
      line1: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
    })
    .optional(),
});

export async function getCatalog(req: Request, res: Response): Promise<void> {
  const partnerId = req.user!.partnerId;
  const category = req.query.category as string | undefined;
  const sortBy = (req.query.sortBy as string) || 'popular';
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  // Stub: query reward_catalog_items with partner_id filtering
  // Items where tenant_ids IS NULL (all tenants) OR partner_id in tenant_ids
  res.json({
    items: [],
    total: 0,
    limit,
    offset,
    filters: { category, sortBy, partnerId: partnerId || null },
  });
}

export async function redeemReward(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const body = redeemSchema.parse(req.body);

  // 1. Check idempotency — stub
  // 2. Check account age >= 7 days — stub
  // 3. Check coin balance on server
  const userCoins = 0; // stub: query from DB
  const itemCost = 0; // stub: query from catalog

  if (userCoins < itemCost) {
    throw new AppError(400, 'Insufficient coins', 'INSUFFICIENT_COINS');
  }

  // 4. Check rate limits
  const limitsCheck = checkRedemptionLimits(0, 0, 0, 0, itemCost);
  if (!limitsCheck.allowed) {
    throw new AppError(429, limitsCheck.reason || 'Rate limit exceeded', 'REDEMPTION_RATE_LIMIT');
  }

  // 5. Create redemption record, deduct coins (atomically in production)
  const redemption = {
    id: body.idempotencyKey,
    userId,
    catalogItemId: body.catalogItemId,
    coinCost: itemCost,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  res.status(201).json(redemption);
}
