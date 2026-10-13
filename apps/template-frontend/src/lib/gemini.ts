import apiClient from '@/src/shared/api/client';

export interface AskGeminiResult {
  success: boolean;
  answer: string;
}

export async function askGeminiConsultationAction(
  prompt: string,
  history?: any,
  userContext?: any,
): Promise<AskGeminiResult> {
  try {
    const response = await apiClient.post<{ answer: string }>('/consultation/ask', {
      prompt,
      history,
      userContext,
    });
    return {
      success: true,
      answer: response.data.answer,
    };
  } catch (error: any) {
    console.error('Gemini Consultation Error:', error);
    return {
      success: false,
      answer:
        'Halo siswi hebat! Saat ini layanan asisten kesehatan sedang sibuk. Pastikan kamu tetap mengonsumsi Tablet Tambah Darah (TTD) sesuai jadwal dan istirahat yang cukup ya! 🌸',
    };
  }
}

export default askGeminiConsultationAction;
