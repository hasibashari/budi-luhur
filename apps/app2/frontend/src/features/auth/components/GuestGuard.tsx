import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SplashScreenView } from '../../splash';

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isInitializing, user, navigate]);

  if (isInitializing) {
    return <SplashScreenView statusText='Memeriksa sesi...' />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default GuestGuard;
