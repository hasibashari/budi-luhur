/**
 * STIKes Budi Luhur Portal PWA Utilities
 */

export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const isPWASearchParam =
    window.location.search.includes('source=pwa') || window.location.search.includes('pwa=1');
  const isAndroidTWA = document.referrer.includes('android-app://');

  return Boolean(isStandaloneMedia || isIOSStandalone || isPWASearchParam || isAndroidTWA);
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[BudiLuhur-SW] Registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[BudiLuhur-SW] Registration failed:', error);
        });
    });
  }
}
