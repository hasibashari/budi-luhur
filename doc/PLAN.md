# Rencana Implementasi: Ekosistem Tiga Aplikasi Budi-Luhur Berbasis Fe-Tablet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun ekosistem tiga aplikasi mandiri berbasis implementasi `fe-tablet` (Frontend React+Vite Feature-Based & Backend Express.js Modular) yang diwadahi di dalam main project `budi-luhur`, lengkap dengan portal landing page utama di `budi-luhur/frontend/` yang menghubungkan ke ketiga aplikasi.

**Architecture:** Mengadopsi pola *Template-First Migration*: mengekstrak satu set template teruji (Frontend React+Vite dan Backend Express.js) dengan paritas fungsional 100% terhadap `fe-tablet`, lalu menduplikasi template tersebut menjadi tiga instans otonom di `budi-luhur/apps/app1`, `app2`, dan `app3` dengan isolasi database PostgreSQL dan *namespaced browser storage*. Portal landing page dibangun di `budi-luhur/frontend` mengadaptasi desain presentasional yang sudah ada sebagai satu-satunya etalase/gerbang informasi publik. **PWA-First Architecture**: Ketiga aplikasi beroperasi sebagai aplikasi web progresif (PWA) mandiri tanpa halaman home/marketing internal; rute root (`/`) pada masing-masing aplikasi mengarahkan pengguna langsung ke alur autentikasi (`/auth/login`), dan kartu aplikasi pada portal utama menghubungkan pengguna langsung ke halaman login dan registrasi.

**Tech Stack:**
- Frontend Portal & Apps: React 19/18, Vite, TypeScript, Tailwind CSS, React Router DOM, Axios, Lucide React, Motion.
- Backend Apps: Express.js, TypeScript, `pg` (node-postgres), `jsonwebtoken`, `bcryptjs`, Google Gemini API SDK.
- Database: PostgreSQL (3 database logis terpisah: `fe_tablet_app1`, `fe_tablet_app2`, `fe_tablet_app3`).

