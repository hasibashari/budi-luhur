# Ekosistem FEMORY - Universitas Budi Luhur
### Portal Terpadu & Tiga Aplikasi Otonom Pemantauan Tablet Tambah Darah (TTD) Remaja Putri

Selamat datang di repositori ekosistem **FEMORY Budi Luhur**. Proyek ini merupakan implementasi lanjutan dari aplikasi referensi `fe-tablet` yang telah diduplikasi dan diarsiteki menjadi **tiga aplikasi otonom mandiri** lengkap dengan **Landing Page Portal Utama** untuk navigasi terpadu.

---

## 🏛️ Arsitektur Ekosistem

Ekosistem ini terdiri dari 1 Landing Page Portal Utama dan 3 Aplikasi Mandiri yang terisolasi secara penuh di level peramban (*browser storage key*) maupun basis data (*PostgreSQL logical database*):

| Komponen | Tipe | Port Frontend | Port Backend | Database (Neon PG) | Auth Storage Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing Portal** | React + Vite + Tailwind v4 | `http://localhost:5170` | - | - | - |
| **Aplikasi 1** | Fullstack Mandiri | `http://localhost:5173` | `http://localhost:4001` | `fe_tablet_app1` | `app1_auth_token` |
| **Aplikasi 2** | Fullstack Mandiri | `http://localhost:5174` | `http://localhost:4002` | `fe_tablet_app2` | `app2_auth_token` |
| **Aplikasi 3** | Fullstack Mandiri | `http://localhost:5175` | `http://localhost:4003` | `fe_tablet_app3` | `app3_auth_token` |

> **Catatan Integritas Referensi:** Direktori `fe-tablet/` tetap dipertahankan 100% utuh tanpa perubahan sebagai referensi acuan kode awal.

---

## 📂 Struktur Direktori

```text
budi-luhur/
├── apps/
│   ├── app1/                     # Aplikasi 1 Otonom
│   │   ├── frontend/             # React 19 + Vite (Port 5173)
│   │   └── backend/              # Express + TS (Port 4001, DB: fe_tablet_app1)
│   ├── app2/                     # Aplikasi 2 Otonom
│   │   ├── frontend/             # React 19 + Vite (Port 5174)
│   │   └── backend/              # Express + TS (Port 4002, DB: fe_tablet_app2)
│   ├── app3/                     # Aplikasi 3 Otonom
│   │   ├── frontend/             # React 19 + Vite (Port 5175)
│   │   └── backend/              # Express + TS (Port 4003, DB: fe_tablet_app3)
│   ├── template-frontend/        # Template Frontend Acuan
│   └── template-backend/         # Template Backend Acuan
├── frontend/                     # Landing Page Portal Utama (Port 5170)
├── doc/
│   ├── PRD.md                    # Product Requirement Document
│   └── PLAN.md                   # Detailed Implementation Plan
├── package.json                  # Root Monorepo Orchestration Scripts
└── README.md                     # Panduan Penggunaan & Operasional
```

---

## ⚡ Prasyarat Sistem

1. **Node.js**: Versi `20.x` atau lebih baru (`node -v`).
2. **npm**: Versi `10.x` atau lebih baru (`npm -v`).
3. **Koneksi Internet**: Untuk sinkronisasi basis data Neon Serverless PostgreSQL dan AI Gemini API.

---

## 🚀 Panduan Memulai Cepat (Quickstart)

### 1. Inisialisasi & Seeding Database (Sekali Saja)
Jalankan perintah berikut di root folder `budi-luhur/` untuk menyiapkan skema dan data awal pada ketiga database Neon:

```bash
# Inisialisasi skema tabel di fe_tablet_app1, fe_tablet_app2, fe_tablet_app3
npm run db:init:all

# Seeding data pengguna, jadwal, artikel, dan grup sahabat di ketiga DB
npm run db:seed:all
```

### 2. Menjalankan Seluruh Ekosistem Secara Bersamaan
Untuk menjalankan Portal Landing Page beserta seluruh 3 backend dan 3 frontend sekaligus:

```bash
npm run dev:all
```

