import { ConsultationTopic, ChatMessage } from '../types';

export const CONSULTATION_TOPICS: ConsultationTopic[] = [
  {
    id: 'top_1',
    icon: '💉',
    title: 'Batas waktu imunisasi TT sebelum nikah',
    category: 'Jadwal & Aturan',
    prompt: 'Berapa minggu sebelum menikah imunisasi TT2 harus diselesaikan?',
    initialAnswer:
      'Menurut standar Kementerian Kesehatan RI, dosis TT2 wajib diselesaikan **minimal 4 minggu (1 bulan) sebelum hari pernikahan**. Hal ini diperlukan agar sistem imun tubuh memiliki waktu yang cukup untuk memproduksi titer antibodi protektif terhadap bakteri *Clostridium tetani* guna melindungi calon ibu dan calon bayi kelak.',
  },
  {
    id: 'top_2',
    icon: '🛡️',
    title: 'Berapa lama masa perlindungan TT2 hingga TT5?',
    category: 'Masa Proteksi',
    prompt: 'Berapa lama masa perlindungan imunisasi TT2, TT3, TT4, hingga TT5?',
    initialAnswer:
      'Masa perlindungan imunisasi TT berjenjang:\n- **TT1:** Langkah awal pembentukan antibodi (skrining awal).\n- **TT2:** Perlindungan **3 tahun** (wajib sebelum menikah).\n- **TT3:** Perlindungan **5 tahun** (min. 6 bulan setelah TT2).\n- **TT4:** Perlindungan **10 tahun** (min. 1 tahun setelah TT3).\n- **TT5:** Perlindungan **seumur hidup (>25 tahun)** (Status T Lengkap).',
  },
  {
    id: 'top_3',
    icon: '👨',
    title: 'Apakah calon pengantin pria perlu imunisasi TT?',
    category: 'Skrining Pria',
    prompt: 'Apakah calon pengantin pria juga diwajibkan menjalani imunisasi TT?',
    initialAnswer:
      'Secara regulasi medis Kemenkes RI, kewajiban suntik vaksin TT pranikah difokuskan pada **calon pengantin wanita** untuk mencegah tetanus maternal dan tetanus neonatorum pada persalinan. Namun calon pengantin pria tetap sangat dianjurkan menjalani skrining kesehatan pranikah (cek golongan darah/rhesus, penyakit menular, dan konseling gizi).',
  },
  {
    id: 'top_4',
    icon: '🩹',
    title: 'Efek samping suntik TT & cara meredakannya',
    category: 'KIPI & Perawatan',
    prompt: 'Bagaimana cara mengatasi pegal atau nyeri di lengan setelah suntik vaksin TT?',
    initialAnswer:
      'Nyeri, kemerahan, atau rasa pegal ringan pada bekas suntikan di lengan atas adalah reaksi KIPI (Kejadian Ikutan Pasca Imunisasi) yang **ringan dan normal**. Anda dapat mengompres dingin area suntikan selama 10-15 menit dan mengistirahatkan lengan. Keluhan biasanya mereda dengan sendirinya dalam 1-2 hari.',
  },
];

export const getInitialChatMessages = (userName?: string): ChatMessage[] => {
  const displayName = userName?.trim() ? userName.trim().split(' ')[0] : 'Calon Pengantin';
  const timestamp =
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  return [
    {
      id: 'msg_1',
      sender: 'assistant',
      text: `Halo ${displayName}! Saya **Luna**, Konselor AI Kesehatan Pranikah & Imunisasi TT PRELUNA. Ada yang ingin Anda konsultasikan seputar jadwal vaksinasi TT, persiapan skrining faskes/KUA, atau tips kesehatan reproduksi calon pengantin?`,
      timestamp,
    },
  ];
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = getInitialChatMessages();
