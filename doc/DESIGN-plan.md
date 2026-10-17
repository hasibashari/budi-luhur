# Implementation Plan: Rebranding Main Website & UI/UX Enhancement STIKes Budi Luhur Cimahi

Dokumen ini merupakan panduan implementasi teknis untuk melakukan **rebranding menyeluruh**, **perbaikan UI/UX**, serta **rekayasa responsivitas mobile-first sistematis** pada homepage root aplikasi:

- **Lokasi Target:** `/home/azure/dev/projects/frontend/budi-luhur/frontend`
- **Port Layanan:** Port 5170 (React 19 + Vite 6 + Tailwind CSS v4)
- **Status Branding:** **Main Website Resmi STIKes Budi Luhur Cimahi** (Bukan landing page Femory)
- **Prinsip Utama:** Menghilangkan seluruh branding _Femory_ dari homepage utama. Homepage merepresentasikan perguruan tinggi kesehatan (STIKes Budi Luhur Cimahi) secara utuh, profesional, dan ramah pengguna di seluruh ukuran layar (Mobile, Tablet, Desktop). Fitur dan aplikasi di luar folder `frontend/` (seperti `apps/app1`, `app2`, `app3`) tidak diubah.

---

## 1. Sasaran Rebranding & Arsitektur Informasi

### 1.1. Perubahan Identitas Inti

| Elemen               | Sebelumnya (Femory Portal)                               | Sesudahnya (Main Website STIKes Budi Luhur)                                                                                                      |
| :------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identitas Header** | Badge "FEMORY" + Teks "Portal Tablet Tambah Darah"       | Logo Resmi STIKes Budi Luhur Cimahi + Teks "Perguruan Tinggi Kesehatan Religius, Berbudi Luhur, & Unggul"                                        |
| **Hero Section**     | Fokus spesifik pada anemia siswi & konsumsi TTD          | Kampus Utama STIKes Budi Luhur: Pendidikan Kesehatan Unggul, Akreditasi LAM-PTKes, Penerimaan Mahasiswa Baru (PMB), dan Ekosistem Kampus Digital |
| **Navigasi Utama**   | Pilih Aplikasi, Manfaat TTD, Fitur Unggulan, Profil, FAQ | Profil Kampus, Program Studi, Keunggulan & Fasilitas, Portal Aplikasi Mandiri, PMB Online, FAQ                                                   |
| **Section Edukasi**  | Manfaat TTD (Lesu, 5L, Anemia)                           | **Keunggulan Kampus**: Dosen Pakar, Lab Klinis Lengkap, Kerjasama Kerja Global (Jepang, Jerman, RS Nasional), Pembinaan Karakter                 |
| **Section Fitur**    | Gamifikasi siswi (Sahabat Sehat, Streak Group)           | **Fasilitas & Layanan Terpadu**: PMB Online, E-Academic Mahasiswa, Perpustakaan & Jurnal JKBL, Asisten AI Edukasi                                |
| **Section Aplikasi** | "FEMORY - Aplikasi 1/2/3"                                | **Portal Ekosistem Aplikasi** (Aplikasi Mandiri 1, Aplikasi Mandiri 2, Aplikasi Mandiri 3 - tetap mengarah ke port 5173, 5174, 5175)             |
| **Footer**           | Fokus pada pemantauan TTD remaja putri                   | Identitas Resmi STIKes Budi Luhur Cimahi, Kontak Kampus, Layanan Akademik, Tautan Cepat PMB & Portal Aplikasi                                    |

---

## 2. Rencana Refinement UI/UX: Eliminasi Redundansi, Peringkasan Teks & Pembersihan Navigasi

Tahap penyempurnaan ini berfokus pada efisiensi informasi, kejernihan hierarki visual, dan profesionalitas website perguruan tinggi resmi.

### 2.1. Eliminasi Elemen UI Redundan (Prioritas: P0)

- **Masalah & Temuan:**
  - Terjadi duplikasi penonjolan CTA pendaftaran: CTA _"PMB Online"_ hadir di `Navbar.tsx` (desktop & mobile drawer) dan sekaligus menjadi tombol primer berukuran besar di `Hero.tsx`.
  - Di `Hero.tsx` sebelumnya terdapat 3 tombol aksi bertumpuk: (1) _Pendaftaran PMB Online_, (2) _Jelajahi Program Studi_, dan (3) _Portal Aplikasi Mandiri ↓_. Hal ini membingungkan fokus pengguna (_action paralysis_) dan memakan ruang vertikal signifikan pada perangkat mobile.
- **Strategi & Solusi:**
  - **Navbar (`Navbar.tsx`):** Navbar diposisikan murni sebagai navigasi global institusi. Tombol aksi di navbar desktop disederhanakan menjadi **satu CTA primer tunggal yang fungsional** menuju portal aplikasi (`Portal Aplikasi` -> `#apps`), sehingga navigasi tetap lapang dan bersih.
  - **Hero Section (`Hero.tsx`):** Menjadi zona konversi utama (_Primary Conversion Zone_). Mengurangi jumlah tombol menjadi **2 tombol terfokus**:
    1. _Primary Action:_ **Pendaftaran PMB Online** (tautan langsung ke portal pendaftaran resmi).
    2. _Secondary Action:_ **Jelajahi Program Studi** (`#prodi`) atau **Portal Aplikasi Mandiri** (`#apps`).
    3. Menghilangkan tombol text link ke-3 yang redundan (`Portal Aplikasi Mandiri ↓`).

### 2.2. Peringkasan & Pemadatan Teks (Prioritas: P1)

- **Masalah & Temuan:**
  - Beberapa heading, deskripsi, dan teks kartu terlalu panjang dan padat (_dense_), sehingga mengurangi kenyamanan membaca (_scannability_) calon mahasiswa, khususnya pada layar smartphone.
- **Strategi & Solusi Pemadatan Copywriting:**
  - **Hero Section (`Hero.tsx`):**
    - _Top Badge:_ Diringkas menjadi format ringkas: `STIKes Budi Luhur Cimahi • Kampus Kesehatan Unggul`.
    - _Subtitle:_ Diringkas menjadi 1-2 kalimat padat (maks ~18 kata): _"Perguruan tinggi kesehatan di Cimahi dengan kurikulum berstandar internasional dan laboratorium modern untuk melahirkan tenaga kesehatan profesional."_
    - _Trust Metric Cards:_ Deskripsi pada kartu akreditasi dan prodi diperpendek menjadi 1 kalimat lugas.
  - **Profil Institusi (`InstitutionalProfileSection.tsx`):**
    - Ringkas pengantar sejarah menjadi 2 kalimat esensial.
    - Pertahankan Visi 2040 dan 3 Pilar (_Religius, Budi Luhur, Unggul_), namun padatkan deskripsi pilar agar tetap proporsional dalam grid horizontal mobile.
  - **Keunggulan & Fasilitas (`Benefits.tsx` & `Features.tsx`):**
    - Padatkan deskripsi kartu fitur dari 3 baris teks panjang menjadi 1-2 baris padat makna (_bulleted points_ atau kalimat ringkas).
  - **FAQ Section (`FAQ.tsx`):**
    - Ringkas jawaban agar to-the-point dan tidak memicu accordion mengembang terlalu panjang pada mobile viewport.

