import { Response } from 'express';
import { AdminService } from './admin.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class AdminController {
  static async getStats(_req: AuthRequest, res: Response) {
    try {
      const stats = await AdminService.getOverviewStats();
      res.json(stats);
    } catch (error: any) {
      console.error('AdminController.getStats error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat statistik fasilitas kesehatan.' });
    }
  }

  static async getUsers(_req: AuthRequest, res: Response) {
    try {
      const users = await AdminService.getManagedUsers();
      res.json(users);
    } catch (error: any) {
      console.error('AdminController.getUsers error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat daftar pengguna.' });
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

  // ─── USER VERIFICATION HANDLERS ──────────────────────────────────────────

  static async getVerifications(req: AuthRequest, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const search = (req.query.q || req.query.search) as string | undefined;
      const list = await AdminService.getVerifications({ status, search });
      res.json({ success: true, data: list });
    } catch (error: any) {
      console.error('AdminController.getVerifications error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat daftar verifikasi pengguna.' });
    }
  }

  static async getVerificationDetail(req: AuthRequest, res: Response) {
    try {
      const userId = String(req.params.userId);
      const detail = await AdminService.getVerificationDetail(userId);
      if (!detail) {
        res.status(404).json({ success: false, error: 'Data verifikasi pengguna tidak ditemukan.' });
        return;
      }
      res.json({ success: true, data: detail });
    } catch (error: any) {
      console.error('AdminController.getVerificationDetail error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat detail verifikasi pengguna.' });
    }
  }

  static async getVerificationDocument(req: AuthRequest, res: Response) {
    try {
      const userId = String(req.params.userId);
      const doc = await AdminService.getVerificationDocument(userId);
      if (!doc || !doc.document_file_data) {
        res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan atau belum diunggah.' });
        return;
      }

      const fileData = doc.document_file_data;
      const fileName = doc.document_file_name || 'dokumen-persyaratan';
      const fileType = doc.document_file_type || 'application/octet-stream';

      const matches = fileData.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1] || fileType;
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.send(buffer);
        return;
      }

      // If stored as raw base64
      try {
        const buffer = Buffer.from(fileData, 'base64');
        res.setHeader('Content-Type', fileType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.send(buffer);
      } catch {
        res.status(400).json({ success: false, error: 'Format data dokumen tidak valid.' });
      }
    } catch (error: any) {
      console.error('AdminController.getVerificationDocument error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat berkas dokumen.' });
    }
  }

  static async approveVerification(req: AuthRequest, res: Response) {
    try {
      const userId = String(req.params.userId);
      const adminId = req.user?.id || 'adm_1';
      const result = await AdminService.approveVerification(userId, adminId);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.approveVerification error:', error);
      res.status(500).json({ success: false, error: 'Gagal menyetujui verifikasi pengguna.' });
    }
  }

  static async rejectVerification(req: AuthRequest, res: Response) {
    try {
      const userId = String(req.params.userId);
      const adminId = req.user?.id || 'adm_1';
      const reason = req.body?.reason;
      if (!reason || !reason.trim()) {
        res.status(400).json({ success: false, error: 'Alasan penolakan pendaftaran wajib disertakan.' });
        return;
      }
      const result = await AdminService.rejectVerification(userId, adminId, reason);
      res.json(result);
    } catch (error: any) {
      console.error('AdminController.rejectVerification error:', error);
      res.status(500).json({ success: false, error: 'Gagal menolak verifikasi pengguna.' });
    }
  }

  static async getVerificationHistory(req: AuthRequest, res: Response) {
    try {
      const userId = String(req.params.userId);
      const history = await AdminService.getVerificationHistory(userId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('AdminController.getVerificationHistory error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat riwayat verifikasi.' });
    }
  }
}
