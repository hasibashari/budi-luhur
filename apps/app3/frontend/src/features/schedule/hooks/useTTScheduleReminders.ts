import { useCallback, useEffect, useRef, useState } from 'react';
import { playNotificationTone, showSystemNotification } from '@/src/shared/utils/notifications';
import { getTTSchedulesAction } from '../api/scheduleRepository';
import { TTSchedule } from '../types';

/**
 * Pengingat jadwal imunisasi Tetanus Toxoid (App 3 — TEMANI).
 *
 * Berbeda dari App 2 yang berbasis jam harian, jadwal TT berbasis TANGGAL
 * (TT1..TT5). Hook mengecek setiap 20 detik dan memunculkan notifikasi:
 *  - tepat pada tanggal & jam jadwal (toleransi 10 menit), dan
 *  - 15 menit sebelum jam jadwal (jika `remind15MinBefore` aktif).
 */

const CHECK_INTERVAL_MS = 20 * 1000;
const EXACT_WINDOW_MINUTES = 10;
const TIMEZONE = 'Asia/Jakarta';
const STORAGE_PREFIX = 'temani_tt_reminder';

const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export interface ActiveTTReminder {
  scheduleId: string;
  kind: 'exact' | 'early';
  stage: string;
  time: string;
}

interface UseTTScheduleRemindersOptions {
  userId?: string;
  enabled?: boolean;
}

interface WibNow {
  dateKey: string;
  minutes: number;
}

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
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));

  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: hour * 60 + minute,
  };
}

function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return (hour || 0) * 60 + (minute || 0);
}

