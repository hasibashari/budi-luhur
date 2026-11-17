/**
 * Femory Web Notification & PWA Push Utilities
 */
import apiClient from '../api/client';

export interface SystemNotificationOptions extends NotificationOptions {
  url?: string;
  vibrate?: number[];
}

function getServiceWorkerPath() {
  return '/sw.js';
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}

export async function subscribeToPush(): Promise<boolean> {
  if (
    !('serviceWorker' in navigator) ||
    !isNotificationSupported() ||
    Notification.permission !== 'granted'
  )
    return false;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter(registration => /\/app1\/sw\.js$/.test(registration.active?.scriptURL || ''))
        .map(registration => registration.unregister()),
    );
    const registration = await navigator.serviceWorker.register(getServiceWorkerPath(), {
      scope: '/',
    });
    const { data } = await apiClient.get<{ publicKey: string | null }>('/notifications/public-key');
    if (!data.publicKey) return false;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      }));
    await apiClient.post('/notifications/subscribe', subscription.toJSON());
    return true;
  } catch (error) {
    console.error('Failed to register push subscription:', error);
    return false;
  }
}

/**
 * Checks if the Web Notification API is supported in the current environment
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

/**
 * Retrieves the current notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Requests notification permission from the user
 */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return Notification.permission;
  }
}

/**
 * Continuous alarm audio state management
 */
let alarmAudioContext: AudioContext | null = null;
let alarmLoopInterval: any = null;
let isAlarmPlaying = false;

/**
 * Plays a single pulse of pleasant medical alarm chime (E5 -> G5 -> C6)
 */
function playAlarmChimePulse(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(329.63, now); // E4
    osc2.frequency.exponentialRampToValueAtTime(392.0, now + 0.15); // G4
    osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.35); // C5

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.1);
    osc2.stop(now + 1.1);
  } catch {
    // Ignore audio context autoplay errors
  }
}

/**
 * Starts continuous looping alarm sound until explicitly stopped by user
 */
export function startContinuousAlarmSound() {
  if (typeof window === 'undefined') return;
  if (isAlarmPlaying) return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!alarmAudioContext || alarmAudioContext.state === 'closed') {
      alarmAudioContext = new AudioContextClass();
    }
    if (alarmAudioContext.state === 'suspended') {
      alarmAudioContext.resume().catch(() => {});
    }

    isAlarmPlaying = true;
    playAlarmChimePulse(alarmAudioContext);

    // Play chime pulse every 1.4 seconds repeatedly
    alarmLoopInterval = setInterval(() => {
      if (!isAlarmPlaying || !alarmAudioContext) {
        clearInterval(alarmLoopInterval);
        alarmLoopInterval = null;
        return;
      }
      playAlarmChimePulse(alarmAudioContext);
    }, 1400);
  } catch {
    // Ignore audio context initialization issues
  }
}

/**
 * Stops continuous alarm sound immediately
 */
export function stopContinuousAlarmSound() {
  isAlarmPlaying = false;
  if (alarmLoopInterval) {
    clearInterval(alarmLoopInterval);
    alarmLoopInterval = null;
  }
  if (alarmAudioContext && alarmAudioContext.state !== 'closed') {
    alarmAudioContext.suspend().catch(() => {});
  }
}

/**
 * Check if continuous alarm sound is currently active
 */
export function isAlarmSoundActive(): boolean {
  return isAlarmPlaying;
}

/**
 * Legacy single tone chime (backwards compatible)
 */
export function playNotificationTone() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    playAlarmChimePulse(ctx);
  } catch {
    // ignore
  }
}

/**
 * Displays a system notification on mobile status bar / desktop notification tray
 */
export async function showSystemNotification(
  title: string,
  options: SystemNotificationOptions = {},
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  // Start continuous alarm tone if this is a real-time alarm trigger
  const defaultOptions: SystemNotificationOptions = {
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    vibrate: [500, 250, 500, 250, 500, 250, 500],
    requireInteraction: true,
    tag: 'femory-ttd-alarm',
    data: {
      url: options.url || '/user/dashboard',
      dateOfArrival: Date.now(),
    },
    ...options,
  };

  // Preferred: Show notification via active Service Worker (required for mobile background & lockscreen)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, defaultOptions);
        return true;
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback: Direct window Notification object
  try {
    const notification = new Notification(title, defaultOptions);
    notification.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };
    return true;
  } catch (error) {
    console.error('Failed to trigger window Notification:', error);
    return false;
  }
}
