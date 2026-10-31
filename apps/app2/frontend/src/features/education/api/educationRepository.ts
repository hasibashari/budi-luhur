import apiClient from '@/src/shared/api/client';
import { Article } from '../types';

export interface ArticleDetailResult {
  article: Article;
  relatedArticles: Article[];
  isBookmarked: boolean;
}

export async function getArticlesAction(category?: string): Promise<Article[]> {
  try {
    const response = await apiClient.get<any>('/articles', {
      params: { category },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data?.articles)) {
      return response.data.articles;
    }
    return [];
  } catch (err) {
    console.error('getArticlesAction error:', err);
    return [];
  }
}

export async function getArticleDetailAction(
  id: string,
  _userId?: string,
): Promise<ArticleDetailResult | null> {
  try {
    const response = await apiClient.get<any>(`/articles/${id}`);
    const data = response.data;
    if (!data) return null;

    // Handle nested format { article: ..., relatedArticles: ..., isBookmarked: ... }
    if (data.article) {
      return {
        article: data.article,
        relatedArticles: Array.isArray(data.relatedArticles) ? data.relatedArticles : [],
        isBookmarked: Boolean(data.isBookmarked ?? data.bookmarked),
      };
    }

    // Handle flat format { ...article, relatedArticles: ..., isBookmarked: ... }
    const { relatedArticles, isBookmarked, bookmarked, ...articleFields } = data;
    return {
      article: articleFields as Article,
      relatedArticles: Array.isArray(relatedArticles) ? relatedArticles : [],
      isBookmarked: Boolean(isBookmarked ?? bookmarked),
    };
  } catch (err) {
    console.error('getArticleDetailAction error:', err);
    return null;
  }
}

export async function getArticleByIdAction(id: string): Promise<Article | null> {
  const data = await getArticleDetailAction(id);
  return data?.article || null;
}

export async function getRelatedArticlesAction(
  id: string,
  _limit = 3,
): Promise<Article[]> {
  const data = await getArticleDetailAction(id);
  return data?.relatedArticles || [];
}

export async function isArticleBookmarkedAction(
  _userId: string,
  articleId: string,
): Promise<boolean> {
  const data = await getArticleDetailAction(articleId);
  return data?.isBookmarked || false;
}

export async function toggleArticleBookmarkAction(
  _userId: string,
  articleId: string,
): Promise<{ success: boolean; isBookmarked: boolean }> {
  try {
    const response = await apiClient.post<any>(`/articles/${articleId}/bookmark`);
    const isBookmarked = Boolean(response.data?.isBookmarked ?? response.data?.bookmarked);
    return { success: true, isBookmarked };
  } catch (err: any) {
    return { success: false, isBookmarked: false };
  }
}
