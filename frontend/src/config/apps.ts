export interface AppInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  onboardingUrl: string;
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

const isProd = import.meta.env.PROD;
const app1BaseUrl = import.meta.env.VITE_APP_1_URL || (isProd ? '/app1' : 'http://localhost:5173');
const app2BaseUrl = import.meta.env.VITE_APP_2_URL || (isProd ? '/app2' : 'http://localhost:5174');
const app3BaseUrl = import.meta.env.VITE_APP_3_URL || (isProd ? '/app3' : 'http://localhost:5175');

export const APPS: AppInfo[] = [
  {
    id: 'app1',
    name: 'Aplikasi Mandiri 1',
    tagline: 'Instansi & Kelompok Studi 1',
    description: 'Aplikasi PWA mandiri dengan database independen fe_tablet_app1. Dirancang untuk pemantauan kesehatan siswi kelas VII & VIII.',
    url: app1BaseUrl,
    onboardingUrl: `${app1BaseUrl}/onboarding`,
    loginUrl: `${app1BaseUrl}/auth/login`,
    registerUrl: `${app1BaseUrl}/auth/register`,
    port: 5173,
    backendPort: 4001,
    badge: 'DB: fe_tablet_app1',
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
      { label: 'Sesi Browser', value: 'Terisolasi' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
  {
    id: 'app2',
    name: 'Aplikasi Mandiri 2',
    tagline: 'Instansi & Kelompok Studi 2',
    description: 'Aplikasi PWA mandiri dengan database independen fe_tablet_app2. Dikhususkan untuk monitoring kesehatan siswi kelas IX.',
    url: app2BaseUrl,
    onboardingUrl: `${app2BaseUrl}/onboarding`,
    loginUrl: `${app2BaseUrl}/auth/login`,
    registerUrl: `${app2BaseUrl}/auth/register`,
    port: 5174,
    backendPort: 4002,
    badge: 'DB: fe_tablet_app2',
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
      { label: 'Sesi Browser', value: 'Terisolasi' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
  {
    id: 'app3',
    name: 'Aplikasi Mandiri 3',
    tagline: 'Instansi & Kelompok Studi 3',
    description: 'Aplikasi PWA mandiri dengan database independen fe_tablet_app3. Digunakan untuk evaluasi berkala dan fasilitas UKS Sekolah Budi Luhur.',
    url: app3BaseUrl,
    onboardingUrl: `${app3BaseUrl}/onboarding`,
    loginUrl: `${app3BaseUrl}/auth/login`,
    registerUrl: `${app3BaseUrl}/auth/register`,
    port: 5175,
    backendPort: 4003,
    badge: 'DB: fe_tablet_app3',
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
      { label: 'Sesi Browser', value: 'Terisolasi' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
];
