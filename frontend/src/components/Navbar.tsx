import React from 'react';
import {
  Phone,
  Mail,
  ExternalLink,
  Globe,
} from 'lucide-react';

export const Navbar: React.FC = () => {

  return (
    <>
      <header className='fixed top-0 inset-x-0 z-50 w-full shadow-xs'>
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

              {/* Mobile Quick Action Button */}
              <div className='lg:hidden flex items-center'>
                <a
                  href='https://pmb.stikesbudiluhurcimahi.ac.id/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs font-bold text-[#004B87] bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors inline-flex items-center gap-1.5'
                >
                  <span>PMB Online</span>
                  <ExternalLink className='w-3 h-3 text-[#005EB8]' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