### 2.3. Pembersihan Ikon AI pada Navigasi (`Navbar.tsx#L154`) (Prioritas: P0)

- **Masalah & Temuan:**
  - Pada `frontend/src/components/Navbar.tsx`, tombol pendaftaran menggunakan ikon `Sparkles` dari `lucide-react` yang diasosiasikan dengan fitur kecerdasan buatan (AI) atau eksperimental, sehingga **tidak relevan** untuk tombol pendaftaran institusi resmi perguruan tinggi.
- **Strategi & Solusi:**
  - Hapus elemen `<Sparkles />` pada tombol desktop `Navbar.tsx` dan tombol mobile drawer.
  - Bersihkan `import { Sparkles }` dari `Navbar.tsx`.
  - **Catatan Keamanan Fitur:** Fitur AI pada section fasilitas (`Features.tsx`) tetap dipertahankan utuh.

---

## 3. Rencana Rekayasa Responsivitas Mobile-First UI/UX (Sistematis & Komprehensif)

Bagian ini merupakan hasil analisis mendalam terhadap kendala teknis dan estetika pada perangkat layar kecil (viewport lebar 320px hingga 430px) guna mengatasi masalah font terlalu besar, teks berhimpitan, elemen tumpang tindih (*overlapping*), dan inkonsistensi layout secara terstruktur.

### 3.1. Diagnosis Masalah Spesifik Responsivitas Mobile Saat Ini

Berdasarkan audit langsung pada struktur DOM, stylesheet Tailwind CSS v4, dan komponen aktif:

1. **Tipografi Terlalu Besar & Tidak Seimbang (Over-scaled Typography):**
   - **Heading Display Raksasa:** `Hero.tsx` menggunakan `text-3xl sm:text-5xl lg:text-6xl` dengan bobot `font-extrabold` (800). Pada viewport 360px–375px, teks 30px memakan tinggi lebih dari 180px (sekitar 30% dari total viewport tinggi layar ponsel lipat/standar), sehingga menekan konten utama ke bawah lipatan (*below the fold*).
   - **Section Title H2 Terlalu Tebal & Dominan:** Pada `InstitutionalProfileSection.tsx`, `Benefits.tsx`, `Features.tsx`, dan `FAQ.tsx`, H2 menggunakan `text-2xl sm:text-4xl lg:text-5xl font-black` (bobot 900) dengan `tracking-tight`. Di layar kecil, ukuran 24px–28px dengan bobot 900 tampak terlalu masif dan tidak seimbang dengan badge kategori 12px di atasnya.
2. **Jarak Antar Teks Terlalu Rapat (Cramped Spacing & Text Density):**
   - **Konflik Montserrat `tracking-tight`:** Karakter huruf Montserrat memiliki rasio aspek horizontal yang lebar secara geometris. Penggunaan `tracking-tight` (-0.025em) pada teks berbobot tebal menyebabkan glif huruf saling bertabrakan atau berhimpitan di layar smartphone.
   - **Line-Height Terlalu Mepet:** Judul yang mematah menjadi 3–4 baris pada mobile menggunakan class `leading-tight` (1.25) atau `leading-none` (1.0). Huruf ascender dan descender (seperti 'g', 'y', 'p' dengan 'b', 'd', 'h') hampir bersentuhan, menyebabkan teks terlihat "gepeng" dan sulit dibaca secara visual.
3. **Elemen Saling Bertumpuk (Overlapping) & Viewport Overflow:**
   - **Hardcoded Offset pada Mobile Drawer:** Pada `Navbar.tsx`, mobile drawer diberi posisi `fixed inset-x-0 top-[88px] sm:top-[104px]`. Jika bar kontak di atasnya mengalami penyesuaian tinggi atau wrapping pada layar sempit (<360px), drawer akan menimpa header navbar atau menyisakan celah transparan.
   - **Blur Decorative Spheres Membocorkan Viewport:** Pada `Hero.tsx`, elemen dekoratif radial blur memiliki lebar statis `w-[650px] h-[360px]`. Pada layar smartphone (lebar 360px–390px), elemen absolut sebesar 650px yang tidak dikontrol secara presisi dapat memicu horizontal scrollbar dan pergeseran sumbu X (*horizontal page drift/layout shift*).
   - **Underline Dekoratif Bertumpuk Saat Wrap:** Aksen garis kuning pada `<span className='relative inline-block'>Unggul & Berbudi Luhur<span className='absolute left-0 right-0 -bottom-1 h-1.5 ...' /></span>` dapat bertumpuk menimpa baris berikutnya jika frasa tersebut terpenggal (*word-wrap*) menjadi 2 baris pada layar sempit.
4. **Layout Kolom Terjepit pada Ruang Sempit (Column Stacking Breakdown):**
   - **3 Pilar Nilai Terjepit di 3 Kolom:** Pada `InstitutionalProfileSection.tsx`, 3 pilar (*Religius, Budi Luhur, Unggul*) dipaksakan menggunakan `grid-cols-3 gap-2` pada mobile. Pada layar 360px (lebar efektif konten ~320px), setiap kartu pilar hanya memperoleh lebar ~85px. Akibatnya, padding internal 10px membuat kata "Budi Luhur" terpotong paksa menjadi dua baris vertikal sempit dan teks deskripsi berdesakan tanpa ruang bernapas.
   - **Tombol Strip Lokasi Menggantung:** Pada strip alamat kampus di bagian bawah profil institusi, tombol outline berada dalam orientasi `flex flex-col sm:flex-row items-center justify-between` tanpa `w-full` di mobile, sehingga tombol menggantung di tengah secara canggung di bawah teks alamat yang rata kiri.
5. **Inkonsistensi Margin, Padding, dan Spacing Kontainer:**
   - **Padding Vertikal Section Terlalu Besar:** Banyak section menggunakan `py-12 sm:py-16 lg:py-24`. Pada mobile, padding vertikal 48px atas dan 48px bawah (total 96px ruang kosong per section) memicu kelelahan scrolling (*scroll fatigue*) yang berlebihan.
   - **Padding Internal Kartu Terlalu Rakus Ruang:** Beberapa kartu menggunakan `p-5` hingga `p-6` di mobile. Padding 20px–24px pada layar 360px menghabiskan hampir 15% dari total lebar layar hanya untuk margin dalam kartu.

