/**
 * Domain Constants
 * Centralized static domain rules, enumerations, and metadata for FEMORY.
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

export const HB_RISK_LEVELS = {
  NORMAL: {
    key: 'normal',
    label: 'Normal (≥ 12.0 g/dL)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    minHb: 12.0,
  },
  MILD: {
    key: 'ringan',
    label: 'Anemia Ringan (11.0 - 11.9 g/dL)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    minHb: 11.0,
    maxHb: 11.9,
  },
  MODERATE: {
    key: 'sedang',
    label: 'Anemia Sedang (8.0 - 10.9 g/dL)',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    minHb: 8.0,
    maxHb: 10.9,
  },
  SEVERE: {
    key: 'berat',
    label: 'Anemia Berat (< 8.0 g/dL)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    maxHb: 7.9,
  },
} as const;

export const DEFAULT_TTD_TARGET_PER_YEAR = 52; // 1 tablet per minggu x 52 minggu
export const DEFAULT_DOSAGE_DESCRIPTION = '1 Tablet Tambah Darah (Fe) + Air Putih';
