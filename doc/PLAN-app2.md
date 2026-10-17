# Rencana Implementasi Refactor UI/UX: Pilluna — Sahabat Setia Minum Pil KB (App 2)
## Edisi Revisi II: Identitas Visual Mandiri (Calming Teal & Warm Coral), Perombakan Total Komponen Kloning, & Optimalisasi Layar

> **Panduan Pengerjaan:** Dokumen ini merupakan rencana induk (*master plan*) refactor antarmuka (UI) dan pengalaman pengguna (UX) untuk aplikasi `budi-luhur/apps/app2` (port 5174). Seluruh langkah disusun berurutan dengan sintaks checklist (`- [ ]`) untuk pelacakan eksekusi.
> 
> **Prinsip Utama Pembaruan:** Memutuskan 100% ketergantungan visual dari Femory (App 1). Pilluna beralih dari skema warna pink remaja UKS menjadi aplikasi *modern clinical-wellness* dengan palet **Calming Medical Teal & Warm Coral/Sand**, membongkar seluruh komponen warisan template yang tidak relevan (seperti `BuddyCard` kelompok UKS dan meteran streak generik), serta mengoptimalkan penggunaan ruang layar (*screen real estate*) secara ergonomis.

---

## 1. Analisis Kesenjangan & Diferensiasi Identitas Visual (Femory vs. Pilluna)

### 1.1. Perbandingan Karakter Produk, Audiens, & Diferensiasi Total

Sebelumnya, App 2 dibangun dari template yang sama dengan App 1, sehingga terasa seperti hasil salinan (*cloning*): palet warna pink cerah yang serupa, emoji bunga (`🌸`), kartu kelompok teman UKS (`BuddyCard`), serta tata letak kartu bertumpuk yang memboroskan ruang layar.

Tabel di bawah menguraikan pemisahan identitas secara fundamental:

| Parameter Desain | Femory (Aplikasi 1 — Suplemen Anemia) | Pilluna Lama (Template Kloning) | Pilluna Baru (Rencana Mandiri 100%) |
| :--- | :--- | :--- | :--- |
| **Audiens Target** | Remaja putri usia sekolah SMP/SMA (12–18 tahun) di lingkungan UKS sekolah. | Tidak terdefinisi tegas; teks diubah ke Pil KB tetapi gaya tetap remaja sekolah. | **Wanita Usia Subur (19–45 tahun)**: Akseptor KB mandiri, ibu muda, wanita karir, dan pasangan yang merencanakan keluarga. |
| **Konteks & Pola Pakai** | Rutinitas mingguan (1x seminggu), pencegahan anemia, suasana kelas bersama. | Minum pil KB harian, namun format jadwal masih menyerupai suplemen TTD. | **Rutinitas harian presisi pada jam yang sama setiap hari** (disiplin waktu siklus 21/28 butir untuk efektivitas 99%). |
| **Karakter Emosi Visual** | Ceria, berenergi (*playful*), kompetitif bersama teman sekolah. | Kekanak-kanakan, canggung, dan terasa tidak cocok untuk akseptor KB dewasa. | **Menenangkan (*Calming*), Higienis (*Medical Grade Trust*), Bebas Cemas (*Anxiety-Free*), Rapi & Dewasa**. |
| **Palet Warna Utama** | Hot Rose-600 (`#e11d48`), Rose-50, Slate-800. | Hot Pink `#E94383`, blush background merah muda pekat. | **Calming Medical Teal (`#0D9488` / `#0F766E`)** dipadukan dengan **Warm Coral / Apricot (`#F97316`)**, **Pure Clinical White (`#FFFFFF`)**, dan **Crisp Mist (`#F8FAFC`)**. 100% bebas dari dominasi warna pink! |
| **Komponen Beranda Utama** | Kartu Streak Mingguan (`StreakProgressCard`) & Dukungan Kelompok UKS (`BuddyCard`). | Sama persis: ada kelompok cheers teman sekolah dan lingkaran suplemen. | **Widget Strip Blister 28 Hari (`ActiveBlisterStripWidget`)**, **Kartu Preskripsi & Perlindungan Hari Ini (`DailyPrescriptionHeroCard`)**, dan **Pelacak Efek Samping / Gejala (`SymptomHealthCard`)**. |
| **Tipografi & Ikonografi** | Font santai, judul besar (28–32px), penuh emoji `🌸`, `✨`, `🎉`. | Masih mempertahankan emoji `🌸` pada tombol dan label menu. | **Plus Jakarta Sans / Inter profesional**, judul proporsional (20–24px), **100% bebas emoji dekoratif**, ikon presisi Lucide React (stroke 1.75px). |
| **Representasi Kemasan** | Grafik evaluasi dan tabel linier suplemen zat besi. | Tabel riwayat generik. | **Representasi kemasan fisik blister pack asli (4 baris x 7 kolom)** dengan pembeda tegas antara 21 pil aktif hormon dan 7 pil plasebo. |

### 1.2. Masalah Layout & Spacing Eksisting yang Wajib Diperbaiki
1. **Pemborosan Ruang Layar Atas (*Above the Fold*):** Pada layar mobile 360–390px, header dan kartu sambutan memakan lebih dari 60% tinggi layar, memaksa pengguna melakukan scroll untuk sekadar menekan tombol "Sudah Minum Pil".
2. **Komponen Kloning yang Tidak Masuk Akal Secara Medis:** Kehadiran modul `BuddyCard` ("Kelompok Tim Hebat Minum Pil") tidak sesuai dengan privasi medis kontrasepsi wanita dewasa.
3. **Hierarki Teks Terlalu Besar (*Oversized Typography*):** Judul layar menggunakan `text-2xl` s.d. `text-3xl` yang sering terpotong atau menghasilkan *line-wrap* canggung pada nama pengguna yang panjang.
4. **Padding & Margin Tidak Konsisten:** Jarak antar komponen bervariasi acak (`p-8` pada kontainer ponsel, `gap-6` yang terlalu renggang, padding bawah `pb-32` yang menyisakan ruang kosong mengambang).

---

## 2. Spesifikasi Desain Sistem & Panduan Visual Pilluna Baru

