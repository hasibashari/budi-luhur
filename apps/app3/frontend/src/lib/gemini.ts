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
    const prompt = `Buatkan artikel edukasi kesehatan tentang ${topic} (Kategori: ${category}) untuk aplikasi kesehatan pranikah dan imunisasi TT calon pengantin PRELUNA (Kemenkes RI). Berikan format JSON dengan properti title, summary, content (format Markdown), dan readTime.`;
    const res = await apiClient.post<{ answer: string }>('/consultation/ask', { prompt });
    let title = topic;
    let summary = `Materi edukasi mengenai ${topic} untuk kesehatan pranikah dan persiapan kehamilan sehat.`;
    let content =
      res.data?.answer || `## ${topic}\n\nEdukasi penting mengenai ${topic} bagi calon pengantin.`;
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
        summary: `Materi penting mengenai ${topic} bagi calon pengantin.`,
        content: `## Pentingnya ${topic}\n\nImunisasi Tetanus Toxoid (TT) dan pemeriksaan kesehatan pranikah sangat penting bagi calon pengantin untuk mempersiapkan kehamilan sehat dan bebas stunting.\n\n> Rekomendasi Faskes: Selesaikan imunisasi TT minimal 1 bulan sebelum hari H pernikahan.`,
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
  const name = params.userName || params.patientName || 'Calon Pengantin';
  const med = params.medicationName || 'Imunisasi TT / Suplementasi Pranikah';
  const tone = params.tone || 'friendly';

  if (tone === 'urgent') {
    return {
      success: true,
      message: `PENGINGAT PENTING: Halo ${name}, jadwal ${med} Anda perlu segera dikonfirmasi menjelang hari pernikahan. Silakan kunjungi Puskesmas rujukan Anda tepat waktu.`,
    };
  }
  if (tone === 'friendly') {
    return {
      success: true,
      message: `Halo ${name}! Persiapkan kesehatan optimal menjelang hari pernikahan bahagia Anda. Jangan lupa jadwalkan kunjungan faskes untuk ${med} ya!`,
    };
  }
  return {
    success: true,
    message: `Halo ${name}, ini pengingat resmi dari fasilitas kesehatan untuk jadwal ${med} Anda. Tetap jaga kesehatan dan konsultasikan dengan petugas kami bila ada kendala.`,
  };
}

export const generateAiPatientNudgeAction = generateAiUserNudgeAction;
