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
): Promise<{ article: Article; relatedArticles: Article[]; isBookmarked?: boolean } | null> {
  try {
    const response = await apiClient.get<any>(`/articles/${id}`);
    if (!response.data) return null;

    if (response.data.article) {
      return response.data;
    }

    // Backend returns article fields at top level with relatedArticles and isBookmarked
    const { relatedArticles, isBookmarked, ...articleData } = response.data;
    return {
      article: articleData as Article,
      relatedArticles: relatedArticles || [],
      isBookmarked: Boolean(isBookmarked),
    };
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
  articleId: string,
): Promise<boolean> {
  const data = await getArticleDetailAction(articleId);
  return Boolean(data?.isBookmarked);
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
