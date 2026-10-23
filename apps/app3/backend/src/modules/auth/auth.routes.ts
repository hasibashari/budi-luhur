import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.post('/register', AuthController.register);
authRoutes.get('/session', authMiddleware as any, AuthController.getSession as any);
authRoutes.delete('/account', authMiddleware as any, AuthController.deleteAccount as any);

export default authRoutes;
