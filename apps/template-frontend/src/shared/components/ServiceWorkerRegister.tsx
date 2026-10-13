'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .then(registration => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('FEMORY ServiceWorker registered with scope:', registration.scope);
          }
        })
        .catch(err => {
          console.error('FEMORY ServiceWorker registration failed:', err);
        });
    }
  }, []);

  return null;
}
