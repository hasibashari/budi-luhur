export const GENDER_OPTIONS = [
  { value: 'Perempuan', label: 'Perempuan' },
  { value: 'Laki-laki', label: 'Laki-laki' },
] as const;

export type UserGender = (typeof GENDER_OPTIONS)[number]['value'];

export const RISK_LEVEL_OPTIONS = [
  { value: 'Rendah', label: 'Rendah (Kepatuhan Optimal ≥90%)' },
  { value: 'Sedang', label: 'Sedang (Kepatuhan 80-89%)' },
  { value: 'Tinggi', label: 'Tinggi (Kepatuhan <80% / Butuh Pantauan)' },
] as const;

export type RiskLevel = (typeof RISK_LEVEL_OPTIONS)[number]['value'];

export const RISK_LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Tinggi: { bg: '#fee2e2', text: '#dc2626' },
  Sedang: { bg: '#fef3c7', text: '#d97706' },
  Rendah: { bg: '#dcfce7', text: '#16a34a' },
  default: { bg: '#f1f5f9', text: '#475569' },
};

export const DEFAULT_SCHOOL_ORG = 'Puskesmas Melati / Wilayah Bidan';

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
