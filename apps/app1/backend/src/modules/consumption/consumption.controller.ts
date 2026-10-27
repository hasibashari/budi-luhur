import { Response } from 'express';
import { ConsumptionService } from './consumption.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class ConsumptionController {
  static async record(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const targetDate =
        req.body.targetDate ||
        req.body.date ||
        req.body.scheduledDate ||
        new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const { status, notes } = req.body;
      const result = await ConsumptionService.recordConsumption(userId, targetDate, status, notes);
      res.json(result);
    } catch (error: any) {
      console.error('ConsumptionController.record error:', error);
      res.status(500).json({ success: false, error: 'Gagal mencatat konsumsi obat.' });
    }
  }

  static async getSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const summary = await ConsumptionService.getMonitoringSummary(userId);
      res.json(summary);
    } catch (error: any) {
      console.error('ConsumptionController.getSummary error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat ringkasan kepatuhan.' });
    }
  }

  static async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const { range, category, status, date } = req.query;
      const logs = await ConsumptionService.getLogs(
        userId,
        (range as string) || 'ALL',
        (category as string) || 'ALL',
        (status as string) || 'ALL',
        (date as string) || undefined,
      );
      res.json(logs);
    } catch (error: any) {
      console.error('ConsumptionController.getHistory error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat riwayat konsumsi.' });
    }
  }
}