**Spec:** [budi-luhur/doc/PRD.md](file:///home/azure/dev/projects/frontend/budi-luhur/doc/PRD.md)

---

## Global Constraints

- Repositori asal `/home/azure/dev/projects/frontend/fe-tablet` bersifat **READ-ONLY**; tidak boleh diubah atau dihapus.
- Direktori kerja utama (*Main Project*) adalah `/home/azure/dev/projects/frontend/budi-luhur`.
- Tidak ada penambahan fitur bisnis baru atau perubahan perilaku aplikasi pada tahap awal (duplikasi fitur murni).
- Setiap aplikasi memiliki autentikasi, sesi browser, dan database yang terisolasi 100%. Akun di App 1 tidak dapat login di App 2 atau App 3.
- Skema database relasional PostgreSQL wajib mencakup 8 modul tabel persis seperti di `fe-tablet/src/db/schema.sql`.
- Port lokal: Portal (`5170`), App 1 (`5173`/`4001`), App 2 (`5174`/`4002`), App 3 (`5175`/`4003`).

---

## Review Focus

1. **Bentrokan Sesi Browser (Cross-App Storage Collision):** Pengguna login di App 1 dan App 2 pada peramban yang sama; sesi tidak boleh saling menimpa karena kunci penyimpanan lokal menggunakan *namespace* berbeda (`app1_auth_token`, `app2_auth_token`, `app3_auth_token`).
2. **Isolasi Database Antar-Aplikasi:** Pendaftaran akun atau pencatatan konsumsi obat di App 1 tidak boleh mengubah atau menambahkan baris pada database App 2 maupun App 3.
3. **Paritas Logika Server Actions ke Express REST:** Seluruh parameter query SQL, penanganan transaksi ACID, dan respons error dari `fe-tablet/*Repository.ts` harus berperilaku identik pada endpoint Express.
4. **Navigasi PWA-First & Eliminasi Home App:** Klik pada masing-masing kartu aplikasi di portal `http://localhost:5170` mengarahkan langsung ke halaman autentikasi (`/auth/login` dan `/auth/register`). Mengakses rute root (`/`) pada App 1, 2, atau 3 (serta via jendela PWA standalone) tidak menampilkan landing page duplikat, melainkan langsung menuju alur login atau dashboard aktif pengguna.
5. **Penanganan Onboarding & Penguncian Setup:** Pengguna baru yang belum melengkapi data sekolah/jadwal wajib tetap dikunci pada rute `/user/setup` hingga profil dilengkapi, sesuai aturan asli di `fe-tablet`.

---

## Task Breakdown

### Task 1: Inisialisasi Struktur Monorepo & Skrip Manajemen Main Project `budi-luhur`

**Files:**
- Create: `budi-luhur/package.json`
- Create: `budi-luhur/.gitignore`
- Modify: `budi-luhur/GEMINI.md`
- Test: Verifikasi eksekusi root scripts di `budi-luhur`

**Interfaces:**
- Produces: Root scripts `npm run dev:portal`, `npm run dev:app1`, `npm run dev:app2`, `npm run dev:app3`, `npm run dev:all`.

- [x] **Step 1: Buat konfigurasi root `budi-luhur/package.json`**
  Definisikan nama project `"budi-luhur-ecosystem"`, private: true, dan npm scripts untuk orkestrasi landing page serta ketiga apps.
- [x] **Step 2: Buat berkas `budi-luhur/.gitignore`**
  Abaikan `node_modules`, `.env`, `dist`, `.DS_Store`, dan berkas log.
- [x] **Step 3: Setup direktori dasar di `budi-luhur/`**
  Pastikan folder `budi-luhur/apps/` dan `budi-luhur/frontend/` siap untuk scaffolding.
- [x] **Step 4: Commit konfigurasi awal**
  Commit git untuk fondasi main project `budi-luhur`.

---

### Task 2: Scaffolding Backend Template Express.js Modular & Database Setup

**Files:**
- Create: `budi-luhur/apps/template-backend/package.json`
- Create: `budi-luhur/apps/template-backend/tsconfig.json`
- Create: `budi-luhur/apps/template-backend/src/config/env.ts`
- Create: `budi-luhur/apps/template-backend/src/config/database.ts`
- Create: `budi-luhur/apps/template-backend/src/db/schema.sql`
- Create: `budi-luhur/apps/template-backend/src/db/init.ts`
- Create: `budi-luhur/apps/template-backend/src/db/seed.ts`
- Create: `budi-luhur/apps/template-backend/src/db/seedData.json`
- Create: `budi-luhur/apps/template-backend/src/app.ts`
- Create: `budi-luhur/apps/template-backend/src/server.ts`
- Test: Script inisialisasi database `npm run db:init` & `npm run db:seed`

**Interfaces:**
- Produces: Singleton database client `db.query(text, params)` dan `db.transaction(callback)` di Express.
- Produces: Endpoint health check `GET /api/v1/health` -> `{ status: "ok", timestamp: ... }`.

- [x] **Step 1: Setup dependencies backend template**
  Pasang `express`, `pg`, `dotenv`, `cors`, `jsonwebtoken`, `bcryptjs`, `@types/express`, `@types/pg`, `@types/node`, `tsx`, `typescript`.
- [x] **Step 2: Salin & sesuaikan skema PostgreSQL dari `fe-tablet`**
  Salin DDL 8 modul tabel dari `fe-tablet/src/db/schema.sql`, `seed.ts`, dan `seedData.json` ke `budi-luhur/apps/template-backend/src/db/`.
- [x] **Step 3: Buat `src/config/database.ts`**
  Implementasikan PostgreSQL connection pool singleton dengan dukungan transaksi ACID yang persis dengan `fe-tablet/src/db/client.ts`.
- [x] **Step 4: Buat `src/app.ts` & `src/server.ts`**
  Setup Express application dengan middleware `cors`, `express.json()`, global error handler, dan route `/api/v1/health`.
- [x] **Step 5: Verifikasi server & koneksi database**
  Jalankan server dan uji endpoint `GET /api/v1/health`.

---

### Task 3: Modul Backend Inti: Auth, Security Middlewares, & User Management

**Files:**
- Create: `budi-luhur/apps/template-backend/src/middlewares/auth.middleware.ts`
- Create: `budi-luhur/apps/template-backend/src/middlewares/role.middleware.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/auth/auth.types.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/auth/auth.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/auth/auth.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/auth/auth.routes.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/users/user.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/users/user.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/users/user.routes.ts`
- Test: Integrasi endpoint Auth & User via unit/integration test

**Interfaces:**
- Consumes: `db` pool dari `src/config/database.ts`.
- Produces: 
  - `POST /api/v1/auth/login` -> `{ token, user, redirectTo, isProfileComplete }`
  - `POST /api/v1/auth/quick-login` -> `{ token, user, redirectTo }`
  - `POST /api/v1/auth/register` -> `{ message: "Pendaftaran berhasil" }`
  - `DELETE /api/v1/auth/account` (Protected) -> `{ message: "Akun dihapus" }`
  - `GET /api/v1/users/dashboard` (Protected) -> `UserDashboardData`
  - `PUT /api/v1/users/profile` (Protected) -> updated profile
  - `POST /api/v1/users/setup` (Protected) -> complete profile & schedule

- [x] **Step 1: Implementasikan `auth.middleware.ts` & `role.middleware.ts`**
  Ekstrak token Bearer JWT dari header `Authorization`, verifikasi payload, dan sematkan `req.user`.
- [x] **Step 2: Migrasi logika `authRepository.ts` ke `auth.service.ts` & controller**
  Porting logika pencarian user, keyword fallback (`admin`, `sarah`), registrasi auto-generate `friend_code`, dan delete account kaskade. Tambahkan pembuatan token JWT saat login berhasil.
- [x] **Step 3: Migrasi logika `userRepository.ts` ke `user.service.ts` & controller**
  Porting agregasi data dashboard (streak, reminder hero, active today), edit profil, dan simpan initial setup profil/jadwal.
- [x] **Step 4: Mount rute di `src/app.ts`**
  Pasang `/api/v1/auth` dan `/api/v1/users`.
- [x] **Step 5: Verifikasi endpoint Auth & User**
  Uji registrasi, login, quick-login, dan akses dashboard dengan token JWT.

---

### Task 4: Modul Backend Domain: Schedules, Consumption, & Buddy System

**Files:**
- Create: `budi-luhur/apps/template-backend/src/modules/schedules/schedule.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/schedules/schedule.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/schedules/schedule.routes.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/consumption/consumption.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/consumption/consumption.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/consumption/consumption.routes.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/buddy/buddy.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/buddy/buddy.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/buddy/buddy.routes.ts`
- Test: Pengujian endpoint schedules, consumption log, dan group chat

**Interfaces:**
- Produces:
  - `GET /api/v1/schedules` & `PUT /api/v1/schedules/:id`
  - `GET /api/v1/schedules/nudges/active` & `POST /api/v1/schedules/nudges/:id/dismiss`
  - `POST /api/v1/consumption/record` -> mutasi log dan kalkulasi ulang streak
  - `GET /api/v1/consumption/history` -> log terfilter preset tanggal/status
  - `GET /api/v1/consumption/monthly-evaluation` -> riwayat kepatuhan 6 bulan
  - `GET /api/v1/buddy/groups` & `POST /api/v1/buddy/groups` & `POST /api/v1/buddy/groups/join`
  - `GET /api/v1/buddy/groups/:id` & `POST /api/v1/buddy/groups/:id/messages`

- [x] **Step 1: Implementasikan modul `schedules`**
  Migrasi logika dari `scheduleRepository.ts` & `user/api/scheduleRepository.ts`.
- [x] **Step 2: Implementasikan modul `consumption`**
  Migrasi logika pencatatan status harian, kalkulasi streak otomatis, dan evaluasi bulanan dari `consumptionRepository.ts`.
- [x] **Step 3: Implementasikan modul `buddy`**
  Migrasi logika manajemen grup sahabat, validasi kode unik grup, pengiriman chat, dan stiker apresiasi (*cheers*) dari `buddyRepository.ts`.
- [x] **Step 4: Mount rute di `src/app.ts`**
  Pasang `/api/v1/schedules`, `/api/v1/consumption`, dan `/api/v1/buddy`.
- [x] **Step 5: Verifikasi transaksi pencatatan obat dan obrolan grup**
  Pastikan mutasi data tercermin dengan benar di database PostgreSQL.

---

### Task 5: Modul Backend Penunjang: Articles, Gemini AI Consultation, & Admin CMS

**Files:**
- Create: `budi-luhur/apps/template-backend/src/modules/articles/article.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/articles/article.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/articles/article.routes.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/consultation/consultation.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/consultation/consultation.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/consultation/consultation.routes.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/admin/admin.service.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/admin/admin.controller.ts`
- Create: `budi-luhur/apps/template-backend/src/modules/admin/admin.routes.ts`
- Test: Pengujian konsultasi AI dan CMS Admin

**Interfaces:**
- Produces:
  - `GET /api/v1/articles` & `GET /api/v1/articles/:id` & `POST /api/v1/articles/:id/bookmark`
  - `POST /api/v1/consultation/ask` -> jawaban AI cerdas dari Google Gemini
  - `GET /api/v1/admin/stats` -> agregat statistik UKS
  - `GET /api/v1/admin/users` -> daftar siswi & risiko anemia
  - `POST /api/v1/admin/reminders/send` -> kirim pengingat nudge (App / WhatsApp)
  - `POST /api/v1/admin/articles` & `PUT /api/v1/admin/articles/:id`

- [x] **Step 1: Implementasikan modul `articles`**
  Migrasi pencarian artikel, filter kategori, detail seksi, dan toggle bookmark dari `educationRepository.ts`.
- [x] **Step 2: Implementasikan modul `consultation` (Gemini AI)**
  Migrasi logika integrasi Google Gemini API dari `fe-tablet/src/lib/gemini.ts` dengan penanganan prompt kesehatan dan fallback respon teruji.
- [x] **Step 3: Implementasikan modul `admin`**
  Migrasi fungsi agregasi statistik kepatuhan, daftar pengguna berisiko, pengiriman nudge, dan CMS artikel dari `features/admin/api/*`.
- [x] **Step 4: Mount seluruh rute tersisa di `src/app.ts`**
  Pasang `/api/v1/articles`, `/api/v1/consultation`, dan `/api/v1/admin` (dilindungi `roleMiddleware(['admin'])`).
- [x] **Step 5: Verifikasi menyeluruh backend template**
  Pastikan 100% endpoint backend bekerja secara RESTful.

---

### Task 6: Scaffolding Frontend Template React + Vite Feature-Based & Core Auth

**Files:**
- Create: `budi-luhur/apps/template-frontend/package.json`
- Create: `budi-luhur/apps/template-frontend/vite.config.ts`
- Create: `budi-luhur/apps/template-frontend/src/shared/api/client.ts`
- Create: `budi-luhur/apps/template-frontend/src/features/auth/context/AuthContext.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/auth/components/AuthGuard.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/auth/views/LoginView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/auth/views/RegisterView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/onboarding/components/OnboardingView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/splash/components/SplashScreenView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/app/routes.tsx`
- Create: `budi-luhur/apps/template-frontend/src/app/App.tsx`
- Create: `budi-luhur/apps/template-frontend/src/main.tsx`
- Test: Verifikasi alur Onboarding -> Login -> Redirect di browser

**Interfaces:**
- Consumes: REST API backend di `VITE_API_BASE_URL`.
- Produces: Client SPA React + Vite dengan sistem routing dan sesi terisolasi.

- [x] **Step 1: Setup project Vite + React + TypeScript + Tailwind CSS**
  Konfigurasi `vite.config.ts` dengan path alias `@/` dan Tailwind CSS styling yang konsisten dengan tema Rose (`#e11d48`) dan canvas blush (`#fff5f7`).
- [x] **Step 2: Setup Axios Client dengan JWT Interceptor**
  Konfigurasi client HTTP di `src/shared/api/client.ts` yang otomatis menyematkan header `Authorization: Bearer <token>` dari local storage.
- [x] **Step 3: Migrasi `AuthContext` & `AuthGuard`**
  Sesuaikan `AuthContext` agar memanggil endpoint REST Express dan menyimpan token dengan konfigurasi kunci dinamis (`VITE_AUTH_STORAGE_KEY`).
- [x] **Step 4: Migrasi `Splash`, `Onboarding`, `LoginView`, dan `RegisterView`**
  Porting komponen antarmuka dari `fe-tablet/src/features/auth` dan `onboarding`, menggantikan dependensi `next/navigation` dengan `useNavigate()` dari `react-router-dom`.
- [x] **Step 5: Verifikasi alur Auth & Onboarding pada browser**
  Pastikan pengguna dapat masuk dan diarahkan sesuai peran (`admin` / `user`).

---

### Task 7: Migrasi Modul-Modul User Portal ke Frontend Template

**Files:**
- Create: `budi-luhur/apps/template-frontend/src/features/dashboard/views/DashboardView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/user/views/SetupProfileView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/user/views/ProfileView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/schedule/views/ScheduleView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/consumption/views/HistoryView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/buddy/views/BuddyView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/education/views/EducationView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/education/views/ArticleDetailView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/consultation/views/ConsultationView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/shared/components/domain/BottomNav.tsx`
- Create: `budi-luhur/apps/template-frontend/src/shared/components/domain/ScreenHeader.tsx`
- Test: Uji coba seluruh alur portal siswi

**Interfaces:**
- Consumes: Modul backend schedules, consumption, buddy, articles, consultation.
- Produces: Pengalaman pengguna portal siswi berorientasi mobile-first dan thumb-friendly.

- [x] **Step 1: Migrasi BottomNavigationBar & Layout Siswi**
  Pasang bottom navigation 5-tab tetap (Beranda, Pantau, Edukasi, Sahabat, Konsultasi).
- [x] **Step 2: Migrasi Dashboard, Hero Reminder, & Setup Profile**
  Porting `DashboardView` dan `SetupProfileView` dengan integrasi ke backend Express.
- [x] **Step 3: Migrasi Jadwal & Kalender Monitoring 3-Tab**
  Porting `ScheduleView` (modal ubah jadwal) dan `HistoryView` (hari ini, mingguan, bulanan dengan grafik).
- [x] **Step 4: Migrasi Sahabat Sehat (Buddy Group Chat & Cheers)**
  Porting `BuddyView` dengan komponen obrolan grup dan modal gabung grup.
- [x] **Step 5: Migrasi Edukasi & AI Consultation Chat**
  Porting `EducationView`, `ArticleDetailView`, dan `ConsultationView` (Gemini chat interface).
- [x] **Step 6: Verifikasi seluruh fitur portal siswi**
  Lakukan pencatatan obat, ubah jadwal, tes AI chat, dan cek pembaruan streak.

---

### Task 8: Migrasi Modul-Modul Admin Portal ke Frontend Template

**Files:**
- Create: `budi-luhur/apps/template-frontend/src/features/admin/views/AdminDashboardView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/views/UserManagementView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/views/ScheduleManagementView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/views/ArticleManagementView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/views/ReportAnalyticsView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/views/AdminProfileView.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/components/AdminSidebar.tsx`
- Create: `budi-luhur/apps/template-frontend/src/features/admin/components/AdminHeader.tsx`
- Test: Uji coba modul admin CMS, nudge reminder, dan tabel siswi

**Interfaces:**
- Consumes: Modul backend admin (`/api/v1/admin/*`).
- Produces: Portal fasilitator medis / UKS lengkap.

- [x] **Step 1: Migrasi Layout Admin & Sidebar**
  Setup tata letak desktop dan mobile nav khusus admin.
- [x] **Step 2: Migrasi Admin Dashboard & Kartu Statistik**
  Tampilkan metrik total siswi, tingkat kepatuhan global, dan alert siswi berisiko.
- [x] **Step 3: Migrasi Manajemen Siswi & Modal Nudge**
  Porting tabel pengguna dan modal pengiriman pesan pengingat langsung via App/WhatsApp.
- [x] **Step 4: Migrasi CMS Artikel & Laporan Kepatuhan**
  Porting editor materi edukasi dan grafik analitik kepatuhan sekolah.
- [x] **Step 5: Verifikasi fitur admin portal**
  Pastikan role `admin` dapat mengoperasikan seluruh kapabilitas manajemen data.

---

### Task 9: Duplikasi Menjadi Tiga Aplikasi Mandiri di `budi-luhur/apps/` & Isolasi Database

**Files:**
- Create: `budi-luhur/apps/app1/frontend/` & `budi-luhur/apps/app1/backend/`
- Create: `budi-luhur/apps/app2/frontend/` & `budi-luhur/apps/app2/backend/`
- Create: `budi-luhur/apps/app3/frontend/` & `budi-luhur/apps/app3/backend/`
- Create: Berkas `.env` unik per aplikasi
- Test: Jalankan ketiga backend dan frontend secara bersamaan; uji isolasi database & sesi

**Interfaces:**
- Produces:
  - App 1: Frontend `http://localhost:5173` | Backend `http://localhost:4001` | DB: `fe_tablet_app1`
  - App 2: Frontend `http://localhost:5174` | Backend `http://localhost:4002` | DB: `fe_tablet_app2`
  - App 3: Frontend `http://localhost:5175` | Backend `http://localhost:4003` | DB: `fe_tablet_app3`

- [x] **Step 1: Duplikasi paket template ke `apps/app1`, `apps/app2`, dan `apps/app3`**
  Salin kode frontend dan backend template yang telah 100% tervalidasi ke ketiga folder aplikasi.
- [x] **Step 2: Konfigurasi berkas `.env` App 1**
  Set `PORT=4001`, `CORS_ORIGIN=http://localhost:5173`, `DATABASE_URL=.../fe_tablet_app1`, `VITE_AUTH_STORAGE_KEY=app1_auth_token`.
- [x] **Step 3: Konfigurasi berkas `.env` App 2**
  Set `PORT=4002`, `CORS_ORIGIN=http://localhost:5174`, `DATABASE_URL=.../fe_tablet_app2`, `VITE_AUTH_STORAGE_KEY=app2_auth_token`.
- [x] **Step 4: Konfigurasi berkas `.env` App 3**
  Set `PORT=4003`, `CORS_ORIGIN=http://localhost:5175`, `DATABASE_URL=.../fe_tablet_app3`, `VITE_AUTH_STORAGE_KEY=app3_auth_token`.
- [x] **Step 5: Inisialisasi dan seed database untuk masing-masing aplikasi**
  Jalankan `npm run db:init` dan `npm run db:seed` di `apps/app1/backend`, `apps/app2/backend`, dan `apps/app3/backend`.
- [x] **Step 6: Verifikasi isolasi operasional**
  Pastikan ketiga backend dan frontend dapat berjalan serentak tanpa bentrokan port.

---

### Task 10: Implementasi Landing Page Portal Utama `budi-luhur/frontend/`

**Files:**
- Create: `budi-luhur/frontend/package.json`
- Create: `budi-luhur/frontend/vite.config.ts`
- Create: `budi-luhur/frontend/src/config/apps.ts`
- Create: `budi-luhur/frontend/src/components/Navbar.tsx`
- Create: `budi-luhur/frontend/src/components/Hero.tsx`
- Create: `budi-luhur/frontend/src/components/AppSelectorSection.tsx`
- Create: `budi-luhur/frontend/src/components/Benefits.tsx`
- Create: `budi-luhur/frontend/src/components/Features.tsx`
- Create: `budi-luhur/frontend/src/components/FAQ.tsx`
- Create: `budi-luhur/frontend/src/components/Footer.tsx`
- Create: `budi-luhur/frontend/src/App.tsx`
- Create: `budi-luhur/frontend/.env`
- Test: Verifikasi tampilan landing page di `http://localhost:5170` dan klik 3 tautan aplikasi

**Interfaces:**
- Consumes: Konfigurasi URL `VITE_APP_1_URL`, `VITE_APP_2_URL`, `VITE_APP_3_URL`.
- Produces: Portal landing page estetis yang memandu pengguna memilih aplikasi.

- [x] **Step 1: Setup project Vite + React + Tailwind di `budi-luhur/frontend/`**
  Konfigurasi port 5170 pada `vite.config.ts`.
- [x] **Step 2: Porting komponen presentasional dari `fe-tablet/src/features/home/`**
  Salin komponen `Benefits`, `Features`, `FAQ`, dan `Footer` dengan penyesuaian styling Tailwind yang bersih.
- [x] **Step 3: Bangun `AppSelectorSection.tsx` dengan 3 kartu aplikasi interaktif**
  Tampilkan 3 kartu: Aplikasi 1 (`http://localhost:5173`), Aplikasi 2 (`http://localhost:5174`), dan Aplikasi 3 (`http://localhost:5175`) lengkap dengan status aktif, deskripsi, dan tombol navigasi langsung.
- [x] **Step 4: Integrasikan ke dalam `App.tsx` & `Hero.tsx`**
  Sematkan tombol navigasi halus (*smooth scroll*) dari hero banner langsung menuju section kartu aplikasi.
- [x] **Step 5: Verifikasi di peramban**
  Buka `http://localhost:5170`, klik masing-masing dari 3 kartu, dan pastikan aplikasi tujuan terbuka dengan tepat.

---

### Task 11: Pengujian End-to-End, Verifikasi Multi-Tab, & Dokumentasi Panduan Operasional

**Files:**
- Create: `budi-luhur/README.md`
- Test: Pengujian multi-tab, multi-database, dan integritas referensi `fe-tablet`

- [x] **Step 1: Uji Skenario Multi-Tab Session Isolation**
  Buka browser yang sama, buka App 1 dan App 2 pada tab terpisah. Login sebagai pengguna berbeda di masing-masing tab; pastikan sesi tidak tertimpa.
- [x] **Step 2: Uji Skenario Data Isolation**
  Daftarkan siswi baru di App 1; pastikan akun tersebut tidak ada di App 2 atau App 3. Catat konsumsi obat di App 2; pastikan data log tidak masuk ke App 1.
- [x] **Step 3: Uji Integritas Referensi `fe-tablet`**
  Jalankan `fe-tablet` secara independen; pastikan tidak ada kode yang rusak dan aplikasi referensi tetap beroperasi normal.
- [x] **Step 4: Tulis panduan lengkap di `budi-luhur/README.md`**
  Dokumentasikan cara instalasi, inisialisasi database, dan perintah untuk menjalankan portal serta ketiga aplikasi secara mudah.
- [x] **Step 5: Final Review & Checklist Verification**
  Pastikan seluruh kriteria penerimaan dari PRD terpenuhi 100%.

---

### Task 12: Eliminasi Halaman Home di Setiap Aplikasi, Pengalihan Root Langsung ke Auth (PWA-First), & Pembaruan Tautan Portal Root

**Goal:** Menghapus halaman home/landing page redundan di setiap aplikasi (`template-frontend`, `app1`, `app2`, `app3`) dan mengalihkan rute root (`/`) langsung ke alur autentikasi (`/auth/login` & `/auth/register`) untuk mendukung pengalaman PWA murni (*standalone app shell*), serta memperbarui kartu navigasi pada portal root (`frontend/`) agar menyediakan tautan langsung ke halaman login dan registrasi.

**Files:**
- Delete: `budi-luhur/apps/template-frontend/src/features/home/`
- Delete: `budi-luhur/apps/app1/frontend/src/features/home/`
- Delete: `budi-luhur/apps/app2/frontend/src/features/home/`
- Delete: `budi-luhur/apps/app3/frontend/src/features/home/`
- Modify: `budi-luhur/apps/template-frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/app1/frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/app/routes.tsx`
- Modify: `budi-luhur/frontend/src/config/apps.ts`
- Modify: `budi-luhur/frontend/src/components/AppSelectorSection.tsx`
- Test: Verifikasi akses root `http://localhost:5173/`, `5174/`, `5175/` langsung mengarah ke `/auth/login`, dan tombol pada `http://localhost:5170` mengarah tepat ke `/auth/login` dan `/auth/register`.

**Interfaces & Behavior:**
- App Frontend Routing (`routes.tsx`):
  - Rute `/` -> `<Route path="/" element={<Navigate to="/auth/login" replace />} />`
  - Rute wildcard fallback `*` -> `<Route path="*" element={<Navigate to="/auth/login" replace />} />`
  - Rute `/auth/login` dan `/auth/register` dilindungi `GuestGuard`: pengguna yang sudah terautentikasi otomatis dialihkan ke `/user/dashboard` (atau `/admin/dashboard` jika admin, atau `/user/setup` jika profil belum lengkap).
- Portal Root (`frontend/`):
  - `AppInfo` di `src/config/apps.ts` mengekspos `loginUrl` (`${app.url}/auth/login`) dan `registerUrl` (`${app.url}/auth/register`).
  - `AppSelectorSection.tsx` menyediakan dua tombol aksi:
    - Tombol Utama: "Masuk / Login" -> membuka `${app.url}/auth/login`
    - Tombol Sekunder: "Daftar Akun Baru" -> membuka `${app.url}/auth/register`
- PWA Configuration:
  - Web App Manifest di setiap aplikasi (`public/manifest.json` atau `vite.config.ts`) mengarahkan `start_url` ke `/` atau `/auth/login` dengan `display: "standalone"`, memastikan aplikasi terpasang di perangkat langsung membuka antarmuka kerja aplikasi.

- [x] **Step 1: Hapus `features/home` dan perbarui `routes.tsx` di `template-frontend`**
  Hapus folder `budi-luhur/apps/template-frontend/src/features/home/`. Pada `budi-luhur/apps/template-frontend/src/app/routes.tsx`, hapus import `HomeView`, alihkan rute `/` dan wildcard `*` ke `/auth/login`.
- [x] **Step 2: Sinkronisasi pembaruan routing & eliminasi `features/home` ke `app1`, `app2`, dan `app3`**
  Hapus direktori `features/home/` di `apps/app1/frontend/src/features/home/`, `apps/app2/frontend/src/features/home/`, dan `apps/app3/frontend/src/features/home/`. Terapkan pembaruan routing yang identik di `routes.tsx` masing-masing aplikasi.
- [x] **Step 3: Perbarui konfigurasi aplikasi di portal landing page (`budi-luhur/frontend/src/config/apps.ts`)**
  Tambahkan field `loginUrl` dan `registerUrl` pada masing-masing item dalam array `APPS` yang mengarah langsung ke `/auth/login` dan `/auth/register`.
- [x] **Step 4: Perbarui antarmuka kartu aplikasi di `budi-luhur/frontend/src/components/AppSelectorSection.tsx`**
  Sematkan tombol navigasi langsung untuk "Masuk / Login" dan link/tombol sekunder untuk "Daftar Akun", serta perbarui label panduan pengguna.
- [x] **Step 5: Verifikasi manifest PWA pada masing-masing aplikasi**
  Pastikan konfigurasi PWA (`start_url`, `display: standalone`) pada ketiga frontend aplikasi siap digunakan sebagai aplikasi mandiri yang langsung menuju login/dashboard saat dibuka dari homescreen.
- [x] **Step 6: Verifikasi end-to-end pada peramban**
  Uji skenario:
  1. Akses langsung `http://localhost:5173/` di browser -> verifikasi URL seketika berubah ke `http://localhost:5173/auth/login`.
  2. Akses portal landing page `http://localhost:5170`, klik "Masuk / Login" pada kartu App 1 -> verifikasi membuka tab baru ke `http://localhost:5173/auth/login`.
  3. Klik "Daftar Akun" pada kartu App 1 -> verifikasi membuka tab baru ke `http://localhost:5173/auth/register`.
  4. Lakukan login akun -> verifikasi pengguna langsung masuk ke dashboard, dan saat refresh rute root tetap berada di dashboard tanpa pernah melihat halaman home duplikat.

