export interface AdminStats {
  totalUsers: number;
  activeSchedules: number;
  adherenceRate: number;
  publishedArticles: number;
  activePrograms: number;
}

export interface ManagedUser {
  id: string;
  name: string;
  age: number | null;
  gender: 'Laki-laki' | 'Perempuan' | null;
  phone: string | null;
  email: string;
  avatarUrl?: string | null;
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah' | null;
  status: 'Aktif' | 'Nonaktif';
  /** null = belum diisi calon pengantin (jangan diisi nilai karangan). */
  schoolOrOrg: string | null;
  assignedDoctor?: string | null;
  activeSchedulesCount: number;
  adherenceRate: number | null;
  lastActive: string | null;
  joinDate: string;
  medicalNotes?: string | null;
  lastReminderSent?: string | null;
  weddingDate?: string | null;
  ttStatus?: 'TT0' | 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5' | null;
  kuaStatus?: 'Terverifikasi' | 'Menunggu Skrining' | 'Belum Lengkap' | null;
  partnerName?: string | null;
}

import type { ScheduleCategory } from '../constants/schedule.constants';
export type { ScheduleCategory };

export interface MedicationSchedule {
  id: string;
  userId: string;
  userName: string;
  patientId?: string;
  patientName?: string;
  partnerName?: string;
  medicationName: string;
  dosage: string;
  frequency: '1x Seminggu' | 'Harian' | string;
  dayOfWeek?: string;
  timeSlots: string[];
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Selesai' | 'Diberhentikan';
  category: ScheduleCategory;
  instructions: string;
  lastReminderSent?: string;
  todayStatus?: 'COMPLETED' | 'PENDING' | 'NOT_YET_TIME' | 'OFF_SCHEDULE' | 'MISSED';
  /** Dosis TT (TT1–TT5) bila jadwal berasal dari modul imunisasi. */
  ttLevel?: string;
  /** Tanggal kunjungan imunisasi (YYYY-MM-DD). */
  scheduledDate?: string;
  completedAt?: string;
  isEnabled?: boolean;
}

export type ArticleCategory = string;

export interface HealthArticle {
  id: string;
  title: string;
  category: ArticleCategory | string;
  author: string;
  authorId?: string;
  publishDate: string;
  status: 'Terbit' | 'Draf';
  views: number;
  summary: string;
  readTime: string;
  imageUrl?: string;
  content?: string;
}

export interface HealthProgram {
  id: string;
  name: string;
  code: string;
  description: string;
  durationWeeks: number;
  enrolledUsersCount: number;
  status: 'Aktif' | 'Draf' | 'Arsip';
  targetCategory: string;
  createdBy: string;
}

export interface ComplianceReport {
  date: string;
  takenCount: number;
  missedCount: number;
  adherencePercentage: number;
}
