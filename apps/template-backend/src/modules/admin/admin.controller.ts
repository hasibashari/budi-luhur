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
}
