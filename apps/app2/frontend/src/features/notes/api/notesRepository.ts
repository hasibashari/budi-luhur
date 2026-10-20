import apiClient, { extractErrorMessage } from '@/src/shared/api/client';
import { DailyHealthLog } from '@/src/shared/components/domain/SymptomHealthCard';

export async function getHealthLogsAction(): Promise<DailyHealthLog[]> {
  const response = await apiClient.get<DailyHealthLog[]>('/notes');
  return response.data || [];
}

export async function saveHealthLogAction(
  log: DailyHealthLog,
): Promise<{ success: boolean; log?: DailyHealthLog; error?: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; log: DailyHealthLog }>('/notes', log);
    return response.data;
  } catch (error) {
    return { success: false, error: extractErrorMessage(error) };
  }
}
