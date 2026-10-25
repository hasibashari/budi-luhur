import { config, validateGeminiModel } from '../../config/env.js';
import db from '../../config/database.js';

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ArticleReference {
  id: string;
  title: string;
  category: string;
}

export interface RelevantArticle extends ArticleReference {
  summary: string;
  leadParagraph?: string;
  score: number;
}

const INDONESIAN_STOP_WORDS = new Set([
  'dan',
  'atau',
  'yang',
  'untuk',
  'pada',
  'ke',
  'di',
  'dari',
  'ini',
  'itu',
  'saya',
  'kamu',
  'anda',
  'dia',
  'kita',
  'mereka',
  'apa',
  'apakah',
  'bagaimana',
  'kapan',
  'kenapa',
  'mengapa',
  'dimana',
  'bisa',
  'ada',
  'tidak',
  'bukan',
  'halo',
  'hai',
  'tolong',
  'tanya',
  'mau',
  'dong',
  'ya',
  'kah',
  'saja',
  'juga',
  'dengan',
  'tentang',
  'seperti',
  'harus',
  'agar',
  'supaya',
  'akan',
  'sudah',
  'cara',
  'membuat',
  'bikin',
  'buat',
  'langkah',
  'tips',
  'trik',
  'hal',
  'oleh',
  'adalah',
  'merupakan',
  'sebuah',
  'suatu',
  'siapa',
  'kalian',
]);

export async function findRelevantArticles(
  query: string,
  maxResults = 3,
): Promise<RelevantArticle[]> {
  try {
    const res = await db.query<{
      id: string;
      title: string;
      category: string;
      summary: string;
      lead_paragraph: string | null;
      tags: string | null;
    }>(
      `SELECT id, title, category, summary, lead_paragraph, tags 
       FROM articles 
       WHERE status = 'Terbit'`,
    );

    const terms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 3 && !INDONESIAN_STOP_WORDS.has(t));

    if (terms.length === 0) return [];

    const scored: RelevantArticle[] = [];
    for (const art of res.rows) {
      let score = 0;
      const titleLower = (art.title || '').toLowerCase();
      const catLower = (art.category || '').toLowerCase();
      const sumLower = (art.summary || '').toLowerCase();
      const leadLower = (art.lead_paragraph || '').toLowerCase();
      const tagsLower = (art.tags || '').toLowerCase();

      for (const term of terms) {
        if (titleLower.includes(term)) score += 6;
        if (catLower.includes(term)) score += 3;
        if (tagsLower.includes(term)) score += 4;
        if (sumLower.includes(term)) score += 2;
        if (leadLower.includes(term)) score += 1;
      }

      if (score >= 3) {
        scored.push({
          id: art.id,
          title: art.title.trim(),
          category: art.category.trim(),
          summary: art.summary.trim(),
          leadParagraph: art.lead_paragraph?.trim() || undefined,
          score,
        });
      }
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, maxResults);
  } catch (err) {
    console.error('Error finding relevant articles:', err);
    return [];
  }
}

