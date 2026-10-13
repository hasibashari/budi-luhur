# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Arsitektur Ekosistem Tiga Aplikasi Terpisah Berbasis Fe-Tablet dengan Main Project Budi-Luhur

**Status Dokumen:** Approved Architecture Blueprint & Technical Specification  
**Versi:** 1.1.0 (Budi-Luhur Main Project Monorepo Architecture)  
**Tanggal:** 13 Oktober 2026  
**Main Project Root:** `/home/azure/dev/projects/frontend/budi-luhur`  
**Referensi Asal (Read-Only Source of Truth):** `/home/azure/dev/projects/frontend/fe-tablet` (Next.js 16 App Router, PostgreSQL, Tailwind CSS v4)  
**Target Arsitektur:** 
- **Main Project:** `budi-luhur/`
- **Landing Page Portal:** `budi-luhur/frontend/` (React + Vite)
- **3 Aplikasi Terpisah:** `budi-luhur/apps/app1`, `budi-luhur/apps/app2`, `budi-luhur/apps/app3`
  - Frontend setiap aplikasi: React + Vite, Feature-Based Architecture
  - Backend setiap aplikasi: Express.js, Modular Architecture
- **Database:** PostgreSQL (Isolasi penuh per aplikasi: `fe_tablet_app1`, `fe_tablet_app2`, `fe_tablet_app3`)

---

## 1. Latar Belakang & Konteks

### 1.1 Konteks Proyek
Aplikasi **fe-tablet (FEMORY)** telah selesai dikembangkan sebagai platform pemantauan kepatuhan konsumsi Tablet Tambah Darah (TTD) bagi remaja putri dan siswi sekolah. Repositori `fe-tablet` ini berfungsi penuh dan komprehensif, mencakup pengingat berkala, pemantauan status harian/mingguan/bulanan, evaluasi kepatuhan, gamifikasi kelompok sebaya (*Buddy Group Streak*), modul edukasi kesehatan, asisten konsultasi AI (Google Gemini), serta portal pembina/fasilitator UKS & Puskesmas.

Kini, seluruh pengembangan baru dipusatkan di dalam **folder `budi-luhur` sebagai Main Project**. Di dalam main project ini, terdapat kebutuhan untuk membangun landing page utama dan **tiga aplikasi terpisah** yang berakar dari implementasi `fe-tablet`. Ketiga aplikasi tersebut beroperasi secara otonom—masing-masing memiliki basis data, akun pengguna, sistem autentikasi, dan siklus sesi tersendiri—sehingga aktivitas dan data antar-aplikasi terisolasi 100%.

### 1.2 Penetapan `budi-luhur` sebagai Main Project
Folder `budi-luhur` ditetapkan sebagai **wadah utama (*main project monorepo*)** untuk seluruh ekosistem:
1. **Landing Page Portal (`budi-luhur/frontend/`)**: Berfungsi sebagai pintu gerbang (*entry point*) yang menyajikan informasi program kesehatan dan menyediakan **tiga kartu tautan navigasi langsung** menuju masing-masing aplikasi.
2. **Direktori Aplikasi Mandiri (`budi-luhur/apps/`)**: Menampung ketiga aplikasi otonom:
   - `budi-luhur/apps/app1/` (Frontend React+Vite & Backend Express.js)
   - `budi-luhur/apps/app2/` (Frontend React+Vite & Backend Express.js)
   - `budi-luhur/apps/app3/` (Frontend React+Vite & Backend Express.js)
3. **Dokumentasi Terpusat (`budi-luhur/doc/`)**: Menyimpan spesifikasi teknis dan PRD resmi proyek.

### 1.3 Prinsip Utama Tahap Awal
1. **Preservasi Referensi**: Repositori `fe-tablet` di luar folder `budi-luhur` tetap dipertahankan secara utuh sebagai referensi implementasi asal tanpa modifikasi destruktif.
2. **Duplikasi Identik (Zero-Behavioral Change)**: Pada tahap awal, fungsionalitas ketiga aplikasi diduplikasi secara identik dari `fe-tablet`. Tidak ada penambahan fitur baru di luar kapabilitas yang sudah teruji.
3. **Pemisahan Otonom Penuh**: Setiap aplikasi memiliki backend Express.js, frontend React+Vite, skema/database, serta kunci sesi/token tersendiri di bawah naungan `budi-luhur/apps/`.
4. **Anti-Overengineering & YAGNI**: Hindari kompleksitas berlebih. Pendekatan modular berbasis duplikasi terkelola (*managed duplication*) di dalam `budi-luhur` dipilih demi stabilitas, kemudahan isolasi, dan kecepatan implementasi.

---

## 2. Tujuan & Sasaran (Objectives)

| ID | Tujuan | Indikator Keberhasilan |
| :--- | :--- | :--- |
| **OBJ-1** | **Main Project Terpusat di `budi-luhur`** | Seluruh kode aktif, portal landing page, dokumentasi, dan ketiga aplikasi berlokasi di dalam folder `budi-luhur`. |
| **OBJ-2** | **Preservasi Repositori Eksisting** | `fe-tablet` tetap berfungsi normal sebagai acuan implementasi pembanding. |
| **OBJ-3** | **Portal Terpusat Budi-Luhur** | `budi-luhur/frontend` menyajikan landing page estetis yang memuat 3 tautan navigasi aktif menuju ketiga aplikasi. |
| **OBJ-4** | **Tiga Aplikasi Terisolasi Penuh** | Aplikasi 1, 2, dan 3 di dalam `budi-luhur/apps/` dapat berjalan serentak tanpa konflik database, cookie, atau session storage. |
| **OBJ-5** | **Transisi Arsitektur Modern** | Mengonversi Server Actions (Next.js) menjadi API RESTful Express.js (Modular Architecture) dan App Router menjadi SPA React + Vite (Feature-Based Architecture). |
| **OBJ-6** | **Paritas Fitur 100%** | Seluruh fitur `fe-tablet` (Auth, Setup, Dashboard, Schedule, Monitoring, Buddy Streak, Education, Consultation AI, Admin CMS) berfungsi sama persis di setiap aplikasi. |