function diffInDays(targetDate: string, todayDate: string): number {
  if (!targetDate || !todayDate) return 0;
  const target = new Date(`${targetDate}T00:00:00`);
  const today = new Date(`${todayDate}T00:00:00`);
  if (Number.isNaN(target.getTime()) || Number.isNaN(today.getTime())) return 0;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
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

function notifyUser(title: string, options: Parameters<typeof showSystemNotification>[1]) {
  const permissionGranted =
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

  if (permissionGranted) {
    void showSystemNotification(title, options);
    return;
  }

  playNotificationTone();
}

export function useTTScheduleReminders({
  userId,
  enabled = true,
}: UseTTScheduleRemindersOptions = {}) {
  const [schedules, setSchedules] = useState<TTSchedule[]>([]);
  const [activeReminders, setActiveReminders] = useState<ActiveTTReminder[]>([]);

  const schedulesRef = useRef<TTSchedule[]>([]);

  useEffect(() => {
    schedulesRef.current = schedules;
  }, [schedules]);

  const refreshData = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await getTTSchedulesAction();
      setSchedules(list);
    } catch (error) {
      console.error('[TTReminder] Gagal memuat jadwal:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    void refreshData();

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

  useEffect(() => {
    if (!enabled) return;

    const checkSchedules = () => {
      const list = schedulesRef.current;
      if (list.length === 0) {
        setActiveReminders(prev => (prev.length === 0 ? prev : []));
        return;
      }

      const { dateKey, minutes: nowMinutes } = getWibNow();
      const stillActive: ActiveTTReminder[] = [];

      for (const schedule of list) {
        if (!schedule.isEnabled || schedule.status === 'completed') continue;

        const daysDiff = diffInDays(schedule.scheduledDate, dateKey);

        // A. Pengingat H-1 Bulan (30 hari sebelum hari H)
        if (schedule.remind1MonthBefore && daysDiff === 30) {
          const keyMonth = `${STORAGE_PREFIX}_${userId || 'user'}_${schedule.id}_1month_${schedule.scheduledDate}`;
          if (!wasAlreadyFired(keyMonth)) {
            markAsFired(keyMonth);
            notifyUser(`H-30 Hari: Persiapan Imunisasi ${schedule.stage} 📅`, {
              body: `Jadwal ${schedule.title || schedule.stage} Anda dijadwalkan pada ${schedule.scheduledDate}. Persiapkan dokumen dan faskes tujuan.`,
              tag: `tt_${schedule.id}_1month`,
              url: `${APP_BASE}/user/jadwal`,
            });
          }
        }

        // B. Pengingat H-1 Hari (1 hari sebelum hari H)
        if (schedule.remind1DayBefore && daysDiff === 1) {
          const keyDay = `${STORAGE_PREFIX}_${userId || 'user'}_${schedule.id}_1day_${schedule.scheduledDate}`;
          if (!wasAlreadyFired(keyDay)) {
            markAsFired(keyDay);
            notifyUser(`Besok: Jadwal Imunisasi ${schedule.stage}! ⏰`, {
              body: `Besok ada jadwal ${schedule.title || schedule.stage} pukul ${schedule.time} WIB. Jangan lupa siapkan kartu TT.`,
              tag: `tt_${schedule.id}_1day`,
              url: `${APP_BASE}/user/jadwal`,
            });
          }
        }

        // C. Pengingat pada Hari H
        if (schedule.scheduledDate !== dateKey) continue;

        const scheduleMinutes = parseTimeToMinutes(schedule.time);
        if (scheduleMinutes === null) continue;

        const diff = nowMinutes - scheduleMinutes;
        const baseKey = `${STORAGE_PREFIX}_${userId || 'user'}_${dateKey}_${schedule.id}`;
        const notificationTag = `tt_${schedule.id}_${dateKey}`;

        // 1. Tepat waktu (0 s/d 10 menit setelah jam jadwal)
        if (diff >= 0 && diff <= EXACT_WINDOW_MINUTES) {
          stillActive.push({
            scheduleId: schedule.id,
            kind: 'exact',
            stage: schedule.stage,
            time: schedule.time,
          });

          const key = `${baseKey}_exact`;
          if (!wasAlreadyFired(key)) {
            markAsFired(key);
            notifyUser(`Waktunya Imunisasi ${schedule.stage}! 💉`, {
              body: `Jadwal ${schedule.title || schedule.stage} hari ini pukul ${schedule.time} WIB. Jangan lupa kunjungi faskes dan catat hasilnya.`,
              tag: `${notificationTag}_exact`,
              url: `${APP_BASE}/user/imunisasi?catat=${encodeURIComponent(schedule.stage)}&scheduleId=${encodeURIComponent(schedule.id)}&date=${encodeURIComponent(schedule.scheduledDate)}&time=${encodeURIComponent(schedule.time)}`,
            });
          }
          continue;
        }

        // 2. Pengingat 30 menit sebelumnya
        if (schedule.remind30MinBefore && diff >= -30 && diff < 0) {
          if (!stillActive.some(item => item.scheduleId === schedule.id && item.kind === 'early')) {
            stillActive.push({
              scheduleId: schedule.id,
              kind: 'early',
              stage: schedule.stage,
              time: schedule.time,
            });
          }

          const key30 = `${baseKey}_early_30m`;
          if (!wasAlreadyFired(key30)) {
            markAsFired(key30);
            notifyUser(`30 Menit Lagi: Imunisasi ${schedule.stage} ⏰`, {
              body: `Jadwal ${schedule.title || schedule.stage} pukul ${schedule.time} WIB. Siapkan kartu TT dan menuju faskes.`,
              tag: `${notificationTag}_early_30m`,
              url: `${APP_BASE}/user/imunisasi?catat=${encodeURIComponent(schedule.stage)}&scheduleId=${encodeURIComponent(schedule.id)}&date=${encodeURIComponent(schedule.scheduledDate)}&time=${encodeURIComponent(schedule.time)}`,
            });
          }
        }

        // 3. Pengingat 15 menit sebelumnya
        if (schedule.remind15MinBefore && diff >= -15 && diff < 0) {
          if (!stillActive.some(item => item.scheduleId === schedule.id && item.kind === 'early')) {
            stillActive.push({
              scheduleId: schedule.id,
              kind: 'early',
              stage: schedule.stage,
              time: schedule.time,
            });
          }

          const key15 = `${baseKey}_early_15m`;
          if (!wasAlreadyFired(key15)) {
            markAsFired(key15);
            notifyUser(`15 Menit Lagi: Imunisasi ${schedule.stage} ⏰`, {
              body: `Jadwal ${schedule.title || schedule.stage} pukul ${schedule.time} WIB. Menuju ruang imunisasi di faskes sekarang.`,
              tag: `${notificationTag}_early_15m`,
              url: `${APP_BASE}/user/imunisasi?catat=${encodeURIComponent(schedule.stage)}&scheduleId=${encodeURIComponent(schedule.id)}&date=${encodeURIComponent(schedule.scheduledDate)}&time=${encodeURIComponent(schedule.time)}`,
            });
          }
        }
      }

      // Hindari re-render layout setiap 20 detik jika isinya sama.
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

  return { schedules, activeReminders, refresh: refreshData };
}

export default useTTScheduleReminders;