---

### 3.2. Standar Skala Modular Tipografi & Hierarki Mobile-First

Untuk menjaga keseimbangan proporsi visual dan kenyamanan membaca, seluruh ukuran teks harus mengikuti matriks skala tipografi modular berikut:

| Level Elemen | Ukuran Mobile (<640px) | Line-Height Mobile | Letter-Spacing Mobile | Ukuran Tablet/Desktop (≥640px) | Line-Height Desktop | Bobot Font |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display (H1)** | `text-2xl` (24px) / `text-[26px]` | `leading-snug` (1.35) | `tracking-normal` (0) | `sm:text-4xl lg:text-5xl` (36–48px) | `sm:leading-tight` (1.2) | `font-bold sm:font-extrabold` |
| **Section Title (H2)** | `text-xl` (20px) / `text-2xl` (24px) | `leading-snug` (1.35) | `tracking-normal` (0) | `sm:text-3xl lg:text-4xl` (30–36px) | `sm:leading-tight` (1.2) | `font-bold sm:font-extrabold` |
| **Card / Item Title (H3)** | `text-base` (16px) / `text-lg` (18px) | `leading-snug` (1.35) | `tracking-normal` (0) | `sm:text-lg lg:text-xl` (18–20px) | `sm:leading-snug` (1.3) | `font-bold` |
| **Subtitle / Subhead** | `text-xs` (12px) / `text-sm` (14px) | `leading-relaxed` (1.6) | `tracking-normal` (0) | `sm:text-base lg:text-lg` (16–18px) | `sm:leading-relaxed` (1.6) | `font-normal / font-medium` |
| **Body Paragraph** | `text-xs` (12px) / `text-sm` (14px) | `leading-relaxed` (1.6) | `normal` (0) | `sm:text-sm lg:text-base` (14–16px) | `sm:leading-relaxed` (1.6) | `font-normal` (400) |
| **Microcopy / Badge** | `text-[10px]` / `text-[11px]` | `leading-normal` (1.5) | `tracking-wider` (+0.05em) | `sm:text-xs` (12px) | `sm:leading-normal` | `font-semibold / font-bold` |
| **Button Text** | `text-xs` (12px) / `text-sm` (13px) | `leading-none` | `tracking-wider` (+0.03em) | `sm:text-sm` (14px) | `leading-none` | `font-bold` |

#### Aturan Khusus Tipografi:
- **Hapuskan `tracking-tight` pada Viewport Mobile:** Font heading Montserrat di mobile wajib menggunakan `tracking-normal`, dan hanya mengaktifkan `sm:tracking-tight` pada layar tablet/desktop di mana lebar container cukup luas.
- **Relaksasi Line-Height:** Seluruh heading multiline di layar mobile dilarang menggunakan `leading-none` atau `leading-tight`. Wajib menggunakan minimal `leading-snug` (1.35) agar glif huruf memiliki ruang vertikal yang nyaman.
- **Batasi Bobot 900 (`font-black`) pada Mobile:** Pada layar kecil, ganti `font-black` menjadi `font-extrabold` (800) atau `font-bold` (700) untuk mencegah distorsi dan rendering huruf yang tampak menggumpal/gepeng.

---

### 3.3. Penataan Spacing, Margin, Padding, dan Lebar Kontainer Mobile

Sistem spacing diselaraskan menggunakan kelipatan 4px/8px yang konsisten di seluruh homepage:

1. **Lebar & Padding Kontainer Utama:**
   - Gunakan `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` secara seragam di seluruh section.
   - Padding horizontal mobile ditetapkan stabil pada `px-4` (16px kiri dan kanan). Total margin aman layar adalah 32px, menyisakan ruang efektif konten minimal 288px pada layar ultra-kecil (320px) dan 328px pada layar 360px.
2. **Padding Vertikal Section (Eliminasi Scroll Fatigue):**
   - Ubah section vertikal dari `py-12 sm:py-16 lg:py-24` menjadi `py-8 sm:py-14 lg:py-20`.
   - Mengurangi ruang kosong berlebih pada mobile sebesar ~33%, membuat alur membaca jauh lebih padat dan dinamis.
3. **Margin Antar Komponen Section:**
   - Margin bawah antara section header (badge + judul + deskripsi) ke grid kartu diturunkan dari `mb-8 sm:mb-12` menjadi `mb-6 sm:mb-10`.
4. **Padding Internal Kartu:**
   - Standardisasi padding kartu pada mobile menggunakan `p-4` (16px) atau `p-4.5` (18px) di bawah 640px, lalu naik menjadi `sm:p-6 lg:p-7` pada tablet dan desktop.
5. **Jarak Antar Kartu (Grid Gap):**
   - Grid 1 kolom di mobile menggunakan `gap-3.5` hingga `gap-4` (14px–16px), beralih ke `sm:gap-6 lg:gap-8` pada breakpoint yang lebih tinggi.

---

### 3.4. Solusi Pencegahan Overlapping & Viewport Clipping

1. **Root Viewport Overflow Clipping:**
   - Pastikan root container atau pembungkus utama memiliki properti `overflow-x: clip` atau `overflow-x: hidden` untuk mengunci viewport dari potensi pergeseran horizontal akibat efek glow atau animasi.
2. **Dynamic Header & Drawer Offset (`Navbar.tsx`):**
   - Gantikan offset statis `top-[88px]` pada mobile drawer. Posisikan mobile drawer relatif terhadap container header atau gunakan perhitungan dinamis berbasis class wrapper (`sticky top-0` dengan drawer yang menempel langsung pada batas bawah navigasi utama).
   - Pastikan drawer memiliki `max-h-[calc(100dvh-5rem)]` dan `overflow-y-auto` agar seluruh menu dan tombol CTA dapat diakses penuh pada layar pendek (misal iPhone SE, height 667px).
3. **Penyusutan Skala Elemen Glow Dekoratif (`Hero.tsx`):**
   - Ubah blur sphere dari `w-[650px] h-[360px]` statis menjadi ukuran adaptif: `w-[320px] sm:w-[500px] lg:w-[650px] h-[200px] sm:h-[300px] lg:h-[360px]`.
   - Pertahankan `-z-10` dan `pointer-events-none` dengan `overflow-hidden` pada elemen `<section>`.
4. **Proteksi Word-Wrap pada Aksen Judul:**
   - Elemen aksen kuning di bawah teks *"Unggul & Berbudi Luhur"* diubah dari elemen absolut statis menjadi dekorasi berbasis span inline atau SVG underline yang fleksibel mengikuti teks tanpa memicu tumpang tindih saat terlipat ke baris kedua.

