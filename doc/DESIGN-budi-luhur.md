---
version: "1.0.0"
name: STIKes Budi Luhur Cimahi Design System
description: Dokumentasi sistem desain dan pedoman identitas visual resmi STIKes Budi Luhur Cimahi untuk pengembangan portal ekosistem dan aplikasi mandiri. Sistem ini dibangun di atas fondasi warna biru institusional berwibawa (Deep Academic Blue #004B87 dan Vibrant Royal Blue #005EB8) dengan aksen Cyan/Sky Blue (#00A3E0) serta Gold Yellow (#FDE900 / #fdc800) yang melambangkan keunggulan dan kemuliaan budi pekerti. Tata letak mengandalkan horizontal banding penuh, kontras tinggi untuk keterbacaan bidang kesehatan, tombol aksi pill beradius 20px, tipografi modern Montserrat/Plus Jakarta Sans, serta struktur navigasi modular dengan off-canvas drawer dan top bar informasi institusi.

colors:
  # ─── Brand & Accent Colors ───
  primary-deep: "#004B87"          # Deep Academic Blue (warna latar utama header strip, sidebar, dan container featured)
  primary: "#005EB8"               # Vibrant Royal Blue (warna teks judul, border kartu, tombol sekunder, dan footer utama)
  accent-sky: "#00A3E0"            # Sky Blue / Cyan (warna top bar header, tombol aksi DAFTAR PMB, dan panel aktif)
  accent-sky-light: "#71C5E8"      # Light Sky Blue (warna panel kutipan pada kartu testimoni alumni)
  accent-gold: "#fdc800"           # Gold Yellow (warna hover tombol, garis penanda judul/divider, dan bintang akreditasi)
  accent-gold-light: "#FDE900"     # Bright Gold Yellow (warna latar khusus container program studi dan header kurikulum)
  on-primary: "#ffffff"            # Pure White untuk teks di atas background biru dan aksen

  # ─── Surface & Backgrounds ───
  canvas: "#ffffff"                # Pure White (latar belakang lembar konten, kartu artikel, dan grid)
  surface-light: "#f5f5f5"         # Off-White / Light Grey Surface (latar alternatif blok netral)
  surface-muted: "#f8fafc"         # Slate Tinted Neutral (latar kartu sekunder portal digital)
  band-navy: "#004B87"             # Full-bleed Band Biru Gelap
  band-royal: "#005EB8"            # Full-bleed Band Royal Blue
  band-sky: "#00A3E0"              # Full-bleed Band Cyan/Sky Blue
  band-gold: "#FDE900"             # Full-bleed Band Banner Program Akademik

  # ─── Text & Typography Colors ───
  ink: "#202020"                   # Heading Black (teks judul gelap berbobot tinggi)
  ink-heading: "#005EB8"           # Royal Blue Heading (warna default elemen h1-h6 pada style resmi)
  ink-body: "#444444"              # Slate Charcoal (warna paragraf standar berdasar stylesheet resmi institusi)
  ink-muted: "#777777"             # Medium Muted Grey (keterangan waktu, rincian tanggal, dan metadata)
  ink-light: "#ffffff"             # Pure White Text (untuk teks kontras di atas latar belakang biru)
  ink-nav: "#ffffff"               # White Nav Link (teks navigasi di dalam header/sidebar biru)
  ink-nav-hover: "#fdc800"         # Gold Nav Link Hover (efek interaksi menu navigasi)

  # ─── Semantic & Line Rules ───
  border-rule: "#bdbdbd"           # Divider Grey (garis pemisah horizontal pada header dan section)
  border-subtle: "#e3e3e3"         # Hairline Grey (garis bawah judul beraksen)
  border-active: "#005EB8"         # Active Border (garis tepi tombol outline dan elemen terfokus)

typography:
  display:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 64px
    letterSpacing: "-0.02em"
  hero-title:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 48px
    letterSpacing: "-0.01em"
  section-title:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 38px
    letterSpacing: "0"
  subsection-title:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: "0"
  feature-title:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: "0"
  lead:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 27px
    letterSpacing: "0"
  body:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: "0"
  body-sm:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: "0"
  button:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 18px
    letterSpacing: "0.05em"
  nav-link:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 22px
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: "0"
  meta:
    fontFamily: "Montserrat, 'Plus Jakarta Sans', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0"

rounded:
  none: 0px
  xs: 3px
  sm: 6px
  md: 15px
  lg: 20px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 15px
  lg: 20px
  xl: 30px
  xxl: 40px
  section: 60px
  giant: 80px
  band: 92px
  page: 100px

components:
  # ─── Global Chrome & Navigasi ───
  header-top-bar:
    backgroundColor: "{colors.accent-sky}"
    textColor: "{colors.on-primary}"
    iconColor: "{colors.accent-gold}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    height: 38

  nav-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    height: 70

  sidebar-drawer:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    activeBackground: "{colors.primary-deep}"
    activeIndicator: "cyan"
    width: 250

  # ─── Hero & Banner ───
  hero-slider-container:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.hero-title}"
    rounded: "{rounded.none}"
    minHeight: 480

  hero-badge:
    backgroundColor: "{colors.accent-sky}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"

  # ─── Buttons & Controls ───
  button-primary:
    backgroundColor: "{colors.accent-sky}"
    textColor: "{colors.on-primary}"
    hoverBackground: "{colors.accent-gold}"
    hoverTextColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    minHeight: 44

  button-secondary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    hoverBackground: "{colors.primary-deep}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    minHeight: 44

  button-ghost-academic:
    backgroundColor: "transparent"
    textColor: "{colors.on-primary}"
    hoverTextColor: "{colors.accent-gold}"
    typography: "{typography.lead}"
    rounded: "{rounded.none}"
    padding: "8px 0"

  button-outline-rounded:
    backgroundColor: "transparent"
    borderColor: "{colors.primary}"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "5px 20px"

  # ─── Cards & Containers ───
  feature-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-body}"
    borderColor: "{colors.border-subtle}"
    rounded: "{rounded.none}"
    padding: "20px"

  academic-banner:
    backgroundColor: "{colors.accent-gold-light}"
    textColor: "{colors.primary}"
    typography: "{typography.subsection-title}"
    rounded: "{rounded.none}"
    padding: "30px"

  testimonial-card:
    imageAreaWidth: "50%"
    quoteBackground: "{colors.accent-sky-light}"
    quoteTextColor: "{colors.primary}"
    authorBadgeBackground: "{colors.accent-sky}"
    authorBadgeTextColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"

  news-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-body}"
    titleColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "15px"

  partner-item:
    backgroundColor: "{colors.canvas}"
    padding: "20px"
    rounded: "{rounded.xs}"

  # ─── Accordion & Info Widgets ───
  accordion-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.feature-title}"
    height: 48

  accordion-content:
    backgroundColor: "{colors.accent-sky}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    padding: "20px"

  # ─── Footer ───
  footer-top:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "60px 0 30px"

  footer-bottom:
    backgroundColor: "{colors.primary}"
    borderColor: "{colors.on-primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "20px 0"

  # ─── Illustrative Ecosystem Examples ───
  ex-app-selector-card:
    description: "Kartu etalase portal utama Budi Luhur untuk memilih satu dari tiga aplikasi otonom."
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.border-subtle}"
    hoverBorderColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"

  ex-auth-card:
    description: "Kartu form autentikasi (login/register) di lingkungan PWA Budi Luhur."
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.border-subtle}"
    rounded: "{rounded.md}"
    padding: "{spacing.xxl}"

  ex-data-table:
    description: "Tabel data monitoring klinis/akademik siswi."
    headerBackground: "{colors.surface-light}"
    headerTextColor: "{colors.primary-deep}"
    cellTextColor: "{colors.ink-body}"
    rowBorder: "{colors.border-subtle}"
    padding: "{spacing.sm} {spacing.md}"
