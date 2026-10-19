# Rencana Implementasi Pengembangan: PRELUNA — Premarital Health & Immunization (App 3)

## Master Plan: Identitas Visual Khusus (Royal Emerald & Champagne Gold), Transformasi Modul Imunisasi Tetanus Toxoid (TT), & Penyelarasan Kesehatan Pranikah

> **Panduan Dokumen:** Dokumen ini merupakan rencana induk (_master development plan_) untuk aplikasi ketiga dalam ekosistem Budi Luhur yang berlokasi di `budi-luhur/apps/app3` (Frontend: port 5175, Backend: port 4003). Seluruh analisis dan rencana disusun berdasarkan acuan spesifikasi resmi pada `frontend/info.md`.
>
> **Prinsip Utama:**
>
> 1. **Bebas Kloning & Identitas Otentik:** Memisahkan identitas App 3 secara tegas dari App 1 (Femory — Anemia Remaja Putri UKS) dan App 2 (Pilluna — Pil KB & SADARI Wanita Usia Subur). PRELUNA didesain khusus sebagai aplikasi **Kesehatan Pranikah & Imunisasi Tetanus Toxoid (TT) Calon Pengantin (Catin)** dengan karakter yang sakral, elegan, berwibawa, dan menenangkan (_Royal Emerald & Champagne Gold_).
> 2. **Integritas Backend Terjaga:** Mempertahankan 100% kompatibilitas backend Express.js dan database PostgreSQL Neon (`fe_tablet_app3`) yang sudah ada tanpa merusak skema tabel, endpoint REST API, otentikasi JWT, dan logika transaksi data.
> 3. **Penyelarasan Domain Medis:** Mengadaptasi seluruh antarmuka frontend, istilah medis, alur pencatatan, dan sistem pengingat dari suplemen zat besi mingguan menjadi **skrining imunisasi TT 5 dosis Kemenkes RI** dan pemantauan kesiapan fisik calon pengantin.

---

## 1. Analisis Kondisi Saat Ini (Current State Analysis)

### 1.1. Arsitektur Proyek Eksisting `budi-luhur/apps/app3`

Saat diperiksa, direktori `budi-luhur/apps/app3` memiliki struktur full-stack monorepo:

```
budi-luhur/apps/app3/
├── backend/
│   ├── .env                    # PORT=4003, DATABASE_URL (Neon PostgreSQL: fe_tablet_app3), GEMINI_API_KEY
│   ├── package.json            # express, pg, jsonwebtoken, bcryptjs, tsx
│   └── src/
│       ├── app.ts              # Express routing /api/v1/*
│       ├── server.ts           # Listen port 4003
│       ├── config/             # Environment & DB config
│       ├── db/                 # schema.sql, init.ts, seed.ts, seedData.json
│       ├── middlewares/        # authMiddleware, errorMiddleware
│       └── modules/            # admin, articles, auth, buddy, consultation, consumption, schedules, users
└── frontend/
    ├── .env                    # VITE_API_BASE_URL=http://localhost:4003/api/v1, VITE_APP_TITLE=FEMORY - Aplikasi 3
    ├── index.html              # Title: "FEMORY - Sahabat Sehat Cegah Anemia", Theme-color: #e11d48
    ├── package.json            # React 19, Vite 6, Tailwind CSS v4, Lucide React, Axios
    └── src/
        ├── app/routes.tsx      # Rute lengkap user dan admin
        ├── features/           # admin, auth, buddy, consultation, consumption, dashboard, education, onboarding, schedule, splash, user
        ├── shared/             # components (ui, domain, profile), api, utils, constants
        └── index.css           # Styling dasar Tailwind CSS v4
```

### 1.2. Masalah Utama Kondisi Saat Ini (Legacy Cloning Issues)

1. **Identitas Masih Berupa Salinan Mentah FEMORY (App 1):**
   - Judul aplikasi di `.env` dan `index.html` masih tertulis _"FEMORY - Sahabat Sehat Cegah Anemia"_.
   - Palet warna masih menggunakan merah muda pekat (_Hot Rose_ `#e11d48`, latar `#fff5f7`), penuh ornamen emoji (`🌸`, `✨`), dan ikon hati remaja.
   - Materi teks di seluruh halaman masih berfokus pada remaja putri usia SMP/SMA di lingkungan UKS sekolah, meminum Tablet Tambah Darah (TTD) 1x seminggu untuk mencegah anemia haid.
2. **Tidak Sesuai dengan Kebutuhan `info.md`:**
   - Dalam `frontend/info.md`, aplikasi ketiga didefinisikan sebagai **PRELUNA (Premarital Health & Immunization)** untuk calon pengantin mengelola kesehatan pranikah dan imunisasi Tetanus Toxoid (TT).
   - Fitur-fitur vital seperti status dosis imunisasi TT (TT1 s.d. TT5), masa perlindungan tetanus, pencatatan faskes/nakes/batch vaksin, dan jadwal interval Kemenkes RI belum diimplementasikan di frontend.
3. **Modul Kloning yang Tidak Relevan:**
   - Modul `buddy` ("Kelompok Tim Remaja UKS") dan streak harian anemia tidak cocok dengan konteks calon pengantin yang membutuhkan privasi medis pernikahan dan koordinasi bersama pasangan/faskes.
   - Form profil meminta data "Nama Sekolah / Kelas" (`school_or_org`), yang seharusnya mencatat "Asal Faskes / KUA / Domisili Catin" dan tanggal rencana pernikahan.

---

## 2. Analisis Kesenjangan (Gap Analysis) vs. `frontend/info.md`

Tabel berikut memetakan kesenjangan mendalam antara spesifikasi kebutuhan pada `info.md` dengan kondisi implementasi frontend saat ini:

