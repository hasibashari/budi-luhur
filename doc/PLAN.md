# Rencana Implementasi: Ekosistem Tiga Aplikasi Budi-Luhur Berbasis Fe-Tablet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun ekosistem tiga aplikasi mandiri berbasis implementasi `fe-tablet` (Frontend React+Vite Feature-Based & Backend Express.js Modular) yang diwadahi di dalam main project `budi-luhur`, lengkap dengan portal landing page utama di `budi-luhur/frontend/` yang menghubungkan ke ketiga aplikasi.

**Architecture:** Mengadopsi pola *Template-First Migration*: mengekstrak satu set template teruji (Frontend React+Vite dan Backend Express.js) dengan paritas fungsional 100% terhadap `fe-tablet`, lalu menduplikasi template tersebut menjadi tiga instans otonom di `budi-luhur/apps/app1`, `app2`, dan `app3` dengan isolasi database PostgreSQL dan *namespaced browser storage*. Portal landing page dibangun di `budi-luhur/frontend` mengadaptasi desain presentasional yang sudah ada sebagai satu-satunya etalase/gerbang informasi publik. **PWA-First & Lifecycle Architecture**: Ketiga aplikasi beroperasi sebagai aplikasi web progresif (PWA) mandiri tanpa halaman home/marketing internal. Rute root (`/`) dan entrypoint PWA (`/splash`) mengaktifkan alur Splash Screen (`SplashScreenView` & `SplashIllustration`) dengan controller `SplashView` (timer 900ms) yang secara cerdas mengarahkan pengguna: pengguna yang belum pernah onboarding diarahkan ke Onboarding (`/onboarding`), pengguna yang sudah pernah onboarding ke alur login (`/auth/login`), dan pengguna terautentikasi langsung ke dashboard aktif pengguna. Kartu aplikasi pada portal utama menghubungkan pengguna langsung ke rute aplikasi, login, dan registrasi.

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
4. **Navigasi PWA-First, Retensi Splash Screen & Onboarding:** Mengakses rute root (`/`) maupun peluncuran PWA standalone (`/splash`) pada App 1, 2, atau 3 tidak menampilkan landing page duplikat, melainkan menampilkan Splash Screen interaktif (maskot Fe-Drop & animasi loading 900ms), lalu mengalir ke Onboarding 3-slide (`/onboarding`) untuk pengguna baru, atau langsung ke login (`/auth/login`) / dashboard bagi pengguna yang telah menyelesaikan onboarding atau sedang aktif.
5. **Penanganan Onboarding, Isolasi State & Penguncian Setup:** State onboarding diisolasi per aplikasi via `${AUTH_STORAGE_KEY}_has_onboarded`. Rute `/onboarding` diproteksi `GuestGuard`. Pengguna baru yang belum melengkapi data sekolah/jadwal tetap dikunci pada rute `/user/setup` hingga profil dilengkapi, sesuai aturan asli di `fe-tablet`.

---

## Task Breakdown


---

### Task 13: Retensi & Penerapan Splash Screen serta Onboarding ke App 1, App 2, dan App 3 Berbasis `fe-tablet`

**Goal:** Mempertahankan komponen dan alur utama Splash Screen (`features/splash`) serta Onboarding (`features/onboarding`) yang telah teruji pada `fe-tablet`, lalu mengintegrasikannya secara penuh ke `template-frontend`, `app1`, `app2`, dan `app3`. Mengimplementasikan controller reusable `SplashView` dengan timer transisi 900ms dan routing cerdas berbasis state autentikasi dan onboarding terisolasi, serta memproteksi rute `/onboarding` menggunakan `GuestGuard`.

