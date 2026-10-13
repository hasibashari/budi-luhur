import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isStandalonePWA } from '../utils/pwa';

export default function PWARedirector() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isStandalonePWA()) {
      navigate('/splash', { replace: true });
    }
  }, [navigate]);

  return null;
}
