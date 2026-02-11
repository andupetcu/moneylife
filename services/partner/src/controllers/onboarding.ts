import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

const createPartnerSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  contactEmail: z.string().email(),
  config: z.record(z.unknown()).optional(),
});

const updateFeaturesSchema = z.object({
  features: z.record(z.boolean()),
});

export async function createPartner(req: Request, res: Response): Promise<void> {
  const body = createPartnerSchema.parse(req.body);
  const partner = {
    id: uuid(),
    ...body,
    status: 'active' as const,
    theme: {},
    features: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.status(201).json(partner);
}

export async function getPartner(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  // Stub: query partners table
  res.json({
    id: partnerId,
    name: 'Demo Bank',
    slug: 'demo-bank',
    status: 'active',
    theme: {},
    features: {},
    createdAt: new Date().toISOString(),
  });
}

export async function updateFeatures(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  const body = updateFeaturesSchema.parse(req.body);
  // Stub: merge features into partner_features table
  // Features override defaults from the feature flag catalog
  res.json({ partnerId, features: body.features, updatedAt: new Date().toISOString() });
}

export async function getFeatures(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  // Stub: return merged default + partner-specific feature flags
  const defaultFlags: Record<string, boolean> = {
    enable_investments: false,
    enable_insurance: false,
    enable_classroom_mode: true,
    enable_mirror_mode: false,
    rewards_redemption_enabled: true,
    social_friends_enabled: true,
    social_leaderboards_enabled: true,
    notifications_push_enabled: true,
    notifications_email_digest: true,
  };
  res.json({ partnerId, features: defaultFlags });
}
