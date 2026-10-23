import { useCallback, useEffect, useRef, useState } from 'react';
import { playNotificationTone, showSystemNotification } from '@/src/shared/utils/notifications';
import { getUserDashboardDataAction } from '@/src/features/user/api/userRepository';
import { getDailySchedulesAction } from '../api/scheduleRepository';
import { DailySchedule } from '../types';

/**
 * Pengingat jadwal harian (App 2 — Pilluna).
 *
 * Berbeda dengan App 1 yang hanya punya 1 jadwal (mingguan/harian), App 2 bisa
 * memiliki BANYAK jadwal harian. Hook ini mengecek seluruh jadwal aktif setiap
 * 20 detik dan memunculkan notifikasi:
 *  - tepat waktu (0 s/d 10 menit setelah jam jadwal), dan
 *  - 15 menit sebelum jam jadwal (jika `remind15MinBefore` aktif).
 *
 * Notifikasi hanya bisa muncul saat aplikasi/tab terbuka. Untuk kondisi aplikasi
 * tertutup, backend App 2 memiliki scheduler + Web Push (lihat
 * `backend/src/modules/schedules/scheduleReminder.service.ts`).
 */

const CHECK_INTERVAL_MS = 20 * 1000;
const EXACT_WINDOW_MINUTES = 10;
const EARLY_WINDOW_MINUTES = 15;
const TIMEZONE = 'Asia/Jakarta';
const STORAGE_PREFIX = 'pilluna_daily_reminder';

// Prefix base URL app2 (mis. "/app2") supaya klik notifikasi tetap di aplikasi.
const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export interface ActiveReminder {
  scheduleId: string;
  kind: 'exact' | 'early';
  title: string;
  time: string;
}

interface UseDailyScheduleRemindersOptions {
  userId?: string;
  /** Matikan sementara pengecekan (mis. saat masih loading auth). */
  enabled?: boolean;
}

interface WibNow {
  dateKey: string;
  minutes: number;
}

/** Ambil tanggal & menit saat ini menurut zona waktu WIB (bukan timezone device). */
function getWibNow(now: Date = new Date()): WibNow {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find(part => part.type === type)?.value || '00';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));

  return {
    dateKey: `${year}-${month}-${day}`,
    minutes: hour * 60 + minute,
  };
}

/** Ubah "HH:mm" menjadi total menit. Null jika format tidak valid. */
function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h || 0) * 60 + (m || 0);
}

function wasAlreadyFired(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markAsFired(key: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, '1');
  } catch {
    // localStorage bisa gagal di mode private — abaikan.
  }
}

/**
 * Tampilkan notifikasi (sekaligus membunyikan nada).
 * `showSystemNotification` sudah memutar nada, jadi nada manual hanya dipakai
 * sebagai fallback ketika izin notifikasi belum/tidak diberikan.
 */
function notifyUser(title: string, options: Parameters<typeof showSystemNotification>[1]) {
  const permissionGranted =
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

  if (permissionGranted) {
    void showSystemNotification(title, options);
    return;
  }

  playNotificationTone();
}

