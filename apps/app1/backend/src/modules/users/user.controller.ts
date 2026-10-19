import { Response } from 'express';
import { UserService } from './user.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class UserController {
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const data = await UserService.getDashboardData(userId);
      if (!data) {
        res.status(404).json({ success: false, error: 'Data pengguna tidak ditemukan.' });
        return;
      }
      res.json(data);
    } catch (error: any) {
      console.error('UserController.getDashboard error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat data dashboard.' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const profile = await UserService.getProfile(userId);
      if (!profile) {
        res.status(404).json({ success: false, error: 'Profil tidak ditemukan.' });
        return;
      }
      res.json(profile);
    } catch (error: any) {
      console.error('UserController.getProfile error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat profil.' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await UserService.updateProfile(userId, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('UserController.updateProfile error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui profil.' });
    }
  }

  static async saveInitialSetup(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await UserService.saveInitialSetup(userId, req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('UserController.saveInitialSetup error:', error);
      res.status(500).json({ success: false, error: 'Gagal menyimpan setup awal.' });
    }
  }
}
