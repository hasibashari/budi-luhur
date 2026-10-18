import apiClient, { extractErrorMessage } from '@/src/shared/api/client';
import { AdminNudge } from '../types';

export async function getUserScheduleAction(_userId?: string) {
  try {
    const response = await apiClient.get('/schedules');
    return response.data;
  } catch {
    return null;
  }
}

export async function updateUserScheduleSettingsAction(
  scheduleId: string,
  data: {
    dayOfWeek?: string;
    time?: string;
    timeSlot?: string;
    remind15MinBefore?: boolean;
    isEnabled?: boolean;
    tabletName?: string;
    dosage?: string;
    instructions?: string;
  },
) {
  try {
    const response = await apiClient.put(`/schedules/${scheduleId}`, data);
    return { success: true, data: response.data };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

export async function getActiveNudgeAction(_userId?: string): Promise<AdminNudge | null> {
  try {
    const response = await apiClient.get<AdminNudge | null>('/schedules/nudges/active');
    return response.data;
  } catch {
    return null;
  }
}

export async function dismissNudgeAction(nudgeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.post(`/schedules/nudges/${nudgeId}/dismiss`);
    return { success: true, ...response.data };
  } catch (err: any) {
    return { success: false, error: extractErrorMessage(err) };
  }
}
