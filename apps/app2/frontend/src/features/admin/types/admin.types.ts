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
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email: string;
  avatarUrl?: string;
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah';
  status: 'Aktif' | 'Nonaktif';
  schoolOrOrg: string;
  assignedDoctor?: string;
  activeSchedulesCount: number;
  adherenceRate: number;
  lastActive: string;
  joinDate: string;
  medicalNotes?: string;
  lastReminderSent?: string;
}

import type { ScheduleCategory } from '../constants/schedule.constants';
export type { ScheduleCategory };

export interface MedicationSchedule {
  id: string;
  userId: string;
  userName: string;
  patientId?: string;
  patientName?: string;
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
}

export type ArticleCategory =
  | 'Anemia & TTD'
  | 'Nutrisi & Gizi'
  | 'Kesehatan Remaja'
  | 'Tips Menstruasi'
  | 'Mitos & Fakta'
  | 'Gaya Hidup';

export interface HealthArticle {
  id: string;
  title: string;
  category: ArticleCategory | string;
  author: string;
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
