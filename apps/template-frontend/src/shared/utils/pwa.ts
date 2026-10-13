/**
 * Checks whether the application is running inside an installed PWA (Standalone mode).
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  const isPWASearchParam =
    window.location.search.includes('source=pwa') || window.location.search.includes('pwa=1')
  const isAndroidTWA = document.referrer.includes('android-app://')

  return Boolean(isStandaloneMedia || isIOSStandalone || isPWASearchParam || isAndroidTWA)
}

/**
 * Checks if the current user agent is a mobile or tablet device.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
