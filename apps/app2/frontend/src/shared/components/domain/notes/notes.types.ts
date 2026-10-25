// --- TIPE DATA & INTERFACES CATATAN HARIAN ---
export type MoodType = 'sedih' | 'murung' | 'biasa_saja' | 'bahagia';
export type PainLevel = 'tidak_ada' | 'ringan' | 'sedang' | 'berat';
export type BleedingType = 'haid_normal' | 'haid_banyak' | 'flek' | 'tidak_ada';
export type WeightTrend = 'stabil' | 'naik' | 'turun';

export interface DailyHealthLog {
  id: string;
  logDate: string; // Format YYYY-MM-DD
  mood: MoodType;
  pain: PainLevel;
  bleeding: BleedingType;
  sideEffects: string[];
  weightStatus: WeightTrend;
  weightKg: string;
  notes: string;
  updatedAt: string;
}

// Alias untuk nama yang lebih deskriptif
export type DailyNoteLog = DailyHealthLog;

export interface DailyNotesCardProps {
  initialLogs?: DailyHealthLog[];
  onSaveLog?: (log: DailyHealthLog) => void | Promise<void>;
}

// Alias backward compatibility
export type SymptomHealthCardProps = DailyNotesCardProps;

export interface ClinicalAdvice {
  category: string;
  text: string;
}

// --- DATA KONFIGURASI OPSI & EDUKASI KLINIS ---
export const MOOD_OPTIONS: { id: MoodType; label: string; advice?: string }[] = [
  {
    id: 'sedih',
    label: 'Sedih',
    advice:
      'Fluktuasi hormon di awal konsumsi pil KB dapat memengaruhi suasana hati. Istirahat cukup dan ceritakan perasaan Anda pada pasangan.',
  },
  {
    id: 'murung',
    label: 'Murung',
    advice: 'Perubahan mood ringan adalah respon adaptasi alami tubuh terhadap hormon.',
  },
  { id: 'biasa_saja', label: 'Biasa saja' },
  { id: 'bahagia', label: 'Bahagia' },
];

export const PAIN_OPTIONS: { id: PainLevel; label: string; advice?: string }[] = [
  { id: 'tidak_ada', label: 'Tidak ada' },
  {
    id: 'ringan',
    label: 'Ringan',
    advice:
      'Kram atau nyeri ringan dapat diredakan dengan kompres hangat di area perut dan minum air putih yang cukup.',
  },
  {
    id: 'sedang',
    label: 'Sedang',
    advice:
      'Jika nyeri cukup mengganggu aktivitas, istirahatlah sejenak dan pantau apakah nyeri berkurang setelah beberapa jam.',
  },
  {
    id: 'berat',
    label: 'Berat',
    advice:
      'PERHATIAN: Jika mengalami nyeri perut atau kepala hebat secara mendadak, segera konsultasikan dengan dokter atau bidan.',
  },
];

export const BLEEDING_OPTIONS: { id: BleedingType; label: string; advice?: string }[] = [
  { id: 'haid_normal', label: 'Haid normal' },
  {
    id: 'haid_banyak',
    label: 'Haid lebih banyak',
    advice:
      'Pantau jumlah pembalut yang digunakan. Jika pendarahan sangat banyak dan berlangsung lebih dari 7 hari, hubungi tenaga medis.',
  },
  {
    id: 'flek',
    label: 'Flek di luar jadwal',
    advice:
      'Flek ringan (spotting) sangat umum terjadi pada 1-3 bulan pertama adaptasi pil KB hormonal. Tetap minum pil sesuai jadwal.',
  },
  { id: 'tidak_ada', label: 'Tidak ada' },
];

export const SIDE_EFFECT_OPTIONS: { id: string; label: string; advice?: string }[] = [
  { id: 'tidak_ada', label: 'Tidak ada' },
  {
    id: 'mual',
    label: 'Mual',
    advice:
      'Konsumsi pil KB setelah makan malam atau menjelang tidur untuk meminimalkan rasa mual.',
  },
  {
    id: 'pusing',
    label: 'Pusing',
    advice:
      'Pastikan tubuh terhidrasi dengan baik. Jika sakit kepala terasa berat atau disertai gangguan penglihatan, segera periksakan diri.',
  },
  {
    id: 'payudara_nyeri',
    label: 'Payudara nyeri',
    advice:
      'Nyeri payudara disebabkan oleh perubahan hormon sementara. Gunakan bra tanpa kawat yang nyaman.',
  },
  {
    id: 'lainnya',
    label: 'Lainnya',
    advice:
      'Tuliskan detail keluhan lainnya pada kolom Catatan Tambahan di bawah agar dapat dievaluasi saat kunjungan faskes.',
  },
];

export const WEIGHT_OPTIONS: { id: WeightTrend; label: string }[] = [
  { id: 'stabil', label: 'Stabil' },
  { id: 'naik', label: 'Naik' },
  { id: 'turun', label: 'Turun' },
];

// Contoh data awal untuk simulasi database di tab Riwayat
export const DUMMY_HISTORY: DailyHealthLog[] = [
  {
    id: 'log-1',
    logDate: '2026-10-11',
    mood: 'bahagia',
    pain: 'tidak_ada',
    bleeding: 'haid_normal',
    sideEffects: ['tidak_ada'],
    weightStatus: 'stabil',
    weightKg: '55',
    notes: 'Kondisi tubuh terasa bugar hari ini, minum suplemen tepat waktu.',
    updatedAt: '09:41 WIB',
  },
  {
    id: 'log-2',
    logDate: '2026-10-10',
    mood: 'biasa_saja',
    pain: 'ringan',
    bleeding: 'flek',
    sideEffects: ['mual'],
    weightStatus: 'stabil',
    weightKg: '55',
    notes: 'Sedikit mual di pagi hari setelah sarapan.',
    updatedAt: '20:15 WIB',
  },
];

// Helper format tanggal Indonesia (Contoh: "Sab, 11 Okt 2026")
export const formatIndonesianDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getHealthScore = (log: DailyHealthLog) => {
  const moodScore: Record<MoodType, number> = {
    sedih: 35,
    murung: 55,
    biasa_saja: 75,
    bahagia: 100,
  };
  const painScore: Record<PainLevel, number> = {
    tidak_ada: 100,
    ringan: 75,
    sedang: 50,
    berat: 20,
  };
  const bleedingScore: Record<BleedingType, number> = {
    haid_normal: 90,
    tidak_ada: 100,
    flek: 70,
    haid_banyak: 35,
  };
  const sideEffectScore = log.sideEffects.includes('tidak_ada')
    ? 100
    : Math.max(20, 100 - log.sideEffects.length * 20);

  return Math.round(
    (moodScore[log.mood] + painScore[log.pain] + bleedingScore[log.bleeding] + sideEffectScore) / 4,
  );
};
