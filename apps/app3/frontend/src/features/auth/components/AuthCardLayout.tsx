import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, Clock, CalendarHeart, Syringe } from 'lucide-react';

export interface AuthCardLayoutProps {
  children: React.ReactNode;
}

export function AuthCardLayout({ children }: AuthCardLayoutProps) {
  return (
    <div className='min-h-screen w-full flex bg-white relative overflow-hidden'>
      {/* Top Left Home Navigation */}
      <div className='absolute top-4 sm:top-6 left-4 sm:left-8 z-20 flex items-center gap-2'>
        <a
          href={import.meta.env.VITE_PORTAL_URL || 'http://localhost:5170'}
          className='inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-all bg-slate-50 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs hover:border-slate-300'
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Portal</span>
        </a>
      </div>

      {/* SISI KIRI: Form Area */}
      <div className='w-full md:w-[52%] lg:w-1/2 min-h-screen flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 py-16 relative z-10 box-border'>
        <div className='w-full max-w-md my-auto'>
          {children}

          {/* Minimalist Trust & Privacy Footer */}
          <div className='flex items-center justify-center gap-1.5 mt-8 text-center text-[#64748b]'>
            <ShieldCheck size={16} className='text-emerald-600 shrink-0' />
            <span className='text-xs font-medium'>
              Privasi rekam imunisasi terproteksi standar Kementerian Kesehatan RI
            </span>
          </div>
        </div>
      </div>

      {/* SISI KANAN: Visual Showcase Banner (Desktop & Tablet >= md) */}
      <div className='hidden md:flex md:w-[48%] lg:w-1/2 min-h-screen relative bg-[#fafaf9] overflow-hidden flex-col justify-center items-center p-8 lg:p-12'>
        {/* Layered Organic Background Shapes */}
        <div className='absolute top-1/2 right-[-15%] -translate-y-1/2 w-[130%] h-[130%] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,rgba(217,119,6,0.05)_50%,transparent_75%)] pointer-events-none' />
        <div className='absolute top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full border border-emerald-200/50 pointer-events-none' />
        <div className='absolute top-[10%] right-[-20%] w-[700px] h-[700px] rounded-full border border-dashed border-amber-300/30 pointer-events-none' />

        {/* Floating Medical Showcase Card */}
        <div className='relative z-10 w-full max-w-sm flex flex-col gap-5'>
          <div className='p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#e2e8f0] shadow-2xl shadow-emerald-950/5 relative'>
            {/* Header Device */}
            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-700/20'>
                  <ShieldCheck size={22} className='text-white' />
                </div>
                <div>
                  <h4 className='text-sm font-extrabold text-[#0f172a] leading-tight'>
                    PRELUNA Catin
                  </h4>
                  <span className='text-[11px] text-[#64748b] font-medium'>
                    Kesehatan Pranikah & TT
                  </span>
                </div>
              </div>

              <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse' />
                Terlindungi
              </div>
            </div>

            {/* Vaccine Dose Status Simulation */}
            <div className='p-3.5 rounded-2xl bg-[#ecfdf5]/60 border border-emerald-100 flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0'>
                  <Syringe size={18} />
                </div>
                <div>
                  <h5 className='text-xs font-bold text-[#0f172a]'>Imunisasi TT Dosis 2</h5>
                  <div className='flex items-center gap-1 text-[11px] text-[#64748b] mt-0.5'>
                    <CheckCircle2 size={11} className='text-emerald-600' />
                    <span>Perlindungan Aktif 3 Tahun</span>
                  </div>
                </div>
              </div>
              <span className='text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200'>
                Kemenkes RI
              </span>
            </div>

            {/* Wedding Countdown Info */}
            <div className='flex items-center justify-between pt-3 border-t border-slate-100 text-xs'>
              <span className='text-[#64748b] font-semibold flex items-center gap-1'>
                <CalendarHeart size={13} className='text-amber-600' />
                <span>Kesiapan Akad Nikah:</span>
              </span>
              <span className='font-extrabold text-emerald-700 text-sm'>Lengkap & Siap</span>
            </div>
          </div>

          {/* Inspirational Description */}
          <div className='text-center px-3'>
            <h3 className='text-base font-extrabold text-[#0f172a] mb-1'>
              Langkah Suci Menuju Keluarga Bahagia
            </h3>
            <p className='text-xs text-[#64748b] leading-relaxed'>
              Pantau jadwal imunisasi Tetanus Toxoid, simpan e-sertifikat kesehatan nikah, dan dapatkan bimbingan kesehatan reproduksi terpercaya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCardLayout;
