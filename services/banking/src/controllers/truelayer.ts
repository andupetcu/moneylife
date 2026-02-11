import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export async function generateAuthUrl(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const state = uuid();

  // Stub: In production, construct TrueLayer authorization URL
  const authUrl = `https://auth.truelayer-sandbox.com/?response_type=code&client_id=STUB&redirect_uri=https://app.moneylife.com/truelayer/callback&scope=info%20accounts%20balance%20transactions%20offline_access&state=${state}`;

  res.json({ authUrl, state, expiresIn: 300 });
}

const callbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function exchangeCode(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const body = callbackSchema.parse(req.body);

  // Stub: In production, POST to https://auth.truelayer.com/connect/token
  // Store encrypted tokens
  const connectionId = uuid();

  res.status(201).json({
    connectionId,
    provider: 'truelayer',
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}