---

## 3. Ruang Lingkup Proyek (Scope of Work)

### 3.1 Dalam Ruang Lingkup (In-Scope)
1. **Organisasi Main Project `budi-luhur`**:
   - Penataan struktur monorepo di dalam `budi-luhur` yang rapi dan modular.
   - Pemanfaatan `budi-luhur/doc/PRD.md` sebagai sumber kebenaran dokumentasi.
2. **Landing Page `budi-luhur/frontend`**:
   - Pemanfaatan komponen presentasional yang sudah ada dari `fe-tablet` (`Hero`, `Benefits`, `Features`, `FAQ`, `Footer`).
   - Penyesuaian navigasi utama dan CTA agar secara eksplisit menyediakan 3 tautan aplikasi yang responsif dan informatif.
3. **Backend Modular Express.js di `budi-luhur/apps/app*/backend`**:
   - Pembuatan backend RESTful menggunakan Express.js dan TypeScript.
   - Migrasi seluruh logika Server Actions dari `fe-tablet/src/features/*/api/*Repository.ts` ke controller dan service di Express.
   - Implementasi autentikasi berbasis JWT / Bearer Token dengan proteksi role `user` dan `admin`.
   - Setup skrip inisialisasi database (`db:init`) dan seeding (`db:seed`) per aplikasi.
4. **Frontend Feature-Based React + Vite di `budi-luhur/apps/app*/frontend`**:
   - Migrasi dari Next.js App Router ke React Router DOM v6/v7.
   - Penataan struktur direktori berbasis domain fitur (`features/auth`, `features/schedule`, `features/buddy`, dll.).
   - Migrasi komponen Next.js (`next/navigation`, `next/image`, `next/link`) ke standar React SPA & Vite.
   - PWA caching dan Web App Manifest terisolasi per aplikasi.
5. **Rencana Deployment & Isolasi**:
   - Pemetaan port lokal dan environment variables (`.env`) untuk portal dan ketiga aplikasi.
   - Strategi isolasi database PostgreSQL (3 database terpisah).

### 3.2 Di Luar Ruang Lingkup (Out-of-Scope)
- Penambahan modul bisnis baru (misal: integrasi pembayaran, e-commerce suplemen, atau integrasi BPJS).
- Implementasi Single Sign-On (SSO) terpusat antar-aplikasi (karena spesifikasi mewajibkan autentikasi terpisah mandiri).
- Modifikasi pada direktori `my-portfolio` (dikonfirmasi terpisah dan tidak berhubungan).

---

## 4. Analisis Komprehensif Sistem Eksisting (`fe-tablet`)

### 4.1 Struktur Direktori Eksisting
Repositori referensi `fe-tablet` dibangun menggunakan **Next.js 16.2.12**, **React 19.2.4**, **Tailwind CSS v4**, dan driver PostgreSQL **`pg` (node-postgres)**:

```text
fe-tablet/
├── docs/                      # Dokumentasi teknis: PRD.md, ERD.md, DESIGN-medical.md
├── public/                    # Aset statis: icons PWA, manifest, ilustrasi
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Landing page (page.tsx)
│   │   ├── auth/              # /auth/login, /auth/register
│   │   ├── onboarding/        # /onboarding (3 slides pengenalan)
│   │   ├── splash/            # /splash (pemeriksaan sesi awal)
│   │   ├── user/              # Portal Siswi: dashboard, schedule, history, buddy,
│   │   │                      # education, consultation, profile, setup
│   │   ├── admin/             # Portal UKS/Admin: dashboard, users, schedules,
│   │   │                      # articles, reports, profile
│   │   └── delete-account/    # Alur hapus akun permanen
│   ├── db/                    # Koneksi & Database Scripts
│   │   ├── client.ts          # PostgreSQL Pool Singleton (pg.Pool)
│   │   ├── init.ts            # DDL Runner dari schema.sql
│   │   ├── schema.sql         # Skema DDL lengkap (PostgreSQL 15+)
│   │   ├── seed.ts            # Script pengisian data contoh
│   │   └── seedData.json      # Data contoh awal (Users, Schedules, Logs, Articles)
│   ├── features/              # Modular Feature Architecture
│   │   ├── auth/              # Login, register, AuthGuard, AuthContext, Server Actions
│   │   ├── home/              # Hero, Benefits, ProductInfo, FAQ, Testimonials
│   │   ├── user/              # Profile, initial setup, dashboard aggregation
│   │   ├── schedule/          # Schedule management, modal ubah jadwal, reminder toggle
│   │   ├── consumption/       # Log konsumsi, kalender filter, evaluasi bulanan
│   │   ├── buddy/             # Group chat, cheers, join group code, streak tim
│   │   ├── education/         # Artikel, filter kategori, detail bacaan, bookmark
│   │   ├── consultation/      # Chat asisten AI, quick prompt chips
│   │   ├── admin/             # Statistik agregat, CRUD user, nudge WhatsApp/App, CMS
│   │   ├── splash/            # Splash screen animation view
│   │   └── onboarding/        # Carousel slide interaktif
│   ├── shared/                # Design system & reusable primitives
│   │   ├── components/ui/     # Button, Card, Badge, Chip, Input, Modal, Select
│   │   ├── components/domain/ # StatusCard, BuddyCard, StreakProgressCard, Chart
│   │   ├── components/profile/# Profil avatar, kartu kontak, metrik Hb
│   │   ├── hooks/             # useToast, usePWA, useOnlineStatus
│   │   └── utils/             # notifications, realtimeSync (BroadcastChannel)
│   └── lib/
│       └── gemini.ts          # Integrasi Google Gemini API untuk konsultasi AI
├── .env                       # DATABASE_URL (Neon PostgreSQL), GEMINI_API
├── package.json               # Dependensi proyek
└── tsconfig.json              # Path alias @/ -> root direktori
```

