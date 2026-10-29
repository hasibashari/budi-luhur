import { Router } from 'express';
import { ArticleController } from './article.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware.js';

export const articleRoutes = Router();

// 1. User Article Management Routes (Authenticated)
articleRoutes.get('/my-articles', authMiddleware as any, ArticleController.getUserArticles as any);
articleRoutes.post('/presign', authMiddleware as any, ArticleController.presignArticleUpload as any);
articleRoutes.post('/upload', authMiddleware as any, ArticleController.uploadArticleImage as any);
articleRoutes.post('/', authMiddleware as any, ArticleController.createArticle as any);
articleRoutes.put('/:id', authMiddleware as any, ArticleController.updateArticle as any);
articleRoutes.delete('/:id', authMiddleware as any, ArticleController.deleteArticle as any);

// 2. Public / General Article Routes
articleRoutes.get('/', ArticleController.getArticles as any);
articleRoutes.get('/:id', optionalAuthMiddleware as any, ArticleController.getArticleById as any);
articleRoutes.post('/:id/bookmark', authMiddleware as any, ArticleController.toggleBookmark as any);

export default articleRoutes;
