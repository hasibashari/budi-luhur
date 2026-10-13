# Budi Luhur Ecosystem - Guidelines & Architecture

Main Project untuk ekosistem tiga aplikasi mandiri berbasis implementasi `fe-tablet`:
- **Landing Page Portal**: `budi-luhur/frontend/` (React + Vite, Port 5170)
- **Tiga Aplikasi Terpisah**: `budi-luhur/apps/`
  - `app1`: Frontend Vite (5173) + Backend Express (4001) | Database: `fe_tablet_app1`
  - `app2`: Frontend Vite (5174) + Backend Express (4002) | Database: `fe_tablet_app2`
  - `app3`: Frontend Vite (5175) + Backend Express (4003) | Database: `fe_tablet_app3`
- **Referensi Implementasi (Read-Only)**: `../fe-tablet` (Next.js 16)
- **Dokumentasi & Spesifikasi**: `budi-luhur/doc/PRD.md` dan `budi-luhur/doc/PLAN.md`

## Aturan Arsitektur
1. Setiap aplikasi memiliki backend Express.js modular dan frontend React+Vite feature-based tersendiri.
2. Isolasi data dan sesi mutlak: Akun dan session storage tidak boleh saling menimpa.
3. Repositori referensi `fe-tablet` tidak boleh dimodifikasi secara destruktif.
