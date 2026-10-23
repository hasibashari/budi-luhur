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
      res.json(result);
    } catch (error: any) {
      console.error('UserController.saveInitialSetup error:', error);
      res.status(500).json({ success: false, error: 'Gagal menyimpan setup awal.' });
    }
  }

  static async getImmunizationRecords(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(await UserService.getImmunizationRecords(userId));
    } catch (error: any) {
      console.error('UserController.getImmunizationRecords error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat riwayat imunisasi.' });
    }
  }

  static async saveImmunizationRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await UserService.saveImmunizationRecord(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('UserController.saveImmunizationRecord error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal menyimpan riwayat imunisasi.' });
    }
  }

  static async updateImmunizationRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await UserService.updateImmunizationRecord(userId, String(req.params.id), req.body);
      res.json(result);
    } catch (error: any) {
      console.error('UserController.updateImmunizationRecord error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal memperbarui riwayat imunisasi.' });
    }
  }

  static async deleteImmunizationRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(await UserService.deleteImmunizationRecord(userId, String(req.params.id)));
    } catch (error: any) {
      console.error('UserController.deleteImmunizationRecord error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal menghapus riwayat imunisasi.' });
    }
  }

  static async verifyImmunizationRecord(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Hanya tenaga kesehatan (admin) yang dapat memverifikasi riwayat.',
        });
        return;
      }
      const status = String(req.body?.status || '').toUpperCase();
      if (status !== 'VERIFIED' && status !== 'REJECTED') {
        res.status(400).json({ success: false, error: 'Status verifikasi tidak valid.' });
        return;
      }
      const result = await UserService.verifyImmunizationRecord(
        String(req.params.id),
        status,
        req.user?.name || req.user?.email || 'Tenaga Kesehatan',
        req.body?.note || null,
      );
      res.json(result);
    } catch (error: any) {
      console.error('UserController.verifyImmunizationRecord error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal memverifikasi riwayat imunisasi.' });
    }
  }
}
