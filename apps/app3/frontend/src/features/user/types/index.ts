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
  hbLevel?: number;
  streakCount?: number;
  friendCode?: string;
  weddingDate?: string;
  ttStatus?: string;
  kuaStatus?: string;
  partnerName?: string;
  notes?: string;
}

export interface ImmunizationRecord {
  id: string;
  doseLevel: 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5';
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
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
    hbLevel?: number | null;
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
