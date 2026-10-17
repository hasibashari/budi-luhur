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
}

export const INITIAL_USER_FORM_DATA: UserFormData = {
  name: '',
  age: '',
  gender: 'Perempuan',
  phone: '',
  email: '',
  riskLevel: 'Rendah',
  schoolOrOrg: DEFAULT_SCHOOL_ORG,
  assignedDoctor: DEFAULT_SCHOOL_ORG,
  medicalNotes: '',
};