### 2.1. Palet Warna Resmi "Calming Medical Teal & Warm Coral"
Palet warna baru dirancang mengikuti rasio distribusi visual **65-25-10** (65% Permukaan Netral Higienis, 25% Kontras Teks/Latar Belakang Halus, 10% Aksen Aksi & Status):

```css
/* Token CSS Pilluna Baru (budi-luhur/apps/app2/frontend/src/index.css) */
@import "tailwindcss";

@theme inline {
  /* 1. Primary Action & Medical Brand Identity (Teal: Efektivitas Medis, Ketenangan, & Perlindungan) */
  --color-primary: #0D9488;          /* Medical Teal 600: Tombol utama, tab aktif, brand accent */
  --color-primary-hover: #0F766E;    /* Deep Teal 700: State hover & active */
  --color-primary-focus: #14B8A6;    /* Teal 500: Ring fokus aksesibilitas */
  --color-primary-subtle: #F0FDFA;   /* Teal Tint 50: Background badge aktif & tab highlight */
  --color-primary-soft: #CCFBF1;     /* Teal Soft 100: Border aksen halus & progress bar fill */

  /* 2. Secondary & Warm Accent (Coral / Terracotta: Siklus Aktif, Jam Hari Ini, & Kehangatan Ramah) */
  --color-secondary: #F97316;        /* Warm Coral 500: Penanda jadwal hari ini, peringatan ramah */
  --color-secondary-hover: #EA580C;  /* Deep Coral 600: State hover aksen sekunder */
  --color-secondary-subtle: #FFF7ED; /* Warm Apricot Tint: Latar badge hari ini / highlight box */
  --color-secondary-soft: #FFEDD5;   /* Soft Coral 100: Border penanda hari ini */

  /* 3. Surface & Canvas (Higienis, Bersih, dan Terasa Luas) */
  --color-canvas: #F8FAFC;           /* Crisp Slate Mist: Latar belakang aplikasi yang sangat bersih & segar */
  --color-surface: #FFFFFF;          /* Pure Clinical White: Permukaan kartu, modal, input, dropdown */
  --color-surface-soft: #F1F5F9;     /* Slate Soft: Area kartu sekunder / background input */
  --color-surface-card: #FFFFFF;     /* Permukaan kartu utama */
  --color-surface-sunken: #E2E8F0;   /* Garis pemisah hairline & divider */

  /* 4. Border & Divider (Halus, Tegas, & Rapi) */
  --color-border: #E2E8F0;           /* Slate Border: Garis 1px tipis, netral, tidak pink */
  --color-border-subtle: #F1F5F9;    /* Hairline divider untuk tabel dan daftar riwayat */

  /* 5. Tipografi & Kontras Teks (Memenuhi Standar Aksesibilitas WCAG AAA) */
  --color-ink-primary: #0F172A;      /* Deep Slate 900: Judul halaman, label penting, kontras tinggi */
  --color-ink-secondary: #334155;    /* Slate 700: Teks paragraf, deskripsi fitur, mudah dibaca */
  --color-ink-tertiary: #64748B;     /* Slate 500: Caption, jam, petunjuk form, placeholder */
  --color-ink-inverse: #FFFFFF;      /* Teks putih di atas tombol primer */

  /* 6. Status Klinis Kontrasepsi Khusus */
  --color-status-protected: #0D9488; /* Medical Teal: Pil diminum tepat waktu / Terlindungi optimal */
  --color-status-protected-bg: #F0FDFA; /* Latar badge terlindungi */
  --color-status-today: #F97316;     /* Warm Coral: Jadwal hari ini menunggu konfirmasi */
  --color-status-today-bg: #FFF7ED;  /* Latar badge hari ini */
  --color-status-missed: #DC2626;    /* Soft Red / Alert: Jadwal terlambat / terlewat */
  --color-status-missed-bg: #FEF2F2; /* Latar badge terlewat */
  --color-status-placebo: #94A3B8;   /* Soft Lavender Slate: Pil plasebo (7 butir tanpa hormon) */
  --color-status-placebo-bg: #F8FAFC;/* Latar pil plasebo */

  --font-sans: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### 2.2. Sistem Grid, Spacing, & Penggunaan Ruang Layar (8-Point Grid)

| Token Spacing | Nilai Piksel | Peruntukan Layout |
| :--- | :--- | :--- |
| `space-1` | 4px | Jarak antar ikon dan label kecil, micro-padding badge status. |
| `space-2` | 8px | Padding tombol kecil, gap antar chip filter, margin teks-ke-subteks. |
| `space-3` | 12px | Jarak antar elemen form input, padding internal kartu padat. |
| `space-4` | 16px | Padding horizontal layar ponsel (`px-4`), padding kartu standar (`p-4`), gap grid. |
| `space-5` | 20px | Gap antar modul kartu di mobile, padding modal dialog. |
| `space-6` | 24px | Padding kontainer desktop (`p-6`), gap section utama. |
| `space-8` | 32px | Jarak antar segmen besar di desktop, padding hero banner. |

**Aturan Penataan Ruang Layar (*Screen Real Estate Rules*):**
1. **Zona "Above the Fold" Mobile:** Kartu Preskripsi & Perlindungan Hari Ini (`DailyPrescriptionHeroCard`) harus terlihat utuh tanpa perlu scroll pada layar ponsel 375x667px (iPhone SE).
2. **Ketinggian Bar Navigasi:**
   - `MobileTopBar`: Tinggi tetap 52px, latar belakang putih semi-transparan `bg-white/95 backdrop-blur-md`, border bawah tipis `#E2E8F0`.
   - `MobileBottomBar`: Tinggi tetap 60px (di luar safe-area inset), teks label 10px, ikon 20px.
   - Kontainer konten diberi padding bawah `pb-24` (bukan `pb-32` berlebihan) agar pas dan tidak ada ruang kosong mengambang.
3. **Penyusunan Desktop Bento Grid (12-Kolom):**
   - Layar desktop (>= 1024px) menggunakan tata letak 12-kolom: Kolom kiri (7–8 kolom) untuk alur klinis aktif (Hero pil hari ini, visual blister pack, log konsumsi) dan Kolom kanan (4–5 kolom) untuk ringkasan kepatuhan siklus, kalender mini, catatan efek samping, dan tips SADARI.

