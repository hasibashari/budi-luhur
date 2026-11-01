/**
 * SADARI Constants & Clinical Data
 * Berdasarkan Materi Edukasi SADARI (Pemeriksaan Payudara Sendiri)
 * Sumber Ilmiah:
 * - Damanik & Saragih (2022)
 * - Maulidia et al. (2022)
 * - Kementerian Kesehatan Republik Indonesia (2022)
 */

export interface SadariStepDetail {
  step: number;
  title: string;
  shortDesc: string;
  instruction: string;
  tactileTip: string;
  visualNote: string;
  citation: string;
  estimatedSeconds: number;
  badge: string;
}

export interface SadariReference {
  citation: string;
  authors: string;
  year: number;
  title: string;
  source: string;
}

export const SADARI_DEFINITION = {
  title: 'Pengertian & Tujuan SADARI',
  fullText:
    'SADARI (Pemeriksaan Payudara Sendiri) merupakan cara yang dilakukan secara mandiri untuk mengenali kondisi dan perubahan pada payudara. Pemeriksaan ini bertujuan membantu perempuan mengenali perubahan yang tidak biasa, seperti benjolan, perubahan bentuk payudara, perubahan kulit, atau perubahan pada puting. Pengenalan terhadap kondisi payudara sendiri dapat meningkatkan kesadaran perempuan untuk mencari pertolongan tenaga kesehatan apabila menemukan kelainan.',
  citation: 'Damanik & Saragih, 2022',
};

export const SADARI_TIMING_INFO = {
  title: 'Waktu Melakukan SADARI',
  generalRule:
    'SADARI dapat dilakukan secara berkala untuk membantu perempuan mengenali kondisi normal payudaranya.',
  menstruating: {
    label: 'Perempuan yang Masih Menstruasi',
    timingWindow: 'Hari ke-7 hingga ke-10 sejak hari pertama menstruasi (HPHT)',
    reason:
      'Pada rentang hari ini, kadar hormon esterogen dan progesteron menurun sehingga jaringan payudara umumnya tidak terlalu terasa nyeri atau membengkak, memudahkan deteksi jaringan abnormal.',
  },
  menopause: {
    label: 'Perempuan Menopause / Tidak Menstruasi',
    timingWindow: 'Tanggal yang sama setiap bulan (misalnya setiap tanggal 1 atau 15)',
    reason:
      'Bagi perempuan yang sudah menopause atau menggunakan kontrasepsi yang menghentikan haid, pemeriksaan dilakukan pada tanggal yang sama setiap bulan agar lebih mudah diingat dan konsisten.',
  },
  medicalDisclaimer:
    'Pemeriksaan mandiri (SADARI) tidak menggantikan pemeriksaan klinis payudara (SADANIS) atau mammografi oleh tenaga kesehatan profesional.',
  citation: 'Maulidia et al., 2022',
};

