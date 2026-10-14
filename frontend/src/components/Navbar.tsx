import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  Menu,
  X,
  ExternalLink,
  Globe,
  Grid,
  Award,
  Heart,
  HelpCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Ukur tinggi header secara dinamis (untuk posisi drawer di luar header)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setHeaderHeight(el.offsetHeight);
    });
    observer.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ─── Header: fixed ke viewport top-0, bersih tanpa backdrop/drawer ─── */}
      <header ref={headerRef} className='fixed top-0 inset-x-0 z-50 w-full shadow-xs'>
        {/* ─── Top Information Bar ─── */}
        <div className='bg-[#00A3E0] text-white text-xs py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 border-b border-sky-400/40'>
          <div className='max-w-7xl mx-auto flex items-center justify-between gap-2'>
            <div className='flex items-center space-x-3 sm:space-x-6 overflow-hidden text-[11px] sm:text-xs'>
              <a
                href='tel:(022)6674696'
                className='inline-flex items-center space-x-1.5 hover:text-[#fdc800] transition-colors shrink-0'
                aria-label='Telepon STIKes Budi Luhur'
              >
                <Phone className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#fdc800]' />
                <span className='font-semibold'>(022) 667 4696</span>
              </a>
              <a
                href='https://wa.me/081223634281'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center space-x-1 hover:text-[#fdc800] transition-colors shrink-0'
                aria-label='WhatsApp STIKes Budi Luhur'
              >
                <span className='font-bold text-[#fdc800]'>WA:</span>
                <span className='font-medium'>081223634281</span>
              </a>
              <a
                href='mailto:info@stikesbudiluhurcimahi.ac.id'
                className='hidden md:inline-flex items-center space-x-1.5 hover:text-[#fdc800] transition-colors truncate'
              >
                <Mail className='w-3.5 h-3.5 text-[#fdc800] shrink-0' />
                <span className='font-medium truncate'>info@stikesbudiluhurcimahi.ac.id</span>
              </a>
            </div>

            <div className='flex items-center space-x-3 shrink-0'>
              <span className='hidden sm:inline-block text-sky-100 text-[11px]'>
                Yayasan Pambudhi Luhur 1976
              </span>
              <div className='hidden sm:inline-flex items-center space-x-1 font-semibold text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full'>
                <Globe className='w-3 h-3 text-[#fdc800]' />
                <span className='text-white'>ID</span>
                <span className='text-sky-200'>|</span>
                <span className='text-sky-100 opacity-80'>EN</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Navbar Area ─── */}
        <div className='bg-white/95 backdrop-blur-md border-b border-slate-200/90'>
          <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between h-16 sm:h-20'>
              {/* Logo & Brand Identity */}
              <a
                href='#'
                className='flex items-center space-x-2.5 sm:space-x-3 group min-h-[44px] py-1'
              >
                <img
                  src='/images/stikes-logo.png'
                  alt='Logo STIKes Budi Luhur Cimahi'
                  className='h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]'
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className='border-l border-slate-300 pl-2.5 sm:pl-3'>
                  <span className='font-extrabold text-base sm:text-xl tracking-tight text-[#004B87] leading-tight block'>
                    STIKes Budi Luhur
                  </span>
                  <p className='text-[10px] sm:text-[11px] text-[#444444] font-medium hidden sm:block'>
                    Perguruan Tinggi Kesehatan • Cimahi
                  </p>
                </div>
              </a>

              {/* Desktop Navigation */}
              <nav className='hidden lg:flex items-center space-x-5 xl:space-x-6'>
                <a
                  href='#profil'
                  className='text-sm font-semibold text-slate-700 hover:text-[#005EB8] transition-colors py-2'
                >
                  Profil
                </a>
                <a
                  href='#prodi'
                  className='text-sm font-semibold text-slate-700 hover:text-[#005EB8] transition-colors py-2'
                >
                  Program Studi
                </a>
                <a
                  href='#keunggulan'
                  className='text-sm font-semibold text-slate-700 hover:text-[#005EB8] transition-colors py-2'
                >
                  Keunggulan
                </a>
                <a
                  href='#fasilitas'
                  className='text-sm font-semibold text-slate-700 hover:text-[#005EB8] transition-colors py-2'
                >
                  Fasilitas
                </a>
                <a
                  href='#apps'
                  className='text-sm font-semibold text-slate-700 hover:text-[#005EB8] transition-colors py-2'
                >
                  Portal Aplikasi
                </a>
                <a
                  href='#faq'
                  className='text-sm font-semibold text-slate-700 hover:text-[#005EB8] transition-colors py-2'
                >
                  FAQ
                </a>
              </nav>

              {/* Action CTA Button (Desktop) */}
              <div className='hidden lg:flex items-center'>
                <a href='#apps' className='btn-budi-primary text-xs py-2 px-5'>
                  <span>Portal Aplikasi</span>
                </a>
              </div>

              {/* Mobile menu trigger button */}
              <div className='lg:hidden flex items-center'>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className='p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#004B87] hover:bg-slate-100 active:bg-slate-200 focus:outline-hidden transition-colors'
                  aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Overlay Backdrop ────────────────────────────────────────────
           DI LUAR <header>: z-40 di global context → header z-50 tetap di atas
      ──────────────────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs'
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden='true'
        />
      )}

      {/* ─── Mobile Slide-Down Drawer ─── */}
      {mobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-x-0 z-50 overflow-y-auto bg-[#004B87] text-white shadow-2xl rounded-b-2xl border-t border-sky-400/30 border-b border-sky-400/30 px-5 pt-1 pb-7 animate-in fade-in slide-in-from-top-2 duration-200'
          style={{
            top: headerHeight,
            maxHeight: `calc(100dvh - ${headerHeight}px)`,
          }}
          role='dialog'
          aria-modal='true'
          aria-label='Menu Navigasi Mobile'
        >
          {/* Header Internal Drawer */}
          <div className='py-2.5 border-b border-white/15 flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-sky-200'>
              STIKes Budi Luhur Cimahi
            </span>
            <span className='text-[11px] font-semibold text-[#fdc800] bg-white/10 px-2 py-0.5 rounded-full'>
              Website Utama
            </span>
          </div>

          {/* List Menu */}
          <div className='space-y-1 py-2'>
            <a
              href='#profil'
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]'
            >
              <Award className='w-4 h-4 text-sky-300 shrink-0' />
              <span>Profil Kampus</span>
            </a>
            <a
              href='#prodi'
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]'
            >
              <Heart className='w-4 h-4 text-rose-300 shrink-0' />
              <span>Program Studi</span>
            </a>
            <a
              href='#keunggulan'
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]'
            >
              <Award className='w-4 h-4 text-[#fdc800] shrink-0' />
              <span>Keunggulan Kampus</span>
            </a>
            <a
              href='#fasilitas'
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]'
            >
              <ExternalLink className='w-4 h-4 text-sky-200 shrink-0' />
              <span>Fasilitas & Layanan</span>
            </a>
            <a
              href='#apps'
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]'
            >
              <Grid className='w-4 h-4 text-[#fdc800] shrink-0' />
              <span>Portal Aplikasi Mandiri</span>
            </a>
            <a
              href='#faq'
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]'
            >
              <HelpCircle className='w-4 h-4 text-sky-200 shrink-0' />
              <span>Tanya Jawab (FAQ)</span>
            </a>
          </div>

          {/* Tombol Aksi */}
          <div className='pt-2 border-t border-white/15 space-y-2'>
            <a
              href='https://pmb.stikesbudiluhurcimahi.ac.id/'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => setMobileMenuOpen(false)}
              className='w-full btn-budi-primary text-center justify-center min-h-[44px]'
            >
              <span>Pendaftaran PMB Online</span>
            </a>
            <a
              href='#apps'
              onClick={() => setMobileMenuOpen(false)}
              className='w-full inline-flex items-center justify-center py-2.5 px-4 rounded-full border border-white/30 text-white font-semibold text-xs hover:bg-white/10 transition-colors min-h-[44px]'
            >
              <Grid className='w-4 h-4 mr-2 text-[#fdc800]' />
              <span>Buka Portal Aplikasi Mandiri</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};