### 2.3. Hierarki Tipografi Baru (Anti Teks Raksasa)
- **Heading 1 (Judul Halaman):** Mobile `text-xl font-bold text-[#0F172A]` (20px), Desktop `text-2xl font-extrabold` (24px). Dilarang memakai `text-3xl` pada judul dashboard mobile.
- **Heading 2 (Judul Bagian/Kartu):** `text-base font-bold text-[#0F172A]` (16px), Desktop `text-lg font-bold` (18px).
- **Heading 3 (Sub-kartu / Label Metrik):** `text-sm font-semibold text-[#0F172A]` (14px).
- **Body Regular (Teks Paragraf):** `text-xs sm:text-sm text-[#334155]` (12px–14px), line-height 1.5.
- **Caption & Meta (Jam, Tanggal, Helper):** `text-[11px] sm:text-xs text-[#64748B]` (11px–12px).
- **Badge & Chip Label:** `text-[10px] sm:text-[11px] font-bold tracking-wider uppercase`.

### 2.4. Standar Ikonografi Sistem (Lucide React)
Menghilangkan seluruh emoji dekoratif non-fungsional (`🌸`, `✨`, `🎉`, `💪`) dari antarmuka kerja. Menggantinya dengan ikon sistem standar dengan **stroke uniform 1.75px**:
- **Status Minum Pil:** `Pill` (pil aktif), `CheckCircle2` (sudah diminum), `AlertCircle` (terlewat).
- **Navigasi 5 Menu:** `Home` (Beranda), `CalendarDays` (Monitoring), `BookOpen` (Edukasi), `Ribbon` (SADARI), `User` (Profil).
- **Waktu & Pengingat:** `Clock` (jam rutin), `BellRing` (pengingat aktif), `CalendarRange` (siklus kemasan).
- **Perlindungan Medis:** `ShieldCheck` (efektivitas 99% terlindungi), `ShieldAlert` (perlindungan menurun).
- **Kesehatan & Efek Samping:** `Activity` (efek samping / gejala), `Smile` (catatan suasana hati), `Droplets` (flek/spotting).
- **Faskes & Konsultasi:** `Building2` (klinik/puskesmas), `Stethoscope` (anjuran dokter/bidan), `MessageSquareText` (asisten AI Luna).

---

## 3. Perombakan Total Komponen Kloning Menjadi Komponen Khusus Pil KB

### 3.1. Eliminasi Komponen Warisan Template yang Tidak Relevan
1. **HAPUS Komponen `BuddyCard` ("Kelompok Minum Bersama Remaja UKS"):**
   - *Alasan:* Kontrasepsi oral adalah urusan medis dan privasi pribadi wanita dewasa, bukan aktivitas kelompok sekolah.
   - *Pengganti:* **`SymptomHealthCard.tsx` (Pelacak Efek Samping & Kesehatan Reproduksi)** — modul pencatat gejala harian (flek/spotting, kram perut, pusing, perubahan mood) yang merupakan fitur utama pada `info.md` poin 5.
2. **HAPUS Komponen `StreakProgressCard` (Lingkaran Streak Suplemen Mingguan):**
   - *Alasan:* Pil KB diminum harian dalam siklus kemasan strip 28/21 hari, bukan siklus mingguan anemia.
   - *Pengganti:* **`ActiveBlisterStripWidget.tsx` (Widget Strip Blister Pekan Ini)** — visualisasi 7 butir pil pada pekan berjalan yang langsung menunjukkan posisi butir hari ini dalam strip kemasan asli.
3. **ROMBAK Komponen `StatusCard` Menjadi `DailyPrescriptionHeroCard`:**
   - *Alasan:* Tombol lingkaran raksasa gaya lama memboroskan ruang layar atas.
   - *Desain Baru:* Kartu preskripsi horizontal kompak dengan status perlindungan kontrasepsi (*"Terlindungi 99% Optimal"*), jam target harian, jenis pil (Hormon vs Plasebo), tombol konfirmasi 1-tap Calming Teal (`#0D9488`), dan tautan tenang panduan lupa minum pil.
4. **ROMBAK `QuickAction` Menjadi `ClinicalQuickActions`:**
   - *Alasan:* Menghilangkan tombol-tombol dekoratif yang tidak fungsional.
   - *4 Tombol Klinis Relevan:*
     1. *Kalender Blister 28 Hari* (`/user/history`, ikon `CalendarDays`)
     2. *Catat Efek Samping* (`/user/health-log`, ikon `Activity`)
     3. *Ubah Jam Pengingat* (`/user/schedule`, ikon `Clock`)
     4. *Panduan SADARI Kemenkes* (`/user/education?tab=sadari`, ikon `Ribbon`)

---

## 4. Tahapan Implementasi Terstruktur (Task Breakdown)

---

### Task 1: Standarisasi Token Warna Pilluna Baru & Base UI Library

**Goal:** Menerapkan token CSS resmi Calming Medical Teal & Warm Coral di `src/index.css`, memperbarui metadata webmanifest dan HTML head, serta merestrukturisasi pustaka komponen dasar (`Card`, `Button`, `Badge`, `Chip`, `Avatar`) dengan estetika *modern clinical-wellness*.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/index.css`
- Modify: `budi-luhur/apps/app2/frontend/index.html`
- Modify: `budi-luhur/apps/app2/frontend/public/manifest.webmanifest`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/ui/Card.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/ui/Button.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/ui/Badge.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/ui/Chip.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/ui/Avatar.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 1.1:** Terapkan token CSS baru pada `@theme inline` di `src/index.css` (Primary Teal `#0D9488`, Secondary Coral `#F97316`, Canvas `#F8FAFC`, Surface `#FFFFFF`, Border `#E2E8F0`, Ink `#0F172A`, Muted Ink `#334155`, Placebo `#94A3B8`).
- [x] **Step 1.2:** Perbarui `index.html` dan `manifest.webmanifest` dengan theme-color `#0D9488`, background `#F8FAFC`, dan deskripsi resmi Pilluna.
- [x] **Step 1.3:** Sesuaikan `Card.tsx` dengan radius `rounded-2xl` (16px), border tipis 1px padat Slate `#E2E8F0`, background putih murni `#FFFFFF`, dan bayangan sangat halus `shadow-xs`.
- [x] **Step 1.4:** Sesuaikan `Button.tsx`: Varian primer Calming Teal `#0D9488`, varian sekunder Warm Coral `#F97316`, varian netral putih ber-border `#E2E8F0`, tinggi minimum 44px, dan hapus emoji pada varian default.
- [x] **Step 1.5:** Sesuaikan `Badge.tsx` dengan varian status Pilluna: `protected` (Teal), `today` (Warm Coral), `missed` (Soft Red), dan `placebo` (Lavender Slate).
- [x] **Step 1.6:** Uji kompilasi TypeScript dan Vite (`npm run build`) untuk memastikan token dan komponen dasar bebas dari error sintaks.

