export const SCHEDULE_CATEGORIES = [
  { value: 'Imunisasi TT', label: 'Imunisasi TT Catin (Tetanus Toxoid)' },
  { value: 'Skrining Pranikah', label: 'Skrining Pranikah (Laboratorium & Fisik)' },
  { value: 'Bimbingan KUA', label: 'Bimbingan & Konseling Pranikah (KUA/Faskes)' },
  { value: 'Suplemen Pranikah', label: 'Suplemen Pranikah (Asam Folat / TTD)' },
] as const;

export type ScheduleCategory = (typeof SCHEDULE_CATEGORIES)[number]['value'];

export const SCHEDULE_CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border?: string }
> = {
  'Imunisasi TT': { bg: '#d1fae5', text: '#047857' },
  'Skrining Pranikah': { bg: '#e0f2fe', text: '#0284c7' },
  'Bimbingan KUA': { bg: '#fef3c7', text: '#b45309' },
  'Suplemen Pranikah': { bg: '#ecfdf5', text: '#059669' },
  default: { bg: '#f1f5f9', text: '#475569' },
};

export const FREQUENCY_OPTIONS = [
  { value: '1x Sesuai Dosis', label: '1x Kunjungan Sesuai Jadwal' },
  { value: '1x Seminggu', label: '1x Seminggu (Suplementasi)' },
  { value: 'Harian', label: 'Harian (Setiap Hari)' },
] as const;

export type ScheduleFrequency = (typeof FREQUENCY_OPTIONS)[number]['value'];

export interface ScheduleFormData {
  userId: string;
  patientId?: string;
  medicationName: string;
  dosage: string;
  frequency: ScheduleFrequency;
  dayOfWeek: string;
  timeSlot: string;
  category: ScheduleCategory;
  instructions: string;
}

export const INITIAL_SCHEDULE_FORM_DATA: ScheduleFormData = {
  userId: '',
  patientId: '',
  medicationName: 'Vaksin Tetanus Toxoid (TT Catin)',
  dosage: '0.5 mL (Intramuskular)',
  frequency: '1x Sesuai Dosis',
  dayOfWeek: 'Sabtu',
  timeSlot: '09:00',
  category: 'Imunisasi TT',
  instructions: 'Hadir ke Puskesmas/Klinik rujukan membawa KTP dan buku KIA/Sertifikat Imunisasi.',
};

export const CATEGORY_PRESETS: Record<
  ScheduleCategory,
  { medicationName: string; frequency: ScheduleFrequency; instructions: string }
> = {
  'Imunisasi TT': {
    medicationName: 'Vaksin Tetanus Toxoid (TT Catin)',
    frequency: '1x Sesuai Dosis',
    instructions: 'Suntik intramuskular pada lengan atas di Faskes rujukan. Minimal 1 bulan sebelum akad nikah.',
  },
  'Skrining Pranikah': {
    medicationName: 'Paket Skrining Laboratorium Catin',
    frequency: '1x Sesuai Dosis',
    instructions: 'Pemeriksaan darah lengkap, golongan darah & rhesus, Hb, hepatitis, dan HIV di Puskesmas.',
  },
  'Bimbingan KUA': {
    medicationName: 'Bimwin / Kursus Calon Pengantin',
    frequency: '1x Sesuai Dosis',
    instructions: 'Mengikuti kelas bimbingan perkawinan dan kesehatan keluarga bersama BP4/KUA setempat.',
  },
  'Suplemen Pranikah': {
    medicationName: 'Asam Folat & Tablet Tambah Darah (TTD)',
    frequency: '1x Seminggu',
    instructions: 'Minum 1 tablet asam folat/TTD sesudah makan malam untuk persiapan kehamilan sehat.',
  },
};
