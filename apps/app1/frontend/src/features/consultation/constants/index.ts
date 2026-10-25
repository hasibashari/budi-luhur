import { ConsultationTopic, ChatMessage } from '../types';

export const CONSULTATION_TOPICS: ConsultationTopic[] = [
  {
    id: 'top_1',
    icon: '🍋',
    title: 'Bolehkah minum TTD bersama air jeruk?',
    category: 'Cara Konsumsi',
    prompt: 'Bolehkah saya minum tablet tambah darah bersama jus jeruk atau air lemon?',
    initialAnswer:
      'Sangat boleh dan dianjurkan! Vitamin C yang terkandung dalam air jeruk, lemon, atau buah segar membantu meningkatkan penyerapan zat besi non-heme di lambung hingga 2-3 kali lipat.',
  },
  {
    id: 'top_2',
    icon: '🤢',
    title: 'Tips atasi rasa mual setelah minum tablet',
    category: 'Efek Samping',
    prompt: 'Bagaimana cara mengatasi rasa mual atau begah di perut setelah minum TTD?',
    initialAnswer:
      'Rasa mual ringan adalah reaksi adaptasi normal tubuh terhadap zat besi. Untuk mengatasinya: 1) Minum TTD tepat setelah makan malam atau sebelum tidur, 2) Jangan minum saat perut kosong, 3) Minum bersama segelas air putih atau jus jeruk kaya vitamin C.',
  },
  {
    id: 'top_3',
    icon: '☕',
    title: 'Mengapa harus hindari teh dan kopi?',
    category: 'Pantangan',
    prompt: 'Mengapa kita tidak boleh minum TTD bersamaan dengan teh atau kopi?',
    initialAnswer:
      'Teh dan kopi mengandung senyawa tanin dan polifenol yang dapat mengikat zat besi sebelum sempat diserap oleh usus, sehingga efektivitas TTD bisa turun lebih dari 50%. Beri jeda minimal 2 jam jika ingin menikmati teh atau kopi.',
  },
  {
    id: 'top_4',
    icon: '🩸',
    title: 'Berapa kadar Hb normal remaja putri?',
    category: 'Kadar Hb',
    prompt: 'Berapa angka kadar hemoglobin (Hb) yang normal untuk remaja putri?',
    initialAnswer:
      'Kadar hemoglobin (Hb) normal untuk remaja putri usia 12-18 tahun adalah minimal 12.0 g/dL. Jika hasil pemeriksaan menunjukkan di bawah 12.0 g/dL, seseorang dikategorikan mengalami anemia dan disarankan konsumsi TTD teratur serta konsultasi ke UKS atau Puskesmas.',
  },
];

export const getInitialChatMessages = (userName?: string): ChatMessage[] => {
  const displayName = userName?.trim() ? userName.trim().split(' ')[0] : 'Sahabat FEMORY';
  const timestamp =
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  return [
    {
      id: 'msg_1',
      sender: 'assistant',
      text: `Halo ${displayName}! 🌸 Saya Asisten TTD FEMORY siap membantu pertanyaan seputar Tablet Tambah Darah (TTD), aturan konsumsi, tips mengatasi mual, dan nutrisi pencegah anemia.\n\n> 💡 **Penting:** AI dapat memberikan informasi yang kurang tepat. Informasi ini bukan pengganti konsultasi dengan dokter, bidan, atau tenaga kesehatan profesional.`,
      timestamp,
    },
  ];
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = getInitialChatMessages();
