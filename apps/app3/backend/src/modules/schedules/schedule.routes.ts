import { Router } from 'express';
import { ScheduleController } from './schedule.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const scheduleRoutes = Router();

scheduleRoutes.get('/', authMiddleware as any, ScheduleController.getSchedule as any);
scheduleRoutes.get('/list', authMiddleware as any, ScheduleController.getSchedules as any);
scheduleRoutes.post('/', authMiddleware as any, ScheduleController.createSchedule as any);
scheduleRoutes.put('/:id', authMiddleware as any, ScheduleController.updateSchedule as any);
scheduleRoutes.delete('/:id', authMiddleware as any, ScheduleController.deleteSchedule as any);
scheduleRoutes.get('/nudges/active', authMiddleware as any, ScheduleController.getActiveNudge as any);
scheduleRoutes.post('/nudges/:id/dismiss', authMiddleware as any, ScheduleController.dismissNudge as any);

export default scheduleRoutes;
