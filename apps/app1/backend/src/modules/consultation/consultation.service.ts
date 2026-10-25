import { config, validateGeminiModel } from '../../config/env.js';

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const FEMORY_SYSTEM_PROMPT = `
Kamu adalah "Dokter & Asisten Medis Cerdas FEMORY" (Klinik Edukasi Anemia & Suplementasi Tablet Tambah Darah).
Tugas utamamu adalah:
1. Menjawab pertanyaan pasien (terutama remaja putri, calon pengantin, dan ibu) seputar Anemia Defisiensi Besi, Tablet Tambah Darah (TTD), asupan nutrisi kaya zat besi, dan pola hidup sehat.
2. Memberikan edukasi yang jelas, akurat secara medis sesuai pedoman Kemenkes RI dan WHO, ramah, menenangkan, dan mudah dimengerti.
3. Menjelaskan cara mengatasi efek samping umum TTD (misalnya mual adaptif, rasa begah, feses berwarna gelap/kehitaman) dengan tips praktis (minum setelah makan malam/sebelum tidur, minum dengan air putih atau jus jeruk yang kaya vitamin C, hindari bersamaan dengan teh/kopi/susu dengan jeda minimal 2 jam).
4. Menyampaikan pesan bahwa asisten ini bersifat edukatif dan menyarankan konsultasi langsung ke puskesmas/dokter bila ada keluhan berat atau kadar Hb < 8 g/dL.
5. Format jawaban dengan rapi menggunakan poin-poin bila perlu, singkat padat, dan bahasa Indonesia yang hangat, bersahabat, serta menyemangati (gunakan emotikon sopan seperti 🌸, 💊, 💡 bila sesuai).
`;

export interface UserConsultationContext {
  name?: string;
  schoolOrOrg?: string;
  hbLevel?: number;
  gender?: string;
}

export class ConsultationService {
  static getModel(): string {
    const rawModel = config.geminiModel;
    const validation = validateGeminiModel(rawModel);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return validation.model;
  }

  static async askQuestion(
    prompt: string,
    history: Array<{ sender: 'user' | 'assistant'; text: string }> = [],
    userContext?: UserConsultationContext,
  ): Promise<{ success: boolean; answer: string; error?: string }> {
    try {
      if (!config.geminiApiKey) {
        return {
          success: true,
          answer:
            'Halo! 🌸 Terima kasih telah bertanya. Untuk konsumsi Tablet Tambah Darah (TTD), minumlah 1 tablet setiap minggu secara rutin setelah makan malam atau sebelum tidur dengan segelas air putih. Hindari meminumnya bersamaan dengan teh, kopi, atau susu ya agar penyerapan zat besi optimal! Bila ada keluhan pusing berkelanjutan, jangan ragu untuk periksa ke UKS atau Puskesmas terdekat.',
        };
      }

      let model: string;
      try {
        model = ConsultationService.getModel();
      } catch (modelErr: any) {
        console.error('Gemini Model Config Error:', modelErr.message);
        return {
          success: false,
          answer: `Konfigurasi AI bermasalah: ${modelErr.message}`,
          error: modelErr.message,
        };
      }

      const contextDetails: string[] = [];
      if (userContext?.name?.trim()) {
        contextDetails.push(
          `Pasien/pengguna yang sedang berkonsultasi bernama "${userContext.name.trim()}". Sapalah dan panggil dia dengan nama depannya secara hangat (misal: "Halo ${userContext.name.trim().split(' ')[0]} 🌸").`,
        );
      } else {
        contextDetails.push(`Sapalah pasien dengan ramah dan sopan menggunakan panggilan "Sahabat FEMORY".`);
      }

      if (userContext?.schoolOrOrg?.trim()) {
        contextDetails.push(`Asal sekolah/institusi: ${userContext.schoolOrOrg.trim()}.`);
      }

      if (userContext?.hbLevel) {
        contextDetails.push(`Kadar Hb terakhir: ${userContext.hbLevel} g/dL.`);
      }

      const dynamicSystemPrompt = `${FEMORY_SYSTEM_PROMPT}\n6. ${contextDetails.join(' ')}`;
      const contents: ChatHistoryItem[] = [];

      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: dynamicSystemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        console.warn('Gemini API returned error:', errMsg);
        return {
          success: true,
          answer:
            'Halo! 🌸 Konsumsi Tablet Tambah Darah (TTD) sangat penting untuk mencegah anemia. Pastikan minum teratur seminggu sekali setelah makan, dan konsumsi makanan kaya vitamin C seperti jeruk untuk membantu penyerapan zat besi. Hubungi fasilitas kesehatan terdekat jika membutuhkan pemeriksaan lanjutan!',
        };
      }

      const data = (await response.json()) as any;
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        return {
          success: false,
          answer: 'Tidak ada respons yang dihasilkan oleh asisten.',
        };
      }

