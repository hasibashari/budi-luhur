import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { NotesController } from './notes.controller.js';

export const notesRoutes = Router();
notesRoutes.get('/', authMiddleware as any, NotesController.getLogs as any);
notesRoutes.post('/', authMiddleware as any, NotesController.upsertLog as any);

export default notesRoutes;
