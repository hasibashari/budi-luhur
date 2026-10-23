import { Response } from 'express';
import { ScheduleService } from './schedule.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class ScheduleController {
  /**
   * GET /schedules — Ambil semua jadwal harian milik user.
   */
  static async getSchedules(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const data = await ScheduleService.getDailySchedules(userId);
      res.json(data);
    } catch (error: any) {
      console.error('ScheduleController.getSchedules error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat jadwal.' });
    }
  }

  /**
   * POST /schedules — Buat jadwal harian baru.
   */
  static async createSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const { title, timeSlot, isEnabled, notes, remind15MinBefore, frequency } = req.body;

      if (!title || !timeSlot) {
        res.status(400).json({ success: false, error: 'Field title dan timeSlot wajib diisi.' });
        return;
      }

      const schedule = await ScheduleService.createSchedule(userId, {
        title,
        timeSlot,
        isEnabled,
        notes,
        remind15MinBefore,
        frequency,
      });

      res.status(201).json(schedule);
    } catch (error: any) {
      console.error('ScheduleController.createSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal membuat jadwal.' });
    }
  }

  /**
   * PUT /schedules/:id — Perbarui jadwal berdasarkan ID.
   */
  static async updateSchedule(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await ScheduleService.updateSchedule(id, req.body);
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('ScheduleController.updateSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui jadwal.' });
    }
  }

  /**
   * DELETE /schedules/:id — Hapus jadwal (soft delete).
   */
  static async deleteSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const id = String(req.params.id);
      const result = await ScheduleService.deleteSchedule(id, userId);
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('ScheduleController.deleteSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal menghapus jadwal.' });
    }
  }

  /**
   * GET /schedules/nudges/active — Ambil nudge aktif.
   */
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

  /**
   * POST /schedules/nudges/:id/dismiss — Dismiss nudge.
   */
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
