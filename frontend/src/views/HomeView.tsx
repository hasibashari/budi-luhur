import React from 'react';
import { Building2, Calendar, ChevronRight, Info } from 'lucide-react';
import { APPS, type AppInfo } from '../config/apps';
import type { NavMenuId } from '../components/Sidebar';

interface HomeViewProps {
  onNavigate: (menu: NavMenuId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  // Format tanggal dinamis dalam Bahasa Indonesia
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Data ilustrasi dan styling kartu untuk masing-masing dari 3 aplikasi mandiri
  const appCardsConfig: Record<
    string,
    {
      subtitle: string;
      bgColor: string;
      circleColor: string;
      illustration: React.ReactNode;
    }
  > = {
    app1: {
      subtitle: 'Usia Remaja & Siswi',
      bgColor: 'bg-[#F3E8FF]', // Ungu pastel muda
      circleColor: 'bg-[#E9D5FF]',
      illustration: (
        <svg viewBox='0 0 100 100' className='w-20 h-20 z-10' aria-hidden='true'>
          {/* Siswi Remaja & Pencegahan Anemia */}
          <circle cx='35' cy='38' r='10' fill='#FED7AA' />
          <path d='M25 33 C25 23, 45 23, 45 43' fill='#1E293B' />
          <path d='M22 85 C22 64, 48 64, 48 85 Z' fill='#9333EA' />
          <circle cx='62' cy='32' r='11' fill='#FED7AA' />
          <path d='M52 26 C52 18, 72 18, 72 26' fill='#1E293B' />
          <path d='M46 85 C46 58, 78 58, 78 85 Z' fill='#A855F7' />
          {/* Aksen Tablet Fe / Tambah Darah */}
          <circle cx='68' cy='62' r='8' fill='#FDE047' />
          <rect x='66.5' y='57' width='3' height='10' rx='1' fill='#9333EA' />
          <rect x='63' y='60.5' width='10' height='3' rx='1' fill='#9333EA' />
        </svg>
      ),
    },
    app2: {
      subtitle: 'Pil KB & Reproduksi',
      bgColor: 'bg-[#FCE7F3]', // Pink pastel lembut
      circleColor: 'bg-[#FBCFE8]',
      illustration: (
        <svg viewBox='0 0 100 100' className='w-20 h-20 z-10' aria-hidden='true'>
          {/* Ibu / Bidan & Edukasi Pil KB */}
          <rect x='44' y='28' width='16' height='12' rx='2' fill='#334155' />
          <circle cx='30' cy='36' r='8' fill='#FED7AA' />
          <path d='M18 85 C18 60, 42 60, 42 85 Z' fill='#F472B6' />
          <circle cx='70' cy='32' r='10' fill='#FED7AA' />
          <path d='M55 85 C50 60, 85 55, 85 85 Z' fill='#EC4899' />
          {/* Kartu / Blister Pil KB */}
          <rect
            x='34'
            y='62'
            width='16'
            height='12'
            rx='2'
            fill='#FFFFFF'
            stroke='#EC4899'
            strokeWidth='1.5'
          />
          <circle cx='38' cy='68' r='2' fill='#EC4899' />
          <circle cx='46' cy='68' r='2' fill='#EC4899' />
        </svg>
      ),
    },
    app3: {
      subtitle: 'Pranikah & Imunisasi TT',
      bgColor: 'bg-[#E0F2FE]', // Biru pastel lembut
      circleColor: 'bg-[#BAE6FD]',
      illustration: (
        <svg viewBox='0 0 100 100' className='w-20 h-20 z-10' aria-hidden='true'>
          {/* Suntikan & Botol Vaksin TT */}
          <g transform='rotate(-40 50 50)'>
            <rect
              x='44'
              y='25'
              width='12'
              height='38'
              rx='2'
              fill='#E2E8F0'
              stroke='#475569'
              strokeWidth='2'
            />
            <rect x='44' y='38' width='12' height='16' fill='#38BDF8' />
            <line x1='50' y1='10' x2='50' y2='25' stroke='#64748B' strokeWidth='2' />
            <line x1='50' y1='63' x2='50' y2='76' stroke='#475569' strokeWidth='3' />
            <line x1='42' y1='76' x2='58' y2='76' stroke='#475569' strokeWidth='3' />
          </g>
          <rect
            x='20'
            y='52'
            width='14'
            height='22'
            rx='2'
            fill='#38BDF8'
            stroke='#0284C7'
            strokeWidth='1.5'
          />
          <rect x='22' y='48' width='10' height='4' fill='#334155' />
        </svg>
      ),
    },
  };

  return (
    <div className='max-w-3xl mx-auto'>
      {/* =========================================================
          1. HEADER SECTION (Gradasi Biru-Hijau Lembut Sesuai Gambar)
         ========================================================= */}
      <div className='relative bg-gradient-to-br from-[#E6F8F6] via-[#D2F4F0] to-white px-6 pt-10 pb-8 md:rounded-b-3xl overflow-hidden'>
        {/* Efek gelombang halus di latar belakang header */}
        <div className='absolute -right-10 -top-10 w-52 h-52 bg-[#B5ECE6] rounded-full blur-2xl opacity-60 pointer-events-none' />

        <div className='relative z-10'>
          <div className='flex items-center gap-3.5 mb-3.5'>
            <div className='w-13 h-13 rounded-2xl bg-white/95 p-1.5 shadow-xs border border-teal-100 flex items-center justify-center shrink-0'>
              <img
                src='/images/sora.png'
                alt='Logo Aplikasi SORA'
                className='w-full h-full object-contain'
              />
            </div>
            <div>
              <p className='text-xs text-gray-600 font-medium leading-none mb-1'>Selamat datang di,</p>
              <h2 className='text-2xl font-extrabold text-gray-900 tracking-tight leading-tight'>
                Aplikasi SORA
              </h2>
            </div>
          </div>

          <div className='space-y-2 text-sm text-gray-700 font-medium pt-0.5'>
            <div className='flex items-center gap-2.5'>
              <Building2 className='w-4 h-4 text-[#149690] stroke-[2] shrink-0' />
              <span>STIKes Budi Luhur Cimahi</span>
            </div>
            <div className='flex items-center gap-2.5'>
              <Calendar className='w-4 h-4 text-[#149690] stroke-[2] shrink-0' />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. BODY SECTION (Layanan Klaster & Layanan Lainnya)
         ========================================================= */}
      <div className='px-6 pt-5 space-y-8'>
        {/* BAGIAN 1: Layanan Klaster (Tepat 3 Aplikasi Mandiri dalam 3 Kolom) */}
        <section aria-labelledby='layanan-klaster-heading'>
          <h3 id='layanan-klaster-heading' className='text-base font-bold text-gray-800 mb-4'>
            Layanan Klaster
          </h3>

          <div className='grid grid-cols-3 gap-x-3.5 gap-y-5 sm:gap-6'>
            {APPS.map((app: AppInfo) => {
              const cardCfg = appCardsConfig[app.id] || {
                subtitle: app.shortTagline,
                bgColor: 'bg-[#EDE9FE]',
                circleColor: 'bg-[#DDD6FE]',
                illustration: null,
              };

              return (
                <a
                  key={app.id}
                  href={app.onboardingUrl}
                  className='flex flex-col items-center group text-center focus:outline-hidden transition-transform duration-200 active:scale-95'
                  aria-label={`Buka aplikasi ${app.name} - ${app.tagline}`}
                >
                  {/* Kotak Ilustrasi Pastel Berlingkaran Aksen */}
                  <div
                    className={`w-full aspect-square rounded-2xl ${cardCfg.bgColor} relative overflow-hidden flex items-end justify-center mb-2 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md shadow-2xs border border-white/40`}
                  >
                    {/* Lingkaran dekoratif di sudut dalam kartu */}
                    <div
                      className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${cardCfg.circleColor} opacity-70 pointer-events-none`}
                    />
                    {cardCfg.illustration}
                  </div>

                  {/* Judul & Keterangan Aplikasi */}
                  <span className='text-xs sm:text-sm font-bold text-gray-800 leading-snug px-1 block truncate w-full'>
                    {app.name}
                  </span>
                  <span className='text-[10px] sm:text-xs text-gray-500 font-medium leading-tight block line-clamp-1 mt-0.5'>
                    {cardCfg.subtitle}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* BAGIAN 2: Layanan Lainnya (Banner Data Individu) */}
        <section aria-labelledby='layanan-lainnya-heading'>
          <h3 id='layanan-lainnya-heading' className='text-base font-bold text-gray-800 mb-4'>
            Layanan Lainnya
          </h3>

          <div className='relative rounded-2xl bg-gradient-to-r from-[#218380] via-[#34A09B] to-[#68C3BE] p-5 text-white overflow-hidden shadow-md flex items-center justify-between min-h-[155px]'>
            {/* Konten Kiri (Teks & Tombol) */}
            <div className='z-10 max-w-[62%] sm:max-w-[60%] space-y-2'>
              <h4 className='text-lg font-bold tracking-wide leading-tight'>Data Individu</h4>
              <p className='text-xs text-teal-50 leading-relaxed'>
                Data masyarakat yang ada di dalam area layanan
              </p>
              <div className='pt-2'>
                <button
                  onClick={() => onNavigate('panduan')}
                  className='bg-white text-[#218380] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-teal-50 active:scale-95 transition-all cursor-pointer'
                >
                  <span>Lihat data</span>
                  <ChevronRight className='w-4 h-4 stroke-[2.5]' />
                </button>
              </div>
            </div>

            {/* Ilustrasi Keluarga/Masyarakat di Sisi Kanan */}
            <div className='w-36 h-32 flex items-end justify-end z-10 pointer-events-none select-none'>
              <svg viewBox='0 0 140 110' className='w-full h-full' aria-hidden='true'>
                {/* Figur Anggota Keluarga & Masyarakat */}
                <circle cx='35' cy='42' r='9' fill='#FED7AA' />
                <path d='M22 110 C22 70, 48 70, 48 110 Z' fill='#FFFFFF' />
                <circle cx='62' cy='46' r='8' fill='#FED7AA' />
                <path d='M50 110 C50 75, 74 75, 74 110 Z' fill='#0F766E' />
                <circle cx='90' cy='36' r='10' fill='#FED7AA' />
                <path d='M75 110 C75 65, 105 65, 105 110 Z' fill='#134E4A' />
                <circle cx='116' cy='44' r='9' fill='#FED7AA' />
                <path d='M102 110 C102 72, 130 72, 130 110 Z' fill='#0D9488' />
              </svg>
            </div>

            {/* Ikon Info (!) di Pojok Kanan Bawah */}
            <button
              onClick={() => onNavigate('pengaturan')}
              aria-label='Informasi Layanan & Portal'
              className='absolute bottom-3 right-3 text-white/80 hover:text-white transition-colors z-20 cursor-pointer p-1'
            >
              <Info className='w-5 h-5' />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeView;