export function useDailyScheduleReminders({
  userId,
  enabled = true,
}: UseDailyScheduleRemindersOptions = {}) {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [todayStatus, setTodayStatus] = useState<'recorded' | 'missed' | 'pending'>('pending');
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);

  const schedulesRef = useRef<DailySchedule[]>([]);
  const todayStatusRef = useRef<'recorded' | 'missed' | 'pending'>('pending');

  useEffect(() => {
    schedulesRef.current = schedules;
  }, [schedules]);

  useEffect(() => {
    todayStatusRef.current = todayStatus;
  }, [todayStatus]);

  // ── Muat data jadwal + status konsumsi hari ini ────────────────────────────
  const refreshData = useCallback(async () => {
    if (!enabled) return;
    try {
      const [list, dashboard] = await Promise.all([
        getDailySchedulesAction(),
        getUserDashboardDataAction(userId).catch(() => null),
      ]);
      setSchedules(list);
      if (dashboard?.todayStatus) setTodayStatus(dashboard.todayStatus);
    } catch (error) {
      console.error('[DailyReminder] Gagal memuat jadwal:', error);
    }
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled) return;

    void refreshData();

    // Refetch berkala (menangkap perubahan jadwal dari device/tab lain)
    const refreshTimer = setInterval(() => {
      void refreshData();
    }, 5 * 60 * 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refreshData();
    };
    const handleLocalUpdate = () => {
      void refreshData();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleLocalUpdate);
    window.addEventListener('schedule:updated', handleLocalUpdate);

    return () => {
      clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleLocalUpdate);
      window.removeEventListener('schedule:updated', handleLocalUpdate);
    };
  }, [enabled, refreshData]);

  // ── Cek jam setiap 20 detik ────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const checkSchedules = () => {
      const list = schedulesRef.current;
      if (list.length === 0) {
        setActiveReminders(prev => (prev.length === 0 ? prev : []));
        return;
      }

      // Sudah mencatat minum hari ini → tidak perlu mengingatkan lagi.
      if (todayStatusRef.current === 'recorded') {
        setActiveReminders(prev => (prev.length === 0 ? prev : []));
        return;
      }

      const { dateKey, minutes: nowMinutes } = getWibNow();
      const stillActive: ActiveReminder[] = [];

      for (const schedule of list) {
        if (!schedule.isEnabled) continue;

        const scheduleMinutes = parseTimeToMinutes(schedule.time);
        if (scheduleMinutes === null) continue;

        const diff = nowMinutes - scheduleMinutes;
        const baseKey = `${STORAGE_PREFIX}_${userId || 'user'}_${dateKey}_${schedule.id}`;
        // Tag disamakan dengan payload Web Push dari backend agar notifikasi
        // tidak dobel saat aplikasi terbuka (notifikasi baru menggantikan yang lama).
        const notificationTag = `daily_${schedule.id}_${dateKey}`;

        // 1. Tepat waktu (0 s/d 10 menit setelah jam jadwal)
        if (diff >= 0 && diff <= EXACT_WINDOW_MINUTES) {
          stillActive.push({
            scheduleId: schedule.id,
            kind: 'exact',
            title: schedule.title,
            time: schedule.time,
          });

          const key = `${baseKey}_exact`;
          if (!wasAlreadyFired(key)) {
            markAsFired(key);
            notifyUser(`Waktunya ${schedule.title}! 🔔`, {
              body: `${schedule.time} WIB telah tiba. Jangan lupa catat sekarang${schedule.notes ? ` — ${schedule.notes}` : ''
                }.`,
              tag: `${notificationTag}_exact`,
              url: `${APP_BASE}/user/dashboard`,
            });
          }
          continue;
        }

        // 2. Pengingat 15 menit sebelumnya
        if (
          schedule.remind15MinBefore &&
          diff >= -EARLY_WINDOW_MINUTES &&
          diff < 0
        ) {
          stillActive.push({
            scheduleId: schedule.id,
            kind: 'early',
            title: schedule.title,
            time: schedule.time,
          });

          const key = `${baseKey}_early`;
          if (!wasAlreadyFired(key)) {
            markAsFired(key);
            notifyUser(`15 Menit Lagi: ${schedule.title} ⏰`, {
              body: `Pengingat ${schedule.title} dijadwalkan pukul ${schedule.time} WIB. Siapkan sekarang.`,
              tag: `${notificationTag}_early`,
              url: `${APP_BASE}/user/dashboard`,
            });
          }
        }
      }

      // Hindari re-render UserLayout setiap 20 detik jika isinya sama.
      setActiveReminders(prev => {
        const isSame =
          prev.length === stillActive.length &&
          prev.every(
            (item, index) =>
              item.scheduleId === stillActive[index].scheduleId &&
              item.kind === stillActive[index].kind,
          );
        return isSame ? prev : stillActive;
      });
    };

    checkSchedules();
    const timer = setInterval(checkSchedules, CHECK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [enabled, userId]);

  return { schedules, todayStatus, activeReminders, refresh: refreshData };
}

export default useDailyScheduleReminders;