### 4.2 Analisis Backend & Data Access Eksisting
1. **Server Actions Monolith**: `fe-tablet` mengeksekusi operasi data melalui **Next.js Server Actions** bertanda `'use server'` di dalam berkas `*Repository.ts`.
2. **Koneksi Database Langsung**: Menggunakan singleton `db` dari `@/src/db/client` dan query SQL terparameterisasi (`db.query(...)`) serta transaksi ACID (`db.transaction(...)`).
3. **Model Entitas Relasional (PostgreSQL 8 Modul)**:
   - `users`: Master akun (`id`, `name`, `email`, `password_hash`, `role: 'admin' | 'user'`, `phone`, `gender`, `avatar_url`, `date_of_birth`).
   - `user_profiles`: Data biometrik & sekolah (`friend_code`, `school_or_org`, `hb_level`, `hb_status`, `risk_level`, `height`, `weight`, `blood_type`, `streak_count`, `level_title`, `status`).
   - `products`: Katalog TTD & suplemen pendukung (`sku`, `stock`, `unit`, `price`, `status`).
   - `reminder_schedules` & `schedule_time_slots`: Jadwal konsumsi rutin (`day_of_week`, `time_slot`, `dosage`, `frequency`, `is_enabled`, `status`).
   - `consumption_logs`: Catatan riwayat konsumsi (`scheduled_date`, `scheduled_time`, `taken_at`, `status: 'ON_TIME' | 'LATE' | 'MISSED' | 'SKIPPED' | 'PENDING'`).
   - `buddy_groups`, `buddy_group_members`, `buddy_group_messages`: Sistem pertemanan kelompok berbasis kode unik (`group_code`), obrolan real-time, dan stiker semangat (`cheer_type`).
   - `buddy_connections`, `buddy_activities`, `buddy_cheers`: Relasi 1-on-1 antar-siswi pendukung streak bersama.
   - `articles`, `article_sections`, `user_bookmarks`: CMS edukasi kesehatan dengan konten multi-seksi dan bookmark pengguna.
   - `admin_nudges`: Intervensi manual admin/UKS untuk mengirim pengingat via aplikasi maupun tautan WhatsApp.

### 4.3 Analisis Autentikasi & Sesi Eksisting
1. **Mekanisme Sesi Saat Ini**:
   - Sesi pengguna disimpan di sisi klien pada `localStorage` (`fe_tablet_auth_user`).
   - Status onboarding disimpan pada `localStorage` (`fe_tablet_has_onboarded`).
   - Login mengembalikan objek JSON `AuthUser` yang langsung disimpan ke browser storage.
2. **Role-Based Access Control (RBAC)**:
   - Terdapat 2 role tegas: **`user`** (siswi / remaja putri) dan **`admin`** (pembina UKS / tenaga medis).
   - Pengalihan hak akses ditangani oleh `AuthGuard.tsx`.
   - Pengguna baru dengan status profil belum lengkap (`!user.isProfileComplete`) dikunci di halaman `/user/setup`.
3. **Quick Login & Demo Fallback**:
   - Mendukung login instan via `quickLoginAction`.

---

## 5. Kebutuhan Sistem Target di Dalam `budi-luhur`

### 5.1 Struktur Monorepo `budi-luhur`
Seluruh pengerjaan aktif diwadahi di dalam direktori `budi-luhur/`:

```text
budi-luhur/
├── doc/
│   └── PRD.md                         # Dokumen PRD Ekosistem (Berkas ini)
│
├── frontend/                          # Landing Page Portal Utama (React + Vite)
│   ├── src/
│   │   ├── components/                # Hero, AppSelectorCards, Benefits, FAQ, Footer
│   │   ├── config/apps.ts             # Konfigurasi URL ketiga aplikasi
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── apps/                              # Wadah Tiga Aplikasi Terpisah
    ├── app1/                          # APLIKASI 1
    │   ├── frontend/                  # React + Vite (Port 5173)
    │   └── backend/                   # Express.js (Port 4001) | DB: fe_tablet_app1
    │
    ├── app2/                          # APLIKASI 2
    │   ├── frontend/                  # React + Vite (Port 5174)
    │   └── backend/                   # Express.js (Port 4002) | DB: fe_tablet_app2
    │
    └── app3/                          # APLIKASI 3
        ├── frontend/                  # React + Vite (Port 5175)
        └── backend/                   # Express.js (Port 4003) | DB: fe_tablet_app3
```

### 5.2 Landing Page Portal `budi-luhur/frontend`
1. **Fungsi Utama**: Pintu gerbang utama yang menyajikan landing page program kesehatan berbasis desain heroik `fe-tablet/src/features/home`.
2. **Penyesuaian Minimum yang Diperlukan**:
   - Mempertahankan komponen desain bernilai tinggi: `Hero`, `Benefits`, `ProductInfo`, `Ingredients`, `Features`, `Testimonials`, `FAQ`, dan `Footer`.
   - Mengubah CTA utama (`Buka Aplikasi`) dan bilah navigasi (`Navbar`) menjadi **Portal Akses 3 Aplikasi**:
     - Menampilkan section kartu interaktif:
       - **Kartu Aplikasi 1**: Judul, deskripsi singkat sasaran, status operasional (🟢 Aktif), dan tombol navigasi langsung `Masuk ke Aplikasi 1` (`http://localhost:5173`).
       - **Kartu Aplikasi 2**: Judul, deskripsi singkat sasaran, status operasional (🟢 Aktif), dan tombol navigasi langsung `Masuk ke Aplikasi 2` (`http://localhost:5174`).
       - **Kartu Aplikasi 3**: Judul, deskripsi singkat sasaran, status operasional (🟢 Aktif), dan tombol navigasi langsung `Masuk ke Aplikasi 3` (`http://localhost:5175`).
   - URL target tautan dikonfigurasi melalui berkas `.env` portal `budi-luhur/frontend`:
     ```env
     VITE_PORTAL_TITLE="Budi Luhur Health Portal"
     VITE_APP_1_URL=http://localhost:5173
     VITE_APP_2_URL=http://localhost:5174
     VITE_APP_3_URL=http://localhost:5175
     ```
   - Portal berjalan sebagai aplikasi web ringan (React + Vite static SPA) tanpa dependensi database internal.