Setelah dijalankan:
- Buka Landing Portal: [http://localhost:5170](http://localhost:5170)
- Aplikasi 1: [http://localhost:5173](http://localhost:5173)
- Aplikasi 2: [http://localhost:5174](http://localhost:5174)
- Aplikasi 3: [http://localhost:5175](http://localhost:5175)

### 3. Menjalankan Komponen Tertentu (Opsi Modular)
Jika ingin menjalankan komponen secara terpisah:

```bash
# Hanya jalankan Portal Landing Page
npm run dev:portal

# Hanya jalankan Aplikasi 1 (Frontend + Backend)
npm run dev:app1

# Hanya jalankan Aplikasi 2 (Frontend + Backend)
npm run dev:app2

# Hanya jalankan Aplikasi 3 (Frontend + Backend)
npm run dev:app3
```

---

## 👥 Kredensial Akun Pengujian (Demo)

Setiap aplikasi telah dilengkapi akun bawaan hasil *seeding* mandiri:

### Role Siswi (Remaja Putri)
- **Email:** `sarah@email.com`
- **Password:** `password123`
- *Atau gunakan tombol **Quick Login Siswi** pada halaman masuk.*
- **Fitur Tersedia:** Hero reminder minum obat, kalender pantau 3-tab, obrolan Sahabat Sehat & Streak Group, konsultasi AI dokter virtual 24/7, modul edukasi anemia, dan profil kesehatan.

### Role Admin (Fasilitator UKS / Puskesmas)
- **Email:** `admin@email.com`
- **Password:** `admin123`
- *Atau gunakan tombol **Quick Login Admin** pada halaman masuk.*
- **Fitur Tersedia:** Admin dashboard metrik kepatuhan global, tabel manajemen siswi, modal kirim pengingat WhatsApp, manajemen jadwal minum serentak, CMS edukasi artikel, dan grafik analytics kepatuhan.

---

## 🛡️ Jaminan Isolasi Sistem & Konfigurasi AI

1. **Isolasi Database Penuh**:
   - Data siswi atau pencatatan obat yang dibuat di Aplikasi 1 **tidak akan pernah muncul** di Aplikasi 2 maupun Aplikasi 3 karena masing-masing terhubung ke database Neon terpisah (`fe_tablet_app1`, `fe_tablet_app2`, `fe_tablet_app3`).
2. **Isolasi Sesi Multi-Tab**:
   - Pengguna dapat membuka Aplikasi 1 sebagai Siswi pada Tab 1 dan membuka Aplikasi 2 sebagai Admin pada Tab 2 pada peramban yang sama secara bersamaan tanpa saling menimpa token login.
3. **Isolasi Fitur AI & Pengaturan Model**:
   - **App 1 (FEMORY):** Dilengkapi fitur Gemini AI (Konsultasi Dokter Virtual 24/7, Pembuatan Draf Artikel Edukasi, dan Smart Reminder Nudge). Model AI dikonfigurasi melalui environment variable `GEMINI_MODEL` di file `.env` (default: `gemini-2.5-flash`), sehingga developer dapat mengganti model tanpa harus mengubah kode sumber. API key hanya berada di sisi backend dan tidak diekspos ke frontend.
   - **App 2 (Pilluna) & App 3 (TEMANI):** **100% Bebas AI**. Seluruh integrasi, API, dependensi, dan helper Gemini telah dihapus. Pembuatan, pengeditan, dan pengelolaan artikel pada App 2 dan App 3 dilakukan murni melalui form CMS aplikasi tanpa ketergantungan AI.
4. **Cara Mengganti Model AI App 1**:
   - Buka `apps/app1/backend/.env`.
   - Ubah nilai variabel `GEMINI_MODEL`, misalnya:
     ```env
     GEMINI_MODEL=gemini-2.5-flash
     # atau model lain: gemini-1.5-flash, gemini-1.5-pro, gemini-2.5-pro
     ```
   - Restart backend App 1 (`npm run dev:app1`). Model baru akan langsung aktif dan divalidasi secara otomatis.
5. **Build Validated**:
   - Seluruh modul frontend dan backend telah divalidasi dengan hasil kompilasi bersih 100%.
