import { Response } from 'express';
import { ConsultationService } from './consultation.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { UserService } from '../users/user.service.js';

export class ConsultationController {
  static async askQuestion(req: AuthRequest, res: Response) {
    try {
      const { prompt, history } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ success: false, error: 'Pertanyaan wajib diisi.' });
        return;
      }

      let userContext;
      if (req.user?.id) {
        const profile = await UserService.getProfile(req.user.id);
        if (profile) {
          userContext = {
            name: profile.name,
            schoolOrOrg: profile.schoolOrOrg,
            hbLevel: profile.hbLevel,
            gender: profile.gender,
          };
        }
      }

      const result = await ConsultationService.askQuestion(prompt, history || [], userContext);
      res.json(result);
    } catch (error: any) {
      console.error('ConsultationController.askQuestion error:', error);
      res.status(500).json({
        success: false,
        answer: 'Terjadi kendala pada layanan konsultasi. Silakan coba kembali nanti.',
        error: error.message,
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

      const result = await ConsultationService.generateArticleDraft(topic, category || 'TTD & Imunisasi TT');
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