**Files:**
- Create: `budi-luhur/apps/template-frontend/src/features/splash/views/SplashView.tsx`
- Modify: `budi-luhur/apps/template-frontend/src/features/splash/index.ts`
- Modify: `budi-luhur/apps/template-frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/template-frontend/public/manifest.webmanifest`
- Create: `budi-luhur/apps/app1/frontend/src/features/splash/views/SplashView.tsx`
- Modify: `budi-luhur/apps/app1/frontend/src/features/splash/index.ts`
- Modify: `budi-luhur/apps/app1/frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/app1/frontend/public/manifest.webmanifest`
- Create: `budi-luhur/apps/app2/frontend/src/features/splash/views/SplashView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/splash/index.ts`
- Modify: `budi-luhur/apps/app2/frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/app2/frontend/public/manifest.webmanifest`
- Create: `budi-luhur/apps/app3/frontend/src/features/splash/views/SplashView.tsx`
- Modify: `budi-luhur/apps/app3/frontend/src/features/splash/index.ts`
- Modify: `budi-luhur/apps/app3/frontend/src/app/routes.tsx`
- Modify: `budi-luhur/apps/app3/frontend/public/manifest.webmanifest`
- Test: Verifikasi alur transisi Splash Screen (900ms) -> Onboarding (jika pengguna baru) -> Login / Dashboard pada ketiga aplikasi di browser.

**Interfaces & Behavior:**
- Alur Navigasi Terurut (Onboarding ➔ Splash Screen ➔ Auth):
  1. Portal Home (`http://localhost:5170`) melalui `AppSelectorSection.tsx` mengarahkan aksi kartu aplikasi ke `${app.onboardingUrl}` (`/onboarding`).
  2. Rute `/onboarding` (`OnboardingView.tsx`) menampilkan panduan 3 slide. Saat pengguna menekan "Mulai Sekarang" atau "Lewati", `completeOnboarding()` dipanggil dan navigasi berlanjut ke `/splash` dengan `{ replace: true }`.
  3. Rute `/splash` (`SplashView.tsx`) menampilkan visual maskot dan animasi bounce dots selama 900ms, lalu mengalihkan pengguna ke `/auth/login` dengan `{ replace: true }`.
  4. Rute `/auth/login` (`AuthCardLayout.tsx`): tombol Back ("Beranda") dengan ikon `ArrowLeft` mengarahkan pengguna langsung kembali ke Home (`VITE_PORTAL_URL` / `http://localhost:5170`), tanpa kembali ke Splash Screen atau Onboarding.
- Proteksi Sesi & Navigasi:
  - Rute `/onboarding` dibungkus `<GuestGuard>` sehingga pengguna yang telah terautentikasi otomatis dialihkan ke dashboard (`/user/dashboard` atau `/admin/dashboard`).
  - Rute root `/` pada masing-masing aplikasi mengarahkan secara default ke `/onboarding`.
  - PWA Web App Manifest dikonfigurasi dengan `start_url: "/splash"`.

- [x] **Step 1: Analisis komparatif implementasi referensi `fe-tablet/src/features/splash` & `fe-tablet/src/features/onboarding`**
  Membedah komponen `SplashIllustration`, `SplashScreenView`, `SplashScreenPage` (timer 900ms), `OnboardingView`, gesture swipe touch, keyboard navigation, dan isolasi storage key.
- [x] **Step 2: Bangun template controller reusable `SplashView.tsx` di `template-frontend`**
  Buat `src/features/splash/views/SplashView.tsx`, ekspor melalui `src/features/splash/index.ts`, dan perbarui routing di `src/app/routes.tsx` untuk rute `/` dan `/splash`, serta bungkus `/onboarding` dengan `GuestGuard`.
- [x] **Step 3: Konfigurasi alur sekuensial Onboarding -> Splash -> Auth & Back to Home**
  Perbarui `handleFinish` di `OnboardingView` menuju `/splash` (`replace: true`), `SplashView` menuju `/auth/login` (`replace: true`), dan tombol Back pada `AuthCardLayout` menuju Home Portal (`http://localhost:5170`).
- [x] **Step 4: Terapkan alur konsisten ke App 1 (`apps/app1/frontend`)**
  Terapkan controller `SplashView.tsx`, update `OnboardingView.tsx`, `AuthCardLayout.tsx`, `routes.tsx`, dan `.env` (`VITE_PORTAL_URL=http://localhost:5170`).
- [x] **Step 5: Terapkan alur konsisten ke App 2 (`apps/app2/frontend`)**
  Terapkan penyesuaian yang sama pada App 2 dengan namespace storage dan routing yang terisolasi.
- [x] **Step 6: Terapkan alur konsisten ke App 3 (`apps/app3/frontend`)**
  Terapkan penyesuaian yang sama pada App 3 dengan namespace storage dan routing yang terisolasi.
