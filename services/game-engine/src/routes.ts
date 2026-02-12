import { Router } from 'express';
import { Pool } from 'pg';
import { authMiddleware } from './middleware/auth.js';
import { createGameController, getGameController, listGamesController } from './controllers/game.js';
import { submitActionController } from './controllers/actions.js';
import { getPendingCardsController } from './controllers/cards.js';
import { getMonthlyReportController } from './controllers/monthly-report.js';
import { getTransactionsController } from './controllers/transactions.js';

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

  return router;
}
