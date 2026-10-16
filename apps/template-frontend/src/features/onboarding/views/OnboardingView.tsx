import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreenView } from '../components/OnboardingScreenView';
import { useAuth } from '@/features/auth';

export interface OnboardingViewProps {
  statusText?: string;
}

export function OnboardingView({ statusText }: OnboardingViewProps) {
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
          // Navigasi ke tahap berikutnya: Splash Screen (Tutorial Slides)
          navigate('/splash', { replace: true });
        }
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [isInitializing, isAuthenticated, user, navigate]);

  return <OnboardingScreenView statusText={statusText} />;
}

export default OnboardingView;