- [x] **Step 7: Perbarui navigasi kartu aplikasi pada `frontend/src/components/AppSelectorSection.tsx`**
  Arahkan link kartu aplikasi langsung ke `app.onboardingUrl` agar pengguna selalu melalui alur Onboarding -> Splash Screen -> Auth.
- [x] **Step 8: Verifikasi kompilasi build & integritas alur aplikasi**
  Jalankan `npm run build` pada `frontend`, `template-frontend`, `app1/frontend`, `app2/frontend`, dan `app3/frontend`. Pastikan seluruh bundle berhasil dibangun tanpa error TypeScript maupun linting.

---

### Task 14: Perbaikan Penamaan (Splash Screen vs Onboarding) & Restrukturisasi Routing Terurut pada Ekosistem Budi Luhur

**Goal:** Memperbaiki kekeliruan penamaan komponen, file, fungsi, dan rute antara Splash Screen dan Onboarding, menyelaraskan semantik setiap komponen dengan fungsinya yang sebenarnya tanpa mengubah UI/styling, serta memastikan alur navigasi berjalan terurut secara konsisten: Onboarding ➔ Splash Screen ➔ Auth (dengan tombol Back pada Auth mengarah langsung ke Home Portal).

**Analisis Latar Belakang & Identifikasi Masalah:**
1. **Analisis Konten `SplashScreenView.tsx` (`fe-tablet/src/features/splash/components/`):**
   - Komponen ini menampilkan maskot Fe-Drop (`SplashIllustration`), judul brand `FEMORY 🌸`, dan tagline *"Sahabat Sehat Remaja Putri Bebas Anemia"*.
   - Ditinjau dari fungsi produk & UX, konten ini adalah **Welcome Screen / Cover Onboarding** (pengenalan identitas dan nilai produk kepada pengguna), bukan sekadar splash teknikal. Penamaannya sebagai `SplashScreenView` di dalam `features/splash` menyebabkan kerancuan semantik.
2. **Analisis Konten `OnboardingView.tsx` (`fe-tablet/src/features/onboarding/components/`):**
   - Komponen ini adalah **Tutorial / Feature Tour Carousel** (3 slide panduan: Pengingat Minum TTD, Catat Siklus, Konsultasi).
3. **Analisis Alur Navigasi Saat Ini:**
   - Saat pengguna memilih aplikasi dari portal, alur yang diharapkan adalah:
     `Onboarding` (Pengenalan/Welcome & Tutorial) ➔ `Splash Screen` (Transisi sistem/loading) ➔ `Auth` (Login/Register).
   - Diperlukan penegasan batas tanggung jawab:
     - **Onboarding (`/onboarding`)**: Halaman edukasi awal dan penyambutan siswi baru (menyajikan identitas, maskot, serta slide fitur panduan).
     - **Splash Screen (`/splash`)**: Layar transisi loading sistem/inisialisasi sesi singkat (900ms) sebelum pengguna masuk ke gerbang autentikasi.
     - **Auth (`/auth/login`)**: Halaman otentikasi akun di mana tombol Back ("Beranda") wajib mengembalikan pengguna langsung ke Portal Home (`http://localhost:5170`), bukan kembali ke splash atau onboarding.

**Files yang Akan Dimodifikasi:**
- `budi-luhur/apps/template-frontend/src/features/onboarding/` (Penyelarasan komponen & penamaan)
- `budi-luhur/apps/template-frontend/src/features/splash/` (Penyelarasan komponen transisi loading)
- `budi-luhur/apps/template-frontend/src/app/routes.tsx` (Perbaikan konfigurasi routing terurut)
- `budi-luhur/apps/app1/frontend/src/features/onboarding/` (Penyelarasan pada App 1)
- `budi-luhur/apps/app1/frontend/src/features/splash/` (Penyelarasan pada App 1)
- `budi-luhur/apps/app1/frontend/src/app/routes.tsx` (Penyelarasan routing App 1)
- `budi-luhur/apps/app2/frontend/src/features/onboarding/` (Penyelarasan pada App 2)
- `budi-luhur/apps/app2/frontend/src/features/splash/` (Penyelarasan pada App 2)
- `budi-luhur/apps/app2/frontend/src/app/routes.tsx` (Penyelarasan routing App 2)
- `budi-luhur/apps/app3/frontend/src/features/onboarding/` (Penyelarasan pada App 3)
- `budi-luhur/apps/app3/frontend/src/features/splash/` (Penyelarasan pada App 3)
- `budi-luhur/apps/app3/frontend/src/app/routes.tsx` (Penyelarasan routing App 3)
- `budi-luhur/frontend/src/config/apps.ts` & `src/components/AppSelectorSection.tsx` (Penyelarasan link portal ke rute Onboarding)