### 5.3 Kebutuhan Fungsional per Aplikasi (Functional Requirements)

#### FR-1: Autentikasi, Profil & Isolasi Sesi
- **FR-1.1**: Registrasi akun baru dengan validasi format email, nomor telepon, dan enkripsi password bcrypt.
- **FR-1.2**: Login pengguna menghasilkan JSON Web Token (JWT) dengan masa kedaluwarsa terkonfigurasi.
- **FR-1.3**: Kunci sesi browser diisolasi per aplikasi (`app1_auth_token`, `app2_auth_token`, `app3_auth_token`) untuk mencegah bentrokan data saat ketiga aplikasi dibuka bersamaan dalam satu peramban.
- **FR-1.4**: Alur onboarding 3 slide dan setup profil awal (sekolah, tanggal lahir, golongan darah, Hb, jadwal awal).
- **FR-1.5**: Hak akses terpisah (RBAC) antara `user` dan `admin`.
- **FR-1.6**: Fitur hapus akun mandiri dengan penghapusan relasional kaskade (`ON DELETE CASCADE`).

#### FR-2: Manajemen Jadwal & Pengingat TTD
- **FR-2.1**: Pengaturan hari minum obat mingguan (default rekomendasi: Sabtu) dan jam (default: 20:00 WIB).
- **FR-2.2**: Opsi pengingat 15 menit sebelumnya dan toggle aktifasi pengingat.
- **FR-2.3**: Pembuatan notifikasi sistem peramban saat jadwal tiba.

#### FR-3: Monitoring & Riwayat Konsumsi
- **FR-3.1**: Pencatatan status harian seketika (*Sudah Minum / ON_TIME*, *Terlewat / MISSED*, *Ubah Catatan*).
- **FR-3.2**: Filter riwayat berdasarkan rentang waktu (*Semua, Hari Ini, 7 Hari, 30 Hari*) dan status kepatuhan.
- **FR-3.3**: Visualisasi kepatuhan bulanan dengan grafik batang dan garis target evaluasi kepatuhan.
- **FR-3.4**: Perhitungan otomatis streak mingguan berbasis kronologi pencatatan.

#### FR-4: Sahabat Sehat (Buddy Group Streak)
- **FR-4.1**: Pembuatan grup sahabat dengan kode acak unik (`group_code`).
- **FR-4.2**: Bergabung ke grup menggunakan kode unik pertemanan.
- **FR-4.3**: Obrolan obrolan grup dan pengiriman stiker apresiasi (*Cheers*: HEART, FLAME, STAR, CLAP, POWER).
- **FR-4.4**: Perhitungan akumulasi streak kolektif anggota grup.

#### FR-5: Edukasi Kesehatan & Literasi Anemia
- **FR-5.1**: Katalog artikel pencegahan anemia terbagi dalam kategori (*Anemia*, *TTD*, *Nutrisi*, *Gaya Hidup*, *Mitos & Fakta*).
- **FR-5.2**: Fitur pencarian kata kunci dan penyimpanan artikel favorit (*Bookmark*).
- **FR-5.3**: Halaman detail artikel dengan format multi-seksi terstruktur dan estimasi waktu baca.

#### FR-6: Konsultasi Asisten AI
- **FR-6.1**: Antarmuka percakapan interaktif dengan *quick prompt chips* seputar pertanyaan umum TTD.
- **FR-6.2**: Pemanggilan aman ke endpoint backend yang meneruskan pertanyaan ke Gemini API disertai konteks profil pengguna (kadar Hb, jenis kelamin, institusi).
- **FR-6.3**: Fallback respons medis terstandarisasi apabila kuota AI atau koneksi eksternal mengalami kendala.

#### FR-7: Portal Administrator (UKS & Fasilitator Medis)
- **FR-7.1**: Dashboard analitik berisi total siswi aktif, persentase kepatuhan global, dan alert siswi berisiko tinggi (Hb rendah).
- **FR-7.2**: Manajemen siswi: pencarian, filter risiko, penyesuaian data profil, dan riwayat pemeriksaan.
- **FR-7.3**: Manajemen jadwal massal dan pengiriman *Nudge* (pengingat langsung ke aplikasi atau pesan WhatsApp).
- **FR-7.4**: CMS publikasi dan pengeditan materi edukasi kesehatan.
- **FR-7.5**: Rekapitulasi laporan kepatuhan dan fitur ekspor data.

### 5.4 Kebutuhan Non-Fungsional (Non-Functional Requirements)
1. **Performa**: Waktu muat awal SPA Vite di bawah 1.5 detik pada koneksi 4G; respons API rata-rata di bawah 150ms.
2. **Keamanan**: Password di-hash menggunakan bcrypt (salt rounds 10); otorisasi endpoint menggunakan JWT Bearer token; CORS dibatasi hanya ke domain frontend masing-masing.
3. **Ergonomi & Desain**: Menggunakan desain palet Rose (`#e11d48`) dan canvas blush (`#fff5f7`), target sentuh minimal 44×44px, safe bottom-padding (`pb-28`) untuk navigasi ponsel/tablet.
4. **Isolasi Data Mutlak**: Tidak ada query lintas database; setiap aplikasi beroperasi pada koneksi PostgreSQL miliknya sendiri.

