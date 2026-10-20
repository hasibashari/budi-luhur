import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { NotificationController } from './notification.controller.js';

export const notificationRoutes = Router();
notificationRoutes.use(authMiddleware as any);
notificationRoutes.get('/public-key', NotificationController.getPublicKey as any);
notificationRoutes.post('/subscribe', NotificationController.subscribe as any);
notificationRoutes.post('/unsubscribe', NotificationController.unsubscribe as any);
