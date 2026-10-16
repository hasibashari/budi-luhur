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
  accentColor: 'rose' | 'emerald' | 'amber';
}

export type OnboardingSlide = SplashSlide;

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'reminder',
    title: 'Pengingat Jam Rutin Minum Pil',
    tagline: 'Disiplin Waktu Harian',
    description:
      'Notifikasi harian tepat pada jam yang sama untuk menjaga efektivitas perlindungan kontrasepsi 99% optimal.',
    illustration: ReminderIllustration,
    accentColor: 'rose',
  },
  {
    id: 'tracking',
    title: 'Kalender Blister & Status Siklus',
    tagline: 'Format Strip Kemasan Asli',
    description:
      'Pantau posisi butir pil aktif dan pil plasebo secara visual sesuai kemasan apotek dengan pencatatan 1-sentuhan.',
    illustration: TrackingIllustration,
    accentColor: 'emerald',
  },
  {
    id: 'sadari',
    title: 'Kesehatan Holistik & SADARI',
    tagline: 'Deteksi Dini & Catatan Gejala',
    description:
      'Catat keluhan tubuh seperti flek atau kram, serta pelajari 5 langkah panduan SADARI resmi Kemenkes RI.',
    illustration: BuddyIllustration,
    accentColor: 'amber',
  },
];
