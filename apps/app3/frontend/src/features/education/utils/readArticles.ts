import { useEffect, useState } from 'react';

const STORAGE_KEY = 'temani_read_articles';
const READ_EVENT = 'temani_read_articles_changed';

export function getReadArticleIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isArticleRead(articleId: string): boolean {
  if (!articleId) return false;
  const list = getReadArticleIds();
  return list.includes(articleId);
}

export function markArticleAsRead(articleId: string): void {
  if (!articleId || typeof window === 'undefined') return;
  try {
    const list = getReadArticleIds();
    if (!list.includes(articleId)) {
      const updated = [...list, articleId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(READ_EVENT));
    }
  } catch (err) {
    console.error('Failed to mark article as read:', err);
  }
}

export function markArticleAsUnread(articleId: string): void {
  if (!articleId || typeof window === 'undefined') return;
  try {
    const list = getReadArticleIds();
    const updated = list.filter(id => id !== articleId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(READ_EVENT));
  } catch (err) {
    console.error('Failed to mark article as unread:', err);
  }
}

/**
 * React Hook to track and react to read articles state
 */
export function useReadArticles() {
  const [readIds, setReadIds] = useState<string[]>(() => getReadArticleIds());

  useEffect(() => {
    const handleUpdate = () => {
      setReadIds(getReadArticleIds());
    };

    window.addEventListener(READ_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(READ_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    readIds,
    isRead: (id: string) => readIds.includes(id),
    markAsRead: markArticleAsRead,
    markAsUnread: markArticleAsUnread,
  };
}
