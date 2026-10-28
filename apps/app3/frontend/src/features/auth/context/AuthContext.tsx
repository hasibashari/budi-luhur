import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  AuthState,
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
} from '../types/auth.types';
import apiClient, { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from '../../../shared/api/client';

export const ONBOARDING_STORAGE_KEY = `${AUTH_STORAGE_KEY}_has_onboarded`;

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  hasCompletedOnboarding: false,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    let isMounted = true;

    const initAppAuth = async () => {
      try {
        const onboardVal = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        const hasCompletedOnboarding = onboardVal === 'true';

        let token = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        let parsedUser: AuthUser | null = null;

        if (token && storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch {
            // ignore
          }
        }

        // Revalidasi ke server: `isProfileComplete` di localStorage bisa basi
        // sehingga pengguna yang sudah setup tetap dilempar ke /user/setup.
        if (token && parsedUser) {
          try {
            const res = await apiClient.get('/auth/session');
            if (res.data?.user) {
              parsedUser = { ...parsedUser, ...res.data.user };
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUser));
            }
          } catch (err: any) {
            if (err?.response?.status === 401) {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              localStorage.removeItem(USER_STORAGE_KEY);
              token = null;
              parsedUser = null;
            }
            // Gagal jaringan: pertahankan sesi lokal agar aplikasi tetap bisa dibuka.
          }
        }

        if (isMounted) {
          setState({
            user: parsedUser,
            isAuthenticated: Boolean(token && parsedUser),
            isLoading: false,
            isInitializing: false,
            hasCompletedOnboarding,
          });
        }
      } catch {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitializing: false,
            isLoading: false,
          }));
        }
      }
    };

    initAppAuth();

    const handleUnauthorized = () => {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
      }));
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {}
    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {}
    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: false,
    }));
  }, []);

  const saveSession = useCallback((token: string, user: AuthUser) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {}
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      isLoading: false,
    }));
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const res = await apiClient.post('/auth/login', credentials);
        const { token, user, redirectTo, isProfileComplete } = res.data;
        if (token && user) {
          saveSession(token, user);
          return {
            success: true,
            user,
            redirectTo,
            isProfileComplete,
          };
        }
        setState(prev => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: 'Gagal login. Periksa kembali email Anda.',
        };
      } catch (err: any) {
        setState(prev => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: err.response?.data?.error || 'Gagal login. Periksa kembali email Anda.',
        };
      }
    },
    [saveSession],
  );

  const register = useCallback(async (data: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await apiClient.post('/auth/register', data);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, message: res.data.message };
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: err.response?.data?.error || 'Terjadi kesalahan sistem saat registrasi.',
      };
    }
  }, []);

  const verifyResetEmail = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: true,
        resetToken: res.data?.resetToken,
        email: res.data?.email,
        message: res.data?.message,
      };
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error:
          err.response?.data?.error ||
          'Email tidak ditemukan atau terjadi kesalahan saat pengecekan.',
      };
    }
  }, []);

  const resetPassword = useCallback(async (credentials: ResetPasswordCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await apiClient.post('/auth/reset-password', credentials);
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: true,
        message: res.data?.message || 'Kata sandi berhasil diperbarui.',
      };
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error:
          err.response?.data?.error ||
          'Gagal memperbarui kata sandi. Silakan coba kembali.',
      };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }));
    const loginPath = `${import.meta.env.BASE_URL || '/'}auth/login`.replace(/\/+/g, '/');
    window.location.href = loginPath;
  }, []);

  const updateUser = useCallback((updated: Partial<AuthUser>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const newUser: AuthUser = { ...prev.user, ...updated };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } catch {}
      return {
        ...prev,
        user: newUser,
      };
    });
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!state.user?.id) {
      return { success: false, error: 'Tidak ada sesi akun yang aktif.' };
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await apiClient.delete('/auth/account');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      const onboardPath = `${import.meta.env.BASE_URL || '/'}onboarding?deleted=true`.replace(
        /\/+/g,
        '/',
      );
      window.location.href = onboardPath;
      return { success: true, message: res.data.message };
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: err.response?.data?.error || 'Gagal menghapus akun.',
      };
    }
  }, [state.user?.id]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyResetEmail,
        resetPassword,
        logout,
        deleteAccount,
        completeOnboarding,
        resetOnboarding,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
