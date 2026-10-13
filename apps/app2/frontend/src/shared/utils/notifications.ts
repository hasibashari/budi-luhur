/**
 * MediCore Web Notification & PWA Push Utilities
 */

export interface SystemNotificationOptions extends NotificationOptions {
  url?: string
  vibrate?: number[]
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

  const defaultOptions: SystemNotificationOptions = {
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
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
      const registration = await navigator.serviceWorker.ready
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
