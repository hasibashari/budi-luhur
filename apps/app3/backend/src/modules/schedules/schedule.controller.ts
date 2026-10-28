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
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const id = String(req.params.id);
      const body = req.body || {};
      const isTTUpdate = [
        'stage',
        'scheduledDate',
        'status',
        'dosage',
        'notes',
        'remind15MinBefore',
        'remind1MonthBefore',
        'remind1DayBefore',
        'remind30MinBefore',
      ].some(key => body[key] !== undefined);

      const result = isTTUpdate
        ? await ScheduleService.updateTTSchedule(id, userId, body)
        : await ScheduleService.updateScheduleSettings(id, {
          ...body,
          time: body.time ?? body.timeSlot,
        });

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

  /** GET /schedules/list — Ambil seluruh jadwal TT milik user. */
  static async getSchedules(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const data = await ScheduleService.getSchedules(userId);
      res.json(data);
    } catch (error: any) {
      console.error('ScheduleController.getSchedules error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat daftar jadwal TT.' });
    }
  }

  /** POST /schedules — Buat jadwal imunisasi TT baru. */
  static async createSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const {
        stage,
        scheduledDate,
        timeSlot,
        dosage,
        notes,
        remind15MinBefore,
        remind1MonthBefore,
        remind1DayBefore,
        remind30MinBefore,
        isEnabled,
      } = req.body || {};

      if (!stage || !scheduledDate || !timeSlot) {
        res.status(400).json({
          success: false,
          error: 'Field stage, scheduledDate, dan timeSlot wajib diisi.',
        });
        return;
      }

      const schedule = await ScheduleService.createSchedule(userId, {
        stage,
        scheduledDate,
        timeSlot,
        dosage,
        notes,
        remind15MinBefore,
        remind1MonthBefore,
        remind1DayBefore,
        remind30MinBefore,
        isEnabled,
      });

      res.status(201).json(schedule);
    } catch (error: any) {
      console.error('ScheduleController.createSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal membuat jadwal TT.' });
    }
  }

  /** DELETE /schedules/:id — Hapus (soft delete) jadwal TT. */
  static async deleteSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ScheduleService.deleteSchedule(String(req.params.id), userId);
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('ScheduleController.deleteSchedule error:', error);
      res.status(500).json({ success: false, error: 'Gagal menghapus jadwal TT.' });
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
