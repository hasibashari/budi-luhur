import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { NotesService, HealthLogInput } from './notes.service.js';

const isDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export class NotesController {
  static async getLogs(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(await NotesService.getLogs(req.user.id));
    } catch (error) {
      console.error('NotesController.getLogs error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat catatan kesehatan.' });
    }
  }

  static async upsertLog(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const input = req.body as Partial<HealthLogInput>;
      if (
        !isDate(input.logDate) ||
        !input.mood ||
        !input.pain ||
        !input.bleeding ||
        !input.weightStatus ||
        !Array.isArray(input.sideEffects) ||
        typeof input.weightKg !== 'string' ||
        typeof input.notes !== 'string'
      ) {
        res.status(400).json({ success: false, error: 'Data catatan kesehatan tidak lengkap atau tidak valid.' });
        return;
      }
      const log = await NotesService.upsertLog(req.user.id, input as HealthLogInput);
      res.json({ success: true, log });
    } catch (error) {
      console.error('NotesController.upsertLog error:', error);
      res.status(500).json({ success: false, error: 'Gagal menyimpan catatan kesehatan.' });
    }
  }
}