---

### Task 2: Refactor Layout Shell, Top Bar Ramping, & Bottom Bar 5 Menu

**Goal:** Memperbaiki layout shell (`UserLayout`), menata bilah navigasi atas mobile (`MobileTopBar`) agar kompak (tinggi 52px), menata bilah navigasi bawah (`MobileBottomBar`) dengan 5 menu konsisten tanpa emoji, serta menyelaraskan sidebar desktop (`UserSidebar`).

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/MobileBottomBar.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/MobileTopBar.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/user/components/UserSidebar.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/user/components/UserLayout.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 2.1:** Rampingkan `MobileTopBar.tsx`: Tinggi 52px, teks logo Pilluna Deep Slate `#0F172A` dengan badge aksen Teal `#0D9488`, avatar profil ringkas, background `bg-white/95 backdrop-blur-md`, border bawah tipis `#E2E8F0`.
- [x] **Step 2.2:** Standarisasi 5 menu pada `MobileBottomBar.tsx`:
  1. *Beranda* (`/user/dashboard`, ikon `Home`)
  2. *Monitoring* (`/user/history`, ikon `CalendarDays`)
  3. *Edukasi* (`/user/education`, ikon `BookOpen`)
  4. *SADARI* (`/user/education?tab=sadari`, ikon `Ribbon`)
  5. *Profil* (`/user/profile`, ikon `User`)
- [x] **Step 2.3:** Hilangkan teks emoji dari seluruh label bottom bar. Terapkan active state: background pill `#F0FDFA` dengan ikon dan label Medical Teal `#0D9488`.
- [x] **Step 2.4:** Sesuaikan padding bawah kontainer utama pada `UserLayout.tsx` menjadi `pb-24` (mengeliminasi ruang kosong vertikal berlebih) dengan safe-area padding yang presisi.
- [x] **Step 2.5:** Perbarui `UserSidebar.tsx` desktop: Navigasi vertikal terstruktur dengan header merek profesional, label menu rapi, dan kartu status pengguna di bagian bawah.
- [x] **Step 2.6:** Verifikasi transisi rute dan responsivitas layout shell pada viewport 360px, 390px, 768px, dan 1280px.

---

### Task 3: Redesain Splash Screen & Onboarding: Maskot Menenangkan & Bebas Emoji Klise

**Goal:** Memperbarui visual Splash Screen dan materi Onboarding 3 slide agar mencerminkan asisten kontrasepsi yang menenangkan, modern, dan bebas dari ornamen kekanak-kanakan.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/splash/components/SplashIllustration.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/splash/components/SplashScreenView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/onboarding/constants/slides.ts`
- Modify: `budi-luhur/apps/app2/frontend/src/features/onboarding/components/OnboardingIllustrations.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/onboarding/views/OnboardingView.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 3.1:** Perbarui `SplashIllustration.tsx`: Maskot pil Pilluna bergaya minimalis modern dengan warna Medical Teal dan aksen Warm Coral lembut, tanpa elemen darah atau anemia.
- [x] **Step 3.2:** Perbarui `SplashScreenView.tsx`: Logo teks Pilluna bersih, subjudul *"Sahabat Setia Minum Pil KB"*, indikator loading titik pastel, timer 900ms yang mulus.
- [x] **Step 3.3:** Tulis ulang konten 3 slide di `slides.ts` dengan gaya bahasa dewasa, suportif, dan menenangkan:
  - Slide 1: *"Pengingat Jam Rutin Minum Pil"* (Disiplin Waktu — Notifikasi harian tepat pada jam yang sama untuk efektivitas perlindungan optimal 99%).
  - Slide 2: *"Kalender Blister & Pemantauan Siklus"* (Visual Strip Asli — Pantau pil aktif dan masa jeda/plasebo secara mudah dan teratur).
  - Slide 3: *"Kesehatan Holistik & Panduan SADARI"* (Periksa Mandiri — Catatan suasana hati, efek samping, dan langkah SADARI setiap bulan).
- [x] **Step 3.4:** Desain ilustrasi SVG baru di `OnboardingIllustrations.tsx` dengan palet Medical Teal, Deep Slate, dan Warm Coral.
- [x] **Step 3.5:** Perbarui tombol aksi di `OnboardingView.tsx` (CTA *"Mulai Sekarang"*, *"Lewati"* tanpa emoji dekoratif).
- [x] **Step 3.6:** Validasi alur perpindahan Onboarding ➔ Splash Screen ➔ Login tanpa kedipan layout (*layout shift*).

---

### Task 4: Refactor Auth Portal & Setup Profil Akseptor yang Bersih & Ergonomis

