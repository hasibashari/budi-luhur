import { useState, useEffect, useRef } from 'react';
import { playNotificationTone, showSystemNotification } from '@/src/shared/utils/notifications';
import { UserScheduleData } from '@/src/features/user/api/userRepository';

interface UseScheduleReminderOptions {
  schedule: UserScheduleData | null | undefined;
  todayStatus: 'recorded' | 'missed' | 'pending';
  userId?: string;
  onAutoMissed?: () => void;
}

export function useScheduleReminder({
  schedule,
  todayStatus,
  userId,
  onAutoMissed,
}: UseScheduleReminderOptions) {
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [isPastTolerance, setIsPastTolerance] = useState(false);
  const lastTriggeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!schedule || !schedule.isEnabled || todayStatus === 'recorded') {
      setIsReminderActive(false);
      setIsPastTolerance(false);
      return;
    }

    const checkSchedule = () => {
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA');

      const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const currentDayName = INDO_DAYS[now.getDay()];

      const isScheduledToday =
        schedule.frequency === 'Harian' ||
        schedule.dayOfWeek.toLowerCase() === currentDayName.toLowerCase();

      if (!isScheduledToday) {
        setIsReminderActive(false);
        setIsPastTolerance(false);
        return;
      }

      const [schH, schM] = schedule.time.split(':').map(Number);
      const schedMinutes = (schH || 20) * 60 + (schM || 0);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const diffMinutes = currentMinutes - schedMinutes;

      // Tolerance window: 60 minutes after schedule
      const toleranceMinutes = 60;

      // 1. Auto-Missed: If current time is past scheduled time + 60 mins tolerance
      if (diffMinutes > toleranceMinutes) {
        setIsReminderActive(false);
        setIsPastTolerance(true);
        if (todayStatus === 'pending') {
          onAutoMissed?.();
        }
        return;
      }

      // 2. Exact Reminder Window (from scheduled time up to 60 mins tolerance)
      if (diffMinutes >= 0 && diffMinutes <= toleranceMinutes) {
        setIsReminderActive(true);
        setIsPastTolerance(false);

        const exactKey = `exact_${userId || 'user'}_${todayStr}_${schedule.time}`;
        if (lastTriggeredRef.current !== exactKey && typeof window !== 'undefined') {
          const stored = sessionStorage.getItem(exactKey);
          if (!stored) {
            sessionStorage.setItem(exactKey, '1');
            lastTriggeredRef.current = exactKey;
            playNotificationTone();
            showSystemNotification('Waktunya Minum TTD! 🌸', {
              body: `Waktu minum ${schedule.tabletName || 'Tablet Tambah Darah'} (${schedule.time} WIB) telah tiba. Yuk catat sekarang!`,
              url: '/user/dashboard',
            });
          }
        }
        return;
      }

      // 3. Early Reminder Window (15 minutes before)
      if (schedule.remind15MinBefore && diffMinutes >= -15 && diffMinutes < 0) {
        setIsReminderActive(false);
        setIsPastTolerance(false);

        const earlyKey = `early_${userId || 'user'}_${todayStr}_${schedule.time}`;
        if (lastTriggeredRef.current !== earlyKey && typeof window !== 'undefined') {
          const stored = sessionStorage.getItem(earlyKey);
          if (!stored) {
            sessionStorage.setItem(earlyKey, '1');
            lastTriggeredRef.current = earlyKey;
            playNotificationTone();
            showSystemNotification('15 Menit Menuju Minum TTD 🌸', {
              body: `Persiapkan ${schedule.tabletName || 'TTD'}. Waktu minum dalam 15 menit (${schedule.time} WIB).`,
              url: '/user/dashboard',
            });
          }
        }
        return;
      }

      setIsReminderActive(false);
      setIsPastTolerance(false);
    };

    checkSchedule();
    const timer = setInterval(checkSchedule, 20 * 1000); // Check every 20 seconds

    return () => clearInterval(timer);
  }, [schedule, todayStatus, userId, onAutoMissed]);

  return {
    isReminderActive,
    isPastTolerance,
  };
}
