import { Request, Response } from 'express';
import { ArticleService } from './article.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

function sendArticleError(res: Response, error: any, fallback: string) {
  const message: string = error?.message || fallback;

  if (message.startsWith('Akses dilarang')) {
    res.status(403).json({ success: false, error: message });
    return;
  }
  if (message.includes('tidak ditemukan')) {
    res.status(404).json({ success: false, error: message });
    return;
  }
  if (message.includes('wajib diisi')) {
    res.status(400).json({ success: false, error: message });
    return;
  }

  console.error('ArticleController error:', error);
  res.status(500).json({ success: false, error: fallback });
}

export class ArticleController {
  static async getArticles(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const articles = await ArticleService.getArticles(category as string | undefined);
      res.json(articles);
    } catch (error: any) {
      console.error('ArticleController.getArticles error:', error);
      res.status(500).json({ success: false, error: 'Gagal memuat artikel.' });
    }
  }

  static async getArticleById(req: AuthRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const currentUser = req.user ? { id: req.user.id, role: req.user.role } : undefined;
      const article = await ArticleService.getArticleById(id, currentUser);
      if (!article) {
        res.status(404).json({ success: false, error: 'Artikel tidak ditemukan.' });
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

  /** Articles authored by the signed-in user (drafts + published). */
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

  /** Creates a draft authored by the signed-in user. */
  static async createArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const userName = req.user?.name || 'Pengguna';
      const article = await ArticleService.createUserArticle(userId, userName, req.body);
      res.status(201).json({ success: true, article });
    } catch (error: any) {
      sendArticleError(res, error, 'Gagal membuat artikel.');
    }
  }

  static async updateArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ArticleService.updateUserArticle(
        userId,
        req.user?.role === 'admin' ? 'admin' : 'user',
        String(req.params.id),
        req.body,
      );
      res.json(result);
    } catch (error: any) {
      sendArticleError(res, error, 'Gagal memperbarui artikel.');
    }
  }

  static async deleteArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Sesi tidak valid.' });
        return;
      }

      const result = await ArticleService.deleteUserArticle(
        userId,
        req.user?.role === 'admin' ? 'admin' : 'user',
        String(req.params.id),
      );
      res.json(result);
    } catch (error: any) {
      sendArticleError(res, error, 'Gagal menghapus artikel.');
    }
  }
}
