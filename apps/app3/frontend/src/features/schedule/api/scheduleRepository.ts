import apiClient, { extractErrorMessage } from '@/src/shared/api/client';
import {
  AdminNudge,
  CreateTTSchedulePayload,
  ScheduleActionResult,
  TTStage,
  TTSchedule,
  UpdateTTSchedulePayload,
} from '../types';

const STAGE_ORDER: Record<TTStage, number> = {
  TT1: 1,
  TT2: 2,
  TT3: 3,
  TT4: 4,
  TT5: 5,
};

/** Normalisasi response backend (camelCase/snake_case) menjadi `TTSchedule`. */
function normalizeSchedule(raw: any): TTSchedule {
  const stage = (raw?.stage || raw?.ttLevel || raw?.tt_level || raw?.doseLevel || 'TT1') as TTStage;
  const rawStatus = String(raw?.status || '').toLowerCase();
  const status =
    raw?.isCompleted === true || rawStatus === 'completed' || raw?.status === 'Selesai'
      ? 'completed'
      : 'pending';

  return {
    id: raw?.id || '',
    patientId: raw?.patientId || raw?.patient_id || raw?.userId || raw?.user_id || '',
    stage,
    title: raw?.title || raw?.tabletName || raw?.tablet_name || `Imunisasi ${stage}`,
    scheduledDate:
      raw?.scheduledDate || raw?.scheduled_date || raw?.date || raw?.nextDate || '',
    time: raw?.time || raw?.timeSlot || raw?.time_slot || '09:00',
    dosage: raw?.dosage || '1 dosis (0.5 mL)',
    notes: raw?.notes ?? raw?.instructions ?? '',
    status,
    isEnabled: raw?.isEnabled ?? raw?.is_enabled ?? true,
    remind15MinBefore: raw?.remind15MinBefore ?? raw?.remind_15min_before ?? true,
    remind1MonthBefore: raw?.remind1MonthBefore ?? raw?.remind_1month_before ?? false,
    remind1DayBefore: raw?.remind1DayBefore ?? raw?.remind_1day_before ?? true,
    remind30MinBefore: raw?.remind30MinBefore ?? raw?.remind_30min_before ?? true,
    completedAt: raw?.completedAt ?? raw?.completed_at ?? null,
    createdAt: raw?.createdAt ?? raw?.created_at,
    updatedAt: raw?.updatedAt ?? raw?.updated_at,
  };
}

function sortSchedules(schedules: TTSchedule[]): TTSchedule[] {
  return [...schedules].sort((a, b) => {
    const byDate = a.scheduledDate.localeCompare(b.scheduledDate);
    if (byDate !== 0) return byDate;
    return STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
  });
}

/** Ambil seluruh jadwal imunisasi TT milik user yang sedang login. */
export async function getTTSchedulesAction(): Promise<TTSchedule[]> {
  try {
    const response = await apiClient.get<TTSchedule | TTSchedule[] | null>('/schedules/list');
    const data = response.data;
    if (!data) return [];
    const list = Array.isArray(data) ? data : [data];
    return sortSchedules(list.filter(Boolean).map(normalizeSchedule));
  } catch {
    return [];
  }
}

/** Buat jadwal imunisasi TT baru. */
export async function createTTScheduleAction(
  payload: CreateTTSchedulePayload,
): Promise<ScheduleActionResult> {
  try {
    const response = await apiClient.post('/schedules', {
      stage: payload.stage,
      scheduledDate: payload.scheduledDate,
      timeSlot: payload.timeSlot,
      dosage: payload.dosage ?? '1 dosis (0.5 mL)',
      notes: payload.notes ?? '',
      remind15MinBefore: payload.remind15MinBefore ?? true,
      remind1MonthBefore: payload.remind1MonthBefore ?? false,
      remind1DayBefore: payload.remind1DayBefore ?? true,
      remind30MinBefore: payload.remind30MinBefore ?? true,
      isEnabled: payload.isEnabled ?? true,
    });
    return { success: true, data: normalizeSchedule(response.data) };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/** Perbarui jadwal imunisasi TT berdasarkan ID. */
export async function updateTTScheduleAction(
  scheduleId: string,
  payload: UpdateTTSchedulePayload,
): Promise<ScheduleActionResult> {
  try {
    const response = await apiClient.put(`/schedules/${scheduleId}`, payload);
    return { success: true, data: normalizeSchedule(response.data) };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/** Aktifkan / nonaktifkan pengingat jadwal. */
export async function toggleTTScheduleAction(
  scheduleId: string,
  isEnabled: boolean,
): Promise<ScheduleActionResult> {
  return updateTTScheduleAction(scheduleId, { isEnabled });
}

/** Tandai jadwal sebagai selesai (sudah divaksin) atau kembalikan ke pending. */
export async function completeTTScheduleAction(
  scheduleId: string,
  completed: boolean,
): Promise<ScheduleActionResult> {
  return updateTTScheduleAction(scheduleId, { status: completed ? 'completed' : 'pending' });
}

/** Hapus jadwal imunisasi TT (soft delete di backend). */
export async function deleteTTScheduleAction(
  scheduleId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.delete(`/schedules/${scheduleId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

// ─── Admin Nudge Actions (dipakai DashboardView) ─────────────────────────────

export async function getActiveNudgeAction(_userId?: string): Promise<AdminNudge | null> {
  try {
    const response = await apiClient.get<AdminNudge | null>('/schedules/nudges/active');
    return response.data;
  } catch {
    return null;
  }
}

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