---

### 3.5. Rekonfigurasi Tata Letak per Komponen (Implementasi Spesifik)

#### 1. Header & Top Bar (`frontend/src/components/Navbar.tsx`)
- **Top Bar Kontak:**
  - Pada layar `<640px`, tampilkan informasi kontak dalam format ringkas horizontal tanpa membungkus menjadi 2 baris: nomor telepon dengan ikon phone dan WhatsApp dengan ikon WA, gunakan `text-[11px] gap-2.5`.
  - Sembunyikan elemen sekunder yang memadati bar (seperti teks panjang Yayasan) pada layar mobile, pertahankan hanya di tablet/desktop.
- **Main Nav Bar:**
  - Jaga tinggi bar pada `h-14 sm:h-18` dengan logo `h-8 sm:h-11`.
  - Brand text: `text-sm sm:text-lg font-extrabold` dengan baris pendukung yang tersembunyi rapi di mobile.
  - Tombol hamburger menu tetap memiliki touch target ergonomis `min-w-[44px] min-h-[44px]` dan `flex items-center justify-center`.
- **Mobile Menu Drawer:**
  - Padding internal drawer `px-4 py-4 space-y-2 pb-safe`.
  - Menu item diberi padding vertikal `py-2.5 px-3` dengan `min-h-[44px]` untuk touch target standar Android/iOS.
  - Tombol aksi PMB Online di dalam drawer diatur `w-full` dengan teks terpusat dan touch target 48px.

#### 2. Hero Section (`frontend/src/components/Hero.tsx`)
- **Top Badge:**
  - Ukuran teks disesuaikan ke `text-[11px] sm:text-xs`, padding `px-3 py-1`, dengan teks ringkas `STIKes Budi Luhur Cimahi • Kampus Unggul`.
- **Display Heading (H1):**
  - Ganti `text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight` menjadi `text-2xl sm:text-4xl lg:text-5xl font-bold sm:font-extrabold tracking-normal sm:tracking-tight leading-snug sm:leading-tight`.
- **Subtitle:**
  - Atur ke `text-xs sm:text-base text-[#444444] leading-relaxed max-w-xl mx-auto mt-3 sm:mt-5`.
- **Action Buttons (2 CTA Utama):**
  - Pada mobile (`<640px`): Tombol aksi ditata vertikal penuh (`w-full flex-col gap-2.5`) dengan tombol PMB Online sebagai prioritas utama di atas dan tombol Jelajahi Program Studi di bawahnya.
  - Pada tablet/desktop (`≥640px`): Otomatis kembali sejajar horizontal (`flex-row gap-4`).
- **Compact Trust Strip:**
  - Pada mobile, rapikan badge akreditasi, prodi, dan karir global dengan `flex flex-wrap items-center justify-center gap-1.5`. Gunakan ukuran `text-[10px] sm:text-xs px-2.5 py-1` agar tersusun simetris dan rapi di layar 360px–390px.

#### 3. Profil Institusi & 3 Pilar (`frontend/src/components/InstitutionalProfileSection.tsx`)
- **Banner Visi 2040:**
  - Padding container disesuaikan dari `p-5 sm:p-8 lg:p-10` menjadi `p-4 sm:p-7 lg:p-10`.
  - Heading Visi: Atur ukuran menjadi `text-lg sm:text-2xl lg:text-3xl font-extrabold leading-snug`.
- **3 Pilar Nilai Luhur (*Religius, Budi Luhur, Unggul*) - PERBAIKAN KRITIS:**
  - **Ubah Grid Mobile:** Ganti `grid grid-cols-3 gap-2` yang terjepit menjadi **`grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5`**.
  - **Tampilan Mobile:** Setiap pilar ditampilkan sebagai kartu horizontal ramping (`flex items-center space-x-3 p-3 rounded-xl bg-white/10 text-left`). Ikon berada di kiri, judul pilar dan deskripsi singkat berada di kanan. Teks "Budi Luhur" tidak lagi terpotong paksa, dan keterbacaan meningkat drastis!
  - **Tampilan Tablet/Desktop:** Otomatis kembali menjadi 3 kolom vertikal berpusat di tengah dengan ikon di atas judul.
- **Campus & Location Strip:**
  - Ubah tombol tautan eksternal menjadi `w-full sm:w-auto text-center justify-center mt-2 sm:mt-0 min-h-[44px]` agar mudah ditekan dengan ibu jari di ponsel.

#### 4. Keunggulan Kampus (`frontend/src/components/Benefits.tsx`)
- **Section Heading:**
  - Sesuaikan ke `text-xl sm:text-3xl lg:text-4xl font-bold sm:font-extrabold tracking-normal sm:tracking-tight`.
- **Grid 4 Keunggulan:**
  - Diatur menjadi `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6`.
  - Padding kartu `p-4 sm:p-6`, ikon box `w-10 h-10 sm:w-12 sm:h-12`, judul `text-base font-bold`, deskripsi `text-xs leading-relaxed text-[#555555]`.

#### 5. Fasilitas & Layanan Terpadu (`frontend/src/components/Features.tsx`)
- **Section Heading:**
  - Sesuaikan ke `text-xl sm:text-3xl lg:text-4xl font-bold sm:font-black tracking-normal sm:tracking-tight`.
- **Card Highlight & Padding:**
  - Padding kartu `p-4 sm:p-6 lg:p-7`.
  - Highlight bullet points menggunakan `space-y-1.5` dengan font `text-xs` dan ikon centang cyan `w-3.5 h-3.5 shrink-0`.

#### 6. Portal Ekosistem Aplikasi (`frontend/src/components/AppSelectorSection.tsx`)
- **Section Heading & Gap:**
  - Heading: `text-xl sm:text-3xl lg:text-4xl font-bold sm:font-extrabold tracking-normal sm:tracking-tight`.
  - Gap kartu aplikasi: `gap-3.5 sm:gap-6 lg:gap-8` (mengurangi jeda kosong vertikal di mobile).
- **App Suite Cards:**
  - Padding kartu `p-4 sm:p-6`.
  - Tombol *"Buka Portal Aplikasi ↗"*: Dipertahankan `w-full min-h-[44px]` dengan font `text-xs sm:text-sm font-semibold`.

#### 7. Tanya Jawab FAQ (`frontend/src/components/FAQ.tsx`)
- **Header FAQ:**
  - Heading `text-xl sm:text-3xl lg:text-4xl font-bold sm:font-black tracking-normal sm:tracking-tight`.
