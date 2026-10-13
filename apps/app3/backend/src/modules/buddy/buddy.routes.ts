import { Router } from 'express';
import { BuddyController } from './buddy.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const buddyRoutes = Router();

buddyRoutes.get('/groups', authMiddleware as any, BuddyController.getGroups as any);
buddyRoutes.post('/groups', authMiddleware as any, BuddyController.createGroup as any);
buddyRoutes.post('/groups/join', authMiddleware as any, BuddyController.joinGroup as any);
buddyRoutes.get('/groups/:id', authMiddleware as any, BuddyController.getChatDetails as any);
buddyRoutes.post('/groups/:id/messages', authMiddleware as any, BuddyController.sendMessage as any);

export default buddyRoutes;
