import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export async function createConnectSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const countryCodes = (req.body.countryCodes as string[]) || ['BR'];

  // Stub: In production, POST to https://www.saltedge.com/api/v5/connect_sessions/create
  const connectUrl = `https://www.saltedge.com/connect?token=${uuid()}`;

  res.json({
    connectUrl,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
}

const callbackSchema = z.object({
  connectionId: z.string().min(1),
});

export async function handleCallback(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const body = callbackSchema.parse(req.body);

  // Stub: fetch connection details from Salt Edge API
  res.status(201).json({
    connectionId: body.connectionId,
    provider: 'saltedge',
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}
