/**
 * Education Constants
 * Centralized static categories, tags, and fallback metadata for PRELUNA.
 * (Premarital Health, Tetanus Toxoid Immunization, & Maternal Wellness)
 */

export type ArticleCategory = string;

export function normalizeArticleCategory(category?: string): string {
  const normalized = (category || '').trim().replace(/\s+/g, ' ');
  return normalized.toLowerCase() === 'kesehatan pranikah' ? 'Catin' : normalized;
}

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Imunisasi TT':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  Catin:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  default:
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
};
