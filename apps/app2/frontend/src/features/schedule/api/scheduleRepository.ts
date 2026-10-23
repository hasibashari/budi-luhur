import apiClient, { extractErrorMessage } from '@/src/shared/api/client';
import {
  AdminNudge,
  DailySchedule,
  CreateDailySchedulePayload,
  UpdateDailySchedulePayload,
  ScheduleActionResult,
} from '../types';

/**
 * Ambil semua jadwal harian milik user yang sedang login.
 */
export async function getDailySchedulesAction(): Promise<DailySchedule[]> {
  try {
    const response = await apiClient.get<DailySchedule | DailySchedule[]>('/schedules');
    const data = response.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

/**
 * Buat jadwal harian baru.
 */
export async function createDailyScheduleAction(
  payload: CreateDailySchedulePayload,
): Promise<ScheduleActionResult> {
  try {
    const response = await apiClient.post<DailySchedule>('/schedules', {
      title: payload.title,
      timeSlot: payload.timeSlot,
      isEnabled: payload.isEnabled ?? true,
      notes: payload.notes ?? '',
      remind15MinBefore: payload.remind15MinBefore ?? true,
      frequency: 'daily', // App 2 selalu harian
    });
    return { success: true, data: response.data };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Perbarui jadwal harian berdasarkan ID.
 */
export async function updateDailyScheduleAction(
  scheduleId: string,
  payload: UpdateDailySchedulePayload,
): Promise<ScheduleActionResult> {
  try {
    const response = await apiClient.put<DailySchedule>(`/schedules/${scheduleId}`, payload);
    return { success: true, data: response.data };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Toggle status aktif/nonaktif jadwal.
 */
export async function toggleDailyScheduleAction(
  scheduleId: string,
  isEnabled: boolean,
): Promise<ScheduleActionResult> {
  return updateDailyScheduleAction(scheduleId, { isEnabled });
}

/**
 * Hapus jadwal harian berdasarkan ID.
 */
export async function deleteDailyScheduleAction(
  scheduleId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.delete(`/schedules/${scheduleId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

// ─── Admin Nudge Actions (digunakan oleh DashboardView) ──────────────────────

/**
 * Ambil nudge aktif dari admin untuk user yang sedang login.
 */
export async function getActiveNudgeAction(_userId?: string): Promise<AdminNudge | null> {
  try {
    const response = await apiClient.get<AdminNudge | null>('/schedules/nudges/active');
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Dismiss/tutup nudge berdasarkan ID.
 */
export async function dismissNudgeAction(
  nudgeId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.post(`/schedules/nudges/${nudgeId}/dismiss`);
    return { success: true, ...response.data };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}
