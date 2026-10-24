import apiClient from '@/src/shared/api/client';
import {
  AdminStats,
  ManagedUser,
  MedicationSchedule,
  HealthArticle,
  ComplianceReport,
} from '../types/admin.types';

export async function getAdminStatsAction(): Promise<AdminStats> {
  try {
    const res = await apiClient.get<AdminStats>('/admin/stats');
    return res.data;
  } catch (err: any) {
    console.error('getAdminStatsAction error:', err);
    return {
      totalUsers: 0,
      activeSchedules: 0,
      adherenceRate: 90,
      publishedArticles: 0,
      activePrograms: 0,
    };
  }
}

export async function getUsersAction(): Promise<ManagedUser[]> {
  try {
    const res = await apiClient.get<ManagedUser[]>('/admin/users');
    return res.data || [];
  } catch (err: any) {
    console.error('getUsersAction error:', err);
    return [];
  }
}

export async function getUserByIdAction(userId: string): Promise<ManagedUser | null> {
  try {
    const res = await apiClient.get<ManagedUser>(`/admin/users/${userId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function createUserAction(data: {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  riskLevel?: string;
  schoolOrOrg?: string;
  medicalNotes?: string;
  weddingDate?: string;
  ttStatus?: string;
  kuaStatus?: string;
  partnerName?: string;
}): Promise<{ success: boolean; user?: ManagedUser; error?: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; user: ManagedUser }>('/admin/users', data);
    return { success: true, user: res.data.user };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function updateUserAction(
  userId: string,
  data: Partial<ManagedUser>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.put(`/admin/users/${userId}`, data);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function deleteUserAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function sendUserReminderAction(
  userId: string,
  message?: string,
  channel: string = 'app',
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.post('/admin/reminders/send', { userId, message, channel });
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function sendReminderNudgeAction(data: {
  userId?: string;
  patientId?: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  scheduleId?: string;
  medicationName?: string;
  dosage?: string;
  timeSlot?: string;
  message: string;
  channel: 'app' | 'whatsapp';
}): Promise<{ success: boolean; nudgeId?: string; error?: string }> {
  const targetId = data.userId || data.patientId;
  return sendUserReminderAction(targetId || '', data.message, data.channel);
}

export async function updateAdminProfileAction(
  dataOrId: any,
  data?: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = data !== undefined ? data : dataOrId;
    const res = await apiClient.put('/admin/profile', payload);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getSchedulesAction(): Promise<MedicationSchedule[]> {
  try {
    const res = await apiClient.get<MedicationSchedule[]>('/admin/schedules');
    return res.data || [];
  } catch (err: any) {
    console.error('getSchedulesAction error:', err);
    return [];
  }
}

export async function getScheduleByIdAction(
  scheduleId: string,
): Promise<MedicationSchedule | null> {
  try {
    const res = await apiClient.get<MedicationSchedule>(`/admin/schedules/${scheduleId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function getAdminArticlesAction(): Promise<HealthArticle[]> {
  try {
    const res = await apiClient.get<HealthArticle[]>('/admin/articles');
    return res.data || [];
  } catch (err: any) {
    console.error('getAdminArticlesAction error:', err);
    return [];
  }
}

export async function createAdminArticleAction(data: {
  title: string;
  category: string;
  summary: string;
  readTime?: string;
  status?: 'Terbit' | 'Draf';
  author?: string;
  imageUrl?: string;
  content?: string;
}): Promise<{ success: boolean; article?: HealthArticle; error?: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; article: HealthArticle }>(
      '/admin/articles',
      data,
    );
    return { success: true, article: res.data.article };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function updateAdminArticleAction(
  articleId: string,
  data: Partial<HealthArticle>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.put(`/admin/articles/${articleId}`, data);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function deleteAdminArticleAction(
  articleId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.delete(`/admin/articles/${articleId}`);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getComplianceReportsAction(): Promise<ComplianceReport[]> {
  try {
    const res = await apiClient.get<ComplianceReport[]>('/admin/compliance');
    return res.data || [];
  } catch (err: any) {
    console.error('getComplianceReportsAction error:', err);
    return [];
  }
}

export interface AdminCertificateRequest {
  userId: string;
  name: string;
  faskesName: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  certificateNumber: string | null;
  note: string | null;
  requestedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  signerName: string | null;
  signerSip: string | null;
  verifiedDoses: number;
  totalRecords: number;
}

export interface AdminUserImmunization {
  id: string;
  doseLevel: string;
  vaccineType: string;
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  infoSource?: string;
  datePrecision?: string;
  attachmentUrl?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationNote?: string | null;
}

export async function getCertificateRequestsAction(): Promise<AdminCertificateRequest[]> {
  try {
    const res = await apiClient.get<AdminCertificateRequest[]>('/admin/certificates');
    return res.data || [];
  } catch (err: any) {
    console.error('getCertificateRequestsAction error:', err);
    return [];
  }
}

export async function reviewCertificateAction(
  userId: string,
  payload: {
    status: 'APPROVED' | 'REJECTED';
    note?: string;
    signerName?: string;
    signerSip?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/admin/certificates/${userId}`, payload);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getUserImmunizationsAction(userId: string): Promise<AdminUserImmunization[]> {
  try {
    const res = await apiClient.get<AdminUserImmunization[]>(
      `/admin/users/${userId}/immunizations`,
    );
    return res.data || [];
  } catch (err: any) {
    console.error('getUserImmunizationsAction error:', err);
    return [];
  }
}

export async function verifyUserImmunizationAction(
  immunizationId: string,
  payload: {
    status: 'VERIFIED' | 'REJECTED';
    note?: string;
  },
): Promise<{ success: boolean; ttStatus?: string; error?: string }> {
  try {
    const res = await apiClient.patch(
      `/admin/immunizations/${immunizationId}/verification`,
      payload,
    );
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getAdminImmunizationAttachmentAction(recordId: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(`/admin/immunizations/${recordId}/attachment`, {
    responseType: 'blob',
  });
  return response.data;
}
