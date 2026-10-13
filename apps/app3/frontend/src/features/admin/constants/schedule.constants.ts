export const SCHEDULE_CATEGORIES = [
  { value: 'TTD Rutin', label: 'TTD Rutin (Pencegahan - 1x Seminggu)' },
  { value: 'Terapi Anemia', label: 'Terapi Anemia (Intensif - Harian)' },
  { value: 'Suplemen Tambahan', label: 'Suplemen Tambahan (Vitamin / Pendukung)' },
] as const;

export type ScheduleCategory = (typeof SCHEDULE_CATEGORIES)[number]['value'];

export const SCHEDULE_CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border?: string }
> = {
  'Terapi Anemia': { bg: '#fee2e2', text: '#dc2626' },
  'Suplemen Tambahan': { bg: '#e0f2fe', text: '#0284c7' },
  'TTD Rutin': { bg: '#ffe4e6', text: '#e11d48' },
  default: { bg: '#f1f5f9', text: '#475569' },
};

export const FREQUENCY_OPTIONS = [
  { value: '1x Seminggu', label: '1x Seminggu (Mingguan)' },
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
  medicationName: 'Tablet Tambah Darah (TTD)',
  dosage: '1 Tablet',
  frequency: '1x Seminggu',
  dayOfWeek: 'Sabtu',
  timeSlot: '20:00',
  category: 'TTD Rutin',
  instructions: 'Minum 1 tablet setelah makan malam atau sebelum tidur dengan air putih.',
};

export const CATEGORY_PRESETS: Record<
  ScheduleCategory,
  { medicationName: string; frequency: ScheduleFrequency; instructions: string }
> = {
  'TTD Rutin': {
    medicationName: 'Tablet Tambah Darah (TTD)',
    frequency: '1x Seminggu',
    instructions: 'Minum 1 tablet setelah makan malam atau sebelum tidur dengan air putih.',
  },
  'Terapi Anemia': {
    medicationName: 'Tablet Tambah Darah (Terapi Intensif)',
    frequency: 'Harian',
    instructions: 'Minum 1 tablet setiap hari secara teratur setelah makan.',
  },
  'Suplemen Tambahan': {
    medicationName: 'Vitamin C / Asam Folat',
    frequency: '1x Seminggu',
    instructions: 'Minum 1 tablet bersamaan dengan TTD untuk meningkatkan penyerapan zat besi.',
  },
};
