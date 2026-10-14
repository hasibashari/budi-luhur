export interface AppInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  loginUrl: string;
  registerUrl: string;
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

const app1BaseUrl = import.meta.env.VITE_APP_1_URL || 'http://localhost:5173';
const app2BaseUrl = import.meta.env.VITE_APP_2_URL || 'http://localhost:5174';
const app3BaseUrl = import.meta.env.VITE_APP_3_URL || 'http://localhost:5175';

export const APPS: AppInfo[] = [
  {
    id: 'app1',
    name: 'FEMORY - Aplikasi 1',
    tagline: 'Instansi & Kelompok Studi 1',
    description: 'Aplikasi PWA mandiri dengan database independen fe_tablet_app1. Dirancang untuk pemantauan siswi kelas VII & VIII secara real-time.',
    url: app1BaseUrl,
    loginUrl: `${app1BaseUrl}/auth/login`,
    registerUrl: `${app1BaseUrl}/auth/register`,
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
      'PWA App Shell (Langsung Login/Register)',
      'Portal Siswi & Portal Admin Terpadu',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Port App', value: ':5173' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
  {
    id: 'app2',
    name: 'FEMORY - Aplikasi 2',
    tagline: 'Instansi & Kelompok Studi 2',
    description: 'Aplikasi PWA mandiri dengan database independen fe_tablet_app2. Dikhususkan untuk monitoring kepatuhan siswi kelas IX.',
    url: app2BaseUrl,
    loginUrl: `${app2BaseUrl}/auth/login`,
    registerUrl: `${app2BaseUrl}/auth/register`,
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
      'PWA App Shell (Langsung Login/Register)',
      'Dukungan Edukasi AI Gemini',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Port App', value: ':5174' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
  {
    id: 'app3',
    name: 'FEMORY - Aplikasi 3',
    tagline: 'Instansi & Kelompok Studi 3',
    description: 'Aplikasi PWA mandiri dengan database independen fe_tablet_app3. Digunakan untuk evaluasi berkala dan fasilitas UKS Sekolah Budi Luhur.',
    url: app3BaseUrl,
    loginUrl: `${app3BaseUrl}/auth/login`,
    registerUrl: `${app3BaseUrl}/auth/register`,
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
      'PWA App Shell (Langsung Login/Register)',
      'Fitur Sahabat Sehat & Streak Group',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Port App', value: ':5175' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
];
