import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';
import { OnboardingScreenView } from '../../onboarding';

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, requiredRole, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isInitializing, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        if (!hasCompletedOnboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(`/auth/login?redirect=${encodeURIComponent(pathname)}`, { replace: true });
        }
      } else if (requiredRole && user?.role !== requiredRole) {
        if (user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      } else if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        if (user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      } else if (user?.role === 'user') {
        if (!user.isProfileComplete && pathname !== '/user/setup') {
          navigate('/user/setup', { replace: true });
        } else if (user.isProfileComplete && pathname === '/user/setup') {
          navigate('/user/dashboard', { replace: true });
        }
      }
    }
  }, [
    isAuthenticated,
    isInitializing,
    hasCompletedOnboarding,
    user,
    requiredRole,
    navigate,
    pathname,
  ]);

  if (isInitializing) {
    return <OnboardingScreenView statusText='Memverifikasi sesi...' />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  if (user?.role === 'user') {
    if (!user.isProfileComplete && pathname !== '/user/setup') {
      return null;
    }
    if (user.isProfileComplete && pathname === '/user/setup') {
      return null;
    }
  }

  return <>{children}</>;
}

export default AuthGuard;