const FEMORY_BASE_PROMPT = `
Kamu adalah "Dokter & Asisten Medis Cerdas FEMORY" (Klinik Edukasi Anemia & Suplementasi Tablet Tambah Darah).
Tugas utamamu adalah membantu pengguna (terutama remaja putri dan sasaran program) memahami pencegahan anemia dan kepatuhan konsumsi Tablet Tambah Darah (TTD).

PANDUAN UTAMA KONSUMSI TTD (KEMENKES RI & WHO):
1. Aturan Rutin: Remaja putri dianjurkan mengonsumsi 1 tablet TTD setiap minggu secara teratur sepanjang tahun.
2. Waktu Terbaik: Diminum malam hari setelah makan malam atau sebelum tidur untuk meminimalkan rasa mual adaptif lambung.
3. Pendukung Penyerapan: Minum dengan segelas air putih atau jus buah yang kaya vitamin C (seperti jeruk, jambu biji) yang meningkatkan penyerapan zat besi.
4. Penghambat Penyerapan (Wajib Jeda 2 Jam): JANGAN meminum TTD bersamaan dengan teh, kopi, susu, atau antasida (obat maag), karena zat tanin dan kalsium menghambat penyerapan zat besi. Berikan jeda waktu minimal 2 jam bila ingin mengonsumsinya.
5. Efek Samping Wajar: Rasa mual adaptif di awal serta tinja/feses berwarna gelap/kehitaman adalah efek samping yang wajar dan aman akibat ekskresi sisa zat besi.

BATASAN TOPIK DAN KEAMANAN MEDIS (SANGAT KETAT):
1. BATASAN TOPIK: Kamu HANYA menjawab pertanyaan seputar Tablet Tambah Darah (TTD), anemia defisiensi besi, aturan/jadwal minum, efek samping TTD, dan nutrisi makanan pendukung zat besi.
2. PERTANYAAN DI LUAR TOPIK: Jika pengguna bertanya tentang topik di luar TTD/anemia (seperti matematika, coding, hiburan, politik, olahraga umum, atau penyakit umum yang tidak terkait anemia/TTD), kamu WAJIB menolak dengan sopan dan ramah:
"Maaf, saya berfokus membantu pertanyaan seputar Tablet Tambah Darah (TTD). Anda dapat bertanya tentang manfaat, cara konsumsi sesuai petunjuk, efek samping, atau membaca artikel TTD yang tersedia di aplikasi."
3. PANDUAN FITUR APLIKASI: Jika pengguna bertanya mengenai cara memakai fitur aplikasi FEMORY, arahkan ke halaman terkait:
- Jadwal & Pengingat Minum TTD: Menu "Jadwal" (/user/schedule)
- Catatan Riwayat Minum: Menu "Riwayat" (/user/history)
- Saling Menyemangati bersama Teman: Menu "Buddy" (/user/buddy)
- Baca Artikel & Panduan Lengkap TTD: Menu "Edukasi" (/user/education)
4. LARANGAN DIAGNOSIS & PERUBAHAN DOSIS: Jangan pernah mendiagnosis penyakit secara mandiri, jangan mengubah dosis medis, dan jangan menyarankan penghentian konsumsi TTD tanpa dasar medis yang sah.
5. GEJALA DARURAT / KELUHAN BERAT: Jika pengguna mengeluhkan efek samping berat, nyeri perut parah, muntah darah, lemas ekstrem, pusing pingsan, atau hasil lab Hb < 8 g/dL, sampaikan dengan empati untuk SEGERA memeriksakan diri ke UKS, Puskesmas, atau dokter terdekat.

INTEGRASI ARTIKEL RESMI ADMIN DARI DATABASE APLIKASI:
- Di bawah ini tercantum artikel resmi yang dibuat oleh admin dari database aplikasi jika ada yang cocok dengan pertanyaan pengguna.
- Gunakan fakta dan isi artikel resmi tersebut sebagai rujukan utama jawabanmu.
- Jika kamu mengutip atau merujuk artikel tersebut, sertakan tautan resmi dalam format markdown: [Judul Artikel](/user/education/:id).
- JANGAN PERNAH mengarang judul artikel atau membuat tautan fiktif yang tidak ada di daftar artikel resmi yang diberikan.
- Jika tidak ada artikel resmi yang relevan, sampaikan keterbatasan sumber artikel secara jujur tanpa berpura-pura mengutip artikel, lalu berikan jawaban edukatif berdasarkan panduan medis TTD terpercaya.
- Format jawaban dengan rapi menggunakan poin-poin bila perlu, bahasa Indonesia yang hangat, bersahabat, dan menyemangati (gunakan emotikon sopan seperti 🌸, 💊, 💡 bila sesuai).
`;

export interface UserConsultationContext {
  name?: string;
}

