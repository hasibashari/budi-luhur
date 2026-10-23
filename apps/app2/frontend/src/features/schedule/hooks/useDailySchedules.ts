import { useState, useEffect, useCallback } from 'react';
import { DailySchedule, CreateDailySchedulePayload, UpdateDailySchedulePayload } from '../types';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getDailySchedulesAction,
  createDailyScheduleAction,
  updateDailyScheduleAction,
  toggleDailyScheduleAction,
  deleteDailyScheduleAction,
} from '../api/scheduleRepository';

/**
 * Beri tahu hook pengingat (`useDailyScheduleReminders`) bahwa jadwal berubah,
 * baik di tab yang sama (window event) maupun tab lain (realtime event).
 */
function notifySchedulesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('schedule:updated'));
  }
  publishRealtimeEvent('SCHEDULE_UPDATED');
}

interface UseDailySchedulesReturn {
  schedules: DailySchedule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSchedule: (
    payload: CreateDailySchedulePayload,
  ) => Promise<{ success: boolean; error?: string }>;
  updateSchedule: (
    id: string,
    payload: UpdateDailySchedulePayload,
  ) => Promise<{ success: boolean; error?: string }>;
  toggleSchedule: (id: string, isEnabled: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteSchedule: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function useDailySchedules(): UseDailySchedulesReturn {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailySchedulesAction();
      setSchedules(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat jadwal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = useCallback(
    async (payload: CreateDailySchedulePayload) => {
      const result = await createDailyScheduleAction(payload);
      if (result.success) {
        await fetchSchedules();
        notifySchedulesChanged();
      }
      return { success: result.success, error: result.error };
    },
    [fetchSchedules],
  );

  const updateSchedule = useCallback(async (id: string, payload: UpdateDailySchedulePayload) => {
    const result = await updateDailyScheduleAction(id, payload);
    if (result.success) {
      // Map timeSlot → time untuk state lokal (DailySchedule menggunakan `time`)
      const stateUpdate: Partial<import('../types').DailySchedule> = {
        ...payload,
        ...(payload.timeSlot !== undefined ? { time: payload.timeSlot } : {}),
      };
      setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...stateUpdate } : s)));
      notifySchedulesChanged();
    }
    return { success: result.success, error: result.error };
  }, []);

  const toggleSchedule = useCallback(async (id: string, isEnabled: boolean) => {
    // Optimistic update
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, isEnabled } : s)));
    const result = await toggleDailyScheduleAction(id, isEnabled);
    if (!result.success) {
      // Rollback jika gagal
      setSchedules(prev => prev.map(s => (s.id === id ? { ...s, isEnabled: !isEnabled } : s)));
    } else {
      notifySchedulesChanged();
    }
    return { success: result.success, error: result.error };
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    const result = await deleteDailyScheduleAction(id);
    if (result.success) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      notifySchedulesChanged();
    }
    return { success: result.success, error: result.error };
  }, []);

  return {
    schedules,
    loading,
    error,
    refetch: fetchSchedules,
    createSchedule,
    updateSchedule,
    toggleSchedule,
    deleteSchedule,
  };
}
