import { config } from '../../config/env.js';

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const GEMINI_MODEL = 'gemini-3.8-flash';

const TEMANI_SYSTEM_PROMPT = `
Kamu adalah "Teman — Konselor AI Kesehatan Pranikah & Imunisasi TT" (Aplikasi TEMANI — Teknologi Edukasi Pranikah dan Pemantauan Imunisasi Tetanus, Program Kesehatan Pranikah Kemenkes RI).
Tugas utamamu adalah:
1. Menjawab pertanyaan calon pengantin (catin wanita maupun pria) seputar Imunisasi Tetanus Toxoid (TT), jadwal 5 dosis TT (TT1 hingga TT5), masa perlindungan imunisasi, dan persiapan kesehatan reproduksi pranikah.
2. Menjelaskan secara akurat aturan klinis Kemenkes RI: TT1 (skrining awal), TT2 (min. 4 minggu setelah TT1, proteksi 3 tahun, wajib min. 1 bulan sebelum nikah), TT3 (min. 6 bulan pasca TT2, proteksi 5 tahun), TT4 (min. 1 tahun pasca TT3, proteksi 10 tahun), TT5 (min. 1 tahun pasca TT4, proteksi seumur hidup >25 tahun / Status T Lengkap).
3. Memberikan panduan skrining fisik catin: Cek Hb (mencegah anemia ibu hamil dan stunting bayi), Lingkar Lengan Atas (LILA min. 23.5 cm), Golongan Darah & Rhesus, serta edukasi gizi pra-konsepsi (asam folat & zat besi).
4. Menenangkan calon pengantin tentang efek samping pasca suntik (KIPI) seperti nyeri lokal ringan pada lengan atas yang wajar dan hilang dalam 1-2 hari.
5. Bersikap profesional, santun, ilmiah, ramah, dan solutif. Format jawaban dengan markdown rapi. Jangan menggunakan kata "siswi" atau "UKS", gunakan sapaan "Calon Pengantin" atau nama depan pengguna secara hangat.
`;

export interface UserConsultationContext {
  name?: string;
  schoolOrOrg?: string;
  hbLevel?: number;
  gender?: string;
}

export class ConsultationService {
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
            'Halo Calon Pengantin! Terima kasih telah berkonsultasi. Imunisasi Tetanus Toxoid (TT) pranikah sangat penting untuk mencegah infeksi tetanus maternal dan tetanus neonatorum pada bayi. Vaksin TT2 wajib diselesaikan minimal 1 bulan sebelum hari pernikahan Anda agar daya tahan antibodi protektif terbentuk optimal. Bila Anda membutuhkan verifikasi surat keterangan sehat, silakan kunjungi Puskesmas rujukan Anda.',
        };
      }

      const contextDetails: string[] = [];
      if (userContext?.name?.trim()) {
        contextDetails.push(
          `Calon pengantin yang sedang berkonsultasi bernama "${userContext.name.trim()}". Sapalah dengan nama depannya secara hangat (misal: "Halo ${userContext.name.trim().split(' ')[0]}").`,
        );
      } else {
        contextDetails.push(
          `Sapalah pasien dengan ramah dan sopan menggunakan panggilan "Calon Pengantin".`,
        );
      }

      if (userContext?.schoolOrOrg?.trim()) {
        contextDetails.push(`Faskes rujukan / domisili catin: ${userContext.schoolOrOrg.trim()}.`);
      }

      if (userContext?.hbLevel) {
        contextDetails.push(`Kadar Hb lab terakhir: ${userContext.hbLevel} g/dL.`);
      }

      const dynamicSystemPrompt = `${TEMANI_SYSTEM_PROMPT}\n6. ${contextDetails.join(' ')}`;
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
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${config.geminiApiKey}`,
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
            'Halo! 🌸 Imunisasi Tetanus Toxoid (TT) sangat penting bagi calon pengantin untuk mencegah infeksi tetanus pada ibu dan bayi kelak. Kunjungi Puskesmas atau fasilitas kesehatan terdekat untuk mendapatkan skrining status TT (TT1–TT5) serta sertifikat imunisasi pranikah!',
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
          'Halo! 🌸 Terjadi kendala koneksi ke server AI, namun ingat pesan penting ini: Lengkapi status imunisasi Tetanus Toxoid (TT1–TT5) di fasilitas kesehatan terdekat untuk perlindungan optimal dan syarat administrasi pernikahan di KUA. Tetap semangat mempersiapkan pernikahan sehatmu ya!',
      };
    }
  }

  static async generateArticleDraft(topic: string, category: string) {
    if (!config.geminiApiKey) {
      return {
        success: true,
        data: {
          title: `Panduan Sehat: ${topic}`,
          summary: `Edukasi penting seputar ${topic} untuk calon pengantin dan persiapan kehamilan sehat.`,
          content: `## Pendahuluan\n${topic} merupakan hal krusial dalam menjaga kebugaran calon pengantin sehari-hari.\n\n## Langkah Pencegahan\n- Rutin konsumsi Tablet Tambah Darah (TTD)\n- Pastikan status imunisasi Tetanus Toxoid (TT) lengkap\n- Istirahat cukup dan jaga asupan gizi seimbang`,
          readTime: '3 min read',
        },
      };
    }

    try {
      const prompt = `
Buatkan draf artikel edukasi kesehatan lengkap dan menarik untuk aplikasi TEMANI (Program Imunisasi Tetanus Toxoid & Kesehatan Calon Pengantin).
Topik: "${topic}"
Kategori: "${category}"
Target Pembaca: Calon pengantin (catin) wanita dan pria, kader posyandu/Puskesmas, serta konselor KUA.

Berikan output dalam format JSON valid persis seperti ini:
{
  "title": "Judul artikel yang menarik dan edukatif",
  "summary": "Ringkasan 1-2 kalimat pengantar untuk kartu artikel",
  "content": "Isi artikel lengkap dalam format Markdown standar. Gunakan ## untuk Sub-Judul, - untuk Poin/List, dan > Tips Catin: untuk highlight kotak tips penting.",
  "readTime": "3 min read"
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${config.geminiApiKey}`,
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
          summary: `Tips dan panduan penting seputar ${topic} bagi calon pengantin.`,
          content: `## Mengenal ${topic}\nInformasi komprehensif mengenai pentingnya imunisasi Tetanus Toxoid (TT) dan kesehatan reproduksi bagi calon pengantin.`,
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
    const fallbackMessage = `Halo ${name}! 🌸 Pengingat jadwal ${params.medicationName} (${params.dosage}) jam ${params.timeSlot}. Mari lengkapi imunisasi TT pranikah! ✨`;

    if (!config.geminiApiKey) {
      return { success: true, message: fallbackMessage };
    }

    try {
      const prompt = `
Tuliskan 1 pesan pengingat WhatsApp singkat (2-3 kalimat) dari Petugas Faskes / KUA TEMANI untuk calon pengantin berikut:
- Nama Calon Pengantin: ${name}
- Layanan/Imunisasi: ${params.medicationName} (${params.dosage})
- Waktu Kunjungan: ${params.timeSlot}
- Tingkat Kepatuhan: ${params.adherenceRate || 80}%
- Nada Pesan: ${params.tone || 'motivational'}

Pesan harus ramah, menyemangati, ada emotikon hangat, dan mengingatkan pentingnya melengkapi dosis imunisasi TT pranikah tepat waktu. Berikan hanya teks pesannya saja.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${config.geminiApiKey}`,
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