- **Accordion Button:**
  - Padding tombol: `px-3.5 py-3 sm:px-5 sm:py-4`.
  - Pertanyaan teks: `text-xs sm:text-base font-bold text-[#202020] leading-snug`.
  - Ruang aman ikon: Pastikan Chevron memiliki `ml-2 shrink-0` agar tidak bertabrakan dengan teks pertanyaan panjang di layar smartphone sempit.
  - Isi jawaban: Padding `px-3.5 pb-3.5 pt-1.5 sm:px-5 sm:pb-4 text-xs sm:text-sm text-[#555555] leading-relaxed`.

#### 8. Footer Institusi (`frontend/src/components/Footer.tsx`)
- **Grid Layout & Spacing:**
  - Padding vertikal footer: `pt-8 pb-6 sm:pt-12 sm:pb-10`.
  - Gap antar kolom vertikal di mobile: `gap-6 sm:gap-8`.
- **Tautan Cepat:**
  - Setiap tautan memiliki target sentuh minimal 40px (`min-h-[40px] flex items-center`) untuk kenyamanan navigasi satu tangan.
- **Bottom Bar:**
  - Teks hak cipta dan motto disusun vertikal dengan `space-y-1.5 sm:space-y-0` dan ukuran teks `text-[11px] sm:text-xs` yang mudah dibaca.

---

### 3.6. Strategi Breakpoint Multi-Device

Implementasi layout harus terverifikasi mulus pada 5 kategori perangkat utama:

```
[ Mobile XS ]        [ Mobile Standard ]      [ Tablet Portrait ]      [ Desktop Mini/Laptop ]     [ Desktop Standard ]
< 360px              360px - 430px            640px - 767px (sm:)      768px - 1023px (md:)        ≥ 1024px (lg:)
iPhone SE 1st/Old    iPhone 13-16, S22-24     Foldable / Mini Tablet   iPad / Surface              FHD Monitor / Mac
1 Kolom Ramping      1 Kolom Nyaman           2 Kolom Adaptif          2-3 Kolom Terstruktur       3-4 Kolom Luas
Heading 22-24px      Heading 24-26px          Heading 32-36px          Heading 36-42px             Heading 48-56px
Pillar: Stack        Pillar: Stack            Pillar: 3 Kolom          Pillar: 3 Kolom             Pillar: 3 Kolom
```

- **Breakpoint `xs` (<360px):** Mode proteksi ekstrem — tombol full width, badge ringkas, 3 pilar stack horizontal, zero horizontal overflow.
- **Breakpoint `default mobile` (360px–639px):** Tampilan mobile standar — hierarki tipografi proporsional, card padding 16px, line-height 1.35–1.6.
- **Breakpoint `sm` (640px–767px):** Transisi tablet awal — tombol kembali berdampingan, grid 2 kolom mulai aktif.
- **Breakpoint `md` (768px–1023px):** Tablet landscape / iPad — layout 2-3 kolom rapi, drawer tetap melayani navigasi sentuh.
- **Breakpoint `lg` & `xl` (≥1024px):** Desktop penuh — navigasi horizontal lengkap, layout multi-kolom luas dengan aksen visual penuh.

---

## 4. Matriks Pemetaan File & Prioritas Implementasi Responsivitas

Prioritas disusun berdasarkan tingkat keparahan dampak (*impact vs effort*):

| Berkas Terkait | Komponen | Fokus Perbaikan Responsivitas | Tingkat Prioritas | Dampak UX |
| :--- | :--- | :--- | :---: | :--- |
| `frontend/src/components/InstitutionalProfileSection.tsx` | Profil Kampus & 3 Pilar | - **P0:** Rekonfigurasi 3 Pilar dari `grid-cols-3` yang terjepit menjadi `grid-cols-1 sm:grid-cols-3` (kartu horizontal di mobile).<br>- Normalisasi heading H2 dan padding banner Visi.<br>- Standarisasi tombol strip lokasi menjadi full-width di mobile. | **P0 (Kritis)** | Menghilangkan teks terpotong parah dan mengembalikan ruang baca pilar. |
| `frontend/src/components/Navbar.tsx` | Header & Drawer | - **P0:** Hilangkan offset statis `top-[88px]` pada mobile drawer menjadi dynamic/sticky-relative agar tidak overlap.<br>- Sederhanakan bar kontak atas di layar `<360px`.<br>- Tambahkan proteksi `max-h` dan scroll lancar pada drawer. | **P0 (Kritis)** | Menghindari navigasi tertutup atau menu terpotong pada layar ponsel pendek. |
| `frontend/src/components/Hero.tsx` | Hero Section | - **P0:** Isolasi ukuran blur sphere agar tidak memicu horizontal scrolling.<br>- **P1:** Turunkan skala H1 dari 30px (`text-3xl`) ke 24px (`text-2xl`) dengan `tracking-normal` dan `leading-snug`.<br>- **P1:** Tombol CTA full-width vertikal di mobile.<br>- **P2:** Rapikan badge trust strip agar simetris. | **P0 / P1** | Halaman utama tidak melebar ke samping; judul proporsional dan tidak menutupi layar. |
| `frontend/src/index.css` | Global Style & Utilities | - **P1:** Tambahkan `overflow-x: clip` pada root html/body.<br>- **P1:** Normalisasi letter-spacing dan line-height heading Montserrat.<br>- **P2:** Sesuaikan padding tombol `.btn-budi-primary` dan `.btn-budi-secondary` di mobile. | **P1 (Tinggi)** | Menjamin kestabilan tipografi dan scrollbar di seluruh browser mobile. |
| `frontend/src/components/Benefits.tsx` | Keunggulan Kampus | - **P1:** Turunkan ukuran heading H2 dan line-height.<br>- **P2:** Padatkan padding vertikal section (`py-8 sm:py-14`).<br>- **P2:** Sesuaikan internal padding kartu ke `p-4 sm:p-6`. | **P2 (Sedang)** | Mengurangi scroll fatigue dan membuat kartu keunggulan nyaman dibaca. |
| `frontend/src/components/Features.tsx` | Fasilitas & Layanan | - **P1:** Normalisasi heading H2.<br>- **P2:** Sesuaikan padding kartu dan jarak antar highlight list (`space-y-1.5`). | **P2 (Sedang)** | Kartu fasilitas lebih rapi dan poin keunggulan tidak berhimpitan. |
| `frontend/src/components/AppSelectorSection.tsx` | Portal Aplikasi | - **P2:** Sesuaikan gap grid kartu dari `gap-5` ke `gap-3.5 sm:gap-6`.<br>- **P3:** Pastikan touch target tombol *"Buka Portal Aplikasi ↗"* tetap minimal 44px di mobile. | **P2 (Sedang)** | Alur kartu ekosistem aplikasi semakin padat dan serasi dengan section lain. |
| `frontend/src/components/FAQ.tsx` | FAQ Accordion | - **P2:** Sesuaikan padding button accordion dan clearance ikon Chevron.<br>- **P1:** Perbaiki line-height judul pertanyaan agar tidak berdempetan saat 2-3 baris. | **P1 / P2** | Pertanyaan FAQ mudah dibaca dan tombol accordion nyaman ditekan. |
| `frontend/src/components/Footer.tsx` | Footer Institusi | - **P2:** Padatkan padding vertikal footer.<br>- **P3:** Jamin seluruh link navigasi akademik dan aplikasi memiliki touch target minimal 40px. | **P3 (Rendah)** | Footer rapi, tidak memanjang berlebihan, dan mudah dinavigasi. |

