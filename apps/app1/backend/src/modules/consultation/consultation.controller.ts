import { Response } from 'express';
import { ConsultationService } from './consultation.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class ConsultationController {
  static async askQuestion(req: AuthRequest, res: Response) {
    try {
      const { prompt, history } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ success: false, error: 'Pertanyaan wajib diisi.' });
        return;
      }

      // Privacy-first: only send the first name of user to AI assistant, avoiding sensitive PII (Hb level, school, etc.)
      let userContext;
      if (req.user?.name) {
        const firstName = req.user.name.trim().split(/\s+/)[0];
        userContext = { name: firstName };
      }

      const result = await ConsultationService.askQuestion(prompt, history || [], userContext);
      res.json(result);
    } catch (error: any) {
      console.error('ConsultationController.askQuestion error:', error);
      res.status(500).json({
        success: false,
        errorType: 'SERVER_ERROR',
        answer: 'Terjadi kendala pada server layanan asisten TTD. Silakan coba kembali beberapa saat lagi.',
        error: 'SERVER_ERROR',
      });
    }
  }

  static async generateArticleDraft(req: AuthRequest, res: Response) {
    try {
      const { topic, category } = req.body;
      if (!topic) {
        res.status(400).json({ success: false, error: 'Topik artikel wajib diisi.' });
        return;
      }

      const result = await ConsultationService.generateArticleDraft(topic, category || 'Anemia & TTD');
      res.json(result);
    } catch (error: any) {
      console.error('ConsultationController.generateArticleDraft error:', error);
      res.status(500).json({ success: false, error: 'Gagal membuat draf artikel AI.' });
    }
  }

  static async generateNudge(req: AuthRequest, res: Response) {
    try {
      const result = await ConsultationService.generateNudgeMessage(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('ConsultationController.generateNudge error:', error);
      res.status(500).json({ success: false, error: 'Gagal membuat pesan nudge AI.' });
    }
  }
}
