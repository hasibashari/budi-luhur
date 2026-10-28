import React from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  CalendarHeart,
  Syringe,
  HeartHandshake,
} from 'lucide-react';

export interface AuthCardLayoutProps {
  children: React.ReactNode;
}

export function AuthCardLayout({ children }: AuthCardLayoutProps) {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || '/';

  return (
    <div className='min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#fafaf9] relative overflow-x-hidden'>
      {/* SISI KIRI: Form Area (Compact & responsive across mobile, tablet, and laptop) */}
      <div className='w-full lg:w-1/2 xl:w-[48%] min-h-[100dvh] flex flex-col justify-between px-3.5 sm:px-6 md:px-8 lg:px-8 xl:px-12 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white relative z-10 box-border overflow-y-auto'>
        {/* Top Header Row: Navigation & Brand Micro-badge */}
        <div className='w-full max-w-[380px] sm:max-w-[400px] mx-auto flex items-center justify-between gap-2.5 pt-0.5 pb-2'>
          <a
            href={portalUrl}
            className='inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#64748b] hover:text-[#8c0f39] transition-all bg-slate-50 hover:bg-white min-h-[34px] sm:min-h-[36px] px-3 py-1 rounded-full border border-slate-200 shadow-2xs hover:border-[#ffd9de] active:scale-95'
            aria-label='Kembali ke Portal Budi Luhur'
          >
            <ArrowLeft size={13} className='shrink-0' />
            <span className='truncate'>Kembali ke Portal</span>
          </a>

          <div className='flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#8c0f39] bg-[#fff0f2] px-2.5 py-1 rounded-full border border-[#ffd9de]/70 shadow-2xs'>
            <span className='w-1.5 h-1.5 rounded-full bg-[#aa294d] animate-pulse' />
            <span className='tracking-wide uppercase'>TEMANI Catin</span>
          </div>
        </div>

        {/* Center: Main Auth Form Container */}
        <div className='w-full max-w-[380px] sm:max-w-[400px] mx-auto my-auto py-2 sm:py-3'>
          {children}
        </div>

        {/* Bottom: Minimalist Trust & Compliance Badge */}
        <div className='w-full max-w-[380px] sm:max-w-[400px] mx-auto pt-2.5 pb-1 border-t border-slate-100 flex items-center justify-center gap-1.5 text-center text-[#64748b]'>
          <ShieldCheck size={14} className='text-[#2a6950] shrink-0' />
          <span className='text-[10px] sm:text-[11px] font-medium leading-tight'>
            Standar Pemantauan Imunisasi &amp; Kesehatan Pranikah Kemenkes RI
          </span>
        </div>
      </div>

      {/* SISI KANAN: Visual Showcase Hero (Desktop & Laptop >= 1024px) */}
      <div className='hidden lg:flex lg:w-1/2 xl:w-[52%] min-h-[100dvh] relative bg-gradient-to-br from-[#fff5f6] via-[#fafaf9] to-[#f2f9f5] overflow-hidden flex-col justify-center items-center p-6 xl:p-10 select-none'>
        {/* Layered Organic Background Ambience */}
        <div className='absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(170,41,77,0.10)_0%,rgba(170,41,77,0.01)_60%,transparent_75%)] pointer-events-none' />
        <div className='absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(42,105,80,0.08)_0%,rgba(42,105,80,0.01)_60%,transparent_75%)] pointer-events-none' />
        <div className='absolute top-[16%] right-[-6%] w-72 h-72 rounded-full border border-[#ffd9de]/50 pointer-events-none' />
        <div className='absolute bottom-[12%] left-[-6%] w-80 h-80 rounded-full border border-dashed border-[#aff1d0]/40 pointer-events-none' />

        {/* Visual Showcase Content Container - Proportionate to laptop screens */}
        <div className='relative z-10 w-full max-w-[360px] xl:max-w-[390px] flex flex-col gap-4'>
          {/* Welcome Showcase Header */}
          <div>
            <h3 className='text-base sm:text-lg font-black text-[#121c2a] tracking-tight mb-1'>
              Selamat datang di Aplikasi TEMANI
            </h3>
            <p className='text-xs text-[#574144] leading-relaxed'>
              Persiapkan pernikahan yang sehat dan pantau imunisasi Tetanus Toksoid.
            </p>
          </div>

          {/* Main Card: Health & TT Tracker Simulation */}
          <div className='p-5 xl:p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-[#ffd9de] shadow-lg shadow-rose-950/5 relative transition-all'>
            {/* Card Header */}
            <div className='flex items-center justify-between mb-3.5 pb-3 border-b border-slate-100'>
              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-[#aa294d] to-[#cb4364] text-white flex items-center justify-center shadow-sm'>
                  <HeartHandshake size={18} className='text-white' />
                </div>
                <div>
                  <h4 className='text-xs sm:text-sm font-extrabold text-[#121c2a] leading-tight'>
                    TEMANI Catin Sehat
                  </h4>
                  <span className='text-[10px] sm:text-[11px] text-[#574144] font-medium'>
                    Pemantauan Imunisasi TT
                  </span>
                </div>
              </div>

              <div className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#2a6950] text-[10px] sm:text-xs font-bold border border-[#aff1d0]'>
                <CheckCircle2 size={12} className='text-[#2a6950]' />
                <span>Terverifikasi</span>
              </div>
            </div>

            {/* Dose Level Status Visual */}
            <div className='p-3 rounded-xl bg-[#fff0f2] border border-[#ffd9de] flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-white text-[#aa294d] flex items-center justify-center shadow-2xs border border-[#ffd9de]/80 shrink-0'>
                  <Syringe size={16} />
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <h5 className='text-[11px] sm:text-xs font-bold text-[#121c2a]'>
                      Status TT Pranikah
                    </h5>
                    <span className='text-[9px] font-bold text-[#8c0f39] bg-white px-1.5 py-0.5 rounded-full border border-[#ffd9de]'>
                      TT3 Lengkap
                    </span>
                  </div>
                  <p className='text-[10px] text-[#574144] mt-0.5'>
                    Perlindungan aktif 5 tahun bagi calon ibu &amp; bayi
                  </p>
                </div>
              </div>
            </div>

            {/* 5-Dose Progress Track */}
            <div className='mb-3 px-0.5'>
              <div className='flex items-center justify-between text-[10px] font-bold text-[#574144] mb-1.5'>
                <span>Tahapan Dosis TT</span>
                <span className='text-[#2a6950] font-black'>Dosis 3 dari 5</span>
              </div>
              <div className='grid grid-cols-5 gap-1'>
                <div className='h-1.5 rounded-full bg-[#2a6950]' title='TT1 Selesai' />
                <div className='h-1.5 rounded-full bg-[#2a6950]' title='TT2 Selesai' />
                <div className='h-1.5 rounded-full bg-[#2a6950]' title='TT3 Aktif' />
                <div className='h-1.5 rounded-full bg-[#ffd9de]' title='TT4 Berikutnya' />
                <div className='h-1.5 rounded-full bg-slate-200' title='TT5 Mendatang' />
              </div>
            </div>

            {/* Wedding Readiness Bar */}
            <div className='flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]'>
              <span className='text-[#574144] font-semibold flex items-center gap-1'>
                <CalendarHeart size={13} className='text-[#aa294d]' />
                <span>Dokumen Akad:</span>
              </span>
              <span className='font-bold text-[#2a6950] text-[10px] sm:text-[11px] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#aff1d0]'>
                Siap Diverifikasi
              </span>
            </div>
          </div>

          {/* Inspirational Description */}
          <div className='text-center px-2'>
            <p className='text-[11px] sm:text-xs text-[#574144] leading-relaxed'>
              Pantau jadwal imunisasi Tetanus Toxoid, catat status kesehatan pranikah, dan dapatkan
              sertifikat verifikasi digital terstandar Kemenkes RI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCardLayout;
