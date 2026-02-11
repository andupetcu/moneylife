import { Router } from 'express';
import * as xpController from '../controllers/xp';
import * as coinsController from '../controllers/coins';
import * as badgesController from '../controllers/badges';
import * as streaksController from '../controllers/streaks';
import * as redemptionsController from '../controllers/redemptions';

export const rewardsRouter = Router();

// Summary
rewardsRouter.get('/summary', xpController.getSummary);

// Badges
rewardsRouter.get('/badges', badgesController.getUserBadges);

// Streaks
rewardsRouter.get('/streaks', streaksController.getStreaks);

// History
rewardsRouter.get('/history', coinsController.getHistory);

// Catalog & Redemption
rewardsRouter.get('/catalog', redemptionsController.getCatalog);
rewardsRouter.post('/redeem', redemptionsController.redeemReward);
