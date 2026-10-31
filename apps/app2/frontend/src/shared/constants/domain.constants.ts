/**
 * Domain Constants
 * Centralized static domain rules, enumerations, and metadata for Pilluna.
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

export const PILL_CYCLE_DAYS = 28;
export const DEFAULT_DOSAGE_DESCRIPTION = '1 Tablet Pil KB + Air Putih';
