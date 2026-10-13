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

export async function generateAiArticleDraftAction(
  topic: string,
  category: string,
): Promise<{
  success: boolean;
  data?: {
    title: string;
    summary: string;
    content: string;
    readTime: string;
  };
  error?: string;
}> {
  try {
    const prompt = `Buatkan artikel edukasi kesehatan tentang ${topic} (Kategori: ${category}) untuk aplikasi edukasi gizi dan anemia remaja FEMORY. Berikan format JSON dengan properti title, summary, content (format Markdown), dan readTime.`;
    const res = await apiClient.post<{ answer: string }>('/consultation/ask', { prompt });
    let title = topic;
    let summary = `Materi edukasi mengenai ${topic} untuk pencegahan anemia remaja putri.`;
    let content = res.data?.answer || `## ${topic}\n\nEdukasi penting mengenai ${topic} bagi siswi dan remaja putri.`;
    let readTime = '3 min read';

    try {
      const match = res.data?.answer?.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.title) title = parsed.title;
        if (parsed.summary) summary = parsed.summary;
        if (parsed.content) content = parsed.content;
        if (parsed.readTime) readTime = parsed.readTime;
      }
    } catch {}

    return {
      success: true,
      data: { title, summary, content, readTime },
    };
  } catch (err: any) {
    return {
      success: true,
      data: {
        title: topic,
        summary: `Materi penting mengenai ${topic} bagi pencegahan anemia remaja.`,
        content: `## Pentingnya ${topic}\n\nTablet Tambah Darah (TTD) sangat esensial bagi remaja putri untuk menjaga konsentrasi belajar dan mencegah anemia defisiensi besi.\n\n> Tips UKS: Konsumsi TTD 1 tablet seminggu sekali secara teratur setelah makan.`,
        readTime: '3 min read',
      },
    };
  }
}

export async function generateAiUserNudgeAction(params: {
  userName?: string;
  patientName?: string;
  medicationName?: string;
  dosage?: string;
  timeSlot?: string;
  adherenceRate?: number;
  tone?: 'friendly' | 'urgent' | 'motivational';
}): Promise<{ success: boolean; message: string; error?: string }> {
  const name = params.userName || params.patientName || 'Siswi';
  const med = params.medicationName || 'Tablet Tambah Darah (TTD)';
  const tone = params.tone || 'friendly';

  if (tone === 'urgent') {
    return {
      success: true,
      message: `PENGINGAT PENTING: Halo ${name}, catatan minum ${med} kamu belum terisi minggu ini. Yuk segera minum suplemen TTD kamu dan catat di aplikasi FEMORY ya! Semangat selalu! 🌸`,
    };
  }
  if (tone === 'friendly') {
    return {
      success: true,
      message: `Halo ${name}! Cegah anemia biar tetap fit dan semangat belajar yuk! Jangan lupa minum ${med} hari ini ya! Tetap ceria selalu 🌸✨`,
    };
  }
  return {
    success: true,
    message: `Halo ${name}, ini pengingat dari UKS untuk minum ${med} sesuai jadwal kamu. Jangan lupa diminum setelah makan dengan air putih ya! 🌸`,
  };
}

export const generateAiPatientNudgeAction = generateAiUserNudgeAction;

export default askGeminiConsultationAction;