**Goal:** Menata ulang halaman login, register, dan setup profil agar memiliki proporsi form yang seimbang, nyaman diisi di ponsel, dan bebas dari distorsi visual.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/auth/components/AuthCardLayout.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/auth/components/AuthTabbedContainer.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/auth/components/LoginForm.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/auth/components/RegisterForm.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/user/views/SetupProfileView.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 4.1:** Perbarui `AuthCardLayout.tsx`: Sisi desktop menampilkan kartu pratinjau blister pil KB dan badge perlindungan klinis. Tombol "Kembali ke Portal Utama" tetap mengarah ke `http://localhost:5170`.
- [x] **Step 4.2:** Standarisasi form input pada `LoginForm.tsx` dan `RegisterForm.tsx`: Input height 44px, border `#E2E8F0`, ring fokus `#0D9488/20`, ikon input monokrom slate, tombol submit Medical Teal `#0D9488`.
- [x] **Step 4.3:** Perbarui `SetupProfileView.tsx` (Step 1 - Data Diri & Step 2 - Atur Jam Minum):
  - Formulir bersih dengan pilihan jenis pil KB (Kombinasi 28 hari, Kombinasi 21 hari, Minipil Progestin).
  - Pilihan jam minum harian yang jelas (pagi/malam setelah makan) dengan pengingat 15 menit sebelumnya.
  - Mempertahankan kontrak API `saveUserInitialSetupAction` tanpa merusak parameter backend.
- [x] **Step 4.4:** Uji alur validasi input, pesan error form dengan warna Soft Red `#DC2626`, dan penguncian rute `/user/setup` untuk pengguna baru.

---

### Task 5: Perombakan Beranda Utama: Preskripsi Hero Card, Blister Widget, & Symptom Logger

**Goal:** Mengganti seluruh kartu warisan kloning pada Beranda (`DashboardView.tsx`) dengan kartu fungsional khusus kontrasepsi, menempatkan informasi status pil di posisi *above the fold*, serta merapikan bento grid desktop.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/dashboard/views/DashboardView.tsx`
- Create / Replace: `budi-luhur/apps/app2/frontend/src/shared/components/domain/DailyPrescriptionHeroCard.tsx` (menggantikan `StatusCard.tsx`)
- Create / Replace: `budi-luhur/apps/app2/frontend/src/shared/components/domain/ActiveBlisterStripWidget.tsx` (menggantikan `StreakProgressCard.tsx`)
- Create / Replace: `budi-luhur/apps/app2/frontend/src/shared/components/domain/SymptomHealthCard.tsx` (menggantikan `BuddyCard.tsx`)
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/domain/ClinicalQuickActions.tsx` (menggantikan `QuickAction.tsx`)

**Checklist Langkah Kerja:**
- [x] **Step 5.1:** Rampingkan header `DashboardView.tsx`: Sapaan satu baris (*"Halo, [Nama]"*), tanggal hari ini, dan chip status perlindungan (*"Terlindungi 99% • Disiplin"*). Hapus emoji dekoratif dari seluruh heading.
- [x] **Step 5.2:** Implementasi `DailyPrescriptionHeroCard.tsx`:
  - Format kartu preskripsi klinis horizontal yang ergonomis.
  - Jam target minum obat (misal: "Pukul 20:00 WIB") dan countdown waktu.
  - Pembeda jenis butir: Pil Aktif Hormon (putih/teal) vs. Pil Plasebo (lavender slate).
  - Tombol Konfirmasi 1-Tap: Lebar penuh, tinggi 48px, warna Medical Teal `#0D9488` (*"Konfirmasi Sudah Minum Pil"*).
  - State sudah diminum: Kartu hijau teal lembut dengan ikon `CheckCircle2` dan jam riil pencatatan.
  - Tautan panduan medis tenang: *"Lupa minum pil? Buka panduan penanganan"*.
- [x] **Step 5.3:** Implementasi `ActiveBlisterStripWidget.tsx`:
  - Menampilkan 7 butir pil strip pekan berjalan (Senin s.d. Minggu).
  - Menandai butir pil yang sudah diminum (Teal), pil hari ini (Warm Coral), dan butir mendatang/plasebo (Slate).
- [x] **Step 5.4:** Implementasi `SymptomHealthCard.tsx`:
  - Menggantikan modul kelompok UKS `BuddyCard` dengan pelacak efek samping harian (pilihan cepat: *Flek/Spotting*, *Kram Ringan*, *Sakit Kepala*, *Mood Stabil*, *Nafsu Makan*).
  - Data tersimpan lokal / tersinkronisasi untuk mendukung kepatuhan akseptor.
- [x] **Step 5.5:** Perbarui `ClinicalQuickActions.tsx` (4 kolom berjarak presisi `gap-3`):
  1. *Kalender Blister* (`/user/history`, ikon `CalendarDays`)
  2. *Catat Gejala* (`#symptom-modal`, ikon `Activity`)
  3. *Ubah Jam Pengingat* (`/user/schedule`, ikon `Clock`)
  4. *Panduan SADARI* (`/user/education?tab=sadari`, ikon `Ribbon`)
- [x] **Step 5.6:** Verifikasi fungsi klik tombol "Sudah Minum" tetap memicu mutasi data dan sinkronisasi realtime `MEDICATION_TAKEN`.

---

### Task 6: Refactor Monitoring & Kalender Blister Kemasan Kontrasepsi Asli

**Goal:** Menata ulang halaman Monitoring (`HistoryView.tsx`) agar menyajikan visualisasi kemasan strip pil KB (blister pack) fisik 28/21 butir yang jelas, mudah dipahami urutannya, dan dilengkapi evaluasi kepatuhan bulanan.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/consumption/views/HistoryView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/consumption/components/DateFilterBar.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/consumption/components/ActiveDateActionCard.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/consumption/components/ConsumptionLogList.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/consumption/components/MonthlyEvaluationView.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 6.1:** Perbarui header `HistoryView.tsx` menjadi *"Monitoring & Kalender Blister Pil KB"* dengan navigasi bulan yang intuitif.
- [x] **Step 6.2:** Buat representasi visual Blister Pack Kemasan Asli:
  - Kisi 7 kolom (Senin – Minggu) x 4 baris (28 butir pil).
  - Butir 1–21: Pil Aktif Hormon (Warna dasar putih/mint dengan indikator status).
  - Butir 22–28: Pil Plasebo (Warna dasar Lavender Slate `#94A3B8` yang membedakan masa jeda haid).
  - Titik status per butir: Medical Teal (Tepat waktu), Warm Coral (Hari ini), Soft Red (Terlewat).
  - Garis panah alur minum pil (urutan konsumsi sesuai kemasan apotek).
