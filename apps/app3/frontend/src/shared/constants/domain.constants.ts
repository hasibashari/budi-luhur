/**
 * Domain Constants
 * Centralized static domain rules, enumerations, and metadata for PRELUNA.
 * (Premarital Health & Tetanus Toxoid Immunization Standards - Kemenkes RI)
 */

export const DAYS_OF_WEEK = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const CONSUMPTION_STATUS = {
  TAKEN: 'taken',
  MISSED: 'missed',
  PENDING: 'pending',
} as const;

export interface TTLevelInfo {
  level: string;
  name: string;
  interval: string;
  protectionDuration: string;
  badgeColor: string;
  textColor: string;
  description: string;
  kemenkesRecommendation: string;
}

export const TT_DOSAGE_LEVELS: Record<string, TTLevelInfo> = {
  TT1: {
    level: 'TT1',
    name: 'Dosis Pertama',
    interval: 'Pemberian awal imunisasi',
    protectionDuration: 'Tahap awal pembentukan kekebalan',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    textColor: 'text-amber-700',
    description: 'Menstimulasi sistem imun tubuh untuk mulai memproduksi antibodi terhadap bakteri Clostridium tetani.',
    kemenkesRecommendation: 'Diberikan segera saat calon pengantin mendaftar pemeriksaan kesehatan di Puskesmas / Faskes.',
  },
  TT2: {
    level: 'TT2',
    name: 'Dosis Kedua',
    interval: 'Minimal 4 minggu setelah TT1',
    protectionDuration: 'Perlindungan selama 3 tahun',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'Memberikan proteksi dasar terhadap infeksi tetanus maternal dan tetanus neonatorum pada persalinan.',
    kemenkesRecommendation: 'Wajib diselesaikan minimal 2–4 minggu sebelum hari pernikahan (ijab qobul/pemberkatan).',
  },
  TT3: {
    level: 'TT3',
    name: 'Dosis Ketiga',
    interval: 'Minimal 6 bulan setelah TT2',
    protectionDuration: 'Perlindungan selama 5 tahun',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    textColor: 'text-teal-700',
    description: 'Memperkuat daya tahan tubuh dan memperpanjang masa kekebalan hingga 5 tahun penuh.',
    kemenkesRecommendation: 'Diberikan pada masa awal pernikahan atau saat masa kehamilan berikutnya.',
  },
  TT4: {
    level: 'TT4',
    name: 'Dosis Keempat',
    interval: 'Minimal 1 tahun setelah TT3',
    protectionDuration: 'Perlindungan selama 10 tahun',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    textColor: 'text-indigo-700',
    description: 'Memberikan perlindungan jangka panjang hingga 10 tahun bagi ibu dan kehamilan berikutnya.',
    kemenkesRecommendation: 'Dianjurkan bagi wanita usia subur untuk perlindungan berkelanjutan.',
  },
  TT5: {
    level: 'TT5',
    name: 'Dosis Kelima',
    interval: 'Minimal 1 tahun setelah TT4',
    protectionDuration: 'Perlindungan lebih dari 25 tahun',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    textColor: 'text-emerald-800',
    description: 'Mencapai status T5 Lengkap dengan kekebalan seumur hidup terhadap infeksi tetanus.',
    kemenkesRecommendation: 'Mencapai perlindungan lebih dari 25 tahun sesuai standar Kementerian Kesehatan RI.',
  },
};

export const TT_DOSAGE_LIST = Object.values(TT_DOSAGE_LEVELS);

export const PREMARITAL_SCREENING_TESTS = [
  {
    key: 'hb',
    name: 'Pemeriksaan Hemoglobin (Hb)',
    purpose: 'Mendeteksi dini anemia defisiensi besi untuk mencegah komplikasi kehamilan & stunting anak.',
    normalRange: '≥ 12.0 g/dL untuk wanita usia subur',
  },
  {
    key: 'blood_type_rhesus',
    name: 'Golongan Darah & Rhesus',
    purpose: 'Mencegah ketidakcocokan rhesus (inkompatibilitas rhesus) antara ibu dan calon janin.',
    normalRange: 'A / B / AB / O (Rhesus Positif / Negatif)',
  },
  {
    key: 'lila',
    name: 'Lingkar Lengan Atas (LILA)',
    purpose: 'Menilai status gizi dan risiko Kurang Energi Kronis (KEK).',
    normalRange: '≥ 23.5 cm (Normal / Tidak KEK)',
  },
  {
    key: 'imt',
    name: 'Indeks Massa Tubuh (IMT)',
    purpose: 'Mengetahui status kecukupan berat badan ideal calon pengantin.',
    normalRange: '18.5 - 25.0 kg/m²',
  },
];

export const DEFAULT_TT_TARGET = 5; // Standar 5 Dosis Tetanus Toxoid
export const DEFAULT_VACCINE_DESCRIPTION = 'Vaksin Tetanus Toxoid (TT) 0.5 mL intramuskular pada lengan atas';
