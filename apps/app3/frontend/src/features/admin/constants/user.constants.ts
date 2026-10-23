export const GENDER_OPTIONS = [
  { value: 'Perempuan', label: 'Perempuan (Calon Pengantin Wanita)' },
  { value: 'Laki-laki', label: 'Laki-laki (Calon Pengantin Pria)' },
] as const;

export type UserGender = (typeof GENDER_OPTIONS)[number]['value'];

export const RISK_LEVEL_OPTIONS = [
  { value: 'Rendah', label: 'Rendah (Skrining Optimal & TT Lengkap)' },
  { value: 'Sedang', label: 'Sedang (Perlu Booster TT / Hb Borderline)' },
  { value: 'Tinggi', label: 'Tinggi (Anemia Hb < 10 / Belum Imunisasi TT)' },
] as const;

export type RiskLevel = (typeof RISK_LEVEL_OPTIONS)[number]['value'];

export const RISK_LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Tinggi: { bg: '#fee2e2', text: '#dc2626' },
  Sedang: { bg: '#fef3c7', text: '#d97706' },
  Rendah: { bg: '#dcfce7', text: '#059669' },
  default: { bg: '#f1f5f9', text: '#475569' },
};

export const TT_STATUS_OPTIONS = [
  { value: 'TT0', label: 'TT0 (Belum Imunisasi - Perlu Penjadwalan)' },
  { value: 'TT1', label: 'TT1 (Dosis 1 - Langkah Awal Pranikah)' },
  { value: 'TT2', label: 'TT2 (Dosis 2 - Syarat Minimal KUA, Proteksi 3 Th)' },
  { value: 'TT3', label: 'TT3 (Dosis 3 - Proteksi 5 Th)' },
  { value: 'TT4', label: 'TT4 (Dosis 4 - Proteksi 10 Th)' },
  { value: 'TT5', label: 'TT5 (Dosis 5 - Proteksi Penuh 25+ Th)' },
] as const;

export type TTStatus = (typeof TT_STATUS_OPTIONS)[number]['value'];

export const KUA_STATUS_OPTIONS = [
  { value: 'Terverifikasi', label: 'Terverifikasi (Sertifikat KUA Siap)' },
  { value: 'Menunggu Skrining', label: 'Menunggu Skrining (Jadwal Puskesmas)' },
  { value: 'Belum Lengkap', label: 'Belum Lengkap (Syarat Belum Terpenuhi)' },
] as const;

export type KUAStatus = (typeof KUA_STATUS_OPTIONS)[number]['value'];

export const TT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TT0: { bg: '#ffd9de', text: '#8c0f39', border: '#fca5a5' },
  TT1: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  TT2: { bg: '#aff1d0', text: '#0a5139', border: '#6ee7b7' },
  TT3: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  TT4: { bg: '#eff4ff', text: '#1d4ed8', border: '#bfdbfe' },
  TT5: { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
};

export const KUA_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Terverifikasi: { bg: '#aff1d0', text: '#0a5139', border: '#6ee7b7' },
  'Menunggu Skrining': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'Belum Lengkap': { bg: '#ffd9de', text: '#8c0f39', border: '#fca5a5' },
};

export const DEFAULT_SCHOOL_ORG = 'Puskesmas Gambir - KUA Gambir';

export interface UserFormData {
  name: string;
  age: string;
  gender: UserGender;
  phone: string;
  email: string;
  riskLevel: RiskLevel;
  schoolOrOrg?: string;
  assignedDoctor?: string;
  medicalNotes: string;
  weddingDate: string;
  ttStatus: TTStatus;
  kuaStatus: KUAStatus;
  partnerName: string;
}

export const INITIAL_USER_FORM_DATA: UserFormData = {
  name: '',
  age: '24',
  gender: 'Perempuan',
  phone: '',
  email: '',
  riskLevel: 'Rendah',
  schoolOrOrg: DEFAULT_SCHOOL_ORG,
  assignedDoctor: DEFAULT_SCHOOL_ORG,
  medicalNotes: '',
  weddingDate: '',
  ttStatus: 'TT1',
  kuaStatus: 'Menunggu Skrining',
  partnerName: '',
};