- [x] **Step 6.3:** Perbarui `ActiveDateActionCard.tsx`: Panel detail tanggal terpilih dengan opsi konfirmasi manual atau catatan khusus jika terjadi keterlambatan.
- [x] **Step 6.4:** Perbarui `ConsumptionLogList.tsx`: Daftar riwayat konsumsi yang rapi dengan badge status Pilluna, filter dropdown, dan pagination mulus.
- [x] **Step 6.5:** Perbarui `MonthlyEvaluationView.tsx`: Ringkasan kepatuhan bulanan dengan visualisasi persentase efektivitas kontrasepsi (kategori: Sangat Baik / 99% Optimal, Cukup, Perlu Ditingkatkan).
- [x] **Step 6.6:** Verifikasi filter tanggal (*Hari Ini*, *7 Hari*, *30 Hari*, *Semua*) dan update status tanggal terpilih tetap bekerja secara realtime.

---

### Task 7: Refactor Pengaturan Jam Pengingat & Panduan Klinis Lupa Minum Pil

**Goal:** Menyesuaikan halaman Jadwal Pengingat (`ScheduleView.tsx`) agar berfokus pada rutinitas jam minum pil harian yang presisi, pengingat toleransi, dan kartu panduan medis lupa minum pil.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/schedule/views/ScheduleView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/domain/ReminderCard.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 7.1:** Perbarui header `ScheduleView.tsx` menjadi *"Jadwal Pengingat Minum Pil KB"* dengan deskripsi aturan waktu rutin.
- [x] **Step 7.2:** Perbarui kartu jadwal aktif: Jam rutin harian (misal: 20:00 WIB), switch aktif/nonaktif bergaya Medical Teal (`#0D9488`), dan indikator notifikasi 15 menit sebelum.
- [x] **Step 7.3:** Perbarui modal edit/buat jadwal: Pilihan jam fleksibel, pilihan tipe siklus pil (21 hari / 28 hari), dan catatan instruksi minum pil.
- [x] **Step 7.4:** Perbarui kartu petunjuk medis di sisi kanan dengan panduan klinis terstruktur:
  - Konsistensi jam: Minum pil pada jam yang sama setiap hari untuk efektivitas maksimal 99%.
  - Tips tidak lupa: Pasang alarm dan letakkan kemasan pil di tempat yang mudah terlihat.
  - Aturan lupa minum 1 pil: Segera minum begitu teringat, dan minum pil berikutnya pada jam rutin biasa (meski harus minum 2 pil dalam satu hari).
  - Aturan lupa minum 2 pil: Hubungi bidan/faskes dan gunakan metode kontrasepsi tambahan (kondom) selama 7 hari.
- [x] **Step 7.5:** Verifikasi penyimpanan perubahan jadwal ke backend via `updateUserScheduleSettingsAction`.

---

### Task 8: Refactor Modul Edukasi & Modul Panduan SADARI Kemenkes RI

**Goal:** Memperbarui modul edukasi (`EducationView.tsx`) dengan materi kesehatan wanita, kontrasepsi yang benar, penanganan pil terlewat, serta menambahkan modul khusus panduan SADARI (Pemeriksaan Payudara Sendiri) lengkap dengan visualisasi tahapan.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/education/views/EducationView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/education/views/ArticleDetailView.tsx`
- Create / Modify: `budi-luhur/apps/app2/frontend/src/features/education/components/SadariGuideSection.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 8.1:** Perbarui kategori edukasi di `EducationView.tsx`:
  - *Semua*, *Panduan Pil KB*, *Lupa Minum Pil*, *Panduan SADARI*, *Efek Samping*, *Kesehatan Wanita*, *Mitos & Fakta*.
- [x] **Step 8.2:** Sempurnakan komponen panduan SADARI interaktif (`SadariGuideSection.tsx`) yang menyajikan 5 langkah pemeriksaan payudara sendiri standar Kemenkes RI:
  1. *Langkah 1:* Melihat perubahan bentuk & permukaan di depan cermin dengan kedua lengan di samping.
  2. *Langkah 2:* Mengangkat kedua lengan ke atas dan perhatikan adanya tarikan pada kulit.
  3. *Langkah 3:* Menaruh tangan di pinggang dan busungkan dada untuk melihat kesimetrisan.
  4. *Langkah 4:* Meraba payudara secara melingkar dari luar ke puting saat mandi / berdiri.
  5. *Langkah 5:* Meraba payudara dalam posisi berbaring dengan bantal kecil di bawah bahu.
- [x] **Step 8.3:** Pisahkan modul panduan SADARI menjadi halaman tersendiri (`/user/sadari` -> `SadariView.tsx`), terpisah penuh dari pustaka artikel `EducationView.tsx`. Navigasi `MobileBottomBar`, `UserSidebar`, dan `QuickAction` diarahkan langsung ke rute `/user/sadari`.
- [x] **Step 8.4:** Perbarui tampilan kartu artikel (`ArticleCard`) dan detail artikel (`ArticleDetailView.tsx`) dengan tipografi Deep Slate `#0F172A`, layout bersih, dan tombol kembali yang nyaman.
- [x] **Step 8.5:** Verifikasi pencarian artikel dan filter kategori tetap berfungsi dengan data API yang ada.

---

### Task 9: Penyelarasan Asisten AI "Luna"

**Goal:** Menyelaraskan tampilan dan konteks percakapan Konsultasi AI (`ConsultationView.tsx`) agar berorientasi pada pendampingan kepatuhan minum pil KB dan kesehatan reproduksi wanita.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/consultation/views/ConsultationView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/consultation/constants/index.ts`

**Checklist Langkah Kerja:**
- [x] **Step 9.1:** Perbarui salam pembuka dan avatar asisten di `ConsultationView.tsx`: *"Luna — Asisten Kepatuhan Pilluna"* dengan pesan pembuka hangat seputar panduan minum pil KB, tips kepatuhan, dan penanganan pil terlambat.
- [x] **Step 9.2:** Perbarui chip topik cepat di `constants/index.ts`:
  - *"Apa yang harus dilakukan jika lupa minum 1 pil?"*
  - *"Bagaimana aturan minum pil plasebo 7 hari terakhir?"*
  - *"Apakah bercak darah (spotting) di awal pemakaian wajar?"*
  - *"Kapan waktu terbaik melakukan SADARI setiap bulan?"*
- [x] **Step 9.3:** Perbarui chat bubble styling: Bubble pengguna dengan warna Medical Teal `#0D9488`, bubble asisten putih ber-border `#E2E8F0`, markdown rendering yang rapi.
- [x] **Step 9.4:** Verifikasi integrasi Server Action Google Gemini API tetap berjalan lancar saat pengguna mengirimkan pertanyaan.

