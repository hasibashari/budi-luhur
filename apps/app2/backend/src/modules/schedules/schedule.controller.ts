import { Response } from 'express';
import { ScheduleService } from './schedule.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class ScheduleController {
  static async getSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const data = await ScheduleService.getUserSchedule(userId);
      res.json(data);
    } catch (error: any) {
      console.error('ScheduleController.getSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat jadwal.' });
    }
  }

  static async updateSchedule(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await ScheduleService.updateScheduleSettings(id, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('ScheduleController.updateSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui jadwal.' });
    }
  }

  static async getActiveNudge(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const nudge = await ScheduleService.getActiveNudge(userId);
      res.json(nudge);
    } catch (error: any) {
      console.error('ScheduleController.getActiveNudge error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat pengingat nudge.' });
    }
  }

  static async dismissNudge(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await ScheduleService.dismissNudge(id);
      res.json(result);
    } catch (error: any) {
      console.error('ScheduleController.dismissNudge error:', error);
      res.status(500).json({ success: false, error: 'Gagal menutup pengingat nudge.' });
    }
  }
}
