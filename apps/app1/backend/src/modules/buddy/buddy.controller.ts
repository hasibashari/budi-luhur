import { Response } from 'express';
import { BuddyService } from './buddy.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class BuddyController {
  static async getGroups(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const groups = await BuddyService.getUserGroups(userId);
      res.json(groups);
    } catch (error: any) {
      console.error('BuddyController.getGroups error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat daftar grup.' });
    }
  }

  static async getChatDetails(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const details = await BuddyService.getGroupChatDetails(id, userId);
      if (!details) {
        res.status(404).json({ success: false, error: 'Grup tidak ditemukan.' });
        return;
      }
      res.json(details);
    } catch (error: any) {
      console.error('BuddyController.getChatDetails error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat obrolan grup.' });
    }
  }

  static async createGroup(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await BuddyService.createGroup(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('BuddyController.createGroup error:', error);
      res.status(500).json({ success: false, error: 'Gagal membuat grup.' });
    }
  }

  static async updateGroup(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await BuddyService.updateGroup(id, userId, req.body);
      if (!result.success) {
        res.status(403).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('BuddyController.updateGroup error:', error);
      res.status(500).json({ success: false, error: 'Gagal memperbarui grup.' });
    }
  }

  static async deleteGroup(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await BuddyService.deleteGroup(id, userId);
      if (!result.success) {
        res.status(403).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('BuddyController.deleteGroup error:', error);
      res.status(500).json({ success: false, error: 'Gagal menghapus grup.' });
    }
  }

  static async leaveGroup(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await BuddyService.leaveGroup(id, userId);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('BuddyController.leaveGroup error:', error);
      res.status(500).json({ success: false, error: 'Gagal keluar dari grup.' });
    }
  }

  static async joinGroup(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { groupCode } = req.body;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await BuddyService.joinGroupByCode(userId, groupCode);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (error: any) {
      console.error('BuddyController.joinGroup error:', error);
      res.status(500).json({ success: false, error: 'Gagal bergabung ke grup.' });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const result = await BuddyService.sendMessage(userId, id, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('BuddyController.sendMessage error:', error);
      res.status(500).json({ success: false, error: 'Gagal mengirim pesan ke grup.' });
    }
  }
}
