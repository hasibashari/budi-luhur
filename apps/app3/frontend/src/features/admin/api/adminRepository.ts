import apiClient from '@/src/shared/api/client';
import {
  AdminStats,
  ManagedUser,
  MedicationSchedule,
  ScheduleCategory,
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

export async function createScheduleAction(data: {
  userId?: string;
  patientId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  dayOfWeek?: string;
  timeSlots: string[];
  startDate?: string;
  endDate?: string;
  category?: ScheduleCategory | string;
  instructions?: string;
}): Promise<{ success: boolean; schedule?: MedicationSchedule; error?: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; schedule: MedicationSchedule }>(
      '/admin/schedules',
      data,
    );
    return { success: true, schedule: res.data.schedule };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function updateScheduleAction(
  scheduleId: string,
  data: Partial<MedicationSchedule>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.put(`/admin/schedules/${scheduleId}`, data);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function deleteScheduleAction(
  scheduleId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiClient.delete(`/admin/schedules/${scheduleId}`);
    return { success: true, ...res.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
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
