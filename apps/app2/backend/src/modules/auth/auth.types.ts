export type UserRole = 'admin' | 'user';
export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  gender?: 'Perempuan' | 'Laki-laki';
  schoolOrOrg?: string;
  friendCode?: string;
  streakCount?: number;
  isProfileComplete?: boolean;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  resetToken: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: 'Perempuan';
}

export interface UserDbRow {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  role: 'admin' | 'user';
  phone: string | null;
  avatar_url: string | null;
  gender: 'Perempuan' | 'Laki-laki' | null;
  friend_code: string | null;
  school_or_org: string | null;
  streak_count: number | null;
  verification_status?: VerificationStatus | null;
  rejection_reason?: string | null;
}
