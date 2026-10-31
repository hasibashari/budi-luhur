import { Router } from 'express';
import { ArticleController } from './article.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware.js';

export const articleRoutes = Router();

articleRoutes.get('/', ArticleController.getArticles as any);
articleRoutes.get('/:id', optionalAuthMiddleware as any, ArticleController.getArticleById as any);
articleRoutes.post('/:id/bookmark', authMiddleware as any, ArticleController.toggleBookmark as any);

export default articleRoutes;
