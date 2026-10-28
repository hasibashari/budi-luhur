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
      'Cegah risiko tetanus maternal dan neonatal pada calon ibu dan buah hati melalui 5 dosis imunisasi Tetanus Toxoid berstandar pelayanan faskes.',
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
    id: 'tt_certificate',
    title: 'Sertifikat Tetanus Toksoid',
    tagline: 'Bukti Resmi & Kesiapan Pranikah',
    description:
      'Peroleh Sertifikat Tetanus Toksoid resmi dari faskes untuk melengkapi syarat administrasi pernikahan serta menjamin perlindungan ibu dan buah hati.',
    illustration: BuddyIllustration,
    accentColor: 'sage',
  },
];
