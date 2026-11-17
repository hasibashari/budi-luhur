import { useState, useEffect, useRef, useCallback } from 'react';
import {
  startContinuousAlarmSound,
  stopContinuousAlarmSound,
  showSystemNotification,
} from '@/src/shared/utils/notifications';
import { UserScheduleData } from '@/src/features/user/api/userRepository';

export interface UseScheduleReminderOptions {
  schedule: UserScheduleData | null | undefined;
  todayStatus: 'recorded' | 'missed' | 'pending';
  userId?: string;
  onAutoMissed?: () => void;
  onConfirmTaken?: () => void;
}

export function useScheduleReminder({
  schedule,
  todayStatus,
  userId,
  onAutoMissed,
  onConfirmTaken,
}: UseScheduleReminderOptions) {
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isPastTolerance, setIsPastTolerance] = useState(false);
  const dismissedKeysRef = useRef<Set<string>>(new Set());

  // Dismiss / Stop the ongoing alarm sound
  const dismissAlarm = useCallback(() => {
    stopContinuousAlarmSound();
    setIsAlarmRinging(false);
    if (schedule) {
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA');
      const dismissKey = `dismissed_${userId || 'user'}_${todayStr}_${schedule.time}`;
      dismissedKeysRef.current.add(dismissKey);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(dismissKey, 'true');
      }
    }
  }, [schedule, userId]);

  // Action: Mark as taken from alarm dialog
  const confirmTaken = useCallback(() => {
    dismissAlarm();
    onConfirmTaken?.();
  }, [dismissAlarm, onConfirmTaken]);

  useEffect(() => {
    // Listen for Service Worker notification action events (from background or lock screen)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'ALARM_ACTION') {
          if (event.data.action === 'take_ttd') {
            confirmTaken();
          } else if (event.data.action === 'dismiss_alarm') {
            dismissAlarm();
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [confirmTaken, dismissAlarm]);

  useEffect(() => {
    if (!schedule || !schedule.isEnabled || todayStatus === 'recorded') {
      setIsReminderActive(false);
      setIsAlarmRinging(false);
      setIsPastTolerance(false);
      stopContinuousAlarmSound();
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
        setIsAlarmRinging(false);
        setIsPastTolerance(false);
        stopContinuousAlarmSound();
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
        setIsAlarmRinging(false);
        setIsPastTolerance(true);
        stopContinuousAlarmSound();
        if (todayStatus === 'pending') {
          onAutoMissed?.();
        }
        return;
      }

      // 2. Exact Reminder Window (from scheduled time up to 60 mins tolerance)
      if (diffMinutes >= 0 && diffMinutes <= toleranceMinutes) {
        setIsReminderActive(true);
        setIsPastTolerance(false);

        const dismissKey = `dismissed_${userId || 'user'}_${todayStr}_${schedule.time}`;
        const isDismissed =
          dismissedKeysRef.current.has(dismissKey) ||
          (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(dismissKey) === 'true');

        if (!isDismissed) {
          setIsAlarmRinging(true);
          startContinuousAlarmSound();

          const notifiedKey = `notified_${userId || 'user'}_${todayStr}_${schedule.time}`;
          if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(notifiedKey)) {
            sessionStorage.setItem(notifiedKey, '1');
            showSystemNotification('Waktunya Minum TTD! 🌸', {
              body: `Waktu minum ${schedule.tabletName || 'Tablet Tambah Darah'} (${schedule.time} WIB) telah tiba. Yuk minum sekarang!`,
              url: '/user/dashboard',
              requireInteraction: true,
            });
          }
        }
        return;
      }

      // 3. Early Reminder Window (15 minutes before)
      if (schedule.remind15MinBefore && diffMinutes >= -15 && diffMinutes < 0) {
        setIsReminderActive(false);
        setIsAlarmRinging(false);
        setIsPastTolerance(false);

        const earlyKey = `early_${userId || 'user'}_${todayStr}_${schedule.time}`;
        if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(earlyKey)) {
          sessionStorage.setItem(earlyKey, '1');
          showSystemNotification('15 Menit Menuju Minum TTD 🌸', {
            body: `Persiapkan ${schedule.tabletName || 'TTD'}. Waktu minum dalam 15 menit (${schedule.time} WIB).`,
            url: '/user/dashboard',
          });
        }
        return;
      }

      setIsReminderActive(false);
      setIsAlarmRinging(false);
      setIsPastTolerance(false);
      stopContinuousAlarmSound();
    };

    checkSchedule();

    // High frequency interval (2.5 seconds) for real-time responsiveness without lag
    const timer = setInterval(checkSchedule, 2500);

    return () => {
      clearInterval(timer);
      stopContinuousAlarmSound();
    };
  }, [schedule, todayStatus, userId, onAutoMissed]);

  return {
    isReminderActive,
    isAlarmRinging,
    isPastTolerance,
    dismissAlarm,
    confirmTaken,
  };
}
