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
    const response = await apiClient.post<{ isBookmarked?: boolean; bookmarked?: boolean }>(
      `/articles/${articleId}/bookmark`,
    );
    const isBookmarked = response.data?.isBookmarked ?? response.data?.bookmarked ?? false;
    return { success: true, isBookmarked: Boolean(isBookmarked) };
  } catch (err: any) {
    return { success: false, isBookmarked: false };
  }
}

export async function getUserArticlesAction(): Promise<Article[]> {
  const response = await apiClient.get<Article[]>('/articles/my-articles');
  return response.data || [];
}

export async function createUserArticleAction(data: {
  title: string;
  category: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  authorName?: string;
}): Promise<{ success: boolean; article?: Article; error?: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; article: Article }>('/articles', data);
    return { success: true, article: response.data.article };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Gagal menyimpan draf artikel.',
    };
  }
}

export async function updateUserArticleAction(
  id: string,
  data: {
    title?: string;
    category?: string;
    summary?: string;
    content?: string;
    imageUrl?: string;
    authorName?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.put<{ success: boolean }>(`/articles/${id}`, data);
    return { success: response.data?.success ?? true };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Gagal memperbarui artikel.',
    };
  }
}

export async function deleteUserArticleAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.delete<{ success: boolean }>(`/articles/${id}`);
    return { success: response.data?.success ?? true };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Gagal menghapus artikel.',
    };
  }
}

export async function getUserArticlePresignedUrlAction(data: {
  filename: string;
  mimeType: string;
  fileSize: number;
  articleId?: string;
}) {
  try {
    const res = await apiClient.post<any>('/articles/presign', data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Gagal menyiapkan sesi upload.',
    };
  }
}