---

## 5. Checklist Rencana Eksekusi Rebranding & Refinement

### Phase 1: Fondasi Meta & Konfigurasi Identitas
- [x] **1.1.** Perbarui `<title>` dan `<meta description>` di `frontend/index.html` agar resmi mencerminkan Website Utama STIKes Budi Luhur Cimahi.
- [x] **1.2.** Sesuaikan data konfigurasi di `frontend/src/config/apps.ts`: ubah penamaan dari _FEMORY - Aplikasi X_ menjadi _Aplikasi Mandiri X_ tanpa mengubah URL port (`:5173`, `:5174`, `:5175`).
- [x] **1.3.** Pastikan token warna dan tipografi di `frontend/src/index.css` tetap presisi (_Deep Blue_ `#004B87`, _Royal Blue_ `#005EB8`, _Sky Cyan_ `#00A3E0`, _Gold_ `#fdc800`).

### Phase 2: Rebranding Header & Navigasi Mobile-First (`Navbar.tsx`)
- [x] **2.1.** Hapus seluruh badge dan label "FEMORY" dari navbar.
- [x] **2.2.** Tampilkan branding murni: Logo STIKes Budi Luhur + Teks institusi resmi.
- [x] **2.3.** Ubah menu navigasi desktop dan mobile drawer menjadi menu institusi resmi: Profil, Prodi, Keunggulan, Fasilitas, Portal Aplikasi, FAQ.
- [x] **2.4.** Pasang tombol CTA desktop institusi dan akses cepat portal aplikasi.
- [x] **2.5.** Pertahankan mobile drawer overlay responsif dengan touch target minimal 44×44px.

### Phase 3: Rebranding Hero Section (`Hero.tsx`)
- [x] **3.1.** Ubah badge atas menjadi representasi institusi resmi Budi Luhur.
- [x] **3.2.** Ganti headline utama menjadi visi universitas kesehatan bertaraf internasional.
- [x] **3.3.** Ganti subheadline dengan pengantar kurikulum global dan ekosistem kampus terpadu.
- [x] **3.4.** Pasang tombol pendaftaran PMB Online dan eksplorasi program studi.
- [x] **3.5.** Pasang kartu highlight reputasi institusi (Akreditasi, Prodi, Karir Global).

### Phase 4: Centerpiece Profil Institusi (`InstitutionalProfileSection.tsx`)
- [x] **4.1.** Tempatkan section profil kampus tepat setelah Hero untuk menegaskan otoritas website utama.
- [x] **4.2.** Tampilkan Visi 2040 dan 3 Pilar Nilai Luhur (_Religius, Budi Luhur, Unggul_).
- [x] **4.3.** Sederhanakan struktur informasi profil institusi agar fokus pada visi dan nilai luhur.
- [x] **4.4.** Tampilkan informasi lokasi kampus dan tautan profil sejarah institusi.

### Phase 5: Keunggulan Kampus & Fasilitas Layanan (`Benefits.tsx` & `Features.tsx`)
- [x] **5.1.** Rebranding `Benefits.tsx` menjadi **Keunggulan Kampus STIKes Budi Luhur** (`#keunggulan`).
- [x] **5.2.** Rebranding `Features.tsx` menjadi **Fasilitas & Ekosistem Digital Kampus** (`#fasilitas`).

### Phase 6: Portal Ekosistem Aplikasi Mandiri (`AppSelectorSection.tsx`)
- [x] **6.1.** Posisikan section ini sebagai **Gerbang Portal Aplikasi Digital Kampus**.
- [x] **6.2.** Hapus teks "FEMORY" dari penamaan kartu aplikasi (Aplikasi Mandiri 1, 2, 3).
- [x] **6.3.** Pertahankan 100% fungsionalitas tombol login dan registrasi ke masing-masing port (`:5173`, `:5174`, `:5175`).
- [x] **6.4.** Sederhanakan tampilan kartu menjadi format *Ecosystem Partner / App Suite Cards* minimalis standar industri (menghilangkan kotak statistik teknis DB/port internal, checklist redundan, dan tab switcher yang memadati tampilan).

### Phase 7: Rebranding FAQ Institusi (`FAQ.tsx`)
- [x] **7.1.** Sesuaikan pertanyaan FAQ agar mencakup PMB online, akreditasi, karir luar negeri, dan portal aplikasi.

### Phase 8: Footer Resmi Kampus (`Footer.tsx`)
- [x] **8.1.** Pastikan footer sepenuhnya merepresentasikan Yayasan Pambudhi Luhur 1976 dan STIKes Budi Luhur Cimahi.
- [x] **8.2.** Hapus teks spesifik anemia/TTD dan ganti dengan motto resmi institusi.
- [x] **8.3.** Sediakan tautan resmi PMB, E-Academic, Perpustakaan, JKBL, dan 3 Aplikasi Mandiri.

### Phase 9: Validasi Teknis Awal
- [x] **9.1.** Validasi kompilasi build zero-error (`npm run build`).
- [x] **9.2.** Verifikasi tidak ada modifikasi di luar direktori `frontend/`.
- [x] **9.3.** Verifikasi keterbacaan pada berbagai ukuran viewport.

### Phase 10: Rencana Refinement UI/UX & Eliminasi Redundansi (Selesai Dikerjakan)
- [x] **10.1.** **Eliminasi Ikon AI di Navbar:** Hapus elemen `<Sparkles />` pada tombol CTA PMB Online di `Navbar.tsx` baris 154 (desktop) dan baris 263 (mobile drawer), serta bersihkan import `Sparkles`.
- [x] **10.2.** **Pembersihan CTA Redundan di Navbar & Hero:**
  - Di `Navbar.tsx`: Menghapus tombol PMB Online pada header desktop sehingga menyisakan satu tombol aksi primer tunggal: **Portal Aplikasi** (`#apps`).
  - Di `Hero.tsx`: Memangkas tombol ke-3 (*Portal Aplikasi Mandiri ↓*); mempertahankan 2 CTA berdaya konversi tinggi (*Pendaftaran PMB Online* dan *Jelajahi Program Studi*).