export interface ConsultationResponse {
  success: boolean;
  answer: string;
  error?: string;
  errorType?: 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'CONFIG_ERROR';
  references?: ArticleReference[];
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
  ): Promise<ConsultationResponse> {
    // 1. Retrieve matching published articles from database
    const relevantArticles = await findRelevantArticles(prompt, 2);
    const references: ArticleReference[] = relevantArticles.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
    }));

    // 2. Check if Gemini API Key is configured
    if (!config.geminiApiKey) {
      return {
        success: false,
        errorType: 'CONFIG_ERROR',
        answer:
          'Asisten TTD sedang dalam pemeliharaan konfigurasi. Anda tetap dapat membaca artikel dan panduan Tablet Tambah Darah yang tersedia di aplikasi.',
        references,
      };
    }

    let model: string;
    try {
      model = ConsultationService.getModel();
    } catch (modelErr: any) {
      console.error('Gemini Model Config Error:', modelErr.message);
      return {
        success: false,
        errorType: 'CONFIG_ERROR',
        answer: `Konfigurasi AI bermasalah: ${modelErr.message}`,
        references,
        error: modelErr.message,
      };
    }

    // 3. Build dynamic context and system prompt with article data
    const contextDetails: string[] = [];
    if (userContext?.name?.trim()) {
      contextDetails.push(
        `Pasien/pengguna yang sedang berkonsultasi bernama "${userContext.name.trim()}". Sapalah dengan nama panggilannya secara hangat (misal: "Halo ${userContext.name.trim()} 🌸").`,
      );
    } else {
      contextDetails.push(
        `Sapalah pasien dengan ramah dan sopan menggunakan panggilan "Sahabat FEMORY".`,
      );
    }

    let articleContextSection = '';
    if (relevantArticles.length > 0) {
      articleContextSection =
        `\n\n--- ARTIKEL RESMI DARI DATABASE APLIKASI (GUNAKAN INI SEBAGAI RUJUKAN UTAMA JIKA RELEVAN) ---\n` +
        relevantArticles
          .map(
            (art, idx) =>
              `Artikel ${idx + 1}:\n- ID: ${art.id}\n- Judul: ${art.title}\n- Kategori: ${art.category}\n- Ringkasan: ${art.summary}\n${art.leadParagraph ? `- Isi/Materi: ${art.leadParagraph.slice(0, 700)}...\n` : ''}- Tautan Resmi: [${art.title}](/user/education/${art.id})`,
          )
          .join('\n\n') +
        `\n--- AKHIR DAFTAR ARTIKEL RESMI ---`;
    } else {
      articleContextSection = `\n\n--- STATUS ARTIKEL RESMI DATABASE ---\nTidak ada artikel resmi dari database aplikasi yang secara spesifik cocok dengan kata kunci pertanyaan ini. Sampaikan secara jujur jika ditanya tentang artikel terkait, dan berikan jawaban berbasis panduan resmi TTD tanpa mengarang referensi artikel palsu.`;
    }

    const dynamicSystemPrompt = `${FEMORY_BASE_PROMPT}\n${contextDetails.join(' ')}${articleContextSection}`;
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

    try {
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
              temperature: 0.6,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        const errStatus = response.status;
        console.warn(`Gemini API returned error [${errStatus}]:`, errMsg);

        // Check for Quota Exceeded / Rate Limit
        if (
          errStatus === 429 ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.toLowerCase().includes('quota') ||
          errMsg.toLowerCase().includes('rate limit')
        ) {
          return {
            success: false,
            errorType: 'QUOTA_EXCEEDED',
            answer:
              'Asisten TTD sedang tidak tersedia untuk sementara karena batas penggunaan telah tercapai. Silakan coba kembali nanti. Anda tetap dapat membaca artikel dan informasi Tablet Tambah Darah yang tersedia di aplikasi.',
            references,
          };
        }

        // Server error on Gemini upstream
        if (errStatus >= 500) {
          return {
            success: false,
            errorType: 'SERVER_ERROR',
            answer:
              'Layanan asisten TTD sedang mengalami kendala teknis pada server AI. Silakan coba kembali beberapa saat lagi. Anda tetap dapat membaca artikel edukasi yang tersedia.',
            references,
          };
        }

        // Fallback for 400/403 or other client errors
        return {
          success: false,
          errorType: 'CONFIG_ERROR',
          answer:
            'Asisten TTD sedang tidak dapat merespons permintaan ini untuk sementara waktu. Silakan baca artikel dan panduan Tablet Tambah Darah yang tersedia di aplikasi.',
          references,
        };
      }

      const data = (await response.json()) as any;
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        return {
          success: false,
          errorType: 'SERVER_ERROR',
          answer: 'Tidak ada respons yang dihasilkan oleh asisten. Silakan coba kembali.',
          references,
        };
      }

      return {
        success: true,
        answer: candidateText.trim(),
        references,
      };
    } catch (err: any) {
      console.error('ConsultationService fetch error:', err?.message || err);
      const isNetwork =
        err?.name === 'TimeoutError' ||
        err?.name === 'AbortError' ||
        err?.code === 'ECONNREFUSED' ||
        err?.message?.includes('fetch failed');

      return {
        success: false,
        errorType: isNetwork ? 'NETWORK_ERROR' : 'SERVER_ERROR',
        answer: isNetwork
          ? 'Koneksi ke asisten TTD mengalami gangguan jaringan. Silakan periksa koneksi internet Anda dan coba kembali nanti. Anda tetap dapat membaca artikel dan informasi Tablet Tambah Darah yang tersedia di aplikasi.'
          : 'Terjadi kendala pada layanan asisten TTD. Silakan coba beberapa saat lagi atau baca artikel edukasi TTD yang tersedia.',
        references,
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
