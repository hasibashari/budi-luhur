import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      if (!result.success) {
        res.status(401).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('AuthController.login error:', error);
      res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat login.' });
    }
  }

  static async quickLogin(req: Request, res: Response) {
    try {
      const role =
        req.body.role ||
        (typeof req.body.keyword === 'string' && req.body.keyword.toLowerCase().includes('admin')
          ? 'admin'
          : 'user');
      const result = await AuthService.quickLogin(role);
      res.json(result);
    } catch (error: any) {
      console.error('AuthController.quickLogin error:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal login cepat.' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json(result);
    } catch (error: any) {
      console.error('AuthController.register error:', error);
      res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat registrasi.' });
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await AuthService.deleteAccount(userId);
      res.json(result);
    } catch (error: any) {
      console.error('AuthController.deleteAccount error:', error);
      res.status(500).json({ success: false, error: 'Gagal memproses penghapusan akun.' });
    }
  }
}
