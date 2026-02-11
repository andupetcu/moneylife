import { Router, type Router as RouterType } from 'express';
import { wrap } from '../utils/wrap';
import * as usersController from '../controllers/users';
import * as gamesController from '../controllers/games';
import * as antiCheatController from '../controllers/anti-cheat';

export const adminRouter: RouterType = Router();

adminRouter.get('/users', wrap(usersController.searchUsers));
adminRouter.get('/users/:id', wrap(usersController.getUser));
adminRouter.put('/users/:id', wrap(usersController.updateUser));
adminRouter.put('/users/:id/suspend', wrap(usersController.suspendUser));
adminRouter.get('/games', wrap(gamesController.searchGames));
adminRouter.get('/games/:id', wrap(gamesController.getGame));
adminRouter.put('/games/:id/reset', wrap(gamesController.resetGame));
adminRouter.get('/partners', (_req, res) => { res.json({ partners: [] }); });
adminRouter.get('/analytics', (_req, res) => {
  res.json({ totalUsers: 0, activeUsers: 0, totalGames: 0, totalRedemptions: 0, revenue: 0 });
});
adminRouter.get('/anti-cheat/flagged', wrap(antiCheatController.getFlaggedAccounts));
adminRouter.put('/anti-cheat/:id/resolve', wrap(antiCheatController.resolveFlag));
adminRouter.get('/system/health', (_req, res) => {
  res.json({
    services: { auth: 'ok', 'game-engine': 'ok', rewards: 'ok', social: 'ok', banking: 'ok', notification: 'ok', partner: 'ok' },
    database: 'ok', redis: 'ok', sqs: 'ok', uptime: process.uptime(),
  });
});
