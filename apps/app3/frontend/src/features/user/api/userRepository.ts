import apiClient from '@/src/shared/api/client';
import {
  UserProfile,
  UserScheduleData,
  UserDashboardData,
  StreakResult,
  ImmunizationRecord,
  ImmunizationInput,
  ImmunizationMutationResult,
  ImmunizationValidationResult,
  CertificateVerification,
} from '../types';

export type { UserProfile, UserScheduleData, UserDashboardData, StreakResult };
export type {
  ImmunizationRecord,
  ImmunizationInput,
  ImmunizationMutationResult,
  CertificateVerification,
};

export async function getImmunizationRecordsAction(): Promise<ImmunizationRecord[]> {
  const response = await apiClient.get<ImmunizationRecord[]>('/users/immunizations');
  return response.data;
}

/** Dry-run: cek interval tanggal tanpa menyimpan. */
export async function validateImmunizationRecordAction(
  data: Partial<ImmunizationInput> & { excludeRecordId?: string },
): Promise<ImmunizationValidationResult> {
  const response = await apiClient.post<ImmunizationValidationResult>(
    '/users/immunizations/validate',
    data,
  );
  return response.data;
}

export async function saveImmunizationRecordAction(
  data: ImmunizationInput,
): Promise<ImmunizationMutationResult> {
  const response = await apiClient.post<ImmunizationMutationResult>('/users/immunizations', data);
  return response.data;
}

export async function updateImmunizationRecordAction(
  id: string,
  data: Partial<ImmunizationInput>,
): Promise<ImmunizationMutationResult> {
  const response = await apiClient.put<ImmunizationMutationResult>(
    `/users/immunizations/${id}`,
    data,
  );
  return response.data;
}

export async function deleteImmunizationRecordAction(
  id: string,
): Promise<{ success: boolean; ttStatus: string }> {
  const response = await apiClient.delete<{ success: boolean; ttStatus: string }>(
    `/users/immunizations/${id}`,
  );
  return response.data;
}

const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export function validateAttachmentFile(file: File): string | null {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    return 'Format berkas harus JPG, PNG, WEBP, atau PDF.';
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return 'Ukuran berkas maksimal 3 MB.';
  }
  if (file.size === 0) {
    return 'Berkas kosong tidak dapat diunggah.';
  }
  return null;
}

export async function uploadImmunizationAttachmentAction(
  recordId: string,
  file: File,
): Promise<{ success: boolean; attachmentUrl: string }> {
  const response = await apiClient.put<{ success: boolean; attachmentUrl: string }>(
    `/users/immunizations/${recordId}/attachment`,
    file,
    {
      headers: {
        'Content-Type': file.type,
        'X-File-Name': encodeURIComponent(file.name),
      },
      transformRequest: data => data,
    },
  );
  return response.data;
}

export async function getImmunizationAttachmentAction(recordId: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(`/users/immunizations/${recordId}/attachment`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function deleteImmunizationAttachmentAction(
  recordId: string,
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/users/immunizations/${recordId}/attachment`,
  );
  return response.data;
}

export async function getCertificateVerificationAction(): Promise<CertificateVerification> {
  const response = await apiClient.get<CertificateVerification>('/users/certificate');
  return response.data;
}

/** Pengguna hanya mengajukan; persetujuan dilakukan admin. */
export async function requestCertificateVerificationAction(
  note?: string,
): Promise<{ success: boolean; status: string }> {
  const response = await apiClient.post<{ success: boolean; status: string }>(
    '/users/certificate/request',
    { note },
  );
  return response.data;
}

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
    const response = await apiClient.post('/consumption/record', { status, notes, date });
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