| Modul / Fitur               | Kebutuhan Resmi `info.md`                                                                                                          | Kondisi Eksisting App 3 (Saat Ini)                                         | Strategi Solusi & Penyesuaian Frontend                                                                                                                     |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identitas Produk**        | **PRELUNA** (_Premarital Health & Immunization_): Pendamping kesehatan pranikah dan imunisasi TT calon pengantin.                  | Masih bernama FEMORY, bertema pencegahan anemia remaja putri sekolah.      | Rebranding total ke **PRELUNA**: Ganti logo, title, favicon, palet warna, tipografi, dan copy teks klinis pranikah.                                        |
| **Target Pengguna**         | Calon pengantin perempuan & laki-laki, didukung petugas kesehatan (Bidan, Puskesmas, KUA).                                         | Siswi remaja putri SMP/SMA dan guru pembina UKS.                           | Sesuaikan segmentasi audiens menjadi pasangan calon pengantin dewasa (19–35+ tahun) dan petugas faskes/KUA.                                                |
| **Palet Warna & Nuansa**    | Sakral, elegan, berwibawa, higienis, dan menenangkan (_Serene Matrimonial Elegance_).                                              | Hot Rose `#e11d48`, baby pink, penuh emoji ceria remaja.                   | Terapkan **Royal Emerald (`#059669`)** & **Champagne Gold (`#D97706`)** di atas kanvas **Ivory Mist (`#FAFAF9`)**. Bebas 100% dari warna pink!             |
| **1. Beranda (Dashboard)**  | Ringkasan status imunisasi TT, progres perlindungan, dan pengingat dosis berikutnya.                                               | Meteran streak suplemen TTD mingguan dan kartu kelompok UKS (`BuddyCard`). | Rancang widget baru: **Status Dosis TT Aktif (TT1–TT5)**, **Masa Perlindungan (Tahun)**, **Countdown Tanggal Pernikahan**, dan Kartu Akses Cepat Faskes.   |
| **2. Status Imunisasi**     | Progres status imunisasi TT berdasarkan riwayat (status TT1 s.d. TT5) dan durasi proteksi.                                         | Status level anemia ('Normal', 'Anemia Ringan', level 'Pemula Sehat').     | Visualisasikan tahapan 5 dosis TT resmi Kemenkes: status dosis tercapai, durasi kekebalan (3 thn, 5 thn, 10 thn, 25+ thn), dan sertifikat digital.         |
| **3. Riwayat Imunisasi**    | Pencatatan jenis imunisasi, tanggal suntik, lokasi faskes (Puskesmas/Klinik), nakes, nomor batch vaksin, dan keterangan.           | Tabel konsumsi tablet suplemen TTD dengan status ON_TIME/MISSED.           | Transformasi `HistoryView`: Daftar riwayat vaksinasi TT lengkap dengan badge dosis, lokasi faskes, nama bidan/nakes, batch vaksin, dan unduh bukti suntik. |
| **4. Jadwal Imunisasi**     | Informasi jadwal imunisasi TT berikutnya berdasarkan interval waktu klinis Kemenkes RI.                                            | Jadwal jam minum tablet mingguan (misal Sabtu jam 20:00).                  | Terapkan kalender interval imunisasi TT: rekomendasi tanggal dosis lanjutan (misal TT2: 4 minggu pasca TT1, TT3: 6 bulan pasca TT2, dst.).                 |
| **5. Pengingat (Reminder)** | Notifikasi cerdas agar calon pengantin tidak terlewat jadwal suntik TT sebelum akad nikah.                                         | Pengingat jam minum obat mingguan dengan alarm 15 menit sebelum.           | Pengingat berbasis kalender dosis vaksin TT (H-7, H-3, dan Hari H jadwal kunjungan faskes) serta notifikasi verifikasi dari faskes.                        |
| **6. Edukasi Kesehatan**    | Materi kesehatan pranikah: Imunisasi TT, Tetanus Maternal & Neonatal, skrining pranikah, nutrisi reproduksi, dan gaya hidup sehat. | Artikel anemia remaja, tips menstruasi, dan makanan tinggi zat besi.       | Rombak katalog artikel ke kategori: _Imunisasi TT_, _Tetanus Maternal & Neonatal_, _Skrining Pranikah_, _Nutrisi & Asam Folat_, _Keluarga Sehat_.          |
| **7. Profil Pengguna**      | Data diri calon pengantin, tanggal pernikahan, faskes/KUA rujukan, dan data calon pasangan.                                        | Data siswi (nama sekolah/kelas, kadar Hb darah, friend code).              | Sesuaikan `SetupProfileView` & `ProfileView`: Data catin, tanggal hari H pernikahan, faskes rujukan KUA, golongan darah/rhesus, dan resume imunisasi.      |
| **Konsultasi AI**           | Asisten cerdas edukasi persiapan kesehatan pranikah dan imunisasi TT.                                                              | Bot generik anemia FEMORY.                                                 | Personalisasikan asisten AI menjadi **"Luna Pranikah"** — Konselor Ahli Kesehatan Pranikah & Imunisasi TT Catin.                                           |
| **Portal Admin**            | Manajemen verifikasi imunisasi catin oleh Bidan Puskesmas / Petugas KUA.                                                           | Pemantauan siswi sekolah dan pengiriman pengingat minum TTD.               | Selaraskan portal admin untuk pencatatan vaksinasi TT catin, verifikasi status perlindungan, dan ekspor laporan imunisasi pranikah.                        |

---

## 3. Strategi Penyesuaian Frontend & Pemetaan Kompatibilitas Backend

### 3.1. Prinsip Utama Kompatibilitas Backend 100%

Backend `budi-luhur/apps/app3/backend` menggunakan arsitektur REST API Express.js yang terhubung ke PostgreSQL Neon (`DATABASE_URL`). Kita **TIDAK PERLU** merusak atau mengubah struktur kolom backend yang sudah berjalan. Sebaliknya, frontend akan memetakan payload data secara cerdas dan semantik:

| Entitas Backend          | Skema / Kolom Eksisting                                                                                      | Pemetaan Semantik Frontend PRELUNA                                                                                                                                                                                                                                                                                                                                                                    |
| :----------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`users`**              | `id`, `name`, `email`, `role`, `phone`, `avatar_url`, `gender`, `date_of_birth`                              | Digunakan untuk data calon pengantin (perempuan maupun laki-laki) serta akun petugas kesehatan/admin.                                                                                                                                                                                                                                                                                                 |
| **`user_profiles`**      | `school_or_org`<br>`friend_code`<br>`notes`<br>`height`, `weight`<br>`blood_type`<br>`hb_level`, `hb_status` | - `school_or_org` ➔ Ditampilkan sebagai **"Faskes / KUA / Domisili Catin"**.<br>- `notes` ➔ Menyimpan informasi **"Nama Calon Pasangan & Tanggal Pernikahan"**.<br>- `friend_code` ➔ Kode Pasangan (_Couple Sync Code_) untuk menghubungkan data catin.<br>- `height`, `weight`, `blood_type`, `hb_level` ➔ Parameter vital **Skrining Fisik Pranikah (IMT, Golongan Darah/Rhesus, Kadar Hb Catin)**. |
| **`products`**           | `name`, `category`, `sku`, `stock`, `unit`, `price`                                                          | Menyimpan jenis vaksin: **Vaksin Tetanus Toxoid (TT)**, **Vaksin Dt/Td**, dan suplemen mikronutrien pranikah (Asam Folat).                                                                                                                                                                                                                                                                            |
| **`reminder_schedules`** | `tablet_name`, `dosage`, `frequency`, `day_of_week`, `time_slot`, `instructions`, `is_enabled`               | Dikelola sebagai **Jadwal Dosis Vaksin TT Aktif** (misal: `tablet_name` diisi _"Vaksin Tetanus Toxoid (TT2)"_, dengan tanggal janji temu faskes).                                                                                                                                                                                                                                                     |
| **`consumption_logs`**   | `title`, `category`, `scheduled_date`, `scheduled_time`, `taken_at`, `status`, `notes`, `taken_by`           | Menjadi **Buku Catatan Riwayat Imunisasi TT**: `title` (misal _"Suntik Vaksin TT1"_), `category` (_"Imunisasi TT"_), `scheduled_date` (tanggal vaksinasi), `notes` (Nama Faskes, Petugas Nakes, No. Batch Vaksin). Status: `ON_TIME` (Sudah Divaksin), `PENDING` (Menunggu Jadwal), `MISSED` (Terlewat).                                                                                              |
| **`articles`**           | `title`, `category`, `summary`, `content`, `image_url`, `status`                                             | Menyajikan artikel resmi kesehatan pranikah dan pencegahan tetanus maternal-neonatal sesuai kategori Kemenkes.                                                                                                                                                                                                                                                                                        |
| **`admin_nudges`**       | `title`, `message`, `channel`, `status`                                                                      | Pesan pengingat jadwal suntik dari Bidan Puskesmas/KUA kepada calon pengantin.                                                                                                                                                                                                                                                                                                                        |

---

## 4. Spesifikasi Desain Sistem & Identitas Visual "PRELUNA"

### 4.1. Filosofi & Diferensiasi Visual Antar-Aplikasi

| Aplikasi  | Nama & Tagline                                     | Karakteristik Emosi                                               | Palet Warna Utama                                                                                         | Audiens & Fokus                                                                                  |
| :-------- | :------------------------------------------------- | :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **App 1** | **FEMORY**<br>_Sahabat Sehat Cegah Anemia_         | Ceria, energik, persahabatan sekolah (_youthful_).                | **Hot Rose (`#E11D48`)** & Blush Pink.                                                                    | Remaja putri SMP/SMA; Suplemen zat besi 1x seminggu.                                             |
| **App 2** | **Pilluna**<br>_Sahabat Setia Minum Pil KB_        | Menenangkan, higienis, bebas cemas (_anxiety-free_).              | **Medical Teal (`#0D9488`)** & Warm Coral (`#F97316`).                                                    | Wanita usia subur akseptor KB; Disiplin minum pil harian & SADARI.                               |
| **App 3** | **PRELUNA**<br>_Kesehatan Pranikah & Imunisasi TT_ | **Elegan, sakral, terpercaya, harmonis, penuh harapan keluarga**. | **Royal Emerald (`#059669`)** & **Champagne Gold (`#D97706`)** di atas kanvas **Ivory Mist (`#FAFAF9`)**. | **Calon pengantin perempuan & laki-laki, Bidan, KUA; Imunisasi TT 5 dosis & skrining pranikah**. |

### 4.2. Token Warna Resmi PRELUNA (`index.css`)

Palet warna dirancang mengikuti rasio harmonis **65-25-10**:

- **65% Permukaan Netral & Elegan:** Pure White (`#FFFFFF`), Ivory Mist (`#FAFAF9`), dan Crisp Border (`#E2E8F0`).
- **25% Kontras Teks & Nuansa Sehat:** Deep Charcoal Slate (`#0F172A`), Slate Secondary (`#334155`), dan Soft Sage Mist (`#ECFDF5`).
- **10% Aksen Sakral & Status Klinis:** Royal Emerald (`#059669` / `#047857`) dan Champagne Gold (`#D97706` / `#B45309`).

