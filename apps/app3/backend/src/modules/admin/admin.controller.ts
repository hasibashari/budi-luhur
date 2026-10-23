import { Response } from 'express';
import { AdminService } from './admin.service.js';
import { UserService } from '../users/user.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class AdminController {
  static async getStats(_req: AuthRequest, res: Response) {
    try {
      const stats = await AdminService.getOverviewStats();
      res.json(stats);
    } catch (error: any) {
      console.error('AdminController.getStats error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat statistik UKS.' });
    }
  }

  static async getUsers(_req: AuthRequest, res: Response) {
    try {
      const users = await AdminService.getManagedUsers();
      res.json(users);
    } catch (error: any) {
      console.error('AdminController.getUsers error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat daftar siswi.' });
    }
  }

  static async getUserById(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const user = await AdminService.getManagedUserById(id);
      if (!user) {
        res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan.' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      console.error('AdminController.getUserById error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat data pengguna.' });
    }
  }

  static async createUser(req: AuthRequest, res: Response) {
    try {
      const user = await AdminService.createUser(req.body);
      res.status(201).json({ success: true, user });
    } catch (error: any) {
      console.error('AdminController.createUser error:', error);
      res.status(500).json({ success: false, error: 'Gagal menambahkan pengguna baru.' });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await AdminService.updateUser(id, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.updateUser error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui pengguna.' });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await AdminService.deleteUser(id);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.deleteUser error:', error);
      res.status(500).json({ success: false, error: 'Gagal menghapus pengguna.' });
    }
  }

  static async sendReminder(req: AuthRequest, res: Response) {
    try {
      const { userId, message, channel } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, error: 'Target userId wajib disertakan.' });
        return;
      }
      const result = await AdminService.sendUserReminder(userId, message, channel);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.sendReminder error:', error);
      res.status(500).json({ success: false, error: 'Gagal mengirim pengingat.' });
    }
  }

  static async getArticles(_req: AuthRequest, res: Response) {
    try {
      const articles = await AdminService.getAdminArticles();
      res.json(articles);
    } catch (error: any) {
      console.error('AdminController.getArticles error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat daftar artikel admin.' });
    }
  }

  /** Riwayat imunisasi milik satu pengguna — sumber data sama dengan sisi pengguna. */
  static async getUserImmunizations(req: AuthRequest, res: Response) {
    try {
      const userId = String(req.params.id);
      res.json(await UserService.getImmunizationRecords(userId));
    } catch (error: any) {
      console.error('AdminController.getUserImmunizations error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat riwayat imunisasi pengguna.' });
    }
  }

  static async getCertificates(req: AuthRequest, res: Response) {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      res.json(await UserService.listCertificateVerifications(status));
    } catch (error: any) {
      console.error('AdminController.getCertificates error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat pengajuan sertifikat.' });
    }
  }

  static async reviewCertificate(req: AuthRequest, res: Response) {
    try {
      const status = String(req.body?.status || '').toUpperCase();
      if (status !== 'APPROVED' && status !== 'REJECTED') {
        res.status(400).json({ success: false, error: 'Status verifikasi tidak valid.' });
        return;
      }
      const reviewer = req.user?.name || req.user?.email || 'Petugas Faskes';
      const result = await UserService.reviewCertificateVerification(
        String(req.params.userId),
        status,
        reviewer,
        {
          note: req.body?.note || null,
          signerName: req.body?.signerName || null,
          signerSip: req.body?.signerSip || null,
        },
      );
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.reviewCertificate error:', error);
      res
        .status(400)
        .json({ success: false, error: error.message || 'Gagal memproses verifikasi sertifikat.' });
    }
  }

  static async createArticle(req: AuthRequest, res: Response) {
    try {
      const article = await AdminService.createAdminArticle(req.body);
      res.status(201).json({ success: true, article });
    } catch (error: any) {
      console.error('AdminController.createArticle error:', error);
      res.status(500).json({ success: false, error: 'Gagal membuat artikel.' });
    }
  }

  static async updateArticle(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await AdminService.updateAdminArticle(id, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.updateArticle error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui artikel.' });
    }
  }

  static async deleteArticle(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await AdminService.deleteAdminArticle(id);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.deleteArticle error:', error);
      res.status(500).json({ success: false, error: 'Gagal menghapus artikel.' });
    }
  }

  static async getSchedules(_req: AuthRequest, res: Response) {
    try {
      const schedules = await AdminService.getSchedules();
      res.json(schedules);
    } catch (error: any) {
      console.error('AdminController.getSchedules error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat jadwal.' });
    }
  }

  static async getScheduleById(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const schedule = await AdminService.getScheduleById(id);
      if (!schedule) {
        res.status(404).json({ success: false, error: 'Jadwal tidak ditemukan.' });
        return;
      }
      res.json(schedule);
    } catch (error: any) {
      console.error('AdminController.getScheduleById error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat detail jadwal.' });
    }
  }

  // Admin tidak membuat/mengubah/menghapus jadwal: jadwal bersumber dari pengguna.
  // Admin hanya memonitor lewat getSchedules & getScheduleById.

  static async getComplianceReports(_req: AuthRequest, res: Response) {
    try {
      const reports = await AdminService.getComplianceReports();
      res.json(reports);
    } catch (error: any) {
      console.error('AdminController.getComplianceReports error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat laporan kepatuhan.' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, error: 'Tidak terotentikasi.' });
        return;
      }
      const result = await AdminService.updateUser(adminId, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.updateProfile error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui profil admin.' });
    }
  }
}
