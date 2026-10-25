import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplashScreenView } from '../components/SplashScreenView';
import { useAuth } from '@/src/features/auth';

export interface SplashViewProps {
  statusText?: string;
}

export function SplashView({ statusText }: SplashViewProps) {
  const navigate = useNavigate();
  const { isInitializing, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isInitializing) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          if (user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/user/dashboard', { replace: true });
          }
        } else {
          // Pengguna baru / belum login diarahkan ke Onboarding (Tutorial Carousel)
          navigate('/onboarding', { replace: true });
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isInitializing, isAuthenticated, user, navigate]);

  return <SplashScreenView statusText={statusText} />;
}

export default SplashView;
