import apiClient from '@/src/shared/api/client';
import { UserProfile, UserScheduleData, UserDashboardData, StreakResult } from '../types';

export type { UserProfile, UserScheduleData, UserDashboardData, StreakResult };

export async function getUserDashboardDataAction(_userId?: string): Promise<UserDashboardData> {
  const response = await apiClient.get<UserDashboardData>('/users/dashboard');
  return response.data;
}

export async function getUserProfileAction(_userId?: string): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/profile');
  return response.data;
}

export async function updateUserProfileAction(
  _userId: string,
  data: Partial<UserProfile>,
): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
  try {
    const response = await apiClient.put('/users/profile', data);
    return { success: true, data: response.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function saveUserInitialSetupAction(
  _userId: string,
  data: Record<string, any>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.post('/users/setup', data);
    return { success: true, ...response.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function recordUserConsumptionAction(
  _userId: string,
  status: 'recorded' | 'missed' | 'pending',
  notes?: string,
  date?: string,
): Promise<{ success: boolean; streakCount: number; error?: string }> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const response = await apiClient.post('/consumption/record', {
      status,
      notes,
      date: targetDate,
      targetDate,
      scheduledDate: targetDate,
    });
    return {
      success: true,
      streakCount: response.data?.streakCount || 0,
      ...response.data,
    };
  } catch (err: any) {
    return { success: false, streakCount: 0, error: err.response?.data?.error || err.message };
  }
}

export async function getUserScheduleAction(_userId?: string): Promise<UserScheduleData | null> {
  try {
    const response = await apiClient.get<UserScheduleData>('/schedules');
    return response.data;
  } catch {
    return null;
  }
}

export async function createUserScheduleAction(
  _userId: string,
  data: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.post('/schedules', data);
    return { success: true, ...response.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function updateUserScheduleSettingsAction(
  scheduleId: string,
  data: any,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await apiClient.put(`/schedules/${scheduleId}`, data);
    return { success: true, data: response.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

