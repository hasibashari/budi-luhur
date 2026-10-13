import { Router } from 'express';
import { ConsultationController } from './consultation.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const consultationRoutes = Router();

consultationRoutes.post('/ask', authMiddleware as any, ConsultationController.askQuestion as any);
consultationRoutes.post('/generate-article', authMiddleware as any, ConsultationController.generateArticleDraft as any);
consultationRoutes.post('/generate-nudge', authMiddleware as any, ConsultationController.generateNudge as any);

export default consultationRoutes;
