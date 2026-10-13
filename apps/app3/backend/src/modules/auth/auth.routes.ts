import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.post('/quick-login', AuthController.quickLogin);
authRoutes.post('/register', AuthController.register);
authRoutes.delete('/account', authMiddleware as any, AuthController.deleteAccount as any);

export default authRoutes;
