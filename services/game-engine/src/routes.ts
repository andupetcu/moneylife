import { Router } from 'express';
import { Pool } from 'pg';
import { authMiddleware } from './middleware/auth.js';
import { createGameController, getGameController, listGamesController } from './controllers/game.js';
import { submitActionController } from './controllers/actions.js';
import { getPendingCardsController } from './controllers/cards.js';
import { getMonthlyReportController } from './controllers/monthly-report.js';
import { getTransactionsController } from './controllers/transactions.js';
import { getXpHistoryController, getBadgesController, getRewardsSummaryController, spendCoinsController } from './controllers/rewards.js';
import {
  linkBankController,
  bankCallbackController,
  listAccountsController,
  unlinkAccountController,
  getBankTransactionsController,
  syncBankController,
  mirrorController,
} from './controllers/banking.js';

export function createRoutes(pool: Pool): Router {
  const router = Router();

  // All routes require auth
  router.use(authMiddleware());

  router.get('/games', listGamesController(pool));
  router.post('/games', createGameController(pool));
  router.get('/games/:id', getGameController(pool));
  router.post('/games/:id/actions', submitActionController(pool));
  router.get('/games/:id/cards', getPendingCardsController(pool));
  router.get('/games/:id/monthly-report/:year/:month', getMonthlyReportController(pool));
  router.get('/games/:id/transactions', getTransactionsController(pool));

  // Rewards endpoints
  router.get('/games/:id/xp-history', getXpHistoryController(pool));
  router.get('/games/:id/badges', getBadgesController(pool));
  router.get('/games/:id/rewards-summary', getRewardsSummaryController(pool));
  router.post('/games/:id/spend-coins', spendCoinsController(pool));

  // Banking endpoints
  router.post('/banking/link', linkBankController(pool));
  router.post('/banking/callback', bankCallbackController(pool));
  router.get('/banking/accounts', listAccountsController(pool));
  router.delete('/banking/accounts/:id', unlinkAccountController(pool));
  router.get('/banking/transactions', getBankTransactionsController(pool));
  router.post('/banking/sync', syncBankController(pool));
  router.get('/banking/mirror/:gameId', mirrorController(pool));

  // Bills endpoint
  router.get('/games/:id/bills', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      // Verify game ownership
      const gameResult = await pool.query('SELECT id FROM games WHERE id = $1 AND user_id = $2', [id, userId]);
      if (gameResult.rows.length === 0) {
        return res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
      }
      const billsResult = await pool.query(
        'SELECT id, name, amount, next_due_date as "dueDate", category, auto_pay as "isAutopay", is_active as "isActive", frequency FROM scheduled_bills WHERE game_id = $1 ORDER BY next_due_date',
        [id]
      );
      res.json(billsResult.rows);
    } catch (err: any) {
      console.error('Get bills error:', err.message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get bills' });
    }
  });

  return router;
}
