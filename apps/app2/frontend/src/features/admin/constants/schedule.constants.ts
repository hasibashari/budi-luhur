export const SCHEDULE_CATEGORIES = [
  { value: 'Pil KB Kombinasi', label: 'Pil KB Kombinasi (Estrogen + Progestin - Harian)' },
  { value: 'Pil KB Progestin', label: 'Pil KB Progestin / Mini Pil (Ibu Menyusui - Harian)' },
  { value: 'Suplemen Tambahan', label: 'Suplemen Tambahan (Asam Folat / Vitamin)' },
] as const;

export type ScheduleCategory = (typeof SCHEDULE_CATEGORIES)[number]['value'];

export const SCHEDULE_CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border?: string }
> = {
  'Pil KB Kombinasi': { bg: '#f0fdfa', text: '#0d9488', border: '#ccfbf1' },
  'Pil KB Progestin': { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
  'Suplemen Tambahan': { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
  default: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
};

export const FREQUENCY_OPTIONS = [
  { value: 'Harian', label: 'Harian (Setiap Hari)' },
  { value: '1x Seminggu', label: '1x Seminggu (Jadwal Khusus)' },
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
  medicationName: 'Pil KB Kombinasi (28 Tablet)',
  dosage: '1 Tablet',
  frequency: 'Harian',
  dayOfWeek: 'Setiap Hari',
  timeSlot: '20:00',
  category: 'Pil KB Kombinasi',
  instructions:
    'Minum 1 tablet setiap hari pada jam yang sama setelah makan malam atau sebelum tidur.',
};

export const CATEGORY_PRESETS: Record<
  ScheduleCategory,
  { medicationName: string; frequency: ScheduleFrequency; instructions: string }
> = {
  'Pil KB Kombinasi': {
    medicationName: 'Pil KB Kombinasi (28 Tablet)',
    frequency: 'Harian',
    instructions:
      'Minum 1 tablet setiap hari pada jam yang sama setelah makan malam atau sebelum tidur.',
  },
  'Pil KB Progestin': {
    medicationName: 'Pil KB Progestin / Mini Pil',
    frequency: 'Harian',
    instructions: 'Minum 1 tablet setiap hari tanpa jeda, aman untuk ibu menyusui.',
  },
  'Suplemen Tambahan': {
    medicationName: 'Asam Folat / Vitamin Penunjang',
    frequency: 'Harian',
    instructions: 'Minum 1 tablet bersamaan dengan pil KB sebagai nutrisi reproduksi.',
  },
};
