import React from 'react';
import {
  ReminderIllustration,
  TrackingIllustration,
  BuddyIllustration,
} from '../components/SplashIllustrations';

export interface SplashSlide {
  id: string;
  title: string;
  tagline: string;
  description: string;
  illustration: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: 'emerald' | 'amber' | 'teal';
}

export type OnboardingSlide = SplashSlide;

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'tt_immunization',
    title: 'Imunisasi TT Calon Pengantin',
    tagline: 'Perlindungan Tetanus Lengkap',
    description:
      'Lindungi diri dan calon buah hati dari bahaya infeksi tetanus maternal dan neonatal melalui 5 dosis imunisasi Tetanus Toxoid.',
    illustration: ReminderIllustration,
    accentColor: 'emerald',
  },
  {
    id: 'schedule_tracking',
    title: 'Jadwal & Riwayat Vaksinasi Catin',
    tagline: 'Interval Standar Kemenkes RI',
    description:
      'Pantau riwayat suntik, jadwal dosis berikutnya, serta batas waktu vaksinasi minimal 1 bulan sebelum hari pernikahan.',
    illustration: TrackingIllustration,
    accentColor: 'amber',
  },
  {
    id: 'premarital_wellness',
    title: 'Kesiapan Fisik Menuju Pernikahan',
    tagline: 'Konsultasi & Edukasi Cerdas',
    description:
      'Pelajari panduan gizi reproduksi, skrining pranikah, dan berkonsultasi seputar imunisasi bersama asisten cerdas Luna Pranikah.',
    illustration: BuddyIllustration,
    accentColor: 'teal',
  },
];
