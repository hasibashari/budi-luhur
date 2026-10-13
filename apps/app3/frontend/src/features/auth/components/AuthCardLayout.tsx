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
        <Link
          to='/'
          className='inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#1e293b] transition-all bg-slate-50 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs hover:border-slate-300'
        >
          <ArrowLeft size={14} />
          <span>Beranda</span>
        </Link>
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
      <div className='hidden md:flex md:w-[48%] lg:w-1/2 min-h-screen relative bg-[#fff5f7] overflow-hidden flex-col justify-center items-center p-8 lg:p-12'>
        {/* Layered Organic Background Shapes */}
        <div className='absolute top-1/2 right-[-15%] -translate-y-1/2 w-[130%] h-[130%] rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.1)_0%,rgba(251,113,133,0.05)_50%,transparent_75%)] pointer-events-none' />
        <div className='absolute top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full border border-rose-200/60 pointer-events-none' />
        <div className='absolute top-[10%] right-[-20%] w-[700px] h-[700px] rounded-full border border-dashed border-rose-300/40 pointer-events-none' />

        {/* Floating Medical Showcase Card */}
        <div className='relative z-10 w-full max-w-sm flex flex-col gap-5'>
          <div className='p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-100 shadow-2xl shadow-rose-950/5 relative'>
            {/* Header Device */}
            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e11d48] to-[#fb7185] text-white flex items-center justify-center shadow-md shadow-rose-500/25'>
                  <Heart size={20} className='fill-white' />
                </div>
                <div>
                  <h4 className='text-sm font-extrabold text-[#1e293b] leading-tight'>
                    FEMORY Sehat
                  </h4>
                  <span className='text-[11px] text-[#64748b] font-medium'>
                    Program Bebas Anemia Siswi
                  </span>
                </div>
              </div>

              <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                Aktif
              </div>
            </div>

            {/* Reminder Simulation */}
            <div className='p-3.5 rounded-2xl bg-[#fff5f7] border border-[#fce7f3] flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shrink-0'>
                  <Pill size={18} />
                </div>
                <div>
                  <h5 className='text-xs font-bold text-[#1e293b]'>Tablet Tambah Darah (TTD)</h5>
                  <div className='flex items-center gap-1 text-[11px] text-[#64748b] mt-0.5'>
                    <Clock size={11} />
                    <span>Sabtu • 20:00 WIB</span>
                  </div>
                </div>
              </div>
              <CheckCircle2 size={20} className='text-emerald-600 shrink-0' />
            </div>

            {/* Adherence Stat */}
            <div className='flex items-center justify-between pt-3 border-t border-[#fce7f3] text-xs'>
              <span className='text-[#64748b] font-semibold'>Kepatuhan Rutin:</span>
              <span className='font-extrabold text-emerald-600 text-sm'>100% Teratur</span>
            </div>
          </div>

          {/* Inspirational Description */}
          <div className='text-center px-3'>
            <h3 className='text-base font-extrabold text-[#1e293b] mb-1'>
              Konsentrasi Belajar Lebih Prima
            </h3>
            <p className='text-xs text-[#64748b] leading-relaxed'>
              Pantau jadwal suplementasi TTD, bangun streak kompak bersama sahabat, dan jaga kadar
              Hb tetap ideal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCardLayout;
