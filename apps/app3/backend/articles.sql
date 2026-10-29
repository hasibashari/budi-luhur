-- ============================================================
-- TEMANI Unified Education Articles Seed Data
-- Schema: PostgreSQL 15+ articles table
-- Generated & Sanitized from Base64 to Local Storage
-- ============================================================

INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  'art_0541',
  'Kesehatan Reproduksi',
  'Reproduksi',
  'Kenali kesehatan reproduksi, jaga kesehatan diri dan pasangan, serta persiapkan kehidupan berkeluarga yang sehat sejak sebelum menikah.',
  '## Kenali Kesehatan Reproduksi, Siapkan Masa Depanmu

Kesehatan reproduksi bukan hanya tentang organ reproduksi, tetapi juga tentang bagaimana kamu menjaga kesehatan diri dan mempersiapkan kehidupan berkeluarga. Kenali tubuhmu, pahami kesehatan reproduksi, dan jangan ragu mencari informasi atau bantuan tenaga kesehatan jika memiliki keluhan.

## Apa itu kesehatan reproduksi?

Kesehatan reproduksi adalah kondisi sehat secara fisik, mental, dan sosial yang berkaitan dengan sistem serta fungsi reproduksi. Bagi calon pengantin, memahami kesehatan reproduksi dapat membantu mempersiapkan pernikahan dan kehamilan yang sehat.

Pengetahuan yang baik juga membantu kamu mengenali kondisi tubuh, memahami perubahan yang terjadi, dan mengambil keputusan terkait kesehatan reproduksi secara bertanggung jawab.

## Mengapa kesehatan reproduksi penting sebelum menikah?

Menjaga kesehatan reproduksi sebelum menikah penting untuk membantu calon pengantin mempersiapkan diri dan pasangan. Beberapa hal yang perlu diperhatikan antara lain:

- Memahami fungsi organ reproduksi dan perubahan yang terjadi pada tubuh.
- Menjaga kebersihan organ reproduksi untuk membantu mencegah iritasi dan gangguan kesehatan.
- Mengetahui pentingnya pemeriksaan kesehatan sebelum menikah.
- Memahami kesuburan dan perencanaan kehamilan.
- Membangun komunikasi terbuka dengan pasangan mengenai kesehatan reproduksi.

## Bagaimana cara menjaga kesehatan reproduksi?

Ada beberapa langkah sederhana yang dapat dilakukan sehari-hari:

- **Jaga kebersihan organ reproduksi**. Bersihkan area genital dengan benar dan hindari produk yang dapat menyebabkan iritasi.
- **Kenali kondisi tubuh**. Perhatikan perubahan menstruasi dan keluhan pada organ reproduksi.
- **Terapkan pola hidup sehat**. Konsumsi makanan bergizi seimbang, beraktivitas fisik, dan istirahat yang cukup.
- **Lakukan pemeriksaan kesehatan**. Konsultasikan pemeriksaan yang diperlukan kepada tenaga kesehatan sebelum menikah.
- **Jaga kesehatan bersama pasangan**. Bangun komunikasi yang terbuka, saling menghormati, dan bertanggung jawab terhadap kesehatan reproduksi.

## Kapan perlu memeriksakan diri?

Jika kamu mengalami nyeri panggul berulang, gangguan menstruasi, luka pada organ genital, atau cairan dari vagina yang berubah warna, berbau tidak biasa, maupun disertai keluhan lain, jangan mengabaikannya. Konsultasikan keluhan tersebut kepada tenaga kesehatan untuk mengetahui penyebab dan mendapatkan penanganan yang tepat.

Ingat, menjaga kesehatan reproduksi merupakan tanggung jawab bersama. Dengan mengenali tubuh dan memperoleh informasi yang benar sejak sebelum menikah, kamu dapat mempersiapkan kehidupan berkeluarga dengan lebih sehat.

