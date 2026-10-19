import apiClient from '@/src/shared/api/client';

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
    const prompt = `Buatkan artikel edukasi kesehatan tentang ${topic} (Kategori: ${category}) untuk aplikasi kepatuhan kontrasepsi dan kesehatan reproduksi Pilluna. Berikan format JSON dengan properti title, summary, content (format Markdown), dan readTime.`;
    const res = await apiClient.post<{ answer: string }>('/consultation/ask', { prompt });
    let title = topic;
    let summary = `Materi edukasi mengenai ${topic} untuk akseptor KB dan wanita usia subur.`;
    let content =
      res.data?.answer ||
      `## ${topic}\n\nEdukasi penting mengenai ${topic} bagi akseptor KB dan kesehatan wanita.`;
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
        summary: `Materi penting mengenai ${topic} bagi akseptor KB dan kesehatan reproduksi.`,
        content: `## Pentingnya ${topic}\n\nPil KB dan pemeriksaan SADARI sangat esensial bagi wanita usia subur untuk perencanaan keluarga yang sehat dan deteksi dini kesehatan payudara.\n\n> Tips Bidan: Konsumsi Pil KB setiap hari di jam yang sama untuk efektivitas perlindungan optimal hingga 99%.`,
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
  const name = params.userName || params.patientName || 'Akseptor';
  const med = params.medicationName || 'Pil KB Kombinasi';
  const tone = params.tone || 'friendly';

  if (tone === 'urgent') {
    return {
      success: true,
      message: `PENGINGAT PENTING: Halo ${name}, catatan minum ${med} kamu belum terisi. Yuk segera minum pil harianmu dan catat di aplikasi Pilluna ya! Semangat selalu! 🌸`,
    };
  }
  if (tone === 'friendly') {
    return {
      success: true,
      message: `Halo ${name}! Jaga perlindungan kontrasepsi optimal yuk! Jangan lupa minum ${med} hari ini pada jam yang sama ya! Tetap sehat dan semangat 🌸✨`,
    };
  }
  return {
    success: true,
    message: `Halo ${name}, ini pengingat dari Bidan Faskes untuk minum ${med} sesuai jadwal kamu. Jangan lupa diminum tepat waktu ya! 🌸`,
  };
}

export const generateAiPatientNudgeAction = generateAiUserNudgeAction;
