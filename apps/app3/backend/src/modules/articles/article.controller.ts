import { Request, Response } from 'express';
import { ArticleService } from './article.service.js';
import { AdminService } from '../admin/admin.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class ArticleController {
  static async getArticles(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const articles = await ArticleService.getArticles(category as string | undefined);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.json(articles);
    } catch (error: any) {
      console.error('ArticleController.getArticles error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat artikel.' });
    }
  }

  static async getArticleById(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const article = await ArticleService.getArticleById(
        id,
        req.user ? { id: req.user.id, role: req.user.role } : undefined,
      );
      if (!article) {
        res.status(404).json({ success: false, error: 'Artikel tidak ditemukan atau belum diterbitkan.' });
        return;
      }

      // Parallelize isBookmarked check and related articles lookup
      const [isBookmarked, related] = await Promise.all([
        req.user?.id ? ArticleService.isBookmarked(req.user.id, id) : Promise.resolve(false),
        ArticleService.getRelatedArticles(id, 3, article.category),
      ]);

      res.json({
        ...article,
        isBookmarked,
        relatedArticles: related,
      });
    } catch (error: any) {
      console.error('ArticleController.getArticleById error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat detail artikel.' });
    }
  }

  static async getUserArticles(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }
      const articles = await ArticleService.getUserArticles(userId);
      res.json(articles);
    } catch (error: any) {
      console.error('ArticleController.getUserArticles error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat artikel Anda.' });
    }
  }

  static async createArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userName = req.user?.name || 'Pengguna';
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ArticleService.createUserArticle(userId, userName, req.body);
      res.status(201).json({ success: true, article: result });
    } catch (error: any) {
      console.error('ArticleController.createArticle error:', error);
      res.status(400).json({ success: false, error: error.message || 'Gagal membuat draf artikel.' });
    }
  }

  static async updateArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'user';
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ArticleService.updateUserArticle(userId, userRole, id, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('ArticleController.updateArticle error:', error);
      const isForbidden = error.message?.includes('Akses dilarang');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        error: error.message || 'Gagal memperbarui artikel.',
      });
    }
  }

  static async deleteArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'user';
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ArticleService.deleteUserArticle(userId, userRole, id);
      res.json(result);
    } catch (error: any) {
      console.error('ArticleController.deleteArticle error:', error);
      const isForbidden = error.message?.includes('Akses dilarang');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        error: error.message || 'Gagal menghapus artikel.',
      });
    }
  }

  static async presignArticleUpload(req: AuthRequest, res: Response) {
    try {
      const { filename, mimeType, fileSize, articleId } = req.body;
      if (!filename || !mimeType) {
        res.status(400).json({ success: false, error: 'Filename dan mimeType wajib disertakan.' });
        return;
      }
      if (!fileSize || typeof fileSize !== 'number') {
        res.status(400).json({ success: false, error: 'Ukuran berkas wajib disertakan.' });
        return;
      }
      const presigned = await AdminService.generateArticlePresignedUpload({
        filename,
        mimeType,
        fileSize,
        articleId,
      });
      res.json({ success: true, ...presigned });
    } catch (error: any) {
      console.error('ArticleController.presignArticleUpload error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Gagal menyiapkan sesi upload presigned.',
      });
    }
  }

  static async uploadArticleImage(req: AuthRequest, res: Response) {
    try {
      const { image, articleId } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ success: false, error: 'Data gambar wajib disertakan.' });
      }
      const targetId = articleId || `art_${Date.now().toString().slice(-4)}`;
      const url = await AdminService.processArticleImage(image, targetId);
      res.json({ success: true, url });
    } catch (error: any) {
      console.error('ArticleController.uploadArticleImage error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Gagal mengunggah gambar artikel.',
      });
    }
  }

  static async toggleBookmark(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ArticleService.toggleBookmark(userId, id);
      res.json(result);
    } catch (error: any) {
      console.error('ArticleController.toggleBookmark error:', error);
      res.status(500).json({ success: false, error: 'Gagal mengubah status bookmark.' });
    }
  }
}