export const SADARI_STEPS: SadariStepDetail[] = [
  {
    step: 1,
    title: 'Berdiri di Depan Cermin',
    shortDesc: 'Amati bentuk, ukuran, dan kesimetrisan kedua payudara di depan cermin.',
    instruction:
      'Berdiri tegak menghadap cermin dengan kedua lengan di samping badan secara rileks. Amati kedua payudara, mulai dari bentuk, ukuran, dan kesimetrisannya. Perhatikan apakah terdapat perubahan kulit, seperti kerutan, kulit tertarik ke dalam, atau perubahan pada puting. Pengamatan secara visual membantu perempuan mengenali perubahan kondisi payudara.',
    tactileTip: 'Lakukan di ruangan yang memiliki pencahayaan cukup terang.',
    visualNote: 'Lengan rileks lurus di samping badan.',
    citation: 'Damanik & Saragih, 2022',
    estimatedSeconds: 45,
    badge: 'Inspeksi Visual',
  },
  {
    step: 2,
    title: 'Angkat Kedua Lengan',
    shortDesc: 'Angkat kedua lengan ke atas dan amati kontur serta permukaan payudara.',
    instruction:
      'Angkat kedua lengan ke atas, kemudian amati kembali bentuk dan permukaan payudara. Perhatikan apakah terdapat perubahan bentuk, kulit yang tertarik, atau perubahan posisi puting. Lakukan pengamatan dengan teliti untuk mengenali perubahan yang tidak biasa.',
    tactileTip: 'Gerakan mengangkat lengan merenggangkan ligamen dan memperjelas tarikan jaringan abnormal.',
    visualNote: 'Kedua lengan lurus terangkat ke atas kepala.',
    citation: 'Damanik & Saragih, 2022',
    estimatedSeconds: 45,
    badge: 'Inspeksi Lengan Terangkat',
  },
  {
    step: 3,
    title: 'Letakkan Tangan di Pinggang',
    shortDesc: 'Tekan kedua tangan pada pinggang untuk mengencangkan otot dada.',
    instruction:
      'Tekan kedua tangan pada pinggang secara perlahan, kemudian amati kembali kedua payudara di depan cermin. Perhatikan adanya perubahan bentuk, lekukan kulit, atau perubahan pada puting yang sebelumnya tidak terlihat.',
    tactileTip: 'Menekan pinggang mengontraksikan otot pektoralis mayor di balik payudara.',
    visualNote: 'Bahu ditarik sedikit ke belakang, dada dibusungkan perlahan.',
    citation: 'Damanik & Saragih, 2022',
    estimatedSeconds: 45,
    badge: 'Kontraksi Otot Dada',
  },
  {
    step: 4,
    title: 'Periksa Bagian Puting',
    shortDesc: 'Amati perubahan bentuk puting dan cairan yang keluar tanpa dipencet.',
    instruction:
      'Amati apakah terdapat perubahan bentuk puting atau cairan yang keluar tanpa dipencet, terutama jika cairan bercampur darah. Perubahan seperti ini perlu diperhatikan dan dikonsultasikan kepada tenaga kesehatan.',
    tactileTip: 'Hindari memencet puting dengan kasar; utamakan observasi cairan spontan atau luka yang sukar sembuh.',
    visualNote: 'Periksa area areola dan puting kanan serta kiri secara bergantian.',
    citation: 'Maulidia et al., 2022',
    estimatedSeconds: 45,
    badge: 'Observasi Puting',
  },
  {
    step: 5,
    title: 'Raba Payudara (Tiga Ujung Jari)',
    shortDesc: 'Gunakan tiga ujung jari dengan gerakan melingkar sistematis hingga ke ketiak.',
    instruction:
      'Gunakan tiga ujung jari untuk meraba payudara secara perlahan dengan gerakan melingkar. Periksa seluruh bagian payudara secara sistematis, termasuk area sekitar puting hingga ketiak. Perhatikan apakah terdapat benjolan, bagian yang mengeras, atau perubahan yang berbeda dari kondisi biasanya.',
    tactileTip: 'Gunakan tangan kiri untuk payudara kanan, dan tangan kanan untuk payudara kiri.',
    visualNote: 'Gunakan bantalan tiga jari tengah (bukan kuku) dengan pola spiral melingkar.',
    citation: 'Damanik & Saragih, 2022',
    estimatedSeconds: 60,
    badge: 'Palpasi Posisi Berdiri',
  },
  {
    step: 6,
    title: 'Meraba Payudara dalam Posisi Berbaring',
    shortDesc: 'Berbaring dengan bantal di bawah bahu dan gunakan 3 tekanan bertahap.',
    instruction:
      'Berbaringlah dengan nyaman, kemudian letakkan bantal kecil di bawah bahu pada sisi payudara yang akan diperiksa. Angkat lengan pada sisi tersebut ke atas kepala. Gunakan tiga ujung jari, yaitu jari telunjuk, jari tengah, dan jari manis, untuk meraba payudara secara perlahan dengan gerakan melingkar. Periksa seluruh bagian payudara secara sistematis, mulai dari bagian luar hingga sekitar puting, termasuk area menuju ketiak. Gunakan tekanan ringan, sedang, dan lebih kuat secara bertahap untuk merasakan perubahan jaringan payudara. Perhatikan apakah terdapat benjolan, pengerasan, atau perubahan yang berbeda dari kondisi biasanya. Jika ditemukan perubahan yang mencurigakan, segera konsultasikan kepada tenaga kesehatan.',
    tactileTip: 'Posisi berbaring meratakan jaringan payudara di dinding dada sehingga benjolan kecil lebih mudah terdeteksi.',
    visualNote: 'Bantal kecil menopang bahu; lengan sisi yang diperiksa diletakkan di atas kepala.',
    citation: 'Kementerian Kesehatan Republik Indonesia, 2022',
    estimatedSeconds: 75,
    badge: 'Palpasi Posisi Berbaring',
  },
];

