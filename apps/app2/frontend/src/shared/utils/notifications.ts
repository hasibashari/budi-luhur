/**
 * MediCore Web Notification & PWA Push Utilities
 */
import apiClient from '../api/client'

export interface SystemNotificationOptions extends NotificationOptions {
  url?: string
  vibrate?: number[]
}

/**
 * Kandidat lokasi Service Worker.
 *
 * - Mode normal: `/app2/sw.js` dengan scope `/app2/` (sesuai `base` Vite app2).
 * - Fallback: `/sw.js` (mis. saat app2 berjalan di bawah domain portal yang
 *   menyediakan Service Worker di root).
 */
function getServiceWorkerCandidates(): Array<{ url: string; scope: string }> {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = `/${base}/`.replace(/\/+/g, '/')
  const candidates = [
    { url: `${normalizedBase}sw.js`.replace(/\/+/g, '/'), scope: normalizedBase },
    { url: '/sw.js', scope: '/' },
  ]
  return candidates.filter((candidate, index) => candidates.findIndex(c => c.url === candidate.url) === index)
}

/** Daftarkan Service Worker pertama yang berhasil (dipakai untuk Web Push). */
async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  for (const candidate of getServiceWorkerCandidates()) {
    try {
      return await navigator.serviceWorker.register(candidate.url, { scope: candidate.scope })
    } catch (error) {
      console.warn(`[Push] Gagal mendaftarkan Service Worker ${candidate.url}:`, error)
    }
  }
  return null
}

/**
 * Daftarkan Service Worker sedini mungkin saat aplikasi dibuka.
 * Tanpa SW aktif, notifikasi di mobile tidak bisa tampil di lockscreen dan
 * `navigator.serviceWorker.ready` tidak akan pernah resolve.
 */
export function registerAppServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  const register = () => {
    registerPushServiceWorker().catch(error => {
      console.error('[SW] Registrasi Service Worker gagal:', error)
    })
  }

  if (document.readyState === 'complete') {
    register()
  } else {
    window.addEventListener('load', register, { once: true })
  }
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

export async function subscribeToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !isNotificationSupported() || Notification.permission !== 'granted') return false
  try {
    const registration = await registerPushServiceWorker()
    if (!registration) return false
    const { data } = await apiClient.get<{ publicKey: string | null }>('/notifications/public-key')
    if (!data.publicKey) return false
    const existing = await registration.pushManager.getSubscription()
    const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(data.publicKey) })
    await apiClient.post('/notifications/subscribe', subscription.toJSON())
    return true
  } catch (error) {
    console.error('Failed to register push subscription:', error)
    return false
  }
}

/**
 * Checks if the Web Notification API is supported in the current environment
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'Notification' in window
}

/**
 * Retrieves the current notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Requests notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return Notification.permission
  }
}

/**
 * Plays a pleasant medical chime audio tone when notification fires
 */
export function playNotificationTone() {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Two-tone medical reminder chime (E5 -> G5)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now) // E5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.18) // G5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(329.63, now) // E4
    osc2.frequency.exponentialRampToValueAtTime(392.0, now + 0.18) // G4

    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.6)
    osc2.stop(now + 0.6)
  } catch {
    // ignore audio context restrictions
  }
}

/**
 * Displays a system notification on mobile status bar / desktop notification tray
 */
export async function showSystemNotification(
  title: string,
  options: SystemNotificationOptions = {}
): Promise<boolean> {
  if (!isNotificationSupported()) return false
  if (Notification.permission !== 'granted') return false

  // Play audio chime
  playNotificationTone()

  const icon = `${import.meta.env.BASE_URL}icons/icon-192x192.png`
  const defaultOptions: SystemNotificationOptions = {
    icon,
    badge: icon,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: options.url || '/user/dashboard',
      dateOfArrival: Date.now(),
    },
    ...options,
  }

  // Preferred: Show notification via active Service Worker (required for mobile background & lockscreen)
  if ('serviceWorker' in navigator) {
    try {
      // `navigator.serviceWorker.ready` tidak pernah resolve jika belum ada SW
      // yang aktif. Beri batas waktu agar fallback di bawah tetap dijalankan.
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>(resolve => setTimeout(() => resolve(null), 1500)),
      ])
      if (registration && registration.showNotification) {
        await registration.showNotification(title, defaultOptions)
        return true
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback: Direct window Notification object
  try {
    const notification = new Notification(title, defaultOptions)
    notification.onclick = () => {
      window.focus()
      if (options.url) {
        window.location.href = options.url
      }
      notification.close()
    }
    return true
  } catch (error) {
    console.error('Failed to trigger window Notification:', error)
    return false
  }
}
