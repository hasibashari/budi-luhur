export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  dateOfBirth?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  schoolOrOrg?: string;
  streakCount?: number;
  friendCode?: string;
  weddingDate?: string;
  ttStatus?: string;
  kuaStatus?: string;
  partnerName?: string;
  notes?: string;
}

export type TTInfoSource = 'self_reported' | 'faskes_record' | 'health_worker';
export type TTDatePrecision = 'exact' | 'month' | 'year';
export type TTVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type TTVaccineType = 'TT' | 'Td' | 'DPT' | 'Lainnya';

export interface ImmunizationRecord {
  id: string;
  doseLevel: 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5';
  vaccineType: TTVaccineType;
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  infoSource: TTInfoSource;
  datePrecision: TTDatePrecision;
  attachmentUrl?: string;
  verificationStatus: TTVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImmunizationInput {
  doseLevel: ImmunizationRecord['doseLevel'];
  vaccineType?: TTVaccineType;
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  infoSource?: TTInfoSource;
  datePrecision?: TTDatePrecision;
  attachmentUrl?: string;
  /** Menandai jadwal tertentu sebagai selesai setelah riwayat tersimpan. */
  scheduleId?: string;
}

export interface ImmunizationValidationResult {
  errors: string[];
  warnings: string[];
}

export interface ImmunizationMutationResult {
  record: ImmunizationRecord;
  warnings: string[];
}

export type CertificateVerificationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CertificateVerification {
  status: CertificateVerificationStatus;
  certificateNumber: string | null;
  note: string | null;
  requestedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  signerName: string | null;
  signerSip: string | null;
}

export interface StreakResult {
  streakCount: number;
  consecutiveDates: string[];
  streakUnit: 'Hari' | 'Minggu';
  isActive: boolean;
}

export interface UserScheduleData {
  id: string;
  patientId: string;
  dayOfWeek: string;
  time: string;
  tabletName: string;
  dosage: string;
  frequency: string;
  category?: string;
  isEnabled: boolean;
  remind15MinBefore: boolean;
  reminderTiming: string;
  channelPush: boolean;
  channelWhatsapp: boolean;
  channelEmail: boolean;
  nextDate: string;
  daysRemaining: number;
  instructions: string;
}

export interface UserDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    streakCount: number;
    streakUnit?: 'Hari' | 'Minggu';
    consecutiveDates?: string[];
    schoolOrOrg?: string | null;
    riskLevel?: string | null;
    friendCode?: string;
    weddingDate?: string;
    ttStatus?: string;
    kuaStatus?: string;
    partnerName?: string;
    notes?: string;
  };
  immunizationRecords: ImmunizationRecord[];
  todayStatus: 'recorded' | 'missed' | 'pending';
  todayRecordedTime?: string;
  activeSchedule: UserScheduleData | null;
  featuredArticle: {
    id: string;
    title: string;
    category: string;
    readTime: string;
    summary: string;
    imageUrl: string;
    author?: {
      name: string;
      role?: string;
    };
  } | null;
  activeBuddy: {
    connectionId: string;
    buddyId: string;
    buddyName: string;
    buddyAvatarUrl: string;
    sharedStreakCount: number;
    userStatusThisWeek: 'recorded' | 'missed' | 'pending';
    buddyStatusThisWeek: 'recorded' | 'missed' | 'pending';
  } | null;
  primaryGroup?: {
    id: string;
    name: string;
    groupCode: string;
    streakCount: number;
    memberCount: number;
    membersSummary: string[];
    weeklyCompletedCount: number;
    weeklyTotalCount: number;
    weeklyCompletionRate: number;
    avatarUrl?: string;
  } | null;
}
