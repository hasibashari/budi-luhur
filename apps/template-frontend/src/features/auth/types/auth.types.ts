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
  roleHint?: UserRole;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: 'Perempuan';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasCompletedOnboarding: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (
    credentials: LoginCredentials,
  ) => Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
    redirectTo?: string;
    isProfileComplete?: boolean;
  }>;
  quickLogin: (role: UserRole) => Promise<{ success: boolean; redirectTo: string }>;
  register: (
    data: RegisterCredentials,
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<{ success: boolean; error?: string; message?: string }>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}
