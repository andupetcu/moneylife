import { Router } from 'express';
import { wrap } from '../utils/wrap';
import * as inAppController from '../controllers/in-app';
import * as pushController from '../controllers/push';

export const notificationRouter = Router();

notificationRouter.get('/', wrap(inAppController.getNotifications));
notificationRouter.put('/:id/read', wrap(inAppController.markRead));
notificationRouter.put('/read-all', wrap(inAppController.markAllRead));
notificationRouter.get('/preferences', wrap(inAppController.getPreferences));
notificationRouter.put('/preferences', wrap(inAppController.updatePreferences));
notificationRouter.post('/send', wrap(pushController.sendNotification));
