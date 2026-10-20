/**
 * Education Constants
 * Centralized static categories, tags, and fallback metadata for PRELUNA.
 * (Premarital Health, Tetanus Toxoid Immunization, & Maternal Wellness)
 */

export const ARTICLE_CATEGORIES = [
  'Semua',
  'Imunisasi TT',
  'Catin',
] as const;

export type ArticleCategory = string;
export const ARTICLE_CONTENT_CATEGORIES = ['Imunisasi TT', 'Catin'] as const;

export function normalizeArticleCategory(category?: string): string {
  return category === 'Kesehatan Pranikah' ? 'Catin' : category || '';
}

export function isAllowedArticleCategory(category?: string): boolean {
  return ARTICLE_CONTENT_CATEGORIES.includes(
    normalizeArticleCategory(category) as (typeof ARTICLE_CONTENT_CATEGORIES)[number],
  );
}

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Imunisasi TT':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  Catin:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  default:
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
};
