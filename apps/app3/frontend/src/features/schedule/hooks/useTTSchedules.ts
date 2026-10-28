import { useCallback, useEffect, useState } from 'react';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  completeTTScheduleAction,
  createTTScheduleAction,
  deleteTTScheduleAction,
  getTTSchedulesAction,
  toggleTTScheduleAction,
  updateTTScheduleAction,
} from '../api/scheduleRepository';
import {
  CreateTTSchedulePayload,
  TTSchedule,
  UpdateTTSchedulePayload,
} from '../types';

interface UseTTSchedulesReturn {
  schedules: TTSchedule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSchedule: (payload: CreateTTSchedulePayload) => Promise<{ success: boolean; error?: string }>;
  updateSchedule: (
    id: string,
    payload: UpdateTTSchedulePayload,
  ) => Promise<{ success: boolean; error?: string }>;
  toggleSchedule: (id: string, isEnabled: boolean) => Promise<{ success: boolean; error?: string }>;
  setCompleted: (id: string, completed: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteSchedule: (id: string) => Promise<{ success: boolean; error?: string }>;
}

/** Beri tahu hook pengingat bahwa jadwal berubah (tab ini & tab lain). */
function notifySchedulesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('schedule:updated'));
  }
  publishRealtimeEvent('SCHEDULE_UPDATED');
}

export function useTTSchedules(): UseTTSchedulesReturn {
  const [schedules, setSchedules] = useState<TTSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTTSchedulesAction();
      setSchedules(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat jadwal imunisasi TT.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = useCallback(
    async (payload: CreateTTSchedulePayload) => {
      const result = await createTTScheduleAction(payload);
      if (result.success) {
        await fetchSchedules();
        notifySchedulesChanged();
      }
      return { success: result.success, error: result.error };
    },
    [fetchSchedules],
  );

  const updateSchedule = useCallback(
    async (id: string, payload: UpdateTTSchedulePayload) => {
      const result = await updateTTScheduleAction(id, payload);
      if (result.success) {
        const stateUpdate: Partial<TTSchedule> = {
          stage: payload.stage,
          scheduledDate: payload.scheduledDate,
          time: payload.timeSlot,
          dosage: payload.dosage,
          notes: payload.notes,
          remind15MinBefore: payload.remind15MinBefore,
          remind1MonthBefore: payload.remind1MonthBefore,
          remind1DayBefore: payload.remind1DayBefore,
          remind30MinBefore: payload.remind30MinBefore,
          isEnabled: payload.isEnabled,
          status: payload.status,
        };
        setSchedules(prev =>
          prev.map(schedule =>
            schedule.id === id ? { ...schedule, ...stripUndefined(stateUpdate) } : schedule,
          ),
        );
        notifySchedulesChanged();
      }
      return { success: result.success, error: result.error };
    },
    [],
  );

  const toggleSchedule = useCallback(async (id: string, isEnabled: boolean) => {
    // Optimistic update
    setSchedules(prev =>
      prev.map(schedule => (schedule.id === id ? { ...schedule, isEnabled } : schedule)),
    );
    const result = await toggleTTScheduleAction(id, isEnabled);
    if (!result.success) {
      // Rollback jika gagal
      setSchedules(prev =>
        prev.map(schedule => (schedule.id === id ? { ...schedule, isEnabled: !isEnabled } : schedule)),
      );
    } else {
      notifySchedulesChanged();
    }
    return { success: result.success, error: result.error };
  }, []);

  const setCompleted = useCallback(async (id: string, completed: boolean) => {
    // Optimistic update
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === id
          ? { ...schedule, status: completed ? 'completed' : 'pending' }
          : schedule,
      ),
    );
    const result = await completeTTScheduleAction(id, completed);
    if (!result.success) {
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === id
            ? { ...schedule, status: completed ? 'pending' : 'completed' }
            : schedule,
        ),
      );
    } else {
      notifySchedulesChanged();
    }
    return { success: result.success, error: result.error };
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    const result = await deleteTTScheduleAction(id);
    if (result.success) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
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
    setCompleted,
    deleteSchedule,
  };
}

/** Buang key dengan nilai `undefined` agar state tidak tertimpa. */
function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as Partial<T>;
}

export default useTTSchedules;