---

## 6. Arsitektur Target & Spesifikasi Teknis

### 6.1 Gambaran Arsitektur Monorepo `budi-luhur`

```mermaid
graph TB
    subgraph MainProject["MAIN PROJECT: budi-luhur/"]
        subgraph Portal["budi-luhur/frontend/"]
            LP_FE["Landing Page Portal\n(React + Vite, Port 5170)"]
        end

        subgraph Apps["budi-luhur/apps/"]
            subgraph App1["apps/app1/"]
                A1_FE["Frontend React + Vite\n(Port 5173)"]
                A1_BE["Backend Express.js\n(Port 4001)"]
                A1_FE <-->|"REST API + JWT"| A1_BE
            end

            subgraph App2["apps/app2/"]
                A2_FE["Frontend React + Vite\n(Port 5174)"]
                A2_BE["Backend Express.js\n(Port 4002)"]
                A2_FE <-->|"REST API + JWT"| A2_BE
            end

            subgraph App3["apps/app3/"]
                A3_FE["Frontend React + Vite\n(Port 5175)"]
                A3_BE["Backend Express.js\n(Port 4003)"]
                A3_FE <-->|"REST API + JWT"| A3_BE
            end
        end
    end

    subgraph Databases["PostgreSQL Databases (Terisolasi)"]
        A1_DB[("DB 1: fe_tablet_app1")]
        A2_DB[("DB 2: fe_tablet_app2")]
        A3_DB[("DB 3: fe_tablet_app3")]
    end

    A1_BE <-->|"node-postgres"| A1_DB
    A2_BE <-->|"node-postgres"| A2_DB
    A3_BE <-->|"node-postgres"| A3_DB

    LP_FE -.->|"Akses Aplikasi 1"| A1_FE
    LP_FE -.->|"Akses Aplikasi 2"| A2_FE
    LP_FE -.->|"Akses Aplikasi 3"| A3_FE

    subgraph Reference["REFERENSI EKSISTING (READ-ONLY)"]
        FE_REF["fe-tablet/\n(Next.js 16 App Router)"]
    end
    FE_REF -.->|"Pola Desain & Logika"| MainProject
```

### 6.2 Arsitektur Frontend: Feature-Based Architecture (React + Vite)
Di dalam `budi-luhur/apps/app*/frontend/`:

```text
src/
├── app/                       # Inisialisasi Aplikasi
│   ├── App.tsx                # Root App Component
│   ├── routes.tsx             # React Router DOM configuration
│   └── providers.tsx          # QueryProvider, AuthProvider, ToastProvider
├── features/                  # Domain Fitur Terisolasi
│   ├── auth/                  # Login, Register, AuthGuard, AuthContext
│   ├── dashboard/             # Dashboard Siswi (Hero, StreakCard, QuickGrid)
│   ├── schedule/              # Jadwal TTD (Modal Ubah Jadwal, Toggle)
│   ├── consumption/           # Log Konsumsi, Kalender, Evaluasi Bulanan
│   ├── buddy/                 # Sahabat Sehat, Group Chat, Stiker Cheers
│   ├── education/             # Modul Artikel, Filter Kategori, Bookmark
│   ├── consultation/          # Asisten AI Gemini
│   ├── admin/                 # Portal Administrator/UKS (CRUD Siswi, Nudge, CMS)
│   └── onboarding/            # Splash & Onboarding 3-Slide
├── shared/                    # Komponen Atomik & Utilitas
│   ├── api/                   # Axios client instance (interceptor JWT)
│   ├── components/ui/         # Button, Card, Badge, Modal, Input, Chip
│   ├── components/domain/     # BottomNavigationBar, ScreenHeader
│   ├── hooks/                 # usePWA, useToast, useOnlineStatus
│   └── utils/                 # cn.ts, dateHelpers, notifications
├── assets/                    # Gambar, SVG, icon PWA
└── main.tsx                   # Entry point Vite
```

### 6.3 Arsitektur Backend: Modular Architecture (Express.js)
Di dalam `budi-luhur/apps/app*/backend/`:

```text
src/
├── config/                    # env.ts, database.ts (pg.Pool)
├── middlewares/               # auth.middleware.ts (JWT), role.middleware.ts, error.middleware.ts
├── modules/                   # Domain Modules
│   ├── auth/                  # auth.controller.ts, auth.service.ts, auth.routes.ts
│   ├── users/                 # user.controller.ts, user.service.ts, user.routes.ts
│   ├── schedules/             # schedule.controller.ts, schedule.service.ts, schedule.routes.ts
│   ├── consumption/           # consumption.controller.ts, consumption.service.ts, consumption.routes.ts
│   ├── buddy/                 # buddy.controller.ts, buddy.service.ts, buddy.routes.ts
│   ├── articles/              # article.controller.ts, article.service.ts, article.routes.ts
│   ├── consultation/          # consultation.controller.ts, consultation.service.ts (Gemini AI)
│   └── admin/                 # admin.controller.ts, admin.service.ts, admin.routes.ts
├── db/                        # schema.sql, seed.ts, seedData.json
├── app.ts                     # Setup express & middleware
└── server.ts                  # Server entry & listener port
```

### 6.4 Pemetaan Kontrak API (Dari Server Actions ke RESTful Endpoints)

