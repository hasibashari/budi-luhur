export interface AppInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  port: number;
  backendPort: number;
  badge: string;
  colorScheme: {
    bgLight: string;
    badgeBg: string;
    badgeText: string;
    borderHover: string;
    btnBg: string;
    btnHover: string;
    ringColor: string;
    accentHex: string;
  };
  features: string[];
  stats: {
    label: string;
    value: string;
  }[];
}

export const APPS: AppInfo[] = [
  {
    id: 'app1',
    name: 'FEMORY - Aplikasi 1',
    tagline: 'Instansi & Kelompok Studi 1',
    description: 'Aplikasi otonom 1 dengan database independen fe_tablet_app1. Dirancang untuk pemantauan siswi kelas VII & VIII secara real-time.',
    url: import.meta.env.VITE_APP_1_URL || 'http://localhost:5173',
    port: 5173,
    backendPort: 4001,
    badge: 'Port 5173 • DB App 1',
    colorScheme: {
      bgLight: 'from-rose-50 to-pink-50/40',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
      borderHover: 'hover:border-rose-400',
      btnBg: 'bg-rose-600',
      btnHover: 'hover:bg-rose-700',
      ringColor: 'focus:ring-rose-500',
      accentHex: '#e11d48',
    },
    features: [
      'Database mandiri (fe_tablet_app1)',
      'Sesi browser terisolasi (app1_auth_token)',
      'Backend Express API di Port 4001',
      'Portal Siswi & Portal Admin Terpadu',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Port App', value: ':5173' },
      { label: 'Backend API', value: ':4001' },
    ],
  },
  {
    id: 'app2',
    name: 'FEMORY - Aplikasi 2',
    tagline: 'Instansi & Kelompok Studi 2',
    description: 'Aplikasi otonom 2 dengan database independen fe_tablet_app2. Dikhususkan untuk monitoring kepatuhan siswi kelas IX.',
    url: import.meta.env.VITE_APP_2_URL || 'http://localhost:5174',
    port: 5174,
    backendPort: 4002,
    badge: 'Port 5174 • DB App 2',
    colorScheme: {
      bgLight: 'from-fuchsia-50 to-rose-50/40',
      badgeBg: 'bg-fuchsia-100',
      badgeText: 'text-fuchsia-700',
      borderHover: 'hover:border-fuchsia-400',
      btnBg: 'bg-fuchsia-600',
      btnHover: 'hover:bg-fuchsia-700',
      ringColor: 'focus:ring-fuchsia-500',
      accentHex: '#c026d3',
    },
    features: [
      'Database mandiri (fe_tablet_app2)',
      'Sesi browser terisolasi (app2_auth_token)',
      'Backend Express API di Port 4002',
      'Dukungan PWA & AI Edukasi Gemini',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Port App', value: ':5174' },
      { label: 'Backend API', value: ':4002' },
    ],
  },
  {
    id: 'app3',
    name: 'FEMORY - Aplikasi 3',
    tagline: 'Instansi & Kelompok Studi 3',
    description: 'Aplikasi otonom 3 dengan database independen fe_tablet_app3. Digunakan untuk evaluasi berkala dan fasilitas UKS Sekolah Budi Luhur.',
    url: import.meta.env.VITE_APP_3_URL || 'http://localhost:5175',
    port: 5175,
    backendPort: 4003,
    badge: 'Port 5175 • DB App 3',
    colorScheme: {
      bgLight: 'from-pink-50 to-amber-50/40',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-pink-700',
      borderHover: 'hover:border-pink-400',
      btnBg: 'bg-pink-600',
      btnHover: 'hover:bg-pink-700',
      ringColor: 'focus:ring-pink-500',
      accentHex: '#db2777',
    },
    features: [
      'Database mandiri (fe_tablet_app3)',
      'Sesi browser terisolasi (app3_auth_token)',
      'Backend Express API di Port 4003',
      'Fitur Sahabat Sehat & Streak Group',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Port App', value: ':5175' },
      { label: 'Backend API', value: ':4003' },
    ],
  },
];
