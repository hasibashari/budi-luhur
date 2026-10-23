import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const userRoutes = Router();

userRoutes.get('/dashboard', authMiddleware as any, UserController.getDashboard as any);
userRoutes.get('/profile', authMiddleware as any, UserController.getProfile as any);
userRoutes.put('/profile', authMiddleware as any, UserController.updateProfile as any);
userRoutes.post('/setup', authMiddleware as any, UserController.saveInitialSetup as any);
userRoutes.get('/immunizations', authMiddleware as any, UserController.getImmunizationRecords as any);
userRoutes.post('/immunizations', authMiddleware as any, UserController.saveImmunizationRecord as any);
userRoutes.put('/immunizations/:id', authMiddleware as any, UserController.updateImmunizationRecord as any);
userRoutes.delete('/immunizations/:id', authMiddleware as any, UserController.deleteImmunizationRecord as any);
userRoutes.patch(
  '/immunizations/:id/verification',
  authMiddleware as any,
  UserController.verifyImmunizationRecord as any,
);

export default userRoutes;
