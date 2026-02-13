import { Request, Response } from 'express';
import { Pool } from 'pg';
import {
  getProviderForRegion,
  isProviderConfigured,
  encrypt,
  findLinkedAccountsByUserId,
  findLinkedAccountById,
  createLinkedAccount,
  softDeleteLinkedAccount,
  syncTransactions,
  getSyncedTransactions,
} from '../services/banking-service.js';
import { comparePeriod, getMirrorDashboard } from '../services/mirror-mode.js';
import { findGameById } from '../models/game.js';

const PSD2_CONSENT_DAYS = 90;

// POST /banking/link — Initiate bank linking
export function linkBankController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { region, redirectUri } = req.body as { region?: string; redirectUri?: string };
      const userRegion = region || 'ro';

      if (!isProviderConfigured(userRegion)) {
        res.status(503).json({
          code: 'PROVIDER_NOT_CONFIGURED',
          message: 'Banking integration is not yet available for your region. Coming soon!',
        });
        return;
      }

      const provider = getProviderForRegion(userRegion);
      const result = await provider.initLink(userId, redirectUri);

      res.json({
        provider: provider.name,
        linkType: result.type,
        linkValue: result.value,
      });
    } catch (err: unknown) {
      console.error('Link bank error:', (err as Error).message);
      res.status(500).json({ code: 'LINK_ERROR', message: 'Failed to initiate bank linking' });
    }
  };
}

// POST /banking/callback — Handle OAuth callback / public token exchange
export function bankCallbackController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const partnerId = req.partnerId || null;
      const { code, region } = req.body as { code: string; region?: string };

      if (!code) {
        res.status(400).json({ code: 'MISSING_CODE', message: 'Missing authorization code or public token' });
        return;
      }

      const userRegion = region || 'ro';
      const provider = getProviderForRegion(userRegion);
      const tokenResult = await provider.exchangeToken(code);

      const consentExpires = new Date();
      consentExpires.setDate(consentExpires.getDate() + PSD2_CONSENT_DAYS);

      const account = await createLinkedAccount(pool, {
        userId,
        partnerId,
        provider: provider.name,
        connectionId: tokenResult.connectionId,
        institutionName: tokenResult.institutionName || null,
        accessTokenEncrypted: encrypt(tokenResult.accessToken),
        consentExpiresAt: consentExpires,
      });

      res.json({
        id: account.id,
        provider: account.provider,
        institutionName: account.institution_name,
        status: account.status,
        consentExpiresAt: account.consent_expires_at,
      });
    } catch (err: unknown) {
      console.error('Bank callback error:', (err as Error).message);
      res.status(500).json({ code: 'CALLBACK_ERROR', message: 'Failed to link bank account' });
    }
  };
}

// GET /banking/accounts — List linked accounts
export function listAccountsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const accounts = await findLinkedAccountsByUserId(pool, userId);

      res.json(accounts.map(a => ({
        id: a.id,
        provider: a.provider,
        institutionName: a.institution_name,
        status: a.status,
        consentGrantedAt: a.consent_granted_at,
        consentExpiresAt: a.consent_expires_at,
        lastSyncAt: a.last_sync_at,
        createdAt: a.created_at,
      })));
    } catch (err: unknown) {
      console.error('List accounts error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list accounts' });
    }
  };
}

// DELETE /banking/accounts/:id — Unlink account (soft-delete + purge synced data)
export function unlinkAccountController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;

      const account = await findLinkedAccountById(pool, id, userId);
      if (!account) {
        res.status(404).json({ code: 'NOT_FOUND', message: 'Account not found' });
        return;
      }

      await softDeleteLinkedAccount(pool, id, userId);
      res.json({ success: true });
    } catch (err: unknown) {
      console.error('Unlink account error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to unlink account' });
    }
  };
}

// GET /banking/transactions — Get synced transactions
export function getBankTransactionsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { from, to } = req.query as { from?: string; to?: string };

      const transactions = await getSyncedTransactions(pool, userId, from, to);
      res.json({ transactions });
    } catch (err: unknown) {
      console.error('Get bank transactions error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get transactions' });
    }
  };
}

// POST /banking/sync — Trigger transaction sync
export function syncBankController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const accounts = await findLinkedAccountsByUserId(pool, userId);
      const activeAccounts = accounts.filter(a => a.status === 'active');

      if (activeAccounts.length === 0) {
        res.status(400).json({ code: 'NO_ACCOUNTS', message: 'No linked accounts to sync' });
        return;
      }

      // Default: sync last 30 days
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      let totalSynced = 0;
      const errors: Array<{ accountId: string; error: string }> = [];

      for (const account of activeAccounts) {
        try {
          const count = await syncTransactions(pool, account, from, to);
          totalSynced += count;
        } catch (err: unknown) {
          errors.push({ accountId: account.id, error: (err as Error).message });
        }
      }

      res.json({
        synced: totalSynced,
        accounts: activeAccounts.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err: unknown) {
      console.error('Sync error:', (err as Error).message);
      res.status(500).json({ code: 'SYNC_ERROR', message: 'Failed to sync transactions' });
    }
  };
}

// GET /banking/mirror/:gameId — Mirror Mode comparison data
export function mirrorController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const gameId = req.params.gameId as string;
      const year = req.query.year as string | undefined;
      const month = req.query.month as string | undefined;

      // Verify game ownership
      const game = await findGameById(pool, gameId);
      if (!game || game.user_id !== userId) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }

      // If year/month provided, get specific comparison
      if (year && month) {
        const comparison = await comparePeriod(
          pool, gameId, userId,
          parseInt(year, 10), parseInt(month, 10),
        );
        res.json(comparison);
        return;
      }

      // Otherwise return dashboard
      const dashboard = await getMirrorDashboard(pool, gameId, userId);
      res.json(dashboard);
    } catch (err: unknown) {
      console.error('Mirror error:', (err as Error).message);
      res.status(500).json({ code: 'MIRROR_ERROR', message: 'Failed to get mirror data' });
    }
  };
}