---

# STIKes Budi Luhur Cimahi — Design Language & Architectural Design System

Dokumen ini merupakan pedoman desain visual, hierarki antarmuka, dan sistem token resmi untuk ekosistem aplikasi STIKes Budi Luhur Cimahi. Pedoman ini dianalisis secara komprehensif menggunakan metodologi terstruktur dari referensi [DESIGN-sap.md](file:///home/azure/dev/projects/frontend/budi-luhur/doc/DESIGN-sap.md) dan diselaraskan secara akurat dengan identitas visual, kode warna, tipografi, struktur halaman, serta aset institusional dari website resmi [STIKes Budi Luhur Cimahi](https://www.stikesbudiluhurcimahi.ac.id/).

---

## 1. Overview & Institutional Identity

### 1.1 Konteks Institusi
**Sekolah Tinggi Ilmu Kesehatan (STIKes) Budi Luhur Cimahi** adalah institusi pendidikan tinggi kesehatan di bawah naungan **Yayasan Pambudhi Luhur 1976**, yang berlokasi di Kota Cimahi, Jawa Barat. Institusi ini memiliki rekam jejak panjang dalam pendidikan tenaga medis:
- **Tahun 1981**: Didirikan sebagai Sekolah Perawat Kesehatan (SPK).
- **Tahun 1999/2000**: Dikonversi menjadi Akademi Keperawatan (AKPER) Budi Luhur sesuai kebijakan Depkes RI.
- **Tahun 2006**: Mengalami peningkatan jenjang menjadi Sekolah Tinggi Ilmu Kesehatan (STIKes) Budi Luhur dengan mendirikan Program Studi D3 Kebidanan dan S1 Keperawatan.
- **Tahun 2011–Sekarang**: Menjalin kerja sama internasional keperawatan (Indonesia–Filipina, Timur Tengah, Arab Saudi, dan Kanada).

### 1.2 Visi & Misi Institusi
- **Visi Resmi (Target 2040)**:
  > *"Menjadi Perguruan Tinggi yang Religius, Berbudi Luhur, dan Unggul di Tingkat Internasional Tahun 2040."*
- **Nilai Pokok Karakter**:
  1. **Religius**: Menjunjung tinggi keimanan, moralitas, dan etika profesi kesehatan.
  2. **Berbudi Luhur**: Mengutamakan integritas, empati kemanusiaan, dan dedikasi pelayanan.
  3. **Unggul & Internasional**: Berorientasi mutu global, tata kelola perguruan tinggi yang baik (*Good University Governance*), serta riset dan pengabdian masyarakat bertaraf internasional.

### 1.3 Karakter Visual Desain
Berbeda dengan sistem SaaS korporat yang bernuansa netral murni, desain STIKes Budi Luhur mencerminkan karakter **Pendidikan Kesehatan Terpercaya & Berwibawa**:
1. **Warna Dominan Biru Bertingkat**: Mengombinasikan Deep Academic Blue (`#004B87`) sebagai penopang wibawa institusi dan Royal Blue (`#005EB8`) sebagai warna aksi dan pembaca konten, dipadukan dengan aksen Cyan/Sky Blue (`#00A3E0`) yang memberi kesan higienis, segar, dan ramah khas dunia medis.
2. **Aksen Keemasan (Gold Accent)**: Warna kuning emas (`#fdc800` / `#FDE900`) digunakan secara selektif sebagai aksen prestisius pada elemen judul, garis aksen, lencana akreditasi, dan efek interaksi hover.
3. **Pola Horizontal Banding**: Konten disusun melalui pita warna penuh (*full-bleed horizontal bands*) yang berselang-seling antara warna institusional dan kanvas putih bersih, memberikan jeda ritmis tanpa membutuhkan drop shadow tebal.
4. **Kontras Tinggi & Keterbacaan Optimal**: Seluruh teks judul dan konten diatur dengan rasio kontras ketat (WCAG AA/AAA) untuk kenyamanan sivitas akademika, tenaga medis, dan siswi pengguna portal.
5. **Aksen Pill 20px pada Elemen Aksi**: Tombol utama menggunakan kelengkungan ramah (*pill button* dengan radius 20px), mencerminkan kepedulian (*caring*) dan kemudahan interaksi bagi pengguna seluler.

---

## 2. Color Palette & Verification

Setiap kode warna dalam sistem ini diverifikasi langsung dari stylesheet resmi (`style.css`), atribut inline HTML, dan komponen navigasi live website STIKes Budi Luhur Cimahi.

### 2.1 Brand & Accent Colors

| Nama Token | Nilai HEX | Sumber Verifikasi | Peran & Penggunaan UI |
|---|---|---|---|
| `colors.primary-deep` | `#004B87` | `style.css` (bg-primary / sidebar) | Biru gelap institusional. Latar belakang frame header, container luar featured area, sidebar drawer, dan footer border. |
| `colors.primary` | `#005EB8` | `style.css` (bg-textPrimary / h1-h6) | Royal blue aktif. Warna standar teks judul, kartu profil, garis bingkai tombol outline, dan latar belakang footer atas. |
| `colors.accent-sky` | `#00A3E0` | `style.css` (.default-big-btn / top-bar) | Cyan / Sky Blue. Latar strip top bar informasi, latar tombol aksi DAFTAR PMB, dan latar accordion isi. |
| `colors.accent-sky-light`| `#71C5E8` | `content.md` (.ts-testimonial-item) | Biru langit lembut. Latar belakang kotak kutipan pada blok testimoni alumni. |
| `colors.accent-gold` | `#fdc800` | `style.css` (.title-bar-high:hover / .btn-view)| Kuning emas aksen. Garis aksen bawah judul (*title bar*), ikon kontak header, dan warna hover tombol primer. |
| `colors.accent-gold-light`| `#FDE900` | `content.md` (section prodi keperawatan) | Kuning cerah akademik. Latar belakang container penayangan profil program studi dan kurikulum. |
| `colors.on-primary` | `#ffffff` | Universal | Putih murni untuk seluruh tipografi di atas bidang biru dan tombol primer. |

### 2.2 Surface & Neutral Backgrounds

| Nama Token | Nilai HEX | Sumber Verifikasi | Peran & Penggunaan UI |
|---|---|---|---|
| `colors.canvas` | `#ffffff` | `style.css` (body background) | Bidang kanvas utama. Lembar baca berita, kartu program, dan permukaan form input. |
| `colors.surface-light` | `#f5f5f5` | `style.css` (.accent-bg / footer text) | Abu-abu sangat terang untuk latar selang-seling section netral. |
| `colors.surface-muted` | `#f8fafc` | Ekosistem Budi Luhur Frontend | Abu-abu netral lembut untuk kartu pendukung di portal digital. |
| `colors.band-navy` | `#004B87` | Live Website | Zona pita horizontal gelap untuk memisahkan babak informasi besar. |
| `colors.band-royal` | `#005EB8` | Live Website | Zona pita horizontal royal blue pada footer dan panel profil. |

### 2.3 Text & Typography Colors

| Nama Token | Nilai HEX | Sumber Verifikasi | Peran & Penggunaan UI |
|---|---|---|---|
| `colors.ink` | `#202020` | `content.md` (.content) | Hitam pekat netral untuk headline besar pada kanvas putih. |
| `colors.ink-heading` | `#005EB8` | `style.css` (h1-h6 color) | Biru royal untuk judul section, subjudul, dan tautan teks penting. |
| `colors.ink-body` | `#444444` | `style.css` (body color: #444444) | Abu-abu arang untuk teks tubuh paragraf; memberikan kontras seimbang tanpa membuat mata cepat lelah. |
| `colors.ink-muted` | `#777777` | `style.css` (metadata) | Abu-abu sedang untuk tanggal publikasi, nomor registrasi, dan caption pendukung. |
| `colors.ink-light` | `#ffffff` | Live Website | Putih murni untuk teks yang terletak di atas background biru dan gelap. |
| `colors.ink-nav` | `#ffffff` | `style.css` (nav link) | Putih solid untuk tautan menu pada header dan sidebar drawer. |
| `colors.ink-nav-hover` | `#fdc800` | `style.css` (header hover a) | Kuning emas saat kursor diarahkan ke menu navigasi. |

### 2.4 Semantic & Boundary Colors

| Nama Token | Nilai HEX | Sumber Verifikasi | Peran & Penggunaan UI |
|---|---|---|---|
| `colors.border-rule` | `#bdbdbd` | `style.css` (.section-divider) | Garis batas pemisah kolom dan divider vertikal/horizontal. |
| `colors.border-subtle` | `#e3e3e3` | `style.css` (.solid-underline:after) | Garis tepi kartu dan pembatas baris tabel yang lembut. |
| `colors.border-active` | `#005EB8` | `style.css` (button outline) | Garis penanda fokus form input dan status aktif selektor. |

---

## 3. Typography & Hierarchy

### 3.1 Tipografi Resmi & Rekomendasi Font Stack
1. **Font Utama Institusi**: **Montserrat** (`font-family: 'Montserrat', sans-serif;`) secara eksplisit didefinisikan pada `style.css` untuk elemen body, heading, dan navigasi website resmi.
2. **Font Pendukung (Web/Google Fonts)**: **Roboto** diimpor pada baris pertama `style.css` sebagai alternatif keterbacaan data tabular.
3. **Font Modern Portal Web**: Proyek portal digital Budi Luhur menggunakan **Plus Jakarta Sans** dan **Inter** yang memiliki metrik x-height tinggi dan geometri modern yang sangat serasi dengan karakter Montserrat.

### 3.2 Tangga Hierarki Tipografi

| Token Sistem | Ukuran (px) | Bobot (Weight) | Line Height | Letter Spacing | Penggunaan Spesifik |
|---|---|---|---|---|---|
| `typography.display` | 56px | 700 (Bold) | 64px | -0.02em | Judul display utama, teks hero banner edisi wisuda / penerimaan |
| `typography.hero-title` | 40px | 700 (Bold) | 48px | -0.01em | Judul slide hero utama (misal: "PENDAFTARAN MAHASISWA BARU") |
| `typography.section-title` | 30px | 600 (SemiBold) | 38px | 0 | Judul babak section (H2) seperti "PROFIL", "BERITA", "PARTNER" |
| `typography.subsection-title`| 24px | 600 (SemiBold) | 32px | 0 | Subjudul babak (H3), nama program studi utama |
| `typography.feature-title` | 20px | 500 (Medium) | 28px | 0 | Judul kartu artikel berita, judul accordion (H4) |
| `typography.lead` | 18px | 500 (Medium) | 27px | 0 | Paragraf pengantar, kutipan pembuka profil pimpinan institusi |
| `typography.body` | 15px | 400 (Regular) | 24px | 0 | Teks standar paragraf website institusi (terverifikasi dari `style.css`) |
| `typography.body-sm` | 14px | 400 (Regular) | 21px | 0 | Teks kartu informasi, link footer, isi accordion |
| `typography.button` | 14px | 700 (Bold) | 18px | 0.05em | Label tombol aksi (UPPERCASE) seperti "DAFTAR", "MASUK PORTAL" |
| `typography.nav-link` | 15px | 500 (Medium) | 22px | 0.02em | Tautan navigasi utama header dan link sidebar drawer |
| `typography.caption` | 13px | 400 (Regular) | 18px | 0 | Keterangan nomor telepon top bar, nama dosen, label foto |
| `typography.meta` | 12px | 400 (Regular) | 16px | 0 | Tanggal rilis berita, hak cipta footer, badge status kecil |

### 3.3 Prinsip Tipografi
- **Kapitalisasi Selektif (Uppercase)**: Teks tombol CTA, judul kategori program studi, dan item menu navigasi tingkat atas menggunakan huruf kapital (*uppercase*) dengan spasi antar-huruf longgar (`0.05em`) untuk menegaskan hierarki navigasi institusi.
- **Tingkat Keterbacaan Paragraf**: Paragraf bodi diatur pada line-height `1.5` hingga `1.6` dengan perataan *justify* atau *left-aligned* yang bersih.
- **Garis Aksen Emas (*Title Bar Accent*)**: Judul section penting dilengkapi garis dekoratif di bawah teks dengan ketebalan 3px dan lebar 40px–45px menggunakan warna emas (`#fdc800`) atau biru (`#005EB8`).

---

## 4. Spacing, Sizing, Grid & Layout

### 4.1 Skala Spacing

Sistem spacing STIKes Budi Luhur berakar pada ritme layout 8px dengan sub-step halus 4px dan interval standar Bootstrap/Tailwind:
- `spacing.xxs`: **2px** — Hairline border, fine padding
- `spacing.xs`: **4px** — Jarak antar-ikon dan teks inline
- `spacing.sm`: **8px** — Padding tombol mini, margin badge
- `spacing.md`: **15px** — Padding sel standar, margin antar paragraf
- `spacing.lg`: **20px** — Padding dalam kartu, margin dasar antar komponen
- `spacing.xl`: **30px** — Jarak antar kolom grid, margin bawah section header
- `spacing.xxl`: **40px** — Ruang vertikal antar kelompok konten
- `spacing.section`: **60px** — Padding atas-bawah section standar
- `spacing.giant`: **80px** — Padding vertikal pada desktop hero
- `spacing.band`: **92px** — Jarak pita footer atas (`padding: 92px 0 0px;` terverifikasi di `style.css`)
- `spacing.page`: **100px** — Section space untuk layout landing page utama

### 4.2 Grid & Lebar Kontainer

- **Grid Sistem**: 12 Kolom fluid berbasis Bootstrap / Tailwind Grid.
- **Lebar Kontainer Maksimal**:
  - `container-lg` / `max-w-7xl`: 1170px hingga 1280px (terpusat dengan margin otomatis).
  - Kontainer seluler: 100% lebar layar dengan padding lateral 15px–20px.
- **Pola Pita Horizontal (*Full-Width Banding*)**:
  1. **Top Bar**: Penuh selebar layar (`100%`) dengan latar Cyan (`#00A3E0`).
  2. **Main Menu**: Penuh selebar layar dengan latar Royal Blue (`#005EB8`).
  3. **Hero Slider Area**: Penuh selebar layar dengan ketinggian dinamis 450px–550px.
  4. **Featured Zone**: Penuh selebar layar dengan latar Deep Blue (`#004B87`) membungkus kontainer kartu putih di dalamnya.
  5. **Footer Zone**: Penuh selebar layar dengan latar Royal Blue (`#005EB8`) dan garis penutup putih.

### 4.3 Filosofi Ruang Kosong (Whitespace)
Ruang kosong digunakan secara struktural untuk memisahkan domain informasi:
- Di dalam section biru gelap (`#004B87`), modul konten diletakkan di atas kontainer kartu putih terpusat (`background: white`), menghasilkan kontras elegan antara bingkai institusi dan lembar kerja informasi.
- Antara elemen visual (foto dosen, banner wisuda) dan teks pendukung diberikan celah minimal 20px–30px agar tidak terasa padat.

---

## 5. Elevation, Depth & Shapes

### 5.1 Skala Ketinggian (Elevation)

| Level | Nilai Shadow / Efek | Penggunaan Spesifik |
|---|---|---|
| **0 (Flat)** | Tidak ada bayangan | Lembar kanvas utama, panel accordion, grid partner |
| **1 (Subtle)** | `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` | Kartu artikel berita saat default, bar pencarian |
| **2 (Elevated)** | `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)` | Kartu aplikasi portal saat disentuh kursor (hover), dropdown menu |
| **3 (Header/Footer)**| `box-shadow: 0px 1px 10px 5px rgba(0,0,0,0.2)` | Pembatas atas footer institusi (terverifikasi dari `steps/59/content.md`), sticky nav |
| **4 (Modal/Drawer)**| `box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25)` | Sidebar navigation drawer saat terbuka (`left: 0`), popup modal pencarian |

### 5.2 Skala Kelengkungan Sudut (Border Radius Scale)

| Token | Nilai | Implementasi UI |
|---|---|---|
| `rounded.none` | **0px** | Pita horizontal full-bleed, header bar, kontainer featured area, footer |
| `rounded.xs` | **3px** | Tombol navigasi hamburger (`border-radius: 3px` pada `.btn` di `content.md`) |
| `rounded.sm` | **6px** | Lencana akreditasi, indikator title bar decoration |
| `rounded.md` | **15px** | Tombol sekunder `READ MORE >>` (`border-radius: 15px`), kartu portal ekosistem |
| `rounded.lg` | **20px** | Tombol primer pill `DAFTAR` (`border-radius: 20px 20px 20px 20px` pada `.default-big-btn`) |
| `rounded.full`| **9999px** | Avatar lingkaran, ikon bulat media sosial, indikator status online |

### 5.3 Geometri Gambar & Fotografi
- **Foto Dokumentasi & Kampus**: Ditampilkan dalam proporsi tajam dengan rasio 16:9 atau 4:3, dibingkai sudut tegas (0px atau 4px halus) dengan efek hover zoom halus (`transform: scale(1.03)`).
- **Foto Dosen & Pimpinan**: Berbentuk potret formal rasio 3:4 dengan nama gelar lengkap dan jabatan di bawah gambar.
- **Foto Testimoni**: Ditampilkan 50% penuh pada kolom kiri modul testimoni berpadu langsung dengan kotak warna kutipan di sisi kanan.

---

## 6. UI Components & Interaction Patterns

Setiap komponen berikut merepresentasikan pola antarmuka resmi yang diterapkan pada ekosistem web STIKes Budi Luhur:

### 6.1 Header & Navigasi

#### 1. Header Top Area (Bar Informasi Kontak & Bahasa)
- **Latar Belakang**: `{colors.accent-sky}` (`#00A3E0`).
- **Tinggi**: 38px–42px.
- **Konten Kiri**: Ikon telepon, WhatsApp (`081223634281`), dan email resmi (`info@stikesbudiluhurcimahi.ac.id`) berwarna emas/putih.
- **Konten Kanan**: Ikon media sosial resmi (Twitter/X, Facebook, Instagram, YouTube) dan pengalih bahasa (Indonesia & English).

#### 2. Main Menu Area (Bilah Navigasi Utama)
- **Latar Belakang**: `{colors.primary}` (`#005EB8`) dengan kontainer terpusat.
- **Elemen Kiri**: Tombol hamburger (`.fa-bars`) berukuran 45×45px untuk memicu off-canvas drawer.
- **Elemen Tengah**: Logo resmi STIKes Budi Luhur Cimahi berukuran proporsional horizontal.
- **Elemen Kanan**: Tombol modal pencarian (`.fa-search`).

#### 3. Sidebar Navigation Drawer (Off-Canvas Menu)
- **Latar Belakang**: `{colors.primary-deep}` (`#004B87`).
- **Lebar**: 250px (tersembunyi pada `left: -250px`, bergeser ke `left: 0px` saat aktif via transisi 0.4s).
- **Elemen Menu**:
  - Beranda
  - Profil
  - Program Studi (Dropdown akordeon: D3 Kebidanan, D3 Keperawatan, Profesi Ners & S1 Keperawatan, Pendidikan Bidan)
  - Galeri (Galeri Alumni, Dosen)
  - Layanan Digital: E-Journal, Perpustakaan, LAJAMTU, LPPM, Berita, Alumni, Kemahasiswaan.
- **Indikator Aktif**: Teks cyan terang dengan garis batas vertikal kiri berwarna cyan (`border-left: 3px solid cyan`).

### 6.2 Hero Section & Slider

- **Komponen**: Banner gambar bergerak (Nivo-slider) menampilkan pengumuman akademik krusial (misal: Penerimaan Mahasiswa Baru / Dies Natalis).
- **Tipografi Judul**: `{typography.hero-title}` (40pt bold) putih dengan bayangan teks lembut.
- **Tombol Aksi Hero**: Tombol pill berlatar `{colors.accent-sky}` bertuliskan **DAFTAR** atau **MASUK PORTAL** dengan lebar minimal 162px dan tinggi 48px.

### 6.3 Tombol & Kontrol Interaksi (Buttons)

#### 1. `button-primary` (Tombol Aksi Utama / PMB)
- **Class Resmi**: `.default-big-btn`
- **Tampilan**: Latar `#00A3E0`, teks `#ffffff`, `border-radius: 20px`, padding vertikal 12px–15px, uppercase bold.
- **Interaksi Hover**: Berubah menjadi latar emas `#fdc800` dengan teks gelap `#212121` via transisi 0.3s.

#### 2. `button-outline-rounded` (Tombol Baca Selengkapnya)
- **Class Resmi**: `.artikel-size`
- **Tampilan**: Latar transparan, garis tepi 1px solid `#005EB8`, warna teks `#005EB8`, `border-radius: 15px`, padding `5px 20px`.
- **Interaksi Hover**: Latar terisi `#005EB8`, teks berubah putih `#ffffff`.

#### 3. `button-ghost-academic` (Tautan Transparan Kartu Jurusan)
- **Class Resmi**: `.sidebar-ghost-btn`
- **Tampilan**: Latar transparan, teks putih uppercase, bobot font 500, padding 8px 0.
- **Interaksi Hover**: Teks berubah menjadi emas `#fdc800` atau biru tua `#002147`.

### 6.4 Kartu & Wadah Konten

#### 1. Kartu Program Studi (2×2 Grid)
- **Format**: Gambar sampul jurusan berdimensi responsif dengan overlay transparan beraksen biru institusional.
- **Tautan**: Teks jurusan muncul di tengah atau bawah sebagai ghost button yang mengarahkan ke kurikulum prodi.

#### 2. Kartu Testimoni Alumni Internasional
- **Format 2 Kolom**:
  - Kolom Kiri (50%): Foto profesional alumni yang bekerja di rumah sakit dalam/luar negeri (misal: Saudi Arabia, Qatar, Kanada).
  - Kolom Kanan (50%): Kotak kutipan berlatar biru langit lembut (`#71C5E8`) dilengkapi ikon tanda kutip dan teks pengalaman kerja.
  - Baris Bawah: Lencana nama alumni dan tanggal kelulusan di atas latar Cyan (`#00A3E0`).

#### 3. Kartu Berita & Publikasi Ilmiah
- **Format**: Kartu vertikal kanvas putih (`#ffffff`).
- **Elemen**: Foto kegiatan (lebar 95%), judul berita berbobot tebal dalam balutan warna `{colors.primary}` (`#005EB8`), dan tautan detail artikel.

#### 4. Grid Logo Mitra Internasional (*Our Partners*)
- **Format**: Carousel baris horizontal berisi logo universitas dan lembaga mitra kesehatan (Centro Escolar University, CHEERS Philippines, Burapha University Thailand, MAHSA University Malaysia, dll.).
- **Tampilan**: Logo ditampilkan bersih di atas latar putih dengan margin 60px antar item.

### 6.5 Accordion Informasi (Visi, Misi, Sarana, Beasiswa)

- **Header Accordion**: Judul dengan garis horizontal dekoratif di samping teks; teks berwarna putih atau cyan (`#00A3E0`).
- **Isi Accordion**: Latar belakang cyan solid (`#00A3E0`) dengan teks putih rapi atau latar transparan dengan teks bodi arang.

### 6.6 Footer Institusi (Triple Column Footer)

- **Latar Belakang**: Latar Royal Blue penuh (`#005EB8`) dengan jarak atas terverifikasi `padding: 92px 0 0px`.
- **Kolom 1 (Contact Us)**:
  - Alamat resmi: *Jl. Kerkof No. 243 Leuwigajah Cimahi 40532 Jawa Barat - Indonesia.*
  - Telepon & Fax: *(022) 667 4696*
  - Email: *info@stikesbudiluhurcimahi.ac.id*
  - Ikon sosial media dan pengalih bahasa.
- **Kolom 2 (Academic Portals)**:
  - Tautan ke PMB Online (`pmb.stikesbudiluhurcimahi.ac.id`).
  - E-Academic Mahasiswa (`mahasiswa.stikesbudiluhurcimahi.ac.id`).
  - E-Library Perpustakaan (`stikesbudiluhurcimahi.ac.id/penelitian/perpustakaan`).
  - E-Journal JKBL (`jurnal.stikesbudiluhurcimahi.ac.id`).
- **Kolom 3 (Career & Alumni)**:
  - Bursa Tenaga Kerja & Tracer Study Alumni.
- **Bilah Hak Cipta Bawah**:
  - Garis pemisah border putih 2px.
  - Teks: *Copyright © 2019–2026 - STIKes BUDILUHUR CIMAHI - All rights reserved.*

### 6.7 Komponen Ekosistem Digital (Pola Implementasi Portal & Aplikasi)

Komponen berikut merupakan adaptasi pola desain Budi Luhur untuk kebutuhan landing page portal dan 3 aplikasi mandiri:

#### 1. `ex-app-selector-card` (Kartu Pemilih Aplikasi pada Portal Utama)
- **Permukaan**: Kanvas putih (`#ffffff`) dengan garis tepi lembut `1px solid rgba(0, 94, 184, 0.15)`.
- **Header Kartu**: Lencana badge berwarna biru/cyan menunjukkan ID instansi, port aktif, dan database terisolasi.
- **Isi**: Judul aplikasi bold, deskripsi kelompok siswi sasaran, daftar fitur utama dengan ikon checklist medis.
- **Aksi Navigasi Langsung**: Dua tombol terpisah — Tombol primer pill menuju `/auth/login` dan tombol teks sekunder menuju `/auth/register`.

#### 2. `ex-auth-card` (Form Autentikasi Aplikasi Mandiri)
- **Permukaan**: Kanvas putih dengan sudut lengkung `rounded.md` (15px) berlatar belakang gradasi halus biru institusional ke putih.
- **Input Field**: Padding 12px 16px, border `#bdbdbd`, fokus ring dengan warna aksen `#005EB8`.
- **Tombol Submit**: Tombol penuh berlatar `#005EB8` atau `#00A3E0` dengan teks huruf kapital bold.

---

## 7. Responsive Strategy & Breakpoints

### 7.1 Breakpoints

| Nama Breakpoint | Lebar Layar | Karakteristik Perubahan Tata Letak |
|---|---|---|
| **Mobile Kecil** | `< 480px` | Tata letak 1 kolom murni. Top bar menyembunyikan kontak teks panjang. Tombol DAFTAR mengecil ke font 8pt–10pt dengan padding proporsional. Drawer navigasi menutupi 80% layar. |
| **Mobile Standar** | `480px – 767px` | Navigasi atas berubah menjadi bilah mobile dengan logo mobile dan tombol toggle hamburger. Grid fitur 2 kolom bertumpuk vertikal. |
| **Tablet** | `768px – 991px` | Grid 2 kolom dipertahankan. Sidebar drawer tetap menjadi mekanisme navigasi sekunder. Kartu testimoni menampilkan gambar dan teks tersusun proporsional. |
| **Desktop / Laptop**| `992px – 1199px`| Tampilan penuh 12 kolom Bootstrap. Menu desktop aktif dengan dropdown program studi dan logo terpusat. |
| **Wide Desktop** | `≥ 1200px` | Kontainer terkunci pada 1170px–1280px dengan margin seimbang di kiri dan kanan; pita warna tetap *full-bleed* ke tepi layar monitor. |

### 7.2 Ukuran Sentuh Minimal (Touch Targets)
- Semua tombol aksi seluler memenuhi standar WCAG AAA minimal **44×44px** (misal tombol hamburger berukuran 45×45px dan tombol primer memiliki tinggi minimal 44px–48px).
- Tautan teks di dalam footer dan sidebar memiliki ruang vertikal minimal 36px–40px per item agar mudah diketuk oleh jari pengguna di layar smartphone.

---

## 8. Brand Assets, Logo & Iconography

### 8.1 Aset Logo Terverifikasi
Berdasarkan berkas statis pada server resmi STIKes Budi Luhur:
1. **Logo Horizontal Utama (`logo-stikes.png`)**:
   - URL: `https://stikesbudiluhurcimahi.ac.id/bahan/img/logo-stikes.png`
   - Komposisi: Lambang perisai segilima berwarna biru-emas dengan buku terbuka, obor menyala, dan tulisan melingkar Yayasan Pambudhi Luhur 1976 di samping teks institusi "STIKes BUDI LUHUR CIMAHI".
2. **Logo Ikon / Favicon (`stikes-logo.png`)**:
   - URL: `https://stikesbudiluhurcimahi.ac.id/bahan/img/stikes-logo.png`
   - Digunakan sebagai favicon browser dan lencana kecil pada header prodi.
3. **Logo Footer Terbalik (`logo-2.png`)**:
   - URL: `https://stikesbudiluhurcimahi.ac.id/bahan/img/logo-2.png`
   - Versi kontras tinggi berlatar transparan untuk penempatan di atas latar belakang biru royal.
4. **Logo Mobile (`logo-mobile.png`)**:
   - Digunakan khusus pada bilah navbar mobile responsif.

### 8.2 Sistem Ikonografi
- **Web Resmi**: Menggunakan ikon vektor **FontAwesome 4.7.0** (`fa-bars`, `fa-phone`, `fa-whatsapp`, `fa-envelope`, `fa-map-marker`, `fa-search`, `fa-caret-down`).
- **Implementasi Modern Ekosistem**: Menggunakan pustaka **Lucide React** dengan padanan semantik:
  - Kontak & Navigasi: `Phone`, `Mail`, `MapPin`, `Menu`, `X`, `Search`, `ChevronDown`, `ExternalLink`.
  - Medis & Kesehatan: `Heart`, `ShieldCheck`, `Activity`, `Pill`, `Calendar`, `Sparkles`.

### 8.3 Panduan Fotografi
- Menampilkan foto asli fasilitas kampus (Gedung milik sendiri di Jl. Kerkof, Laboratorium Keperawatan & Kebidanan ber-AC, Asrama Mahasiswa, Klinik Umum Budi Luhur).
- Menghindari visual kartun atau ilustrasi generik tanpa konteks medis.
- Foto alumni yang berkarir di luar negeri disajikan dengan seragam resmi dan latar rumah sakit tempat bertugas untuk mempertegas kredibilitas internasional.

---

## 9. Design Guidelines (Do's and Don'ts)

### Do (Wajib Diterapkan)
1. **Gunakan Biru Institusi sebagai Warna Utama**: Utamakan Deep Blue (`#004B87`) untuk struktur pembungkus dan Royal Blue (`#005EB8`) untuk judul teks dan kartu aktif.
2. **Pertahankan Garis Aksen Emas**: Sisipkan aksen warna emas (`#fdc800`) setebal 3px di bawah judul section untuk menjaga identitas visual khas Budi Luhur.
3. **Gunakan Tombol Pill pada Aksi Utama**: Terapkan `border-radius: 20px` pada tombol CTA primer untuk mempertahankan keselarasan dengan tombol PMB resmi.
4. **Pisahkan Section dengan Horizontal Banding**: Gunakan blok warna pita horizontal penuh selebar layar untuk membedakan kategori informasi besar secara ritmis.
5. **Cantumkan Legalitas & Alamat Lengkap**: Sertakan alamat resmi kampus di Leuwigajah Cimahi dan nomor kontak terverifikasi pada setiap footer aplikasi.
6. **Pastikan Kontras Tinggi pada Seluler**: Pastikan teks putih selalu berada di atas bidang biru gelap atau royal, dan gunakan teks `#444444` di atas kanvas putih.

### Don't (Dilarang)
1. **Jangan Menggunakan Warna Merah/Pink sebagai Warna Utama Institusi**: Warna coral/pink hanya diperkenankan sebagai aksen tematik khusus kesehatan siswi/anemia di level kartu konten, bukan sebagai warna pengganti identitas Budi Luhur.
2. **Jangan Menggunakan Radius Ekstrem pada Kontainer**: Jangan membulatkan tepi kontainer pita horizontal penuh; pita section harus tetap bersudut siku (`0px`) agar terbaca sebagai zona arsitektur web.
3. **Jangan Mengaburkan Logo Institusi**: Logo lambang perisai STIKes Budi Luhur tidak boleh diubah warna, di-stretch, atau dihilangkan elemen teks yayasannya.
4. **Jangan Menyematkan Drop Shadow Tebal yang Gelap**: Hindari bayangan hitam tebal ala neumorphism; kedalaman visual Budi Luhur bertumpu pada kontras warna bidang (*color zoning*).
5. **Jangan Mengarang Informasi Akademik**: Program studi, nomor kontak pimpinan, dan tautan portal wajib merujuk pada data resmi yang terverifikasi.

---

## 10. Status Verifikasi & Catatan Teknis Arsitektur

Dokumentasi ini membedakan secara tegas antara fakta yang diverifikasi langsung dari website institusi dengan adaptasi arsitektur portal digital:

| Aspek Desain | Status | Catatan Teknis & Dasar Fakta |
|---|---|---|
| **Identitas & Alamat Kampus** | **Terverifikasi 100%** | Jl. Kerkof No. 243 Leuwigajah Cimahi 40532, Telp (022) 667 4696, Yayasan Pambudhi Luhur 1976. |
| **Palet Warna Utama** | **Terverifikasi 100%** | `#004B87`, `#005EB8`, `#00A3E0`, `#71C5E8`, `#fdc800`, `#FDE900` diambil langsung dari file `style.css` dan DOM live website. |
| **Daftar Program Studi** | **Terverifikasi 100%** | D3 Keperawatan, D3 Kebidanan, Pendidikan Ners (S1 & Profesi), Pendidikan Bidan (S1 & Profesi). |
| **Layanan Digital Institusi** | **Terverifikasi 100%** | PMB Online, E-Akademic, E-Library, E-Journal (JKBL). |
| **Tipografi Resmi Website** | **Terverifikasi 100%** | Montserrat dan Roboto sebagaimana dideklarasikan pada stylesheet institusi. |
| **Font Stack Ekosistem Web** | **Adaptasi Modern** | Penggunaan Plus Jakarta Sans dan Inter pada portal Vite merupakan peningkatan kompatibilitas UI modern tanpa merusak hierarki Montserrat. |
| **Pola Ekosistem 3 Aplikasi** | **Spesifikasi PRD Proyek**| Pemisahan data dan navigasi langsung ke alur autentikasi (PWA-first) diatur berdasarkan PRD dan rencana arsitektur monorepo Budi Luhur. |

---

*Dokumentasi ini disahkan sebagai pedoman acuan desain resmi (Design System of Record) untuk implementasi antarmuka portal dan seluruh aplikasi dalam ekosistem STIKes Budi Luhur Cimahi.*