- [x] **10.3.** **Preservasi Fitur Navigasi & AI Terpisah:** Fungsi routing, anchor scroll, mobile drawer, serta fitur asisten cerdas AI di section fasilitas (`Features.tsx`) tetap berfungsi normal.

### Phase 11: Peringkasan Teks & Optimasi Kerapian Homepage (Selesai Dikerjakan)
- [x] **11.1.** **Peringkasan Copy Hero Section:** Memadatkan badge atas, mempersingkat paragraf subtitle, dan meringkas 3 kartu reputasi institusi.
- [x] **11.2.** **Peringkasan Profil Institusi:** Menyederhanakan pengantar sejarah dan teks mikro 3 pilar nilai.
- [x] **11.3.** **Peringkasan Kartu Keunggulan & Fasilitas:** Format deskripsi ringkas 1-2 baris dan mengganti badge dengan ikon institusi.
- [x] **11.4.** **Peringkasan Jawaban FAQ:** Poin tanya jawab to-the-point tanpa referensi lama.
- [x] **11.5.** **Verifikasi Visual Awal:** Build test lolos dan port 5170 aktif.

---

### Phase 12: Penataan Responsivitas Mobile-First Komprehensif (Siap Dikerjakan)

Rencana kerja terinci untuk menuntaskan seluruh isu responsivitas pada tampilan mobile:

#### 12.1. Global Typography & Viewport Safety (`index.css`)
- [ ] **12.1.1.** Tambahkan aturan `html, body { overflow-x: clip; }` dan pastikan tidak ada horizontal scrolling pada seluruh rentang ukuran layar smartphone (320px–430px).
- [ ] **12.1.2.** Sesuaikan aturan tipografi heading Montserrat di mobile: hapus `tracking-tight` pada heading mobile dan terapkan default `line-height` minimal `1.35` (`leading-snug`).
- [ ] **12.1.3.** Optimalkan tombol utilitas `.btn-budi-primary` dan `.btn-budi-secondary`: pada mobile (<640px) gunakan `font-size: 13px`, `padding: 10px 18px`, dan `letter-spacing: 0.02em` agar tidak tampak kaku atau melebar berlebihan.

#### 12.2. Rekonfigurasi Header & Mobile Drawer (`Navbar.tsx`)
- [ ] **12.2.1.** Rapikan bar kontak atas (`bg-[#00A3E0]`): pada layar `<360px`, pastikan link kontak tetap dalam 1 baris ringkas (`gap-2`, tanpa teks panjang Yayasan) sehingga tidak memicu pertambahan tinggi bar yang tak terduga.
- [ ] **12.2.2.** Hilangkan nilai hardcoded `top-[88px]` pada mobile drawer. Ganti dengan mekanisme positioning yang menempel tepat di bawah header navbar (`top-full` atau wrapper sticky) agar bebas dari celah atau tumpang tindih (*overlapping*).
- [ ] **12.2.3.** Tambahkan `max-h-[calc(100dvh-5rem)]` dan `overflow-y-auto` pada drawer untuk menjamin seluruh menu dan tombol CTA PMB dapat di-scroll dengan sempurna di ponsel berlayar pendek (height ≤ 667px).

#### 12.3. Penataan Skala & Layout Hero Section (`Hero.tsx`)
- [ ] **12.3.1.** Skalakan heading H1 pada mobile menjadi `text-2xl sm:text-4xl lg:text-5xl` dengan bobot `font-bold sm:font-extrabold`, `tracking-normal sm:tracking-tight`, dan `leading-snug sm:leading-tight`.
- [ ] **12.3.2.** Lindungi underline aksen judul agar tidak menimpa baris berikutnya jika frasa mengalami pemenggalan kata (*word-wrap*) pada layar kecil.
- [ ] **12.3.3.** Kecilkan ukuran radial blur dekoratif di mobile menjadi `w-[320px] h-[200px]` untuk mencegah risiko overflow sumbu X pada browser WebKit/Blink.
- [ ] **12.3.4.** Standarisasi tombol CTA Hero di mobile menjadi tumpukan vertikal penuh (`w-full flex-col gap-2.5 max-w-xs mx-auto`), lalu kembali ke `sm:flex-row sm:w-auto` di layar tablet/desktop.
- [ ] **12.3.5.** Rapikan compact trust strip mobile (`sm:hidden`) agar badge akreditasi, prodi, dan karir berjejer simetris dengan font `text-[10px]` dan padding `px-2.5 py-1`.

#### 12.4. Rekonfigurasi Kritis 3 Pilar Nilai & Profil Kampus (`InstitutionalProfileSection.tsx`)
- [ ] **12.4.1.** **Ubah Grid 3 Pilar:** Ganti `grid-cols-3` di mobile menjadi `grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5`.
- [ ] **12.4.2.** Format tampilan 3 pilar pada mobile menjadi *horizontal compact card* (`flex items-center space-x-3 p-3 text-left`), sehingga kata "Budi Luhur" tidak lagi terlipat paksa dan deskripsi memiliki ruang bernapas luas.
- [ ] **12.4.3.** Sesuaikan padding banner Visi 2040 menjadi `p-4 sm:p-7 lg:p-10` dan heading Visi menjadi `text-lg sm:text-2xl lg:text-3xl leading-snug`.
- [ ] **12.4.4.** Buat tombol tautan profil di strip alamat kampus menjadi `w-full sm:w-auto text-center justify-center min-h-[44px]` pada mobile.

#### 12.5. Harmonisasi Spacing & Kartu Keunggulan (`Benefits.tsx`)
- [ ] **12.5.1.** Ubah padding vertikal section menjadi `py-8 sm:py-14 lg:py-20`.
- [ ] **12.5.2.** Normalisasi heading section ke `text-xl sm:text-3xl lg:text-4xl font-bold sm:font-extrabold tracking-normal sm:tracking-tight`.
- [ ] **12.5.3.** Tetapkan internal padding kartu pada `p-4 sm:p-6` dan grid gap `gap-3.5 sm:gap-6`.

#### 12.6. Penataan Spacing Kartu Fasilitas (`Features.tsx`)
- [ ] **12.6.1.** Sesuaikan heading H2 dan deskripsi pengantar agar proporsional di layar smartphone.
- [ ] **12.6.2.** Sesuaikan padding kartu fasilitas menjadi `p-4 sm:p-6 lg:p-7` dan kurangi jarak list highlight menjadi `space-y-1.5` dengan font `text-xs`.

#### 12.7. Penyempurnaan Spacing Ekosistem Aplikasi (`AppSelectorSection.tsx`)
- [ ] **12.7.1.** Sesuaikan margin bawah header section ke `mb-6 sm:mb-10`.
- [ ] **12.7.2.** Sesuaikan jarak antar kartu aplikasi pada mobile menjadi `gap-3.5 sm:gap-6 lg:gap-8`.
- [ ] **12.7.3.** Pastikan tombol aksi *"Buka Portal Aplikasi ↗"* tetap memiliki tinggi ergonomis minimal 44px dengan teks `text-xs sm:text-sm`.

