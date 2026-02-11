import { Router, type Router as RouterType } from 'express';
import { wrap } from '../utils/wrap';
import * as xpController from '../controllers/xp';
import * as coinsController from '../controllers/coins';
import * as badgesController from '../controllers/badges';
import * as streaksController from '../controllers/streaks';
import * as redemptionsController from '../controllers/redemptions';

export const rewardsRouter: RouterType = Router();

rewardsRouter.get('/summary', wrap(xpController.getSummary));
rewardsRouter.get('/badges', wrap(badgesController.getUserBadges));
rewardsRouter.get('/streaks', wrap(streaksController.getStreaks));
rewardsRouter.get('/history', wrap(coinsController.getHistory));
rewardsRouter.get('/catalog', wrap(redemptionsController.getCatalog));
rewardsRouter.post('/redeem', wrap(redemptionsController.redeemReward));
