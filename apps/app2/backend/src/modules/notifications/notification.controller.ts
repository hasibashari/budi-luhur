import { Response, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { NotificationService } from './notification.service.js';
import { ScheduleReminderService } from '../schedules/scheduleReminder.service.js';

export class NotificationController {
  static getPublicKey(_req: AuthRequest, res: Response) { res.json({ publicKey: NotificationService.getPublicKey() }); }
  static async subscribe(req: AuthRequest, res: Response) {
    if (!req.user?.id || !req.body?.endpoint || !req.body?.keys) {
      res.status(400).json({ success: false, error: 'Subscription push tidak valid.' }); return;
    }
    res.json(await NotificationService.saveSubscription(req.user.id, req.body));
  }
  static async unsubscribe(req: AuthRequest, res: Response) {
    if (!req.user?.id || typeof req.body?.endpoint !== 'string') {
      res.status(400).json({ success: false, error: 'Endpoint push wajib disertakan.' }); return;
    }
    res.json(await NotificationService.removeSubscription(req.user.id, req.body.endpoint));
  }

  /**
   * GET/POST /notifications/cron-reminders
   * Dipanggil oleh Vercel Cron (serverless tidak bisa memakai setInterval).
   * Dilindungi `CRON_SECRET` (Vercel otomatis mengirim header Authorization).
   */
  static async runReminderCron(req: Request, res: Response) {
    const secret = process.env.CRON_SECRET;
    if (secret && req.headers.authorization !== `Bearer ${secret}`) {
      res.status(401).json({ success: false, error: 'Unauthorized cron.' });
      return;
    }

    try {
      const result = await ScheduleReminderService.checkAndSendReminders();
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('NotificationController.runReminderCron error:', error);
      res.status(500).json({ success: false, error: 'Gagal menjalankan cron pengingat.' });
    }
  }
}