#### 12.8. Optimasi Keterbacaan Accordion FAQ (`FAQ.tsx`)
- [ ] **12.8.1.** Sesuaikan ukuran teks pertanyaan pada tombol accordion menjadi `text-xs sm:text-base font-bold leading-snug`.
- [ ] **12.8.2.** Beri jarak aman (`ml-2 shrink-0`) pada ikon Chevron agar tidak tertabrak teks pertanyaan yang mematah menjadi 2 baris di layar sempit.
- [ ] **12.8.3.** Atur padding tombol menjadi `px-3.5 py-3 sm:px-5 sm:py-4` dan padding panel jawaban menjadi `px-3.5 pb-3.5 pt-1.5 sm:px-5 sm:pb-4`.

#### 12.9. Penataan Spacing & Navigasi Footer (`Footer.tsx`)
- [ ] **12.9.1.** Padatkan padding vertikal footer menjadi `pt-8 pb-6 sm:pt-12 sm:pb-10`.
- [ ] **12.9.2.** Kurangi gap vertikal antar kolom di mobile menjadi `gap-6 sm:gap-8`.
- [ ] **12.9.3.** Verifikasi seluruh link menu akademik dan portal aplikasi memiliki tinggi sentuh minimal 40px untuk kenyamanan jempol.

---

## 6. Checklist Validasi & Matriks Pengujian Multi-Device (Mobile, Tablet, Desktop)

Pengujian harus dilakukan secara menyeluruh pada Chrome DevTools Responsive Mode dan perangkat nyata:

### 6.1. Matriks Pengujian Ukuran Viewport

| Kategori Perangkat | Rentang Viewport | Contoh Perangkat Uji | Kriteria Pemeriksaan Khusus |
| :--- | :--- | :--- | :--- |
| **Mobile Ultra-Kecil** | `320px – 360px` | iPhone SE (1st gen), Galaxy A01, Redmi Go | - Bebas horizontal scrollbar.<br>- Tidak ada teks terpotong pada 3 Pilar Visi.<br>- Tombol CTA memenuhi lebar kontainer (`w-full`). |
| **Mobile Standar** | `375px – 430px` | iPhone 13/14/15/16 Pro, Samsung S23/S24, Pixel 7 | - Judul H1 Hero seimbang (2 baris anggun, line-height lega).<br>- Padding kartu 16px terasa lapang dan proporsional.<br>- Touch targets minimal 44×44px. |
| **Tablet Portrait** | `640px – 768px` | iPad Mini, Galaxy Tab A7 (Portrait) | - Grid kartu otomatis beralih menjadi 2 kolom rapi.<br>- Tombol Hero beralih menjadi sejajar horizontal (`sm:flex-row`).<br>- 3 Pilar tertata simetris 3 kolom. |
| **Tablet Landscape** | `769px – 1023px` | iPad Air, Surface Pro (Landscape) | - Transisi navigasi drawer tetap stabil tanpa layout break.<br>- Kartu fasilitas dan keunggulan terbagi rata. |
| **Desktop / Laptop** | `≥ 1024px` | MacBook Air, Layar FHD (1920×1080) | - Desktop navbar horizontal aktif penuh.<br>- Tidak ada degradasi tampilan desktop dari perbaikan mobile-first. |

### 6.2. Skenario Pengujian Fungsional & Ergonomi
- [ ] **Uji Sentuh (Touch Ergonomics):** Seluruh tombol CTA, link navigasi, dan tombol accordion FAQ mudah ditekan menggunakan satu tangan (ibu jari) tanpa risiko salah pencet (*fat-finger error*).
- [ ] **Uji Orientasi (Portrait ke Landscape):** Pergantian orientasi layar pada smartphone tidak merusak posisi header sticky atau memicu elemen overlapping.
- [ ] **Uji Zoom Aksesibilitas (Text Zoom 120%–150%):** Teks tetap terbaca jelas tanpa terpotong di luar batas kartu (*content clipping*).
- [ ] **Zero Horizontal Scrollbar:** Sumbu X terkunci sempurna pada 100vw di semua viewport mobile.

---

## 7. Kriteria Keberhasilan (Acceptance Criteria)

1. **Responsivitas & Proporsi Tipografi Mobile Terstandarisasi:**
   - Tidak ada lagi heading raksasa yang mendominasi lebih dari 30% viewport mobile.
   - Karakter font Montserrat tidak berhimpitan secara horizontal (`tracking-normal` di mobile); line-height heading minimal 1.35 (`leading-snug`) sehingga baris teks tidak saling bertabrakan.
   - Hierarki ukuran font mengalir harmonis: H1 (24–26px) > H2 (20–24px) > H3 (16–18px) > Body (13–14px) > Micro (10–11px).
2. **Bebas Overlapping & Viewport Clipping:**
   - Mobile menu drawer tidak tumpang tindih dengan bar navigasi pada resolusi layar apa pun dan dapat di-scroll lancar pada smartphone berlayar pendek.
   - Section Hero bebas dari luapan elemen dekoratif glow ke samping layar (100% bebas horizontal scrollbar).
   - 3 Pilar Nilai Luhur di `InstitutionalProfileSection.tsx` tampil rapi tanpa teks "Budi Luhur" yang terlipat paksa.
3. **Konsistensi Spacing, Margin, Padding & Gap:**
   - Seluruh section mengadopsi padding horizontal seragam `px-4 sm:px-6 lg:px-8`.
   - Padding internal kartu distandarisasi pada `p-4 sm:p-6`, memberi ruang bernapas yang cukup bagi konten tanpa membuang area layar.
   - Padding vertikal section dipadatkan (`py-8 sm:py-14 lg:py-20`), mengeliminasi rasa lelah scrolling (*scroll fatigue*) bagi calon mahasiswa.
4. **Pendekatan Mobile-First Tanpa Regresi Desktop:**
   - Seluruh perubahan penyesuaian mobile menerapkan prefix responsif Tailwind (`sm:`, `md:`, `lg:`) sehingga tampilan tablet dan desktop tetap elegan, megah, dan proporsional.
5. **Integritas Teknis & Keamanan Fitur:**
   - Kompilasi build zero-error (`npm run build`).
   - Seluruh tautan resmi (PMB, profil, portal aplikasi port `:5173`, `:5174`, `:5175`) tetap berfungsi 100%.
   - Isolasi repositori terjaga, tidak ada modifikasi di luar cakupan `frontend/` dan dokumentasi.
