import { ConsultationTopic, ChatMessage } from '../types';

export const CONSULTATION_TOPICS: ConsultationTopic[] = [
  {
    id: 'top_1',
    icon: '⏰',
    title: 'Apa yang dilakukan jika lupa 1 pil KB?',
    category: 'Lupa Minum',
    prompt: 'Apa yang harus saya lakukan jika lupa minum 1 pil KB hari ini?',
    initialAnswer:
      'Jika lupa 1 pil: Segera minum pil yang terlupa begitu teringat (meskipun harus minum 2 pil dalam satu hari). Lanjutkan pil berikutnya sesuai jadwal harian biasa. Efektivitas proteksi biasanya tetap aman jika keterlambatan kurang dari 12 jam.',
  },
  {
    id: 'top_2',
    icon: '🎗️',
    title: 'Kapan waktu terbaik melakukan SADARI?',
    category: 'SADARI',
    prompt: 'Kapan waktu terbaik untuk melakukan pemeriksaan payudara sendiri (SADARI)?',
    initialAnswer:
      'Waktu terbaik melakukan SADARI adalah hari ke-7 hingga hari ke-10 dihitung dari hari pertama menstruasi dimulai. Pada masa ini, kadar hormon estrogen dan progesteron menurun sehingga payudara terasa paling lembut dan tidak bengkak.',
  },
  {
    id: 'top_3',
    icon: '💊',
    title: 'Beda Pil Kombinasi vs Pil Progestin',
    category: 'Jenis Pil',
    prompt: 'Apa perbedaan antara Pil KB Kombinasi dengan Pil Progestin (Mini Pil)?',
    initialAnswer:
      'Pil KB Kombinasi mengandung hormon estrogen dan progesteron yang cocok untuk wanita usia subur tanpa keluhan khusus. Pil Progestin (Mini Pil) hanya mengandung progestin, sangat dianjurkan untuk ibu menyusui karena tidak mengganggu produksi ASI.',
  },
  {
    id: 'top_4',
    icon: '🩸',
    title: 'Flek ringan / spotting di awal konsumsi',
    category: 'Efek Samping',
    prompt: 'Apakah normal timbul flek kecokelatan di awal bulan pertama minum pil KB?',
    initialAnswer:
      'Ya, flek ringan (spotting) atau perubahan siklus di 1–3 bulan pertama merupakan adaptasi normal tubuh terhadap perubahan hormon. Tetaplah minum pil setiap hari di jam yang sama. Jika flek berlanjut lebih dari 3 bulan, konsultasikan dengan bidan Anda.',
  },
];

export const getInitialChatMessages = (userName?: string): ChatMessage[] => {
  const displayName = userName?.trim() ? userName.trim().split(' ')[0] : 'Sahabat Pilluna';
  const timestamp =
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  return [
    {
      id: 'msg_1',
      sender: 'assistant',
      text: `Halo ${displayName}, saya Luna, Asisten Informasi Kontrasepsi Pilluna. Ada yang ingin ditanyakan seputar konsumsi pil KB, tips adaptasi siklus hormon, atau panduan deteksi dini SADARI?`,
      timestamp,
    },
  ];
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = getInitialChatMessages();
