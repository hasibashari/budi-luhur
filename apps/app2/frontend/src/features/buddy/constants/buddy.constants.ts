/**
 * Buddy Streak Constants
 * Centralized static milestone tiers, cheers, and badges.
 */

export interface StreakTier {
  minWeeks: number;
  maxWeeks: number | null;
  name: string;
  badge: string;
  color: string;
  description: string;
}

export const STREAK_TIERS: StreakTier[] = [
  {
    minWeeks: 1,
    maxWeeks: 4,
    name: 'Pemula Sehat',
    badge: '🌱',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description: 'Langkah awal pembentukan kebiasaan sehat!',
  },
  {
    minWeeks: 5,
    maxWeeks: 11,
    name: 'Pejuang TTD',
    badge: '🔥',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    description: 'Konsistensi luar biasa bersama sahabat!',
  },
  {
    minWeeks: 12,
    maxWeeks: 23,
    name: 'Jawara Anti-Anemia',
    badge: '⚡',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    description: 'Tubuh bugar, konsentrasi belajar makin prima!',
  },
  {
    minWeeks: 24,
    maxWeeks: null,
    name: 'Legenda Bebas Anemia',
    badge: '👑',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Inspirasi hidup sehat untuk seluruh siswi di sekolah!',
  },
];

export const CHEER_STICKERS = [
  { emoji: '❤️', label: 'Semangat Kawan!', type: 'HEART' },
  { emoji: '🔥', label: 'Kompak Terus!', type: 'FIRE' },
  { emoji: '💪', label: 'Yuk Pasti Bisa!', type: 'POWER' },
  { emoji: '✨', label: 'Keren Banget!', type: 'STAR' },
] as const;

export const DEFAULT_AVATARS = {
  USER: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  BUDDY:
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
};
