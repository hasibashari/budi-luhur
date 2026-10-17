/**
 * Education Constants
 * Centralized static categories, tags, and fallback metadata for PRELUNA.
 * (Premarital Health, Tetanus Toxoid Immunization, & Maternal Wellness)
 */

export const ARTICLE_CATEGORIES = [
  'Semua',
  'Imunisasi TT',
  'Kesehatan Pranikah',
  'Nutrisi & Anemia',
  'Persiapan Kehamilan',
  'Mitos & Fakta TT',
  'Skrining Laboratorium',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Imunisasi TT':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  'Kesehatan Pranikah':
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
  'Nutrisi & Anemia':
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80',
  'Persiapan Kehamilan':
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  'Mitos & Fakta TT':
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
  'Skrining Laboratorium':
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
  default:
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
};