| Next.js Server Action (`fe-tablet`) | HTTP Method | RESTful Endpoint (Express.js) | Deskripsi Fungsional |
| :--- | :---: | :--- | :--- |
| `loginUserAction` | `POST` | `/api/v1/auth/login` | Login dengan email/password, mengembalikan JWT & profil |
| `quickLoginAction` | `POST` | `/api/v1/auth/quick-login` | Demo login instan berdasarkan peran (`admin` / `user`) |
| `registerUserAction` | `POST` | `/api/v1/auth/register` | Pendaftaran siswi baru dan pembuatan `friend_code` |
| `deleteUserAccountAction` | `DELETE` | `/api/v1/auth/account` | Hapus akun aktif dan seluruh data terkait secara kaskade |
| `getUserDashboardDataAction`| `GET` | `/api/v1/users/dashboard` | Ambil data agregat beranda (streak, status hari ini, jadwal) |
| `updateUserProfileAction` | `PUT` | `/api/v1/users/profile` | Pembaruan data biometrik, sekolah, dan nomor kontak |
| `saveUserInitialSetupAction`| `POST` | `/api/v1/users/setup` | Simpan profil awal dan jadwal pertama kali |
| `getUserScheduleAction` | `GET` | `/api/v1/schedules` | Ambil jadwal aktif pengguna |
| `updateUserScheduleSettingsAction` | `PUT` | `/api/v1/schedules/:id` | Ubah hari, jam, dosis, atau aktif/nonaktif pengingat |
| `getActiveNudgeAction` | `GET` | `/api/v1/schedules/nudges/active` | Ambil pengingat personal aktif dari fasilitator/admin |
| `dismissNudgeAction` | `POST` | `/api/v1/schedules/nudges/:id/dismiss` | Tandai pengingat personal telah dibaca/ditutup |
| `recordUserConsumptionAction`| `POST` | `/api/v1/consumption/record` | Konfirmasi konsumsi obat (*ON_TIME*, *LATE*, *MISSED*) |
| `getUserConsumptionHistoryAction`| `GET` | `/api/v1/consumption/history` | Riwayat log konsumsi dengan filter tanggal dan status |
| `getMonthlyEvaluationAction`| `GET` | `/api/v1/consumption/monthly-evaluation` | Statistik kepatuhan 6 bulan dan rasio kepatuhan |
| `getUserGroupsAction` | `GET` | `/api/v1/buddy/groups` | Ambil daftar grup sahabat yang diikuti pengguna |
| `createBuddyGroupAction` | `POST` | `/api/v1/buddy/groups` | Buat grup baru dan generate kode unik grup |
| `joinGroupByCodeAction` | `POST` | `/api/v1/buddy/groups/join` | Bergabung ke grup menggunakan kode unik |
| `getGroupChatDetailsAction`| `GET` | `/api/v1/buddy/groups/:id` | Ambil obrolan obrolan dan daftar anggota grup |
| `sendGroupMessageAction` | `POST` | `/api/v1/buddy/groups/:id/messages` | Kirim pesan teks atau stiker semangat (*cheers*) |
| `getArticlesAction` | `GET` | `/api/v1/articles` | Katalog materi edukasi dengan filter kategori & pencarian |
| `getArticleDetailAction` | `GET` | `/api/v1/articles/:id` | Detail isi artikel beserta seksi-seksi materi |
| `toggleBookmarkAction` | `POST` | `/api/v1/articles/:id/bookmark` | Simpan atau hapus artikel dari daftar favorit |
| `askGeminiConsultationAction`| `POST` | `/api/v1/consultation/ask` | Kirim pertanyaan ke Gemini AI disertai konteks kesehatan |
| `getAdminStatsAction` | `GET` | `/api/v1/admin/stats` | Statistik global kepatuhan untuk dashboard UKS |
| `getUsersAction` | `GET` | `/api/v1/admin/users` | Daftar siswi binaan dan status risiko anemia |
| `sendUserReminderAction` | `POST` | `/api/v1/admin/reminders/send` | Kirim pengingat manual ke siswi (App / WhatsApp) |
| `createArticleAction` / `updateArticleAction` | `POST`/`PUT` | `/api/v1/admin/articles` | CMS artikel kesehatan |

---

## 7. Rencana Struktur Repositori & Folder Blueprint Lengkap

```text
/home/azure/dev/projects/frontend/
│
├── budi-luhur/                                # MAIN PROJECT ROOT
│   ├── doc/
│   │   └── PRD.md                             # Dokumen PRD Ekosistem (Berkas ini)
│   │
│   ├── frontend/                              # LANDING PAGE PORTAL (React + Vite)
│   │   ├── src/
│   │   │   ├── components/                    # Hero, AppSelectorCards, Benefits, FAQ, Footer
│   │   │   ├── config/apps.ts                 # Konfigurasi URL ketiga aplikasi
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── apps/                                  # WADAH TIGA APLIKASI MANDIRI
│       ├── app1/                              # APLIKASI 1
│       │   ├── frontend/                      # React + Vite (Port 5173)
│       │   │   ├── src/
│       │   │   │   ├── features/              # Feature-based modules
│       │   │   │   ├── shared/                # UI, API client, hooks
│       │   │   │   └── main.tsx
│       │   │   ├── .env                       # VITE_API_BASE_URL=http://localhost:4001/api/v1
│       │   │   └── package.json
│       │   └── backend/                       # Express.js (Port 4001)
│       │       ├── src/
│       │       │   ├── config/                # env, database pool
│       │       │   ├── middlewares/           # auth, role, error
│       │       │   ├── modules/               # auth, users, schedules, consumption, dll.
│       │       │   ├── db/                    # schema.sql, seed.ts
│       │       │   └── server.ts
│       │       ├── .env                       # PORT=4001, DATABASE_URL (fe_tablet_app1)
│       │       └── package.json
│       │
│       ├── app2/                              # APLIKASI 2
│       │   ├── frontend/                      # React + Vite (Port 5174)
│       │   │   ├── .env                       # VITE_API_BASE_URL=http://localhost:4002/api/v1
│       │   │   └── package.json
│       │   └── backend/                       # Express.js (Port 4002)
│       │       ├── .env                       # PORT=4002, DATABASE_URL (fe_tablet_app2)
│       │       └── package.json
│       │
│       └── app3/                              # APLIKASI 3
│           ├── frontend/                      # React + Vite (Port 5175)
│           │   ├── .env                       # VITE_API_BASE_URL=http://localhost:4003/api/v1
│           │   └── package.json
│           └── backend/                       # Express.js (Port 4003)
│               ├── .env                       # PORT=4003, DATABASE_URL (fe_tablet_app3)
│               └── package.json
│
└── fe-tablet/                                 # REFERENSI IMPLEMENTASI ASAL (READ-ONLY)
    └── (Next.js 16 - Dipertahankan 100% utuh tanpa modifikasi)
```

