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

  static async getSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await AuthService.getSession(userId);
      if (!result.success) {
        res.status(401).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('AuthController.getSession error:', error);
      res.status(500).json({ success: false, error: 'Gagal memverifikasi sesi.' });
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