---

### Task 10: Refactor Profil Akseptor & Preferensi Faskes/Bidan

**Goal:** Memperbarui halaman profil pengguna (`ProfileView.tsx`) dan subkomponennya agar menyajikan ringkasan akun, metrik kepatuhan minum pil KB, pengaturan notifikasi, serta mempertahankan fitur edit profil, upload avatar, dan hapus akun.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/user/views/ProfileView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/profile/ProfileHeaderCard.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/profile/ProfileMetricsGrid.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/profile/ProfileContactCard.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/profile/ProfileSecuritySection.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/shared/components/profile/ProfileEditModal.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 10.1:** Perbarui `ProfileHeaderCard.tsx` dengan badge *"AKSEPTOR KB AKTIF"*, background gradient halus Teal-Mist, tombol edit profil, dan upload avatar.
- [x] **Step 10.2:** Perbarui kartu metrik kesehatan di `ProfileMetricsGrid.tsx`:
  - *Streak Kepatuhan:* Jumlah hari konsisten minum pil harian.
  - *Status Perlindungan:* Persentase catatan tepat waktu (Medical Teal `#0D9488`).
  - *Jadwal Rutin:* Jam minum obat yang sedang aktif.
- [x] **Step 10.3:** Perbarui `ProfileContactCard.tsx`: Tampilkan email akun, nomor telepon, dan faskes/domisili bidan pembina.
- [x] **Step 10.4:** Perbarui `ProfileSecuritySection.tsx`: Tombol keluar akun (logout) dan tombol hapus akun permanen dengan dialog konfirmasi aman.
- [x] **Step 10.5:** Perbarui `ProfileEditModal.tsx` agar formulir edit profil selaras dengan palet Pilluna.
- [x] **Step 10.6:** Uji update profil dan logout untuk memastikan sesi pengguna diperbarui dengan benar.

---

### Task 11: Penyelarasan Portal Admin Bidan & Faskes KB

**Goal:** Menyelaraskan seluruh tampilan antarmuka Admin Portal (`/admin/*`) dari skema Rose-600 menjadi palet Pilluna Medical Teal yang profesional, bersih, dan konsisten.

**Files:**
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/components/AdminLayout.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/components/AdminSidebar.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/components/AdminHeader.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/views/AdminDashboardView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/views/UserManagementView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/views/ScheduleManagementView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/views/ArticleManagementView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/views/ReportAnalyticsView.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/components/ScheduleFormModal.tsx`
- Modify: `budi-luhur/apps/app2/frontend/src/features/admin/components/SendReminderModal.tsx`

**Checklist Langkah Kerja:**
- [x] **Step 11.1:** Perbarui `AdminSidebar.tsx` dan `AdminHeader.tsx` dengan branding *"Pilluna — Portal Bidan & Faskes"*, active menu link Medical Teal `#0D9488`, dan typography Deep Slate `#0F172A`.
- [x] **Step 11.2:** Perbarui tabel data akseptor (`DataTable`), badge status kepatuhan, dan tombol aksi pada `UserManagementView.tsx`.
- [x] **Step 11.3:** Perbarui tampilan analitik kepatuhan pada `AdminDashboardView.tsx` dan `ReportAnalyticsView.tsx`.
- [x] **Step 11.4:** Perbarui modal manajemen artikel di `ArticleManagementView.tsx` (termasuk kategori Kontrasepsi dan Panduan SADARI).
- [x] **Step 11.5:** Verifikasi modal pengingat WhatsApp (`SendReminderModal.tsx`) dan form jadwal (`ScheduleFormModal.tsx`) menggunakan istilah akseptor, pil KB, dan faskes pembina.

---

### Task 12: Pengujian Komprehensif, Paritas Fungsional, & Validasi Build

**Goal:** Menjalankan serangkaian pengujian menyeluruh terhadap tampilan visual, responsivitas multi-device, keutuhan alur navigasi, integrasi database, dan build production bundle.

**Files:**
- Test: Pengujian seluruh rute pengguna dan admin di browser
- Validate: `npm run build` pada `budi-luhur/apps/app2/frontend`

**Checklist Langkah Kerja:**
- [x] **Step 12.1:** Jalankan typecheck TypeScript (`tsc -b`) dan build Vite (`npm run build`) pada `budi-luhur/apps/app2/frontend`. Pastikan exit code 0 tanpa error tipe atau linting.
- [x] **Step 12.2:** Verifikasi alur pengguna baru: Home Portal ➔ Kartu App 2 ➔ `/onboarding` ➔ `/splash` (900ms) ➔ `/auth/login` / `/auth/register` ➔ `/user/setup` ➔ `/user/dashboard`.
- [x] **Step 12.3:** Verifikasi 5 menu navigasi bawah seluler berfungsi responsif dan menunjukkan status aktif yang tepat.
- [x] **Step 12.4:** Verifikasi tombol Back pada `/auth/login` dan `/auth/register` mengarah kembali ke Portal Utama `http://localhost:5170`.
- [x] **Step 12.5:** Verifikasi fungsi bisnis pencatatan konsumsi pil ("Sudah Minum" dan "Terlewat") tersimpan ke PostgreSQL `fe_tablet_app2`.
- [x] **Step 12.6:** Verifikasi isolasi sesi browser: login di App 2 tidak merusak atau menimpa sesi di App 1 atau App 3.

---

## 5. Checklist Pengujian Komprehensif

