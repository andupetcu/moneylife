import { Request, Response } from 'express';
import { z } from 'zod';

const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl: z.string().url().optional(),
  fontFamily: z.string().optional(),
  coinName: z.string().max(20).optional(),
  coinIcon: z.string().url().optional(),
  customStrings: z.record(z.string()).optional(),
});

export async function updateTheme(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  const theme = themeSchema.parse(req.body);
  // Stub: upsert partner_themes table
  res.json({ partnerId, theme, updatedAt: new Date().toISOString() });
}

export async function getTheme(req: Request, res: Response): Promise<void> {
  const partnerId = req.params.id;
  // Stub: query partner_themes table
  res.json({
    partnerId,
    theme: {
      primaryColor: '#1E88E5',
      secondaryColor: '#43A047',
      accentColor: '#FB8C00',
      backgroundColor: '#FFFFFF',
      logoUrl: null,
      fontFamily: 'Inter',
      coinName: 'Coins',
      coinIcon: null,
      customStrings: {},
    },
  });
}