```css
/* Token CSS PRELUNA Baru (budi-luhur/apps/app3/frontend/src/index.css) */
@import 'tailwindcss';

@theme inline {
  /* 1. Primary Action & Brand Identity (Royal Emerald: Perlindungan, Kesuburan, Kehidupan Baru) */
  --color-primary: #059669; /* Emerald 600: Tombol utama, tab aktif, brand accent */
  --color-primary-hover: #047857; /* Deep Emerald 700: State hover */
  --color-primary-focus: #10b981; /* Emerald 500: Ring fokus aksesibilitas */
  --color-primary-subtle: #ecfdf5; /* Emerald 50: Background badge aktif & card highlight */
  --color-primary-soft: #d1fae5; /* Emerald 100: Border aksen halus & progress bar fill */

  /* 2. Secondary & Matrimonial Accent (Champagne Gold / Amber: Sakral, Prestise, Masa Depan Cerah) */
  --color-secondary: #d97706; /* Warm Amber/Gold 600: Countdown nikah, badge dosis, sertifikat */
  --color-secondary-hover: #b45309; /* Deep Gold 700: Hover aksen sekunder */
  --color-secondary-subtle: #fffbeb; /* Soft Cream Tint: Latar countdown & highlight box */
  --color-secondary-soft: #fde68a; /* Light Amber 200: Border penanda hari H */

  /* 3. Surface & Canvas (Elegan, Hangat, & Bersih) */
  --color-canvas: #fafaf9; /* Ivory Mist / Stone 50: Latar aplikasi bernuansa sakral */
  --color-surface: #ffffff; /* Pure Clinical White: Permukaan kartu, modal, input */
  --color-surface-soft: #f4f4f5; /* Zinc Soft: Latar kartu sekunder & placeholder */
  --color-surface-card: #ffffff; /* Permukaan kartu utama */
  --color-surface-sunken: #e4e4e7; /* Garis pemisah hairline */

  /* 4. Border & Divider (Presisi & Rapi) */
  --color-border: #e2e8f0; /* Slate Border 1px netral */
  --color-border-subtle: #f1f5f9; /* Hairline divider */

  /* 5. Tipografi & Kontras Teks (WCAG AAA Compliance) */
  --color-ink-primary: #0f172a; /* Deep Slate 900: Judul halaman & teks utama */
  --color-ink-secondary: #334155; /* Slate 700: Deskripsi & isi paragraf */
  --color-ink-tertiary: #64748b; /* Slate 500: Caption, jam, placeholder */
  --color-ink-inverse: #ffffff; /* Teks putih di atas tombol primer */

  /* 6. Status Dosis Imunisasi Tetanus Toxoid (Kemenkes RI) */
  --color-tt-tt1: #f59e0b; /* TT1: Kontak pertama / Skrining (Langkah awal) */
  --color-tt-tt2: #059669; /* TT2: Terlindungi 3 Tahun */
  --color-tt-tt3: #0d9488; /* TT3: Terlindungi 5 Tahun */
  --color-tt-tt4: #4f46e5; /* TT4: Terlindungi 10 Tahun */
  --color-tt-tt5: #047857; /* TT5: Terlindungi Seumur Hidup (>25 Tahun) */

  --font-sans:
    'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### 4.3. Tipografi & Ikonografi

- **Tipografi:** Plus Jakarta Sans & Inter. Ukuran judul proporsional (`text-xl` hingga `text-2xl`), bebas teks emoji anak-anak (`🌸`, `🎉`, `🔥`), digantikan dengan micro-badge berkelas.
- **Ikonografi Lucide React:** `Syringe` (suntik TT), `ShieldCheck` (status perlindungan), `CalendarHeart` (countdown pernikahan), `Award` (sertifikat imunisasi catin), `HeartHandshake` (kemitraan catin & faskes), `FileCheck` (verifikasi medis), `BotMessageSquare` (Luna Pranikah).

---

## 5. Rencana Modul & Komponen Frontend PRELUNA

### 5.1. Komponen yang Digunakan Kembali (_Reusable Components_)

Komponen pondasi yang tetap dipertahankan dengan penyesuaian styling token CSS baru:

- `Card.tsx`, `Button.tsx`, `Modal.tsx`, `Avatar.tsx`, `Badge.tsx`, `Chip.tsx`.
- Infrastruktur otentikasi: `AuthContext.tsx`, `AuthGuard.tsx`, `GuestGuard.tsx`, `client.ts`.
- Utilitas helper tanggal dan real-time event sync.

### 5.2. Komponen yang Disesuaikan / Direfaktor (_Refactored Components_)

1. **`UserSidebar.tsx` & `MobileBottomBar.tsx`:** Menghilangkan menu `buddy` (UKS teman sekolah), menggantinya dengan menu terstruktur:
   - _Beranda_ (`/user/dashboard`, ikon `Home`)
   - _Riwayat TT_ (`/user/history`, ikon `CalendarCheck`)
   - _Jadwal TT_ (`/user/schedule`, ikon `Clock`)
   - _Edukasi_ (`/user/education`, ikon `BookOpen`)
   - _Konsultasi AI_ (`/user/consultation`, ikon `Bot`)
   - _Profil & Catin_ (`/user/profile`, ikon `User`)
2. **`SetupProfileView.tsx`:** Mengubah formulir data diri siswi menjadi formulir calon pengantin:
   - Step 1: Data Diri Catin (Nama, Tanggal Lahir, Jenis Kelamin, Golongan Darah/Rhesus, Berat/Tinggi Badan, Faskes/KUA Domisili).
   - Step 2: Data Pasangan & Hari H (Nama Calon Pasangan, Rencana Tanggal Pernikahan, Status Imunisasi TT Saat Ini).
3. **`ConsultationView.tsx`:** Konteks percakapan diubah menjadi asisten konsultasi pranikah (_Luna Pranikah_).
4. **Portal Admin (`/admin/*`):** Branding diubah menjadi _"PRELUNA — Portal Petugas Faskes & KUA"_ untuk verifikasi catin.

### 5.3. Komponen Baru Khusus Domain Imunisasi TT (_New Dedicated Components_)

1. **`ImmunityStatusBanner.tsx`:** Kartu hero di Beranda yang menampilkan status dosis TT saat ini (misal _"Status Anda: TT2 — Terlindungi 3 Tahun"_), visualisasi tahapan 5 pin dosis, dan rekomendasi interval suntik berikutnya.
2. **`WeddingCountdownWidget.tsx`:** Kartu countdown hari H akad nikah calon pengantin, lengkap dengan penanda batas waktu aman vaksinasi TT (minimal 1 bulan sebelum hari H).
3. **`DigitalVaccineCard.tsx`:** Kartu sertifikat digital tanda bukti telah melakukan skrining dan imunisasi TT yang dapat dicetak/diperlihatkan ke KUA atau faskes.
4. **`TTIntervalTimeline.tsx`:** Komponen panduan visual interval 5 dosis vaksin TT resmi Kemenkes RI beserta durasi perlindungan masing-masing.

---

## 6. Rencana Implementasi Bertahap (Step-by-Step Task Checklist)

Rencana kerja dibagi ke dalam **12 Task terstruktur** yang memprioritaskan penyesuaian frontend secara berurutan:

---

### Task 1: Fondasi Desain Sistem & Identitas Visual PRELUNA (Royal Emerald & Champagne Gold)

**Goal:** Membangun identitas visual baru PRELUNA pada level global (`index.html`, `index.css`, `vite.config.ts`, `.env`), menggantikan seluruh palet Hot Rose dan styling warisan FEMORY.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/index.html`
- Modify: `budi-luhur/apps/app3/frontend/src/index.css`
- Modify: `budi-luhur/apps/app3/frontend/.env`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/constants/domain.constants.ts`

**Checklist Langkah Kerja:**

- [x] **Step 1.1:** Perbarui metadata di `index.html`: Title _"PRELUNA — Premarital Health & Immunization"_, meta theme-color `#059669`, favicon jarum suntik/perisai medis, dan link Google Fonts Plus Jakarta Sans & Inter.
- [x] **Step 1.2:** Perbarui file `budi-luhur/apps/app3/frontend/.env`:
  - `VITE_APP_TITLE=PRELUNA - Kesehatan Pranikah & Imunisasi TT`
  - `VITE_APP_DESCRIPTION=Aplikasi Kesehatan Pranikah & Pemantauan Imunisasi Tetanus Toxoid Calon Pengantin`
- [x] **Step 1.3:** Terapkan tema warna `@theme inline` pada `src/index.css` dengan palet **Royal Emerald (`#059669`)**, **Champagne Gold (`#D97706`)**, **Ivory Mist (`#FAFAF9`)**, dan **Deep Slate (`#0F172A`)**.
- [x] **Step 1.4:** Buat konstanta domain khusus di `domain.constants.ts`: Daftar 5 level imunisasi TT (TT1 s.d. TT5), interval waktu resmi Kemenkes, masa perlindungan, dan panduan skrining pranikah.
- [x] **Step 1.5:** Validasi kompilasi CSS awal tanpa error parsing Tailwind CSS v4.

---

### Task 2: Refactor Layout Shell & Navigasi Terstruktur (Mobile TopBar, BottomBar, Sidebar Desktop)

**Goal:** Menyusun struktur navigasi bersih untuk calon pengantin dan petugas faskes, mengeliminasi tombol `buddy` sekolah, dan menerapkan active state berbasis Royal Emerald.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/MobileTopBar.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/MobileBottomBar.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/user/components/UserSidebar.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/user/components/UserLayout.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/Navbar.tsx`

**Checklist Langkah Kerja:**

- [x] **Step 2.1:** Perbarui `MobileTopBar.tsx`: Logo PRELUNA dengan ikon perisai/cincin hijau emerald, teks "Sahabat Sehat Pranikah", avatar profil ringkas, background `bg-white/95 backdrop-blur-md`, dan border bawah `#E2E8F0`.
- [x] **Step 2.2:** Standarisasi 5 menu navigasi di `MobileBottomBar.tsx`:
  1. _Beranda_ (`/user/dashboard`, ikon `Home`)
  2. _Riwayat TT_ (`/user/history`, ikon `CalendarCheck`)
  3. _Jadwal TT_ (`/user/schedule`, ikon `Clock`)
  4. _Edukasi_ (`/user/education`, ikon `BookOpen`)
  5. _Profil Catin_ (`/user/profile`, ikon `User`)
- [x] **Step 2.3:** Hilangkan teks emoji dan menu `buddy` dari navigasi. Terapkan active state: pill `#ECFDF5` dengan ikon dan label Royal Emerald `#059669`.
- [x] **Step 2.4:** Perbarui `UserSidebar.tsx` desktop: Navigasi vertikal terstruktur dengan branding PRELUNA, link menu rapi, dan kartu status calon pengantin di bagian bawah.
- [x] **Step 2.5:** Sesuaikan `UserLayout.tsx` dengan padding bawah `pb-24` untuk memastikan kenyamanan pada perangkat ponsel berbagai ukuran layar.

---

### Task 3: Redesain Splash Screen & Onboarding: Tema Kesehatan Pranikah & Perlindungan Ibu-Anak

**Goal:** Memperbarui visual Splash Screen dan materi Onboarding 3 slide agar berfokus pada edukasi kesehatan pranikah, urgensi imunisasi TT, dan pencegahan tetanus maternal-neonatal.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/splash/components/SplashIllustration.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/splash/components/SplashScreenView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/onboarding/constants/slides.ts`
- Modify: `budi-luhur/apps/app3/frontend/src/features/onboarding/components/OnboardingIllustrations.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/onboarding/views/OnboardingView.tsx`

**Checklist Langkah Kerja:**

- [x] **Step 3.1:** Perbarui `SplashIllustration.tsx` dan `SplashScreenView.tsx`: Logo PRELUNA elegan dengan subjudul _"Kesehatan Pranikah & Imunisasi TT Calon Pengantin"_, transisi lembut tanpa ornamen bunga merah muda.
- [x] **Step 3.2:** Tulis ulang 3 materi slide pada `slides.ts` dengan gaya bahasa dewasa, suportif, dan edukatif:
  - _Slide 1:_ **"Imunisasi TT Calon Pengantin"** — Pentingnya melengkapi 5 dosis vaksin Tetanus Toxoid untuk perlindungan seumur hidup ibu dan calon buah hati.
  - _Slide 2:_ **"Pantau Status & Jadwal Suntik"** — Informasi jadwal vaksinasi berikutnya berdasarkan interval resmi Kemenkes RI menjelang hari pernikahan.
  - _Slide 3:_ **"Edukasi & Konsultasi Pranikah"** — Panduan gizi, skrining kesehatan calon pengantin, dan konsultasi cerdas bersama asisten Luna Pranikah.
- [x] **Step 3.3:** Perbarui ilustrasi SVG di `OnboardingIllustrations.tsx` dengan palet Royal Emerald, Champagne Gold, dan Ivory Mist.
- [x] **Step 3.4:** Validasi alur perpindahan Onboarding ➔ Splash ➔ Login tanpa kedipan layout (_layout shift_).

---

### Task 4: Refactor Auth Portal & Setup Profil Calon Pengantin (Data Diri, Pasangan, & Hari H)

**Goal:** Menyesuaikan halaman login, registrasi, dan setup profil awal (`SetupProfileView.tsx`) agar mengumpulkan parameter calon pengantin tanpa merusak endpoint backend `saveUserInitialSetupAction`.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/auth/components/AuthCardLayout.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/auth/components/AuthTabbedContainer.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/auth/components/LoginForm.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/auth/components/RegisterForm.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/user/views/SetupProfileView.tsx`

**Checklist Langkah Kerja:**

- [x] **Step 4.1:** Perbarui `AuthCardLayout.tsx`: Sisi desktop menampilkan kartu pratinjau imunisasi TT calon pengantin dan badge perlindungan Kemenkes RI. Tombol "Kembali ke Portal Utama" mengarah ke `http://localhost:5170`.
- [x] **Step 4.2:** Standarisasi form input pada `LoginForm.tsx` dan `RegisterForm.tsx`: Input height 44px, border `#E2E8F0`, ring fokus `#059669/20`, tombol submit Royal Emerald `#059669`.
- [x] **Step 4.3:** Rombak formulir `SetupProfileView.tsx` menjadi 2 tahap ramah pengguna:
  - _Tahap 1 (Data Diri & Skrining Fisik Catin):_ Nama lengkap, tanggal lahir, jenis kelamin (Perempuan / Laki-laki), golongan darah & rhesus, berat badan, tinggi badan, kadar Hb darah (jika sudah cek laboratorium), serta Asal Faskes/KUA rujukan (disimpan ke field `schoolOrOrg`).
  - _Tahap 2 (Pernikahan & Status Imunisasi TT Awal):_ Nama calon pasangan, rencana tanggal akad nikah (disimpan ke field `notes`), dan pilihan status dosis TT terakhir yang pernah diterima (Belum pernah / TT1 / TT2 / TT3 / TT4 / Lengkap TT5).
- [x] **Step 4.4:** Pastikan payload yang dikirim ke `saveUserInitialSetupAction` tetap sesuai dengan kontrak backend tanpa memicu error 400/500.

---

### Task 5: Beranda Calon Pengantin (`DashboardView`): Status Imunisasi TT, Countdown Nikah, & Menu Cepat

**Goal:** Membangun antarmuka Beranda yang kaya informasi, menyajikan status imunisasi TT calon pengantin secara transparan, widget hitung mundur pernikahan, dan aksi cepat ke fasilitas kesehatan.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/dashboard/views/DashboardView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/domain/QuickAction.tsx`
- Create: `budi-luhur/apps/app3/frontend/src/features/dashboard/components/ImmunityStatusBanner.tsx`
- Create: `budi-luhur/apps/app3/frontend/src/features/dashboard/components/WeddingCountdownWidget.tsx`
- Remove unused: Hapus ketergantungan pada `BuddyCard` dan meteran streak UKS.

**Checklist Langkah Kerja:**

- [x] **Step 5.1:** Buat komponen `ImmunityStatusBanner.tsx`:
  - Menampilkan badge dosis saat ini (misal _"Status Imunisasi: TT2 — Terlindungi 3 Tahun"_).
  - Progres garis 5 lingkaran penanda dosis TT1 hingga TT5.
  - Rekomendasi tindakan: _"Jadwal TT3 Anda: 6 bulan pasca TT2 (Juli 2026)"_.
- [x] **Step 5.2:** Buat komponen `WeddingCountdownWidget.tsx`:
  - Menghitung mundur jumlah hari menuju tanggal akad nikah (disadur dari data profil).
  - Indikator peringatan kesiapan medis: _"Pastikan imunisasi TT minimal 1 bulan sebelum hari H pernikahan"_.
- [x] **Step 5.3:** Perbarui `QuickAction.tsx` dengan 5 menu cepat bertema kesehatan pranikah:
  1. _Jadwal TT_ (ke `/user/schedule`, ikon `Clock`)
  2. _Riwayat Suntik_ (ke `/user/history`, ikon `CalendarCheck`)
  3. _Edukasi Pranikah_ (ke `/user/education`, ikon `BookOpen`)
  4. _Sertifikat TT_ (ke `/user/profile`, ikon `Award`)
  5. _Tanya Luna AI_ (ke `/user/consultation`, ikon `Bot`)
- [x] **Step 5.4:** Rapikan header Beranda: Sambutan hangat kepada calon pengantin, tanggal hari ini, dan penanda verifikasi dari faskes/KUA binaan.

---

### Task 6: Modul Riwayat Imunisasi TT (`HistoryView`): Pencatatan Vaksin, Faskes, Batch, & Petugas

**Goal:** Mentransformasikan halaman riwayat konsumsi menjadi modul pencatatan riwayat imunisasi Tetanus Toxoid digital yang komprehensif dan dapat dibuktikan keabsahannya.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/consumption/views/HistoryView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/consumption/components/ConsumptionLogList.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/consumption/components/ActiveDateActionCard.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/consumption/components/MonthlyEvaluationView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/consumption/api/consumptionRepository.ts`

**Checklist Langkah Kerja:**

- [x] **Step 6.1:** Perbarui judul dan konteks di `HistoryView.tsx` menjadi _"Buku Riwayat Imunisasi Tetanus Toxoid (TT)"_.
- [x] **Step 6.2:** Rombak kartu aksi `ActiveDateActionCard.tsx` menjadi dialog pencatatan vaksinasi TT:
  - Pilihan dosis vaksin (TT1, TT2, TT3, TT4, TT5).
  - Tanggal penyuntikan.
  - Lokasi Fasilitas Kesehatan (Puskesmas / Klinik / RS / Bidan Praktik Mandiri).
  - Nama Petugas Kesehatan / Vaksinator.
  - Nomor Batch Vaksin dan catatan observasi KIPI (Kejadian Ikutan Pasca Imunisasi, misal nyeri ringan pada lengan).
- [x] **Step 6.3:** Sesuaikan `ConsumptionLogList.tsx` untuk menampilkan daftar riwayat vaksinasi dengan kartu berdesain sertifikat medis: badge dosis Royal Emerald, tanggal suntik, nama nakes, dan status verifikasi `ON_TIME` (Telah Diberikan).
- [x] **Step 6.4:** Sesuaikan `MonthlyEvaluationView.tsx` menjadi ringkasan status proteksi kumulatif pranikah: jumlah dosis yang telah diterima dan proyeksi masa perlindungan aktif.

---

### Task 7: Modul Jadwal & Pengingat Imunisasi TT (`ScheduleView`): Interval Dosis Kemenkes RI

**Goal:** Memperbarui modul jadwal agar menyajikan jadwal imunisasi berikutnya berdasarkan aturan interval klinis resmi Kementerian Kesehatan RI, dilengkapi form pengingat janji temu faskes.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/schedule/views/ScheduleView.tsx`
- Create: `budi-luhur/apps/app3/frontend/src/features/schedule/components/TTIntervalGuideCard.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/schedule/api/scheduleRepository.ts`

**Checklist Langkah Kerja:**

- [x] **Step 7.1:** Perbarui header `ScheduleView.tsx` menjadi _"Jadwal & Pengingat Imunisasi TT Calon Pengantin"_.
- [x] **Step 7.2:** Buat komponen panduan interval Kemenkes RI (`TTIntervalGuideCard.tsx`):
  - **TT1:** Kunjungan pertama skrining pranikah (Langkah awal pembentukan antibodi).
  - **TT2:** Minimal 4 minggu setelah TT1 (Masa perlindungan 3 tahun untuk ibu dan bayi baru lahir).
  - **TT3:** Minimal 6 bulan setelah TT2 (Masa perlindungan 5 tahun).
  - **TT4:** Minimal 1 tahun setelah TT3 (Masa perlindungan 10 tahun).
  - **TT5:** Minimal 1 tahun setelah TT4 (Masa perlindungan seumur hidup / >25 tahun).
- [x] **Step 7.3:** Perbarui kartu jadwal aktif: Menampilkan tanggal janji temu suntik dosis berikutnya, nama faskes yang dituju, dan tombol pengingat aktif/nonaktif.
- [x] **Step 7.4:** Perbarui modal edit/buat jadwal: Pilihan tanggal kunjungan faskes, pilihan jam operasional imunisasi (pagi/siang), dan pengingat H-3 / H-1 sebelum jadwal kunjungan.
- [x] **Step 7.5:** Verifikasi penyimpanan jadwal ke backend via `updateUserScheduleSettingsAction` tetap berjalan normal.

---

### Task 8: Modul Edukasi Kesehatan Pranikah & Pencegahan Tetanus Maternal-Neonatal

**Goal:** Memperbarui modul edukasi (`EducationView.tsx`) dan detail artikel (`ArticleDetailView.tsx`) dengan kategori dan materi kesehatan pranikah, imunisasi TT, serta persiapan kehamilan sehat.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/education/views/EducationView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/education/views/ArticleDetailView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/education/components/ArticleCard.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/education/constants/education.constants.ts`

**Checklist Langkah Kerja:**

- [x] **Step 8.1:** Perbarui kategori edukasi di `education.constants.ts`:
  - _Semua_, _Imunisasi TT & Jadwal_, _Tetanus Maternal-Neonatal_, _Skrining Pranikah_, _Nutrisi & Asam Folat_, _Gaya Hidup Pasangan_, _Mitos & Fakta_.
- [x] **Step 8.2:** Perbarui tampilan kartu artikel (`ArticleCard.tsx`) dengan tipografi Deep Slate `#0F172A`, badge kategori Emerald/Gold, dan estimasi waktu baca.
- [x] **Step 8.3:** Perbarui header `EducationView.tsx`: _"Pustaka Edukasi Kesehatan Pranikah & Imunisasi TT"_, kotak pencarian materi pranikah, dan featured article banner.
- [x] **Step 8.4:** Perbarui layout detail artikel pada `ArticleDetailView.tsx`: Layout baca yang nyaman, key takeaways untuk pasangan catin, tombol bookmark, dan navigasi kembali yang mulus.
- [x] **Step 8.5:** Verifikasi integrasi API pengambilan artikel dan filter pencarian berjalan sempurna.

---

### Task 9: Penyelarasan Asisten AI "Luna Pranikah" (`ConsultationView`)

**Goal:** Menyesuaikan persona dan konteks asisten AI agar ahli dalam mendampingi calon pengantin seputar imunisasi TT, efek samping pasca suntik, dan syarat administrasi kesehatan nikah.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/consultation/views/ConsultationView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/consultation/constants/index.ts`
- Modify: `budi-luhur/apps/app3/frontend/src/lib/gemini.ts`

**Checklist Langkah Kerja:**

- [x] **Step 9.1:** Perbarui persona di `ConsultationView.tsx`: _"Luna — Konselor AI Kesehatan Pranikah & Imunisasi TT"_ dengan pesan sambutan hangat untuk calon pengantin.
- [x] **Step 9.2:** Perbarui chip pertanyaan cepat di `constants/index.ts`:
  - _"Mengapa calon pengantin wajib imunisasi Tetanus Toxoid (TT)?"_
  - _"Berapa minggu sebelum hari pernikahan suntik TT harus dilakukan?"_
  - _"Apa saja efek samping suntik TT dan bagaimana cara mengatasinya?"_
  - _"Apakah calon pengantin laki-laki juga perlu skrining kesehatan pranikah?"_
  - _"Bagaimana jadwal 5 dosis TT untuk perlindungan seumur hidup?"_
- [x] **Step 9.3:** Sesuaikan prompt sistem di `gemini.ts` agar memberikan jawaban medis akurat berpedoman pada standar Kementerian Kesehatan RI tentang kesehatan reproduksi pranikah.
- [x] **Step 9.4:** Terapkan styling chat bubble: Bubble pengguna dengan warna Royal Emerald `#059669`, bubble asisten putih ber-border halus `#E2E8F0`, dan markdown rendering yang rapi.

---

### Task 10: Profil Calon Pengantin & E-Sertifikat Imunisasi Pranikah (`ProfileView`)

**Goal:** Memperbarui halaman profil pengguna (`ProfileView.tsx`) untuk menyajikan ringkasan data calon pengantin, kartu status imunisasi TT (e-sertifikat), pengaturan faskes/KUA rujukan, dan modal edit profil.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/user/views/ProfileView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/profile/ProfileHeaderCard.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/profile/ProfileMetricsGrid.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/profile/ProfileContactCard.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/shared/components/profile/ProfileEditModal.tsx`
- Create: `budi-luhur/apps/app3/frontend/src/shared/components/profile/DigitalImmunizationCertificateModal.tsx`

**Checklist Langkah Kerja:**

- [x] **Step 10.1:** Perbarui `ProfileHeaderCard.tsx` dengan badge _"CALON PENGANTIN TERDAFTAR"_, latar gradient halus Emerald-Mist, tombol edit data diri, dan upload avatar.
- [x] **Step 10.2:** Perbarui kartu metrik di `ProfileMetricsGrid.tsx`:
  - _Status Imunisasi TT:_ Dosis terakhir tercapai (TT1–TT5).
  - _Masa Perlindungan:_ Estimasi durasi proteksi aktif (3 thn / 5 thn / 25+ thn).
  - _Countdown Pernikahan:_ Hari tersisa menuju akad nikah.
  - _Status Skrining Fisik:_ Indeks Massa Tubuh (IMT), Golongan Darah & Rhesus, dan Kadar Hb.
- [x] **Step 10.3:** Buat komponen `DigitalImmunizationCertificateModal.tsx`: Tampilan E-Sertifikat Keterangan Imunisasi TT Calon Pengantin dengan QR code verifikasi dan data faskes pelaksana untuk kebutuhan administrasi pernikahan di KUA/Gereja/Catatan Sipil.
- [x] **Step 10.4:** Perbarui `ProfileContactCard.tsx`: Tampilkan email akun, nomor WhatsApp, nama calon pasangan, dan Faskes/KUA rujukan.
- [x] **Step 10.5:** Perbarui `ProfileEditModal.tsx` agar formulir selaras dengan palet dan field data PRELUNA.

---

### Task 11: Penyelarasan Portal Admin Petugas Faskes & KUA Pranikah

**Goal:** Menyelaraskan seluruh tampilan antarmuka Admin Portal (`/admin/*`) dari skema Rose-600 menjadi palet PRELUNA Royal Emerald yang profesional, berwibawa, dan efisien untuk verifikasi data calon pengantin.

**Files:**

- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/components/AdminLayout.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/components/AdminSidebar.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/components/AdminHeader.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/views/AdminDashboardView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/views/UserManagementView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/views/ScheduleManagementView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/views/ArticleManagementView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/views/ReportAnalyticsView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/components/ScheduleFormModal.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/admin/components/SendReminderModal.tsx`

**Checklist Langkah Kerja:**

- [x] **Step 11.1:** Perbarui `AdminSidebar.tsx` dan `AdminHeader.tsx` dengan branding _"PRELUNA — Portal Petugas Faskes & KUA"_, active menu link Royal Emerald `#059669`, dan teks Deep Slate `#0F172A`.
- [x] **Step 11.2:** Perbarui tabel data calon pengantin (`UserManagementView.tsx`): Kolom Nama Catin, Nama Pasangan, Tanggal Pernikahan, Status Imunisasi TT (TT1–TT5), dan tombol verifikasi sertifikat.
- [x] **Step 11.3:** Perbarui analitik pada `AdminDashboardView.tsx` dan `ReportAnalyticsView.tsx`: Statistik cakupan imunisasi TT catin di wilayah binaan puskesmas.
- [x] **Step 11.4:** Perbarui modal manajemen artikel di `ArticleManagementView.tsx` dengan kategori materi kesehatan pranikah.
- [x] **Step 11.5:** Perbarui modal pengingat WhatsApp (`SendReminderModal.tsx`) dan form jadwal (`ScheduleFormModal.tsx`) menggunakan bahasa resmi pengingat jadwal suntik vaksin TT catin.

---

### Task 12: Pengujian Menyeluruh, Validasi Fungsional, & Verifikasi Build Production

**Goal:** Menjalankan serangkaian pengujian menyeluruh terhadap tampilan visual, paritas logika bisnis, keutuhan alur navigasi, integrasi database, dan build production bundle.

**Files:**

- Test All Views: User Portal (`/user/*`), Admin Portal (`/admin/*`), Auth (`/auth/*`), Onboarding, Splash.
- Run Command: `npm --prefix budi-luhur/apps/app3/frontend run build`
- Run Command: `npm --prefix budi-luhur/apps/app3/backend run build`

**Checklist Langkah Kerja:**

- [x] **Step 12.1:** Uji responsivitas layout shell pada viewport ponsel (360px, 390px, 412px), tablet (768px), dan desktop (1280px+).
- [x] **Step 12.2:** Uji seluruh alur auth: Registrasi calon pengantin baru ➔ Setup profil 2 langkah (data catin & hari H) ➔ Redirect mulus ke Beranda.
- [x] **Step 12.3:** Uji fungsionalitas pencatatan riwayat imunisasi TT di `HistoryView` dan pastikan data tersimpan ke tabel `consumption_logs` dengan benar.
- [x] **Step 12.4:** Uji fungsionalitas jadwal vaksinasi di `ScheduleView` dan pastikan sync data jadwal tersimpan ke tabel `reminder_schedules`.
- [x] **Step 12.5:** Uji fitur pencarian dan pembacaan artikel edukasi di `EducationView`.
- [x] **Step 12.6:** Uji konsultasi asisten AI "Luna Pranikah" di `ConsultationView`.
- [x] **Step 12.7:** Jalankan `npm run build` pada direktori frontend dan backend untuk memastikan tidak ada kesalahan TypeScript, missing props, atau lint error.

---

## 7. Kriteria Keberhasilan & Matriks Validasi

Implementasi refactor App 3 dinyatakan berhasil apabila memenuhi seluruh kriteria berikut:

1. **Paritas Penuh terhadap `info.md`:** Seluruh 7 fitur utama (Beranda, Edukasi kesehatan, Riwayat imunisasi, Status imunisasi, Jadwal imunisasi, Pengingat, dan Profil pengguna) berjalan nyata dan berfokus pada imunisasi Tetanus Toxoid (TT) calon pengantin.
2. **Bebas Kloning 100%:** Tidak ada lagi teks, logo, maupun komponen bertema anemia remaja UKS sekolah (FEMORY) atau kontrasepsi pil KB (Pilluna) di dalam kode App 3.
3. **Identitas Visual Berkarakter Kuat:** Menggunakan palet resmi **Royal Emerald (`#059669`)** & **Champagne Gold (`#D97706`)** di atas **Ivory Mist (`#FAFAF9`)**, dengan tipografi Plus Jakarta Sans / Inter yang elegan dan bersih dari emoji kekanak-kanakan.
4. **Kompatibilitas Backend 100%:** Backend Express.js dan database Neon PostgreSQL (`fe_tablet_app3`) tetap beroperasi normal tanpa perubahan skema tabel fisik, dengan data yang terpetakan secara semantik.
5. **Kompilasi Sukses (Zero Build Error):** Perintah `npm run build` pada `apps/app3/frontend` dan `apps/app3/backend` selesai dengan exit code 0.
