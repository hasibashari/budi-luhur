import React from 'react';
import {
  ReminderIllustration,
  TrackingIllustration,
  BuddyIllustration,
} from '../components/OnboardingIllustrations';

export interface OnboardingSlide {
  id: string;
  title: string;
  tagline: string;
  description: string;
  illustration: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: 'rose' | 'emerald' | 'amber';
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'reminder',
    title: 'Ingat Minum TTD Tepat Waktu',
    tagline: 'Jadwal Mingguan Otomatis ⏰',
    description:
      'Pengingat cerdas setiap minggu agar kamu tidak lupa minum tablet tambah darah tepat waktu.',
    illustration: ReminderIllustration,
    accentColor: 'rose',
  },
  {
    id: 'tracking',
    title: 'Pantau Kepatuhan & Hb Sehat',
    tagline: 'Pencatatan 1-Sentuhan 📊',
    description:
      'Catat konsumsi tablet dengan cepat dan pantau riwayat kesehatanmu secara real-time.',
    illustration: TrackingIllustration,
    accentColor: 'emerald',
  },
  {
    id: 'buddy',
    title: 'Cegah Anemia Bersama Sahabat',
    tagline: 'Streak & Komunitas Positif 🔥',
    description:
      'Jaga konsistensi sehat bersama teman sekolahmu dan jadilah remaja putri yang aktif & berprestasi.',
    illustration: BuddyIllustration,
    accentColor: 'amber',
  },
];
