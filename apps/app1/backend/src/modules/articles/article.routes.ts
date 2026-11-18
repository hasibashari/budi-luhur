import { Router } from 'express';
import { ArticleController } from './article.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware.js';

export const articleRoutes = Router();

// User-authored material (drafts). Declared before '/:id' so it is not shadowed.
articleRoutes.get('/my-articles', authMiddleware as any, ArticleController.getUserArticles as any);
articleRoutes.post('/', authMiddleware as any, ArticleController.createArticle as any);
articleRoutes.put('/:id', authMiddleware as any, ArticleController.updateArticle as any);
articleRoutes.delete('/:id', authMiddleware as any, ArticleController.deleteArticle as any);

// Public catalog + detail (detail uses optional auth so authors can preview drafts)
articleRoutes.get('/', ArticleController.getArticles as any);
articleRoutes.get('/:id', optionalAuthMiddleware as any, ArticleController.getArticleById as any);
articleRoutes.post('/:id/bookmark', authMiddleware as any, ArticleController.toggleBookmark as any);

export default articleRoutes;
