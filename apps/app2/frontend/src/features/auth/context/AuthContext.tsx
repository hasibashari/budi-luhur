import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  AuthState,
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
} from '../types/auth.types';
import apiClient, {
  AUTH_STORAGE_KEY,
  USER_STORAGE_KEY,
  extractErrorMessage,
} from '../../../shared/api/client';

export const ONBOARDING_STORAGE_KEY = `${AUTH_STORAGE_KEY}_has_onboarded`;

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  hasCompletedOnboarding: false,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    let isMounted = true;

    const initAppAuth = () => {
      try {
        const onboardVal = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        const hasCompletedOnboarding = onboardVal === 'true';

        const token = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        let parsedUser: AuthUser | null = null;

        if (token && storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch {
            // ignore
          }
        }

        if (isMounted) {
          setState({
            user: parsedUser,
            isAuthenticated: !!(token && parsedUser),
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
          error: extractErrorMessage(err, 'Gagal login. Periksa kembali email Anda.'),
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
        error: extractErrorMessage(err, 'Terjadi kesalahan sistem saat registrasi.'),
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
      const onboardPath = `${import.meta.env.BASE_URL || '/'}onboarding?deleted=true`.replace(/\/+/g, '/');
      window.location.href = onboardPath;
      return { success: true, message: res.data.message };
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: extractErrorMessage(err, 'Gagal menghapus akun.'),
      };
    }
  }, [state.user?.id]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
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
