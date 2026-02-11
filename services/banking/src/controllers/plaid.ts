import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger';

const linkTokenSchema = z.object({
  countryCodes: z.array(z.string()).default(['US']),
  language: z.string().default('en'),
});

export async function createLinkToken(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const body = linkTokenSchema.parse(req.body);

  // Stub: In production, call Plaid API
  // POST https://production.plaid.com/link/token/create
  const linkToken = `link-sandbox-${uuid()}`;

  res.json({
    linkToken,
    expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
}

const exchangeSchema = z.object({
  publicToken: z.string().min(1),
  institutionId: z.string().optional(),
  institutionName: z.string().optional(),
});

export async function exchangePublicToken(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const body = exchangeSchema.parse(req.body);

  // Stub: In production, call Plaid API
  // POST https://production.plaid.com/item/public_token/exchange
  // Then store encrypted access_token
  const connectionId = uuid();

  // Never log the access token
  logger.info('Bank account linked', { userId, connectionId, provider: 'plaid' });

  res.status(201).json({
    connectionId,
    provider: 'plaid',
    institutionName: body.institutionName || 'Unknown Bank',
    status: 'active',
    createdAt: new Date().toISOString(),
  });
}

export async function getAccounts(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  // Stub: query banking_connections + accounts for user
  res.json({ userId, accounts: [] });
}

export async function getTransactions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const from = req.query.from as string;
  const to = req.query.to as string;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  // Stub: query banking_transactions for user, never return raw descriptions
  res.json({ userId, transactions: [], total: 0, limit });
}

export async function disconnectAccount(req: Request, res: Response): Promise<void> {
  const accountId = req.params.id;
  const userId = req.user!.sub;

  // Stub: revoke token with provider, soft-delete connection, purge transactions within 24h
  logger.info('Bank account disconnected', { userId, accountId });
  res.status(204).send();
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  // In production: verify JWT signature from Plaid
  const { webhook_type, webhook_code, item_id } = req.body;

  logger.info('Plaid webhook received', { webhook_type, webhook_code });

  switch (webhook_code) {
    case 'SYNC_UPDATES_AVAILABLE':
      // Trigger incremental sync
      break;
    case 'ERROR':
      // Mark connection as needs_reauth
      break;
    case 'PENDING_EXPIRATION':
      // Notify user to re-consent
      break;
  }

  res.json({ received: true });
}
