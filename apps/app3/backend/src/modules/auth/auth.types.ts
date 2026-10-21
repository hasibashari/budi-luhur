export type UserRole = 'admin' | 'user';

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
  hbLevel?: number;
  streakCount?: number;
  isProfileComplete?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: 'Perempuan' | 'Laki-laki';
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
  hb_level: number | null;
  streak_count: number | null;
}
