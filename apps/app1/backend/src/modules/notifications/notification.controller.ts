import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { NotificationService } from './notification.service.js';

export class NotificationController {
  static getPublicKey(_req: AuthRequest, res: Response) {
    res.json({ publicKey: NotificationService.getPublicKey() });
  }

  static async subscribe(req: AuthRequest, res: Response) {
    if (!req.user?.id || !req.body?.endpoint || !req.body?.keys) {
      res.status(400).json({ success: false, error: 'Subscription push tidak valid.' });
      return;
    }
    const result = await NotificationService.saveSubscription(req.user.id, req.body);
    res.json(result);
  }

  static async unsubscribe(req: AuthRequest, res: Response) {
    if (!req.user?.id || typeof req.body?.endpoint !== 'string') {
      res.status(400).json({ success: false, error: 'Endpoint push wajib disertakan.' });
      return;
    }
    const result = await NotificationService.removeSubscription(req.user.id, req.body.endpoint);
    res.json(result);
  }
}
