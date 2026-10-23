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

  /** Dry-run: peringatan interval sebelum data benar-benar disimpan. */
  static async validateImmunizationRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(await UserService.validateImmunizationRecord(userId, req.body));
    } catch (error: any) {
      console.error('UserController.validateImmunizationRecord error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal memeriksa data imunisasi.' });
    }
  }

  static async uploadImmunizationAttachment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Berkas bukti tidak terbaca. Gunakan JPG, PNG, WEBP, atau PDF.',
        });
        return;
      }
      const fileName = (req.header('x-file-name') || '').slice(0, 255) || undefined;
      const result = await UserService.saveImmunizationAttachment(
        userId,
        String(req.params.id),
        { buffer: req.body, fileName },
      );
      res.status(201).json(result);
    } catch (error: any) {
      console.error('UserController.uploadImmunizationAttachment error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal mengunggah bukti imunisasi.' });
    }
  }

  static async getImmunizationAttachment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const file = await UserService.getImmunizationAttachment(
        userId,
        String(req.params.id),
        req.user?.role === 'admin',
      );
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(file.file_name || 'bukti-imunisasi')}"`,
      );
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(file.data);
    } catch (error: any) {
      console.error('UserController.getImmunizationAttachment error:', error);
      res
        .status(404)
        .json({ success: false, error: error.message || 'Bukti imunisasi tidak ditemukan.' });
    }
  }

  static async deleteImmunizationAttachment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(
        await UserService.deleteImmunizationAttachment(userId, String(req.params.id)),
      );
    } catch (error: any) {
      console.error('UserController.deleteImmunizationAttachment error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal menghapus bukti imunisasi.' });
    }
  }

  static async getCertificateVerification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(await UserService.getCertificateVerification(userId));
    } catch (error: any) {
      console.error('UserController.getCertificateVerification error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat status sertifikat.' });
    }
  }

  /** Pengguna mengajukan; keputusan tetap di admin. */
  static async requestCertificateVerification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      res.json(await UserService.requestCertificateVerification(userId, req.body?.note));
    } catch (error: any) {
      console.error('UserController.requestCertificateVerification error:', error);
      res.status(400).json({ success: false, error: 'Gagal mengajukan verifikasi sertifikat.' });
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