### 5.1. UI & Visual Aesthetics Checklist
- [x] Latar belakang seluruh halaman menggunakan Crisp Slate Mist `#F8FAFC` yang tenang dan higienis (bebas pink background).
- [x] Permukaan kartu, form, dan modal menggunakan Pure Clinical White `#FFFFFF` dengan border tipis Slate `#E2E8F0`.
- [x] Seluruh tombol primer, tab aktif, dan CTA menggunakan Calming Medical Teal `#0D9488`.
- [x] Penanda jadwal hari ini dan aksen hangat menggunakan Warm Coral `#F97316`.
- [x] Seluruh judul, teks utama, dan label penting menggunakan Deep Slate `#0F172A` dengan kontras WCAG AAA.
- [x] Butir pil plasebo (7 butir terakhir pada blister 28 hari) menggunakan Soft Lavender Slate `#94A3B8`.
- [x] Modul `BuddyCard` dan lingkaran streak mingguan kloning sudah terhapus dan digantikan oleh `SymptomHealthCard` serta `ActiveBlisterStripWidget`.
- [x] Tidak ada emoji dekoratif acak (`🌸`, `✨`, `🎉`, `💪`) yang tersisa di seluruh teks antarmuka.

### 5.2. Mobile & Desktop Responsiveness Checklist
- [x] Mobile View (< 768px): Bilah navigasi bawah (`MobileBottomBar`) tampil tetap di bagian bawah dengan 5 menu, bilah atas (`MobileTopBar`) tampil ramping (52px), konten tidak tertutup bottom bar (`pb-24`).
- [x] Tablet & Desktop View (>= 768px): Bilah navigasi bawah tersembunyi, `UserSidebar` tampil di sebelah kiri dengan sticky height `100vh`, konten utama tertata rapi dalam layout bento grid 12-kolom.
- [x] Touch targets memenuhi standar kenyamanan jari (minimal 44x44 px).
- [x] Tidak terjadi horizontal overflow (*horizontal scrollbar*) pada viewport 360px, 390px, 412px, 768px, 1024px, dan 1440px.

### 5.3. Routing & Navigation Integrity Checklist
- [x] Akses root `/` mengarahkan ke `/onboarding` (untuk tamu baru) atau ke dashboard (jika sudah login).
- [x] Selesai onboarding (klik "Mulai Sekarang" / "Lewati") mengarahkan ke `/splash` dengan `{ replace: true }`.
- [x] Layar `/splash` menampilkan maskot pil Pilluna selama 900ms lalu mengarahkan ke `/auth/login` (atau dashboard jika terautentikasi).
- [x] Tombol "Kembali ke Portal Utama" pada halaman auth mengarahkan kembali ke Portal Utama `http://localhost:5170`.
- [x] Pengguna baru yang belum menyelesaikan setup profil terkunci pada rute `/user/setup`.
- [x] Kelima tombol pada `MobileBottomBar` (*Beranda, Monitoring, Edukasi, SADARI, Profil*) mengarahkan ke rute yang benar dengan penanda menu aktif yang akurat.

### 5.4. Functional & Data Integrity Checklist
- [x] Pengguna dapat mendaftarkan akun baru dan masuk (login) menggunakan kredensial yang valid.
- [x] Pengguna dapat menekan tombol "Sudah Minum" pada Beranda, dan status berubah menjadi tercatat dengan waktu riil.
- [x] Data konsumsi tersimpan di database PostgreSQL `fe_tablet_app2` dan tampil pada Kalender Kontrasepsi (`/user/history`).
- [x] Pengguna dapat mengubah jadwal jam minum obat di `/user/schedule` dan perubahan tersimpan.
- [x] Modul panduan SADARI dapat diakses dan menampilkan tahapan periksa payudara sendiri dengan jelas.
- [x] Fitur tanya jawab Asisten AI "Luna" merespons dengan konteks pil KB yang edukatif dan menenangkan.
- [x] Admin portal (`/admin/*`) dapat diakses oleh akun role admin dan menyajikan data manajemen akseptor KB.

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

Refactor UI/UX App 2 dinyatakan **SELESAI dan MEMENUHI SYARAT** apabila seluruh kriteria berikut terpenuhi:

1. **Diferensiasi Merek 100% dari Femory:** Aplikasi Pilluna memiliki identitas visual mandiri sejati dengan palet **Calming Medical Teal (`#0D9488`) & Warm Coral (`#F97316`)**, latar Crisp Mist higienis (`#F8FAFC`), dan tidak lagi menggunakan latar belakang pink atau warna merah muda dominan Femory.
2. **Eliminasi Total Komponen Kloning:** Tidak ada lagi modul `BuddyCard` kelompok anak sekolah atau meteran streak generik; telah digantikan dengan **Widget Strip Blister 28 Hari**, **Kartu Preskripsi & Perlindungan**, dan **Pelacak Efek Samping (Symptom Log)**.
3. **Optimalisasi Tata Letak & Spacing:** Seluruh modul antarmuka menganut sistem 8-point grid, teks judul proporsional (20–24px), informasi status pil hari ini berada di posisi *above the fold*, dan tidak ada pemborosan spasi vertikal.
4. **Standarisasi Ikon Fungsional:** Semua ikon menggunakan pustaka Lucide React seragam (stroke 1.75px) yang relevan dengan kontrasepsi, serta bebas dari emoji dekoratif non-fungsional.
5. **Paritas Spesifikasi `info.md` 100%:** Mencakup 5 menu utama navigasi bawah (*Beranda, Monitoring, Edukasi, SADARI, Profil*), representasi blister kemasan asli, dan modul SADARI yang komprehensif.
6. **Alur Bisnis & Data Utuh:** Tidak ada alur bisnis, endpoint API, skema tabel PostgreSQL (`fe_tablet_app2`), maupun kunci penyimpanan lokal (`app2_auth_token`) yang berubah atau rusak.
7. **Kompilasi & Build Bersih:** Menjalankan perintah `npm run build` pada folder `budi-luhur/apps/app2/frontend` menghasilkan exit code 0 tanpa error TypeScript, styling, maupun build artifact.
8. **Integrasi Ekosistem Portal:** Navigasi dari dan menuju Main Portal (`http://localhost:5170`) berjalan lancar tanpa bentrokan sesi.