[Efektifitas Komunikasi Informasi dan Edukasi (KIE) tentang Kesehatan Reproduksi pada Calon Pengantin (Catin) dalam Mempersiapkan Pernikahan dan Kehamilan](https://jurnal.itkeswhs.ac.id/index.php/medika/id/article/view/638)',
  '/uploads/articles/art_0541.png',
  '3 min read',
  'Terbit',
  FALSE,
  40,
  '2026-10-26',
  'Temani',
  '2026-10-26 10:43:01.628343+00',
  '2026-10-27 01:17:38.257409+00'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  'art_5824',
  'Lindungi Diri, Persiapkan Kehamilan yang Sehat',
  'Imunisasi TT',
  'Imunisasi yang mengandung toksoid tetanus membantu melindungi ibu dan bayi baru lahir dari risiko penyakit tetanus. Ketahui manfaat imunisasi, pentingnya pemeriksaan riwayat vaksinasi, serta jadwal pemberian yang sesuai melalui konsultasi dengan bidan atau tenaga kesehatan.',
  '## Lindungi Diri, Persiapkan Kehamilan yang Sehat

Imunisasi Tetanus Toxoid (TT) merupakan imunisasi yang membantu tubuh membentuk kekebalan terhadap penyakit tetanus. Imunisasi ini penting bagi wanita usia subur, termasuk calon pengantin, sebagai bagian dari persiapan kesehatan sebelum kehamilan. 

Imunisasi tetanus merupakan salah satu upaya untuk melindungi dari penyakit tetanus, termasuk tetanus pada ibu dan bayi baru lahir. Calon pengantin perlu mengetahui status imunisasinya agar dapat memperoleh vaksinasi sesuai riwayat imunisasi dan anjuran tenaga kesehatan.

## Apa itu imunisasi TT?

Imunisasi tetanus menggunakan vaksin yang mengandung toksoid tetanus untuk membantu tubuh membentuk kekebalan terhadap penyakit tetanus, komponen yang merangsang tubuh membentuk kekebalan terhadap racun yang dihasilkan bakteri penyebab tetanus. Penyakit tetanus dapat menyebabkan kekakuan otot dan kejang yang berbahaya.

Dalam pelayanan kesehatan, vaksin yang mengandung toksoid tetanus juga tersedia dalam kombinasi, seperti vaksin Td yang melindungi terhadap tetanus dan difteri. Jenis vaksin yang diberikan disesuaikan dengan program imunisasi dan kondisi individu.

## Mengapa imunisasi tetanus penting?
Imunisasi TT penting untuk membantu:

- Membantu melindungi diri dari penyakit tetanus.
- Membantu mencegah tetanus pada ibu dan bayi baru lahir.
- Mendukung persiapan kesehatan sebelum kehamilan.

## Siapa yang perlu memeriksa status imunisasi TT?

Wanita usia subur, termasuk calon pengantin dan perempuan yang merencanakan kehamilan, dapat memeriksa status imunisasi tetanusnya. Pemeriksaan ini bertujuan mengetahui vaksinasi yang telah diterima dan menentukan apakah diperlukan dosis lanjutan.

Tidak semua orang perlu memulai imunisasi dari dosis pertama. Riwayat imunisasi sebelumnya perlu diperhitungkan agar pemberian vaksin sesuai kebutuhan.

## Bagaimana jadwal imunisasinya?

Jadwal imunisasi ditentukan berdasarkan riwayat imunisasi sebelumnya. Menurut pedoman Kementerian Kesehatan, status imunisasi tetanus perlu diperiksa terlebih dahulu sebelum pemberian vaksin pada wanita usia subur dan ibu hamil. 

Langkah yang dapat dilakukan:

- Periksa buku KIA atau catatan imunisasi jika tersedia.
- Sampaikan riwayat vaksinasi kepada petugas kesehatan.
- Jalani skrining status imunisasi di Puskesmas atau fasilitas kesehatan.
- Ikuti jadwal dan jenis vaksin yang direkomendasikan berdasarkan hasil pemeriksaan.

| Dosis | Jarak pemberian | Masa perlindungan |
|T1|Dosis awal|Tahap awal pembentukan kekebalan|
|T2|Minimal 1 bulan setelah T1|3 tahun|
|T3|Minimal 6 bulan setelah T2|5 tahun|
|T4|Minimal 12 bulan setelah T3|10 tahun|
|T5|Minimal 12 bulan setelah T4|Lebih dari 25 tahun|

Jadwal ini merupakan interval minimal. Tidak semua calon pengantin harus memulai dari T1; dosis lanjutan ditentukan berdasarkan riwayat imunisasi dan hasil skrining tenaga kesehatan. 

## Apa efek samping yang mungkin muncul?

Setelah imunisasi, sebagian orang dapat mengalami:

- Nyeri atau kemerahan pada tempat suntikan.
- Pembengkakan ringan di sekitar tempat suntikan.
- Demam ringan atau rasa lelah.

Keluhan tersebut biasanya bersifat sementara. Jika mengalami sesak napas, pembengkakan pada wajah atau tenggorokan, atau gejala berat setelah vaksinasi, segera cari pertolongan medis.

Sebelum vaksin diberikan, informasikan kepada tenaga kesehatan jika pernah mengalami reaksi alergi berat setelah imunisasi atau memiliki kondisi kesehatan yang perlu dipertimbangkan.

## Apa yang perlu dilakukan calon pengantin?

1. Periksa buku KIA atau catatan imunisasi sebelumnya jika tersedia.
2. Konsultasikan status imunisasi tetanus ke Puskesmas atau tenaga kesehatan.
3. Ikuti jadwal vaksinasi sesuai hasil skrining.
4. Simpan catatan vaksinasi agar mudah dipantau.


[WHO-Tetanus](https://www.who.int/news-room/fact-sheets/detail/tetanus)
[Kemenkes RI — jadwal imunisasi dan skrining status imunisasi](https://jdih.kemkes.go.id/pdfjs/web/viewer.html?file=https%3A%2F%2Fjdih.kemkes.go.id%2Fstorage%2Fdocuments%2Fpdfs%2F2024kepmenkes1098.pdf)
[pengaruh edukasi terhadap pengetahuan calon pengantin](https://jurnal.umsb.ac.id/index.php/menarailmu/article/view/7652)
[penyuluhan imunisasi TT bagi calon pengantin dan wanita usia subur](https://doi.org/10.25105/juara.v4i2.13965)
[pengaruh konseling imunisasi TT terhadap pengetahuan calon pengantin](https://www.jurnal-id.com/index.php/jupin/article/view/666)',
  '/uploads/articles/art_5824.png',
  '5 min read',
  'Terbit',
  FALSE,
  125,
  '2026-10-23',
  'Temani',
  '2026-10-23 16:04:23.273575+00',
  '2026-10-27 04:20:38.859366+00'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  'art_6106',
  'Gizi & Anemia Calon Pengantin',
  'Gizi & Anemia',
  'Gizi seimbang, zat besi, tanda anemia, dan pencegahannya.',
  '## Gizi Seimbang, Cegah Anemia Sejak Dini

Gizi yang baik merupakan salah satu persiapan penting bagi calon pengantin untuk menjaga kesehatan tubuh dan mempersiapkan kehamilan yang sehat. Asupan zat gizi yang tidak mencukupi dapat meningkatkan risiko anemia dan kekurangan energi kronis (KEK). Oleh karena itu, calon pengantin perlu memperhatikan pola makan, menjaga berat badan yang sehat, dan melakukan pemeriksaan kesehatan sebelum merencanakan kehamilan.

## Mengapa Gizi Penting bagi Calon Pengantin?

Pemenuhan gizi sejak sebelum kehamilan membantu menjaga kondisi tubuh dan mendukung kesehatan reproduksi. Status gizi yang baik juga penting untuk mengurangi risiko masalah kesehatan selama kehamilan. Penelitian pada perempuan pranikah di Sleman menunjukkan bahwa praktik kesehatan dan gizi prakonsepsi berkaitan dengan kejadian anemia.

## Apa Saja Zat Gizi yang Dibutuhkan?

Beberapa zat gizi penting yang perlu diperhatikan oleh calon pengantin meliputi:

- **Zat besi**
Membantu pembentukan hemoglobin yang berfungsi membawa oksigen ke seluruh tubuh. Sumbernya antara lain daging, ikan, ayam, telur, dan kacang-kacangan.

- **Asam folat**
Berperan dalam pembentukan sel dan perkembangan awal janin. Perempuan yang merencanakan kehamilan dianjurkan mengonsumsi suplemen asam folat 400 mikrogram per hari, dimulai sebelum hamil dan dilanjutkan selama 12 minggu pertama kehamilan.

- **Protein**
Membantu pertumbuhan dan perbaikan jaringan tubuh. Sumbernya meliputi ikan, telur, ayam, tahu, tempe, dan kacang-kacangan.

- **Vitamin dan mineral**
Sayuran dan buah-buahan menyediakan berbagai vitamin dan mineral yang mendukung fungsi tubuh. Konsumsi makanan yang beragam membantu memenuhi kebutuhan zat gizi sehari-hari.

- **Karbohidrat dan lemak sehat** 
Menjadi sumber energi untuk beraktivitas. Pilih makanan pokok yang beragam serta sumber lemak sehat, seperti ikan, kacang-kacangan, dan biji-bijian.

## Apa Itu Anemia?

Anemia adalah kondisi ketika kadar hemoglobin dalam darah lebih rendah dari nilai normal. Kondisi ini dapat menyebabkan tubuh kekurangan pasokan oksigen yang optimal sehingga seseorang lebih mudah merasa lelah dan lemas.

Anemia dapat disebabkan oleh kekurangan zat besi, kehilangan darah saat menstruasi, kekurangan zat gizi tertentu, atau kondisi kesehatan lainnya.

## Apa Tanda-Tanda Anemia?

Anemia dapat menimbulkan beberapa keluhan, seperti:

- Mudah lelah dan merasa lemas.
- Pusing atau sakit kepala.
- Tampak pucat.
- Sulit berkonsentrasi.
- Napas terasa pendek saat beraktivitas.

Namun, anemia tidak selalu menimbulkan gejala yang jelas. Untuk memastikannya, calon pengantin perlu melakukan pemeriksaan kadar hemoglobin sesuai anjuran tenaga kesehatan.

## Bagaimana Cara Mencegah Anemia?

Pencegahan anemia dapat dilakukan melalui beberapa kebiasaan berikut:

- Mengonsumsi makanan bergizi seimbang setiap hari.
- Memilih sumber zat besi dan mengonsumsi buah atau sayuran sumber vitamin C untuk membantu penyerapan zat besi.
- Mengonsumsi Tablet Tambah Darah (TTD) sesuai anjuran tenaga kesehatan.
- Melakukan pemeriksaan hemoglobin untuk mendeteksi anemia sejak dini.
- Berkonsultasi dengan tenaga kesehatan apabila mengalami gejala anemia atau memiliki hasil pemeriksaan hemoglobin yang rendah.

Dengan menerapkan pola makan bergizi seimbang dan melakukan pemeriksaan kesehatan, calon pengantin dapat mempersiapkan kondisi tubuh yang lebih sehat sebelum merencanakan kehamilan.

[Edukasi Gizi Prakonsepsi dan Makanan Fertilitas untuk Persiapan Kehamilan Sehat Calon Pengantin](https://ejournal.abcollab.id/index.php/Mosaic/article/view/269)
[Penyuluhan tentang Gizi Prakonsepsi dan Pemberian Tablet Asam Folat kepada Calon Pengantin](https://www.jurnal.globalhealthsciencegroup.com/index.php/JPM/article/view/1393)',
  '/uploads/articles/art_6106.png',
  '4 min read',
  'Terbit',
  FALSE,
  5,
  '2026-10-27',
  'Temani',
  '2026-10-27 01:13:56.125449+00',
  '2026-10-27 04:21:29.217823+00'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  'art_7852',
  'Persiapan Sebelum Hamil',
  'Perencanaan Kehamilan',
  'Persiapan sebelum hamil, masa subur, dan pemeriksaan prakonsepsi',
  '## Rencanakan Kehamilan, Persiapkan Kesehatan Sejak Dini

Perencanaan kehamilan merupakan langkah penting bagi calon pengantin untuk mempersiapkan kondisi kesehatan sebelum terjadi kehamilan. Persiapan ini meliputi pemeriksaan kesehatan, pemenuhan gizi, konsumsi asam folat, peninjauan status imunisasi, serta kesiapan fisik, mental, dan sosial. Dengan perencanaan yang baik, calon orang tua dapat mengenali faktor risiko dan memperoleh pendampingan kesehatan sejak dini.

## Mengapa Perencanaan Kehamilan Penting?

Persiapan sebelum kehamilan membantu calon orang tua mengetahui kondisi kesehatannya dan menangani masalah yang berpotensi memengaruhi kehamilan. Pemeriksaan prakonsepsi juga menjadi kesempatan untuk berkonsultasi mengenai penyakit yang dimiliki, obat-obatan yang dikonsumsi, status gizi, dan riwayat imunisasi sebelum merencanakan kehamilan.

## Apa Saja yang Perlu Dipersiapkan?

**1. Pemeriksaan kesehatan.** Lakukan konsultasi dengan tenaga kesehatan untuk menilai kondisi kesehatan, riwayat penyakit, tekanan darah, status gizi, dan pemeriksaan lain sesuai kebutuhan.
**2. Pemenuhan gizi.** Konsumsi makanan beragam dengan gizi seimbang, termasuk sumber protein, zat besi, sayuran, dan buah-buahan.
**3. Asam folat.** Perempuan yang merencanakan kehamilan dianjurkan mengonsumsi asam folat sebanyak 400 mikrogram per hari, dimulai sebelum hamil dan dilanjutkan hingga 12 minggu pertama kehamilan, kecuali terdapat indikasi untuk dosis berbeda berdasarkan arahan tenaga kesehatan.
**4. Pemeriksaan imunisasi.** Tinjau riwayat imunisasi, termasuk perlindungan terhadap tetanus, bersama tenaga kesehatan agar kebutuhan imunisasi dapat ditentukan dengan tepat.
**5. Kesiapan mental dan pasangan.** Diskusikan harapan, pembagian tanggung jawab, dukungan selama kehamilan, serta rencana pengasuhan anak.
**6. Pola hidup sehat.** Hindari rokok dan alkohol, jaga aktivitas fisik, tidur cukup, serta konsultasikan penggunaan obat sebelum merencanakan kehamilan.

## Kapan Waktu yang Tepat untuk Merencanakan Kehamilan?

Persiapan sebaiknya dilakukan sebelum mulai mencoba untuk hamil, bukan setelah kehamilan diketahui. Waktu konsultasi dapat disesuaikan dengan kondisi kesehatan masing-masing pasangan. Apabila memiliki penyakit kronis, sedang menggunakan obat tertentu, atau pernah mengalami komplikasi kehamilan, konsultasikan rencana kehamilan lebih awal dengan tenaga kesehatan.

## Bagaimana Cara Mempersiapkan Kehamilan yang Sehat?

Calon pengantin dapat memulai langkah berikut:
- Menjadwalkan konsultasi prakonsepsi.
- Memastikan status gizi dan melakukan pemeriksaan anemia bila dianjurkan.
- Mulai mengonsumsi asam folat sesuai rekomendasi.
- Meninjau status imunisasi dan riwayat penyakit.
- Mendiskusikan kesiapan mental, finansial, dan dukungan pasangan.
- Mengikuti anjuran tenaga kesehatan berdasarkan hasil pemeriksaan.
Dengan perencanaan yang tepat, calon pengantin dapat mempersiapkan kehamilan secara lebih terarah dan mengetahui langkah kesehatan yang perlu dilakukan sebelum hamil.

[Pelaksanaan Skrining Prakonsepsi pada Calon Pengantin Perempuan](https://doi.org/10.22146/jkr.55481)
[World Health Organization. (2023). Periconceptional Folic Acid Supplementation to Prevent Neural Tube Defects](https://www.who.int/tools/elena/interventions/folate-periconceptional)',
  '/uploads/articles/art_7852.png',
  '4 min read',
  'Terbit',
  FALSE,
  0,
  '2026-10-27',
  'Temani',
  '2026-10-27 02:48:27.915319+00',
  '2026-10-27 04:22:27.031252+00'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  'art_8206',
  'Kenali Emosi, Bangun Hubungan yang Sehat',
  'Kesehatan Mental',
  'Kesehatan mental merupakan bagian penting dari persiapan pernikahan. Mengenali emosi, mengelola stres, dan membangun komunikasi yang sehat dapat membantu calon pengantin mempersiapkan kehidupan bersama.',
  '## Kesehatan Mental, Siapkan Diri untuk Pernikahan yang Sehat

Kesehatan mental merupakan bagian penting dalam mempersiapkan kehidupan pernikahan. Calon pengantin perlu mempersiapkan diri secara emosional dan psikologis untuk menghadapi perubahan peran, tanggung jawab, serta dinamika hubungan dengan pasangan. Dengan mengenali emosi, mengelola stres, dan membangun komunikasi yang sehat, calon pengantin dapat mempersiapkan hubungan yang saling mendukung.

## Mengapa Kesehatan Mental Penting bagi Calon Pengantin?

Persiapan pernikahan tidak hanya meliputi kesiapan fisik dan finansial, tetapi juga kesiapan mental. Perbedaan harapan, kekhawatiran tentang kehidupan setelah menikah, dan perubahan tanggung jawab dapat menimbulkan stres. Kesiapan mental membantu calon pengantin memahami diri sendiri, mengenali kebutuhan pasangan, dan menghadapi permasalahan melalui komunikasi yang baik.

## Apa Saja yang Perlu Dipersiapkan?

Beberapa aspek kesehatan mental yang perlu diperhatikan oleh calon pengantin meliputi:
- **Mengenali emosi** 
Memahami perasaan seperti senang, sedih, takut, atau cemas dapat membantu seseorang merespons situasi dengan lebih baik.
- **Mengelola stres**
Menjaga rutinitas, tidur yang cukup, beraktivitas fisik, dan meluangkan waktu untuk beristirahat dapat membantu mengurangi tekanan.
- **Membangun komunikasi yang sehat**
Membicarakan harapan, kebutuhan, keuangan, dan pembagian tanggung jawab secara terbuka dapat membantu pasangan saling memahami.
- **Menghargai perbedaan**
Setiap individu memiliki latar belakang, kebiasaan, dan cara berpikir yang berbeda. Perbedaan perlu dibicarakan dengan saling menghormati.
- **Mengenali batasan diri**
Hubungan yang sehat perlu didasari rasa aman, saling menghargai, dan bebas dari kekerasan maupun perilaku mengendalikan pasangan.

## Apa Tanda-Tanda Stres yang Perlu Diperhatikan?

Stres dapat muncul ketika seseorang menghadapi tekanan atau perubahan besar. Beberapa tanda yang dapat dirasakan antara lain:
- Mudah merasa cemas atau gelisah.
- Lebih mudah marah atau tersinggung.
- Sulit berkonsentrasi.
- Mengalami gangguan tidur.
- Mengalami perubahan nafsu makan.
- Merasa lelah atau mengalami keluhan fisik akibat tekanan.
Tanda-tanda tersebut tidak selalu menunjukkan gangguan mental. Namun, jika berlangsung terus-menerus atau mengganggu aktivitas sehari-hari, sebaiknya konsultasikan dengan tenaga kesehatan atau profesional kesehatan mental.

## Bagaimana Cara Menjaga Kesehatan Mental Sebelum Menikah?

Calon pengantin dapat melakukan beberapa langkah berikut:
- Menjaga pola tidur dan aktivitas fisik secara teratur.
- Meluangkan waktu untuk melakukan kegiatan yang disukai.
- Membicarakan kekhawatiran dengan pasangan secara terbuka.
- Berbagi cerita dengan keluarga atau orang tepercaya.
- Menghindari penyelesaian konflik melalui ancaman, penghinaan, atau kekerasan.
- Mencari bantuan profesional apabila mengalami tekanan emosional yang sulit diatasi. 
  
Dengan mempersiapkan kesehatan mental sejak sebelum menikah, calon pengantin dapat belajar memahami diri sendiri, membangun komunikasi yang sehat, dan menghadapi perubahan kehidupan bersama secara lebih matang.

[Skrining Kesehatan Mental bagi Pasangan Calon Pengantin dalam Persiapan Kehamilan Sehat](https://thejnp.org/index.php/jnp/article/view/958)
[World Health Organization. (2020). Doing What Matters in Times of Stress: An Illustrated Guide. WHO](https://www.who.int/publications/i/item/9789240003927)',
  '/uploads/articles/art_8206.png',
  '4 min read',
  'Terbit',
  FALSE,
  6,
  '2026-10-27',
  'Temani',
  '2026-10-27 02:14:38.945411+00',
  '2026-10-27 02:58:49.158717+00'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  'art_9959',
  'Infeksi menular seksual, skrining kesehatan, dan pencegahan infeksi.',
  'Pencegahan Infeksi',
  'Pencegahan infeksi penting untuk menjaga kesehatan reproduksi calon pengantin melalui perilaku sehat, skrining IMS, dan deteksi dini.',
  '## Cegah Infeksi, Jaga Kesehatan Reproduksi

Menjaga kesehatan reproduksi merupakan bagian penting dalam mempersiapkan kehidupan pernikahan yang sehat. Infeksi tertentu, termasuk infeksi menular seksual (IMS), dapat terjadi tanpa gejala dan berisiko menimbulkan gangguan kesehatan apabila tidak terdeteksi serta ditangani dengan tepat. Oleh karena itu, calon pengantin perlu memahami cara mencegah infeksi, mengenali faktor risiko, dan melakukan pemeriksaan kesehatan sebelum merencanakan kehamilan. 

## Apa Itu Infeksi Menular Seksual?

Infeksi menular seksual (IMS) adalah infeksi yang terutama ditularkan melalui kontak seksual. Contohnya meliputi HIV, sifilis, gonore, klamidia, dan herpes genital. Sebagian infeksi dapat tidak menimbulkan gejala sehingga seseorang mungkin tidak menyadari bahwa dirinya terinfeksi. Pemeriksaan kesehatan membantu mendeteksi infeksi dan menentukan penanganan yang diperlukan. 

## Apa Saja Tanda-Tanda Infeksi yang Perlu Diwaspadai?

Beberapa tanda yang perlu diperhatikan antara lain:
- Keluar cairan yang tidak biasa dari organ reproduksi.
- Nyeri atau rasa terbakar saat buang air kecil.
- Luka, lepuhan, atau benjolan di area genital.
- Gatal atau iritasi pada area genital.
- Nyeri pada perut bagian bawah.
Gejala tersebut tidak selalu disebabkan oleh IMS, dan beberapa infeksi tidak menunjukkan gejala sama sekali. Jika mengalami keluhan, segera konsultasikan dengan tenaga kesehatan dan hindari mengonsumsi obat tanpa pemeriksaan. 

## Bagaimana Cara Mencegah Infeksi?

Calon pengantin dapat melakukan beberapa langkah berikut:
**1. Melakukan pemeriksaan kesehatan.** Konsultasikan kebutuhan skrining, termasuk HIV, sifilis, dan hepatitis B sesuai indikasi serta standar pelayanan kesehatan.
**2. Menjaga kebersihan organ reproduksi.** Bersihkan area genital dengan cara yang tepat, hindari penggunaan produk yang dapat menyebabkan iritasi, dan tidak perlu menggunakan cairan pembersih vagina bagian dalam.
**3. Memahami pencegahan penularan.** Penggunaan kondom secara benar dan konsisten dapat mengurangi risiko penularan berbagai IMS, meskipun tidak memberikan perlindungan mutlak terhadap semua infeksi.
**4. Memeriksa status imunisasi.** Konsultasikan kebutuhan vaksin, seperti hepatitis B dan HPV, dengan tenaga kesehatan.
**5. Mencari pengobatan jika terdeteksi infeksi.** Ikuti pengobatan sesuai anjuran dan konsultasikan langkah pencegahan penularan kepada pasangan. 

## Mengapa Skrining Kesehatan Sebelum Menikah Penting?

Skrining kesehatan membantu calon pengantin mengetahui kondisi kesehatannya, mendeteksi masalah sejak dini, dan memperoleh penanganan yang sesuai. Pemeriksaan dilakukan di puskesmas atau fasilitas pelayanan kesehatan lain sesuai standar. Jika ditemukan infeksi, tenaga kesehatan dapat memberikan konseling, pengobatan, dan tindak lanjut sesuai hasil pemeriksaa

Dengan memahami pencegahan infeksi dan melakukan pemeriksaan kesehatan, calon pengantin dapat menjaga kesehatan reproduksi serta mempersiapkan kehidupan bersama dengan lebih baik.




[Petunjuk Pelaksanaan KIE Kesehatan Reproduksi dan Seksual bagi Calon Pengantin](https://repository.stikesbcm.ac.id/id/eprint/387/)
[Upaya Pencegahan IMS melalui Skrining Triple Eliminasi pada Calon Pengantin](https://naluriedukasi.com/index.php/cjcs/article/view/582)
[World Health Organization](https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-%28STIs%29)',
  '/uploads/articles/art_9959.png',
  '4 min read',
  'Terbit',
  FALSE,
  13,
  '2026-10-27',
  'Temani',
  '2026-10-27 03:23:51.05418+00',
  '2026-10-27 03:23:51.05418+00'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;
