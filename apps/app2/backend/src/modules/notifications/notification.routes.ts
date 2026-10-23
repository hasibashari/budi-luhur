import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { NotificationController } from './notification.controller.js';

export const notificationRoutes = Router();

// ─── Cron (tanpa auth user, dilindungi CRON_SECRET) ──────────────────────────
// Harus didaftarkan SEBELUM `authMiddleware` agar tidak terkena auth JWT.
notificationRoutes.get('/cron-reminders', NotificationController.runReminderCron as any);
notificationRoutes.post('/cron-reminders', NotificationController.runReminderCron as any);

notificationRoutes.use(authMiddleware as any);
notificationRoutes.get('/public-key', NotificationController.getPublicKey as any);
notificationRoutes.post('/subscribe', NotificationController.subscribe as any);
notificationRoutes.post('/unsubscribe', NotificationController.unsubscribe as any);