**Interfaces & Contract Perubahan:**
- **Rute `/onboarding`:**
  - Menampilkan antarmuka Onboarding (Welcome & Panduan Fitur).
  - Aksi "Mulai Sekarang" / "Lewati" mencatat status onboarding selesai (`completeOnboarding()`) lalu melakukan navigasi:
    `navigate('/splash', { replace: true })`.
- **Rute `/splash`:**
  - Menampilkan antarmuka Splash Screen (animasi loading transisi sistem).
  - Setelah timer 900ms atau verifikasi sesi selesai, melakukan navigasi:
    - Jika tamu/belum login: `navigate('/auth/login', { replace: true })`.
    - Jika sudah terautentikasi: `navigate('/user/dashboard', { replace: true })`.
- **Rute `/auth/login` & `/auth/register`:**
  - Tombol Back (`ArrowLeft`) memiliki handler/link eksplisit yang mengarahkan ke `http://localhost:5170` (Portal Home) tanpa menyimpan riwayat splash/onboarding di browser stack.
- **Rute Root `/`:**
  - Mengarahkan default ke `/onboarding` untuk pengguna baru, atau dashboard untuk pengguna yang sudah login.

**Rencana Langkah Kerja (Checklist):**
- [x] **Step 1: Tinjau dan Konfirmasi Struktur Semantik Komponen**
  Memastikan kesepakatan pemisahan fungsional antara layar Onboarding (Welcome & Slide Tutorial) dan layar Splash Screen (Transisi Loading Sistem) sebelum melakukan perubahan kode.
- [x] **Step 2: Standarisasi Penamaan File dan Komponen di `template-frontend`**
  Menyelaraskan nama file, komponen, dan ekspor di `apps/template-frontend/src/features/onboarding/` dan `apps/template-frontend/src/features/splash/` agar sesuai dengan fungsinya masing-masing, mempertahankan 100% kode visual/UI yang sudah ada.
- [x] **Step 3: Konfigurasi Ulang Routing Terurut di `template-frontend/src/app/routes.tsx`**
  Memastikan rute `/` mengarah ke `/onboarding`, rute `/onboarding` memicu navigasi ke `/splash` saat selesai, rute `/splash` memicu navigasi ke `/auth/login`, dan rute `/auth/*` memiliki tombol Back ke Portal Home.
- [x] **Step 4: Terapkan Penyesuaian ke App 1 (`apps/app1/frontend`)**
  Menerapkan perbaikan penamaan berkas dan routing yang identik pada App 1.
- [x] **Step 5: Terapkan Penyesuaian ke App 2 (`apps/app2/frontend`)**
  Menerapkan perbaikan penamaan berkas dan routing yang identik pada App 2.
- [x] **Step 6: Terapkan Penyesuaian ke App 3 (`apps/app3/frontend`)**
  Menerapkan perbaikan penamaan berkas dan routing yang identik pada App 3.
- [x] **Step 7: Validasi Tombol Portal Home (`frontend/src/components/AppSelectorSection.tsx`) & Tombol Back Auth**
  Memastikan kartu aplikasi membuka rute awal `/onboarding`, dan tombol Back pada halaman Auth ketiga aplikasi secara konsisten kembali ke Home `http://localhost:5170`.
- [x] **Step 8: Verifikasi Kompilasi Build & Pengujian Alur Terurut di Browser**
  Menjalankan `npm run build` pada seluruh paket (`template-frontend`, `app1/frontend`, `app2/frontend`, `app3/frontend`, `frontend`) dengan hasil build exit code 0 tanpa error.


