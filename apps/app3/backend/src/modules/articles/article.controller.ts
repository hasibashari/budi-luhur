import { Request, Response } from 'express';
import { ArticleService } from './article.service.js';
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
      const article = await ArticleService.getArticleById(id);
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
}
