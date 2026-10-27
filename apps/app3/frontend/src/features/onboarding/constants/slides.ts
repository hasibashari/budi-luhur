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
  accentColor: 'ruby' | 'gold' | 'sage';
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'tt_immunization',
    title: 'Imunisasi TT Calon Pengantin',
    tagline: 'Perlindungan Tetanus 5 Dosis',
    description:
      'Cegah risiko tetanus maternal dan neonatal pada calon ibu dan buah hati melalui 5 dosis imunisasi Tetanus Toxoid berstandar Kemenkes RI.',
    illustration: ReminderIllustration,
    accentColor: 'ruby',
  },
  {
    id: 'schedule_tracking',
    title: 'Jadwal & Batas Waktu Catin',
    tagline: 'Terencana 1 Bulan Sebelum Akad',
    description:
      'Pantau tanggal vaksinasi, jarak antar dosis, serta pastikan suntik TT telah lengkap minimal sebulan sebelum pelaksanaan akad nikah.',
    illustration: TrackingIllustration,
    accentColor: 'gold',
  },
  {
    id: 'premarital_wellness',
    title: 'Sertifikat & Edukasi Pranikah',
    tagline: 'Kesiapan Nikah & Edukasi Gizi',
    description:
      'Akses bukti verifikasi faskes resmi untuk berkas pernikahan serta pelajari panduan nutrisi dan skrining kesehatan reproduksi calon pengantin.',
    illustration: BuddyIllustration,
    accentColor: 'sage',
  },
];
