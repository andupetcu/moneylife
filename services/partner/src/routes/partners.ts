import { Router } from 'express';
import { wrap } from '../utils/wrap';
import { requireRole } from '../middleware/auth';
import * as onboardingController from '../controllers/onboarding';
import * as themingController from '../controllers/theming';
import * as analyticsController from '../controllers/analytics';
import * as rewardsController from '../controllers/rewards';

export const partnerRouter = Router();

partnerRouter.post('/', requireRole('system_admin'), wrap(onboardingController.createPartner));
partnerRouter.get('/:id', wrap(onboardingController.getPartner));
partnerRouter.put('/:id/theme', requireRole('partner_admin', 'system_admin'), wrap(themingController.updateTheme));
partnerRouter.get('/:id/theme', wrap(themingController.getTheme));
partnerRouter.put('/:id/features', requireRole('partner_admin', 'system_admin'), wrap(onboardingController.updateFeatures));
partnerRouter.get('/:id/features', wrap(onboardingController.getFeatures));
partnerRouter.get('/:id/analytics', requireRole('partner_admin', 'system_admin'), wrap(analyticsController.getAnalytics));
partnerRouter.post('/:id/rewards', requireRole('partner_admin', 'system_admin'), wrap(rewardsController.addPartnerReward));
partnerRouter.get('/:id/rewards', wrap(rewardsController.getPartnerRewards));