export const SADARI_PRESSURE_LEVELS = [
  {
    level: 1,
    name: 'Tekanan Ringan',
    target: 'Jaringan Superfisial (Tepat di bawah kulit)',
    description: 'Sentuhan lembut untuk mendeteksi kelainan atau benjolan pada lapisan luar kulit payudara.',
  },
  {
    level: 2,
    name: 'Tekanan Sedang',
    target: 'Jaringan Kelenjar & Duktus (Lapisan Tengah)',
    description: 'Tekanan sedang untuk merasakan kelenjar susu dan jaringan lemak payudara di lapisan tengah.',
  },
  {
    level: 3,
    name: 'Tekanan Dalam / Kuat',
    target: 'Jaringan Dalam (Mendekati Dinding Tulang Rusuk)',
    description: 'Tekanan lebih dalam hingga terasa dinding dada dan tulang rusuk untuk mendeteksi benjolan terdalam.',
  },
];

export const SADARI_WARNING_SIGNS = [
  {
    id: 'lump',
    title: 'Benjolan Padat & Mengeras',
    description:
      'Benjolan baru yang teraba padat, keras, berbatas tidak teratur, atau tidak hilang setelah siklus menstruasi selesai.',
    dangerLevel: 'high',
  },
  {
    id: 'skin-change',
    title: 'Perubahan Tekstur Kulit (Peau d\'Orange)',
    description:
      'Kulit tampak menebal dan berpori-pori besar mirip kulit jeruk, atau tampak cekungan seperti lesung pipi (dimpling).',
    dangerLevel: 'high',
  },
  {
    id: 'nipple-retraction',
    title: 'Puting Tertarik ke Dalam',
    description:
      'Puting payudara yang mendadak tertarik ke dalam (retraksi), bergeser posisinya, atau timbul luka/koreng yang sukar sembuh.',
    dangerLevel: 'high',
  },
  {
    id: 'discharge',
    title: 'Cairan Abnormal Spontan',
    description:
      'Keluarnya cairan yang keluar tanpa dipencet, terutama cairan bercampur darah, nanah, atau cairan keruh dari satu puting.',
    dangerLevel: 'high',
  },
];

export const SADARI_REFERENCES: SadariReference[] = [
  {
    citation: 'Damanik & Saragih, 2022',
    authors: 'Damanik, E. & Saragih, R.',
    year: 2022,
    title: 'Penyuluhan dan Demonstrasi Pemeriksaan Payudara Sendiri (SADARI) sebagai Deteksi Dini Kanker Payudara pada Wanita Usia Subur',
    source: 'Jurnal Pengabdian Komunitas Kesehatan, 2(1), 15-22.',
  },
  {
    citation: 'Maulidia et al., 2022',
    authors: 'Maulidia, N., Fitriani, A., & Handayani, S.',
    year: 2022,
    title: 'Edukasi Deteksi Dini Kanker Payudara Melalui Pemeriksaan Payudara Sendiri (SADARI)',
    source: 'Jurnal Kreativitas Pengabdian Kepada Masyarakat (PKM), 5(4), 1120-1128.',
  },
  {
    citation: 'Kementerian Kesehatan Republik Indonesia, 2022',
    authors: 'Kementerian Kesehatan Republik Indonesia',
    year: 2022,
    title: 'Buku Panduan Deteksi Dini Kanker Payudara dan Kanker Leher Rahim di Fasilitas Pelayanan Kesehatan Tingkat Pertama',
    source: 'Direktorat Pencegahan dan Pengendalian Penyakit Tidak Menular (P2PTM) Kemenkes RI, Jakarta.',
  },
];