---

## 8. Strategi Duplikasi, Migrasi, & Implementasi Bertahap

### 8.1 Strategi Duplikasi Terkelola (Template-First Approach)

```mermaid
flowchart TD
    Origin["fe-tablet/\n(Next.js 16 Ref)"] -->|Analisis & Ekstraksi Logika| TemplateFE["Template Frontend\n(React + Vite)"]
    Origin -->|Ekstraksi Server Actions & SQL| TemplateBE["Template Backend\n(Express.js Modular)"]
    
    TemplateFE & TemplateBE --> TemplateApp["Template Aplikasi Stabil\n(apps/template)"]
    
    TemplateApp -->|Duplikasi & Set Port 5173/4001| App1["budi-luhur/apps/app1\n(DB: fe_tablet_app1)"]
    TemplateApp -->|Duplikasi & Set Port 5174/4002| App2["budi-luhur/apps/app2\n(DB: fe_tablet_app2)"]
    TemplateApp -->|Duplikasi & Set Port 5175/4003| App3["budi-luhur/apps/app3\n(DB: fe_tablet_app3)"]
    
    Origin -.->|Adaptasi Komponen Presentasional| Landing["budi-luhur/frontend/\n(Landing Portal)"]
```

1. **Langkah 1 (Template Scaffolding)**:
   - Bangun 1 pasang template teruji: `frontend` (React + Vite) dan `backend` (Express.js).
   - Pastikan template ini memiliki 100% paritas fitur dengan `fe-tablet`.
2. **Langkah 2 (Duplikasi Bersih ke `budi-luhur/apps/`)**:
   - Salin paket template ke `budi-luhur/apps/app1`, `budi-luhur/apps/app2`, dan `budi-luhur/apps/app3`.
   - Ubah konfigurasi port, nama database, dan secret key token di setiap berkas `.env`.
3. **Langkah 3 (Landing Page Portal di `budi-luhur/frontend`)**:
   - Terapkan landing page pada `budi-luhur/frontend` dengan tautan aktif ke ketiga aplikasi.

### 8.2 Matriks Tahapan Eksekusi (Implementation Roadmap)

| Fase | Nama Aktivitas | Luaran (Deliverables) |
| :---: | :--- | :--- |
| **Fase 1** | **Spesifikasi & Blueprint** | Dokumen PRD lengkap di `budi-luhur/doc/PRD.md` (Tahap Saat Ini). |
| **Fase 2** | **Backend Modular Express.js** | Backend Express.js dengan modular structure, koneksi PostgreSQL, JWT middleware, dan endpoint RESTful lengkap. |
| **Fase 3** | **Frontend Feature-Based Vite** | Frontend React + Vite dengan routing React Router DOM, migrasi komponen `fe-tablet`, dan Axios API client. |
| **Fase 4** | **Verifikasi Paritas Fitur Template** | Pengujian menyeluruh alur login, pencatatan obat, grafik, obrolan sahabat, AI, dan admin CMS pada template. |
| **Fase 5** | **Duplikasi & Isolasi 3 Aplikasi** | 3 aplikasi independen di `budi-luhur/apps/` berjalan di port masing-masing dengan database terisolasi (`app1_db`, `app2_db`, `app3_db`). |
| **Fase 6** | **Landing Page Portal Budi-Luhur** | Antarmuka landing page di `budi-luhur/frontend` menampilkan 3 kartu akses aplikasi yang responsif. |
| **Fase 7** | **Validasi & Pengujian Akhir** | Pengujian integrasi lintas aplikasi, pengujian multi-tab tanpa bentrokan sesi, dan uji ketahanan PWA. |

---

## 9. Konfigurasi Lingkungan, Port, & Database

### 9.1 Alokasi Port Lingkungan Lokal

| Layanan | Direktori Kerja | Port Lokal | Konfigurasi URL |
| :--- | :--- | :---: | :--- |
| **Portal Budi-Luhur** | `budi-luhur/frontend` | `5170` | `http://localhost:5170` |
| **Aplikasi 1 - Frontend** | `budi-luhur/apps/app1/frontend` | `5173` | `http://localhost:5173` |
| **Aplikasi 1 - Backend** | `budi-luhur/apps/app1/backend` | `4001` | `http://localhost:4001/api/v1` |
| **Aplikasi 2 - Frontend** | `budi-luhur/apps/app2/frontend` | `5174` | `http://localhost:5174` |
| **Aplikasi 2 - Backend** | `budi-luhur/apps/app2/backend` | `4002` | `http://localhost:4002/api/v1` |
| **Aplikasi 3 - Frontend** | `budi-luhur/apps/app3/frontend` | `5175` | `http://localhost:5175` |
| **Aplikasi 3 - Backend** | `budi-luhur/apps/app3/backend` | `4003` | `http://localhost:4003/api/v1` |

### 9.2 Contoh Konfigurasi `.env`

