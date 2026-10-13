import { Router } from 'express';
import { ConsumptionController } from './consumption.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const consumptionRoutes = Router();

consumptionRoutes.post('/record', authMiddleware as any, ConsumptionController.record as any);
consumptionRoutes.get('/summary', authMiddleware as any, ConsumptionController.getSummary as any);
consumptionRoutes.get('/history', authMiddleware as any, ConsumptionController.getHistory as any);

export default consumptionRoutes;
