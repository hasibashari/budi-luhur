/**
 * Education Constants
 * Centralized static categories, tags, and fallback metadata for Articles.
 */

export const ARTICLE_CATEGORIES = [
  'Semua',
  'Anemia & TTD',
  'Nutrisi & Gizi',
  'Kesehatan Remaja',
  'Tips Menstruasi',
  'Mitos & Fakta',
  'Gaya Hidup',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Anemia & TTD':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  'Nutrisi & Gizi':
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80',
  'Kesehatan Remaja':
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
  'Tips Menstruasi':
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
  'Mitos & Fakta':
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
  'Gaya Hidup':
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
  default:
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
};
