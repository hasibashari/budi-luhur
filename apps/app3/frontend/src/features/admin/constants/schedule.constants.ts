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
  'Imunisasi TT': { bg: '#ffd9de', text: '#8c0f39', border: '#ffd9de' },
  'Skrining Pranikah': { bg: '#eff4ff', text: '#1d4ed8', border: '#dee9fc' },
  'Bimbingan KUA': { bg: '#aff1d0', text: '#0a5139', border: '#6ee7b7' },
  'Suplemen Pranikah': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  default: { bg: '#f8f9ff', text: '#574144', border: '#dee9fc' },
};
