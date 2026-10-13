import apiClient from '@/src/shared/api/client';
import { Article } from '../types';

export async function getArticlesAction(category?: string): Promise<Article[]> {
  const response = await apiClient.get<Article[]>('/articles', {
    params: { category },
  });
  return response.data;
}

export async function getArticleDetailAction(
  id: string,
  _userId?: string,
): Promise<{ article: Article; relatedArticles: Article[] } | null> {
  try {
    const response = await apiClient.get<{ article: Article; relatedArticles: Article[] }>(
      `/articles/${id}`,
    );
    return response.data;
  } catch {
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
  _articleId: string,
): Promise<boolean> {
  return false;
}

export async function toggleArticleBookmarkAction(
  _userId: string,
  articleId: string,
): Promise<{ success: boolean; isBookmarked: boolean }> {
  try {
    const response = await apiClient.post<{ bookmarked: boolean }>(`/articles/${articleId}/bookmark`);
    return { success: true, isBookmarked: response.data.bookmarked };
  } catch (err: any) {
    return { success: false, isBookmarked: false };
  }
}