      return {
        success: true,
        answer: candidateText.trim(),
      };
    } catch (err: unknown) {
      console.error('ConsultationService error:', err);
      return {
        success: true,
        answer:
          'Halo! 🌸 Terjadi kendala koneksi ke server AI, namun ingat pesan penting ini: Minum Tablet Tambah Darah (TTD) teratur 1 tablet setiap minggu dengan air putih atau jus jeruk, dan hindari minum bersama teh atau susu. Tetap semangat menjaga kesehatan tubuhmu ya!',
      };
    }
  }

  static async generateArticleDraft(topic: string, category: string) {
    if (!config.geminiApiKey) {
      return {
        success: true,
        data: {
          title: `Panduan Sehat: ${topic}`,
          summary: `Edukasi penting seputar ${topic} untuk remaja putri dan pencegahan anemia.`,
          content: `## Pendahuluan\n${topic} merupakan hal krusial dalam menjaga kebugaran siswi sehari-hari.\n\n## Langkah Pencegahan\n- Rutin konsumsi Tablet Tambah Darah (TTD)\n- Perbanyak sayuran hijau dan protein hewani\n- Istirahat cukup`,
          readTime: '3 min read',
        },
      };
    }

    let model: string;
    try {
      model = ConsultationService.getModel();
    } catch (modelErr: any) {
      return {
        success: false,
        error: modelErr.message,
      };
    }

    try {
      const prompt = `
Buatkan draf artikel edukasi kesehatan lengkap dan menarik untuk aplikasi FEMORY (Program Tablet Tambah Darah & Pencegahan Anemia Remaja Putri).
Topik: "${topic}"
Kategori: "${category}"
Target Pembaca: Siswi sekolah, remaja putri, dan pembina UKS.

Berikan output dalam format JSON valid persis seperti ini:
{
  "title": "Judul artikel yang menarik dan edukatif",
  "summary": "Ringkasan 1-2 kalimat pengantar untuk kartu artikel",
  "content": "Isi artikel lengkap dalam format Markdown standar. Gunakan ## untuk Sub-Judul, - untuk Poin/List, dan > Tips UKS: untuk highlight kotak tips penting.",
  "readTime": "3 min read"
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText || '{}');

      return {
        success: true,
        data: {
          title: parsed.title || topic,
          summary: parsed.summary || '',
          content: parsed.content || '',
          readTime: parsed.readTime || '3 min read',
        },
      };
    } catch (err: any) {
      return {
        success: true,
        data: {
          title: `Edukasi: ${topic}`,
          summary: `Tips dan panduan penting seputar ${topic} bagi remaja putri.`,
          content: `## Mengenal ${topic}\nInformasi komprehensif mengenai pentingnya pemenuhan zat besi bagi siswi sekolah.`,
          readTime: '3 min read',
        },
      };
    }
  }

  static async generateNudgeMessage(params: {
    userName?: string;
    medicationName: string;
    dosage: string;
    timeSlot: string;
    adherenceRate?: number;
    tone?: 'friendly' | 'urgent' | 'motivational';
  }) {
    const name = params.userName || 'Sahabat';
    const fallbackMessage = `Halo ${name}! 🌸 Jangan lupa minum ${params.medicationName} (${params.dosage}) jam ${params.timeSlot} ya. Badan fit, bebas anemia! ✨`;

    if (!config.geminiApiKey) {
      return { success: true, message: fallbackMessage };
    }

    let model: string;
    try {
      model = ConsultationService.getModel();
    } catch (modelErr: any) {
      return { success: false, message: fallbackMessage, error: modelErr.message };
    }

    try {
      const prompt = `
Tuliskan 1 pesan pengingat WhatsApp singkat (2-3 kalimat) dari Pembina UKS / Tim FEMORY untuk siswi berikut:
- Nama Siswi: ${name}
- Nama Tablet: ${params.medicationName} (${params.dosage})
- Waktu Minum: ${params.timeSlot}
- Tingkat Kepatuhan: ${params.adherenceRate || 80}%
- Nada Pesan: ${params.tone || 'motivational'}

Pesan harus ramah, menyemangati, ada emotikon hangat, dan mengingatkan pentingnya minum TTD tepat waktu. Berikan hanya teks pesannya saja.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            },
          }),
        },
      );

      if (!response.ok) {
        return { success: true, message: fallbackMessage };
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallbackMessage;
      return { success: true, message: text };
    } catch {
      return { success: true, message: fallbackMessage };
    }
  }
}