#### Backend `.env` (Contoh Aplikasi 1 di `budi-luhur/apps/app1/backend/.env`):
```env
NODE_ENV=development
PORT=4001
CORS_ORIGIN=http://localhost:5173

# Database PostgreSQL Terisolasi
DATABASE_URL=postgresql://postgres:password@localhost:5432/fe_tablet_app1?sslmode=disable

# Keamanan Token
JWT_SECRET=app1_super_secret_jwt_key_2026_xyz
JWT_EXPIRES_IN=7d

# Google Gemini API untuk Konsultasi
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Frontend `.env` (Contoh Aplikasi 1 di `budi-luhur/apps/app1/frontend/.env`):
```env
VITE_APP_TITLE="FEMORY - Aplikasi 1"
VITE_API_BASE_URL=http://localhost:4001/api/v1
VITE_AUTH_STORAGE_KEY=app1_auth_token
VITE_USER_STORAGE_KEY=app1_user_profile
```

#### Portal `.env` (di `budi-luhur/frontend/.env`):
```env
VITE_PORTAL_TITLE="Portal Kesehatan Budi Luhur"
VITE_APP_1_URL=http://localhost:5173
VITE_APP_2_URL=http://localhost:5174
VITE_APP_3_URL=http://localhost:5175
```

---

## 10. Kriteria Penerimaan (Acceptance Criteria)

1. **Struktur Main Project Terpusat**:
   - Seluruh kode kerja aktif, landing page, dan 3 aplikasi berada di dalam folder `budi-luhur/`.
   - Direktori `fe-tablet/` tidak mengalami modifikasi dan tetap dapat dijalankan sebagai acuan.
2. **Landing Page Portal Budi-Luhur**:
   - Membuka `http://localhost:5170` menampilkan landing page dengan desain visual premium (palet Rose, hero banner, edukasi).
   - Terdapat 3 kartu aplikasi yang jelas dengan tombol aksi yang membuka Aplikasi 1, 2, dan 3 secara akurat.
3. **Isolasi Akun & Data**:
   - Akun yang didaftarkan pada Aplikasi 1 tidak dapat digunakan untuk login pada Aplikasi 2 atau Aplikasi 3.
   - Perubahan jadwal atau log konsumsi pada Aplikasi 1 tidak berdampak pada data di Aplikasi 2 maupun 3.
4. **Isolasi Sesi Peramban**:
   - Pengguna dapat membuka Aplikasi 1, 2, dan 3 secara bersamaan pada browser yang sama tanpa terjadi kondisi tertimpa sesi (*session overwrite*).
5. **Paritas Fitur 100%**:
   - Seluruh alur: Splash, Onboarding, Login/Register, Setup Profil Awal, Dashboard, Ubah Jadwal, Monitoring 3-Tab, Obrolan Buddy Group & Cheers, Artikel & Bookmark, Konsultasi AI, serta Portal Admin UKS bekerja tanpa error fungsional.

---

## 11. Analisis Risiko, Asumsi, & Pertanyaan Terbuka

### 11.1 Matriks Risiko & Mitigasi

| Risiko | Tingkat | Dampak | Strategi Mitigasi |
| :--- | :---: | :---: | :--- |
| **Bentrokan Sesi Browser (Local Storage Collision)** | Sedang | Sesi antarlayanan saling menimpa jika nama key sama. | Terapkan *namespaced storage keys* (`app1_auth_token`, `app2_auth_token`, `app3_auth_token`). |
| **Kuotasi & Biaya Gemini API** | Rendah | 3 backend memanggil Gemini API secara serempak. | Simpan API key aman di server backend, terapkan caching respons untuk pertanyaan populer, dan gunakan prompt yang efisien token. |
| **Beban Pemeliharaan Duplikasi Kode** | Sedang | Perbaikan bug di satu aplikasi harus disalin manual ke aplikasi lain jika tidak menggunakan basis template. | Gunakan fase *Template-First*; pastikan template 100% stabil sebelum diduplikasi ke App 1, 2, dan 3. |
| **PWA Service Worker Scope Conflict** | Rendah | Service worker saling menimpa cache jika domain sama tanpa pemisahan scope. | Batasi service worker scope berdasarkan path atau jalankan pada port/subdomain terpisah. |

### 11.2 Asumsi Arsitektural (Assumptions)
1. **Identitas Tiga Aplikasi**: Diasumsikan ketiga aplikasi pada fase pertama memiliki tujuan bisnis, alur medis, dan kebutuhan fungsional yang sama persis (misal: digunakan untuk 3 institusi/sekolah percontohan berbeda atau 3 wilayah kerja Puskesmas yang terpisah).
2. **Topologi Database**: Diasumsikan PostgreSQL server lokal atau cloud (Neon) dapat menampung 3 database logis terpisah (`fe_tablet_app1`, `fe_tablet_app2`, `fe_tablet_app3`) atau skema terisolasi.
3. **Teknologi Frontend & Backend**: Spesifikasi React + Vite untuk frontend dan Express.js untuk backend disetujui sebagai arsitektur target resmi.

### 11.3 Pertanyaan Terbuka (Open Questions untuk Tahap Selanjutnya)
1. **Penamaan Spesifik Aplikasi**: Apakah ketiga aplikasi nantinya akan memiliki nama merek/identitas visual tersendiri (misal: *FEMORY SMAN 1*, *FEMORY Wilayah Puskesmas A*, dll.), atau tetap menggunakan nama default dengan nomor indeks?
2. **Kebutuhan Agregasi Superadmin**: Apakah di masa depan dibutuhkan satu akun "Super Admin" yang dapat memantau laporan kepatuhan agregat dari ketiga aplikasi sekaligus, ataukah pelaporan tetap wajib terpisah 100%?
3. **Penyedia Hosting Produksi**: Apakah ketiga aplikasi akan di-deploy menggunakan container Docker (misal: Docker Compose di satu VPS / Cloud Run) atau menggunakan layanan managed serverless/PaaS terpisah?
