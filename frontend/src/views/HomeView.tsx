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

  // Data informasi dan logo untuk masing-masing dari 3 aplikasi mandiri
  const appCardsConfig: Record<
    string,
    {
      subtitle: string;
      illustration: React.ReactNode;
    }
  > = {
    app1: {
      subtitle: 'Usia Remaja & Siswi',
      illustration: (
        <img
          src='/icons/femory.png'
          alt='Logo FEMORY'
          className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-108'
        />
      ),
    },
    app2: {
      subtitle: 'Pil KB & Reproduksi',
      illustration: (
        <img
          src='/icons/pilluna.png'
          alt='Logo PILLUNA'
          className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-108'
        />
      ),
    },
    app3: {
      subtitle: 'Pranikah & Imunisasi TT',
      illustration: (
        <img
          src='/icons/preluna.png'
          alt='Logo PRELUNA'
          className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-108'
        />
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
                src='/images/sibiru.png'
                alt='Logo Aplikasi SIBIRU'
                className='w-full h-full object-contain'
              />
            </div>
            <div>
              <p className='text-xs text-gray-600 font-medium leading-none mb-1'>
                Selamat datang di,
              </p>
              <h2 className='text-2xl font-extrabold text-gray-900 tracking-tight leading-tight'>
                Aplikasi SIBIRU
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
                illustration: null,
              };

              return (
                <a
                  key={app.id}
                  href={app.onboardingUrl}
                  className='flex flex-col items-center group text-center focus:outline-hidden transition-transform duration-200 active:scale-95'
                  aria-label={`Buka aplikasi ${app.name} - ${app.tagline}`}
                >
                  {/* Langsung Logo Aplikasi */}
                  <div className='w-full aspect-square flex items-center justify-center mb-2'>
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
