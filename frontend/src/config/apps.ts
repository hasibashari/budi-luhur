export interface AppInfo {
  id: string;
  name: string;
  tagline: string;
  shortTagline: string;
  description: string;
  url: string;
  onboardingUrl: string;
  loginUrl: string;
  registerUrl: string;
  port: number;
  backendPort: number;
  badge: string;
  logoType: 'femory' | 'pilluna' | 'preluna';
  colorScheme: {
    bgLight: string;
    badgeBg: string;
    badgeText: string;
    borderHover: string;
    btnBg: string;
    btnHover: string;
    ringColor: string;
    accentHex: string;
    gradientFrom: string;
    gradientTo: string;
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
    name: 'FEMORY',
    tagline: 'Pencegahan Anemia & Monitoring TTD Remaja Putri',
    shortTagline: 'Sahabat Sehat Cegah Anemia',
    description: 'Aplikasi PWA mandiri untuk pemantauan kepatuhan konsumsi Tablet Tambah Darah (TTD), pencatatan siklus menstruasi, dan edukasi anemia siswi SMP/SMA.',
    url: app1BaseUrl,
    onboardingUrl: `${app1BaseUrl}/onboarding`,
    loginUrl: `${app1BaseUrl}/auth/login`,
    registerUrl: `${app1BaseUrl}/auth/register`,
    port: 5173,
    backendPort: 4001,
    badge: 'DB: fe_tablet_app1',
    logoType: 'femory',
    colorScheme: {
      bgLight: 'from-rose-50 to-pink-50/40',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
      borderHover: 'hover:border-rose-400',
      btnBg: 'bg-[#e11d48]',
      btnHover: 'hover:bg-[#be123c]',
      ringColor: 'focus:ring-rose-500',
      accentHex: '#e11d48',
      gradientFrom: '#e11d48',
      gradientTo: '#fb7185',
    },
    features: [
      'Database mandiri (fe_tablet_app1)',
      'Sesi browser terisolasi (app1_auth_token)',
      'PWA App Shell (Langsung Onboarding/Login)',
      'Monitoring Kepatuhan Tablet Fe & Siklus Haid',
    ],
    stats: [
      { label: 'Role Akses', value: 'Siswi & Admin' },
      { label: 'Sesi Browser', value: 'Terisolasi' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
  {
    id: 'app2',
    name: 'Pilluna',
    tagline: 'Sahabat Setia Minum Pil KB & Edukasi Reproduksi',
    shortTagline: 'Sahabat Setia Minum Pil KB',
    description: 'Aplikasi PWA cerdas untuk pengingat jadwal minum pil harian, asisten konsultasi edukasi reproduksi, dan pemantauan kesehatan wanita terpadu.',
    url: app2BaseUrl,
    onboardingUrl: `${app2BaseUrl}/onboarding`,
    loginUrl: `${app2BaseUrl}/auth/login`,
    registerUrl: `${app2BaseUrl}/auth/register`,
    port: 5174,
    backendPort: 4002,
    badge: 'DB: fe_tablet_app2',
    logoType: 'pilluna',
    colorScheme: {
      bgLight: 'from-pink-50 to-rose-50/40',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-pink-700',
      borderHover: 'hover:border-[#E94383]',
      btnBg: 'bg-[#E94383]',
      btnHover: 'hover:bg-[#d82a6f]',
      ringColor: 'focus:ring-pink-500',
      accentHex: '#E94383',
      gradientFrom: '#E94383',
      gradientTo: '#F58CB4',
    },
    features: [
      'Database mandiri (fe_tablet_app2)',
      'Sesi browser terisolasi (app2_auth_token)',
      'PWA App Shell (Langsung Onboarding/Login)',
      'Pengingat Harian & Edukasi Kesehatan Reproduksi',
    ],
    stats: [
      { label: 'Role Akses', value: 'Pengguna & Bidan' },
      { label: 'Sesi Browser', value: 'Terisolasi' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
  {
    id: 'app3',
    name: 'PRELUNA',
    tagline: 'Kesehatan Pranikah & Panduan Imunisasi TT',
    shortTagline: 'Kesehatan Pranikah & Imunisasi TT',
    description: 'Aplikasi PWA panduan jadwal 5 dosis imunisasi Tetanus Toksoid (TT) Kemenkes, skrining kesiapan reproduksi calon pengantin, dan sertifikasi digital.',
    url: app3BaseUrl,
    onboardingUrl: `${app3BaseUrl}/onboarding`,
    loginUrl: `${app3BaseUrl}/auth/login`,
    registerUrl: `${app3BaseUrl}/auth/register`,
    port: 5175,
    backendPort: 4003,
    badge: 'DB: fe_tablet_app3',
    logoType: 'preluna',
    colorScheme: {
      bgLight: 'from-red-50 to-rose-50/40',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-[#aa294d]',
      borderHover: 'hover:border-[#aa294d]',
      btnBg: 'bg-[#aa294d]',
      btnHover: 'hover:bg-[#881d3a]',
      ringColor: 'focus:ring-rose-500',
      accentHex: '#aa294d',
      gradientFrom: '#aa294d',
      gradientTo: '#cb4364',
    },
    features: [
      'Database mandiri (fe_tablet_app3)',
      'Sesi browser terisolasi (app3_auth_token)',
      'PWA App Shell (Langsung Onboarding/Login)',
      'Kalkulator Interval TT & Kartu Skrining Catin',
    ],
    stats: [
      { label: 'Role Akses', value: 'Catin & Nakes' },
      { label: 'Sesi Browser', value: 'Terisolasi' },
      { label: 'PWA Ready', value: 'Yes' },
    ],
  },
];
