import { Router } from 'express';
import { Pool } from 'pg';
import { authMiddleware } from './middleware/auth.js';
import { createGameController, getGameController, listGamesController } from './controllers/game.js';
import { submitActionController } from './controllers/actions.js';
import { getPendingCardsController } from './controllers/cards.js';
import { getMonthlyReportController } from './controllers/monthly-report.js';
import { getTransactionsController } from './controllers/transactions.js';
import { getXpHistoryController, getBadgesController, getRewardsSummaryController, spendCoinsController } from './controllers/rewards.js';
import { getAdviceController, getCardHintController, getDailySummaryController, getAIStatusController } from './controllers/ai.js';
import {
  sendFriendRequestController,
  acceptFriendRequestController,
  rejectFriendRequestController,
  removeFriendController,
  listFriendsController,
  listFriendRequestsController,
  searchUsersController,
  globalLeaderboardController,
  friendsLeaderboardController,
  levelLeaderboardController,
  createClassroomController,
  joinClassroomController,
  listClassroomsController,
  getClassroomController,
  classroomLeaderboardController,
} from './controllers/social.js';

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

  // AI advisor endpoints
  router.get('/games/:id/ai/status', getAIStatusController(pool));
  router.post('/games/:id/ai/advice', getAdviceController(pool));
  router.post('/games/:id/ai/card-hint/:cardId', getCardHintController(pool));
  router.get('/games/:id/ai/daily-summary', getDailySummaryController(pool));

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

  // Social: Friends
  router.post('/friends/request', sendFriendRequestController(pool));
  router.post('/friends/accept/:requestId', acceptFriendRequestController(pool));
  router.post('/friends/reject/:requestId', rejectFriendRequestController(pool));
  router.delete('/friends/:friendshipId', removeFriendController(pool));
  router.get('/friends', listFriendsController(pool));
  router.get('/friends/requests', listFriendRequestsController(pool));
  router.get('/friends/search', searchUsersController(pool));

  // Social: Leaderboard
  router.get('/leaderboard/global', globalLeaderboardController(pool));
  router.get('/leaderboard/friends', friendsLeaderboardController(pool));
  router.get('/leaderboard/level', levelLeaderboardController(pool));

  // Social: Classrooms
  router.post('/classrooms', createClassroomController(pool));
  router.post('/classrooms/join', joinClassroomController(pool));
  router.get('/classrooms', listClassroomsController(pool));
  router.get('/classrooms/:id', getClassroomController(pool));
  router.get('/classrooms/:id/leaderboard', classroomLeaderboardController(pool));

  return router;
}
