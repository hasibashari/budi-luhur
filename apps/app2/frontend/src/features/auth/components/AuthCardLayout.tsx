import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Heart, CheckCircle2, Clock, Pill } from 'lucide-react';

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
          className='inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#1e293b] transition-all bg-slate-50 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs hover:border-slate-300'
        >
          <ArrowLeft size={14} />
          <span>Beranda</span>
        </a>
      </div>

      {/* SISI KIRI: Form Area */}
      <div className='w-full md:w-[52%] lg:w-1/2 min-h-screen flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 py-16 relative z-10 box-border'>
        <div className='w-full max-w-md my-auto'>
          {children}

          {/* Minimalist Trust & Privacy Footer */}
          <div className='flex items-center justify-center gap-1.5 mt-8 text-center text-[#64748b]'>
            <ShieldCheck size={16} className='text-emerald-500 shrink-0' />
            <span className='text-xs font-medium'>
              Privasi & rekam kesehatan terproteksi standar keamanan
            </span>
          </div>
        </div>
      </div>

      {/* SISI KANAN: Visual Showcase Banner (Desktop & Tablet >= md) */}
      <div className='hidden md:flex md:w-[48%] lg:w-1/2 min-h-screen relative bg-[#F8FAFC] overflow-hidden flex-col justify-center items-center p-8 lg:p-12'>
        {/* Layered Organic Background Shapes */}
        <div className='absolute top-1/2 right-[-15%] -translate-y-1/2 w-[130%] h-[130%] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.1)_0%,rgba(20,184,166,0.05)_50%,transparent_75%)] pointer-events-none' />
        <div className='absolute top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full border border-[#E2E8F0] pointer-events-none' />
        <div className='absolute top-[10%] right-[-20%] w-[700px] h-[700px] rounded-full border border-dashed border-[#CCFBF1] pointer-events-none' />

        {/* Floating Medical Showcase Card */}
        <div className='relative z-10 w-full max-w-sm flex flex-col gap-5'>
          <div className='p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-xl shadow-[#0D9488]/10 relative'>
            {/* Header Device */}
            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white flex items-center justify-center shadow-md shadow-[#0D9488]/25'>
                  <Pill size={20} className='rotate-45' />
                </div>
                <div>
                  <h4 className='text-sm font-extrabold text-[#0F172A] leading-tight'>
                    Pilluna KB
                  </h4>
                  <span className='text-[11px] text-[#334155] font-medium'>
                    Sahabat Setia Minum Pil KB
                  </span>
                </div>
              </div>

              <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold border border-[#0D9488]/20'>
                <span className='w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse' />
                Terproteksi 99%
              </div>
            </div>

            {/* Reminder Simulation */}
            <div className='p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-white text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center shrink-0 shadow-2xs'>
                  <Clock size={18} />
                </div>
                <div>
                  <h5 className='text-xs font-bold text-[#0F172A]'>Pil KB Harian (Fase Aktif)</h5>
                  <div className='flex items-center gap-1 text-[11px] text-[#334155] mt-0.5'>
                    <span>Setiap Hari • 20:00 WIB</span>
                  </div>
                </div>
              </div>
              <CheckCircle2 size={20} className='text-[#0D9488] shrink-0' />
            </div>

            {/* Adherence Stat */}
            <div className='flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs'>
              <span className='text-[#334155] font-semibold'>Tingkat Kepatuhan:</span>
              <span className='font-extrabold text-[#0D9488] text-sm'>100% Terlindungi</span>
            </div>
          </div>

          {/* Description */}
          <div className='text-center px-3'>
            <h3 className='text-base font-extrabold text-[#0F172A] mb-1'>
              Disiplin Minum Pil, Bebas Khawatir
            </h3>
            <p className='text-xs text-[#334155] leading-relaxed'>
              Pengingat cerdas harian, pelacak siklus pil kontrasepsi, serta panduan SADARI untuk deteksi dini kesehatan payudara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCardLayout;
