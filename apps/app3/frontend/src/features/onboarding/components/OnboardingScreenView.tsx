import React from 'react';
import { OnboardingIllustration } from './OnboardingIllustration';
import { ShieldCheck } from 'lucide-react';

export interface OnboardingScreenViewProps {
  statusText?: string;
  fullScreen?: boolean;
}

export function OnboardingScreenView({
  statusText = 'Memuat aplikasi TEMANI...',
  fullScreen = true,
}: OnboardingScreenViewProps) {
  return (
    <div
      className={`relative w-full ${
        fullScreen ? 'h-[100dvh] max-h-[100dvh]' : 'h-full min-h-[420px]'
      } bg-gradient-to-b from-[#fafaf9] via-[#fff5f6] to-[#fafaf9] flex flex-col items-center justify-between p-6 sm:p-8 select-none overflow-hidden box-border`}
    >
      {/* Ambient soft background rose & sage orbs */}
      <div className='absolute top-1/4 -left-16 w-72 h-72 bg-[#ffd9de]/50 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-1/4 -right-16 w-80 h-80 bg-[#aff1d0]/25 rounded-full blur-3xl pointer-events-none' />

      <div className='shrink-0 w-full pt-safe h-6 sm:h-8' />

      <div className='flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto px-4 max-w-sm sm:max-w-md w-full animate-fade-in'>
        <div className='mb-5 sm:mb-6'>
          <OnboardingIllustration size={145} className='sm:w-[165px] sm:h-[165px]' />
        </div>

        <h1 className='text-3xl sm:text-4xl md:text-5xl font-black text-[#8c0f39] tracking-widest flex items-center justify-center gap-2 mb-2 uppercase'>
          <span>TEMANI</span>
        </h1>

        <div className='mb-2'>
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd9de] border border-[#ffb3c0] text-xs font-bold text-[#8c0f39] shadow-2xs'>
            <ShieldCheck size={13} className='text-[#aa294d]' />
            <span>Kesehatan Pranikah &amp; Imunisasi TT</span>
          </span>
        </div>

        <p className='text-xs sm:text-sm font-medium text-[#574144] tracking-wide max-w-xs sm:max-w-sm leading-relaxed mt-1'>
          Teknologi Edukasi Pranikah &amp; Pemantauan Imunisasi Tetanus
        </p>
      </div>

      <div className='shrink-0 w-full max-w-xs flex flex-col items-center gap-3 pb-safe pb-6 sm:pb-8 z-10'>
        <div className='flex items-center gap-2'>
          <span className='w-2.5 h-2.5 rounded-full bg-[#8c0f39] animate-bounce delay-0' />
          <span className='w-2.5 h-2.5 rounded-full bg-[#cb4364] animate-bounce delay-150' />
          <span className='w-2.5 h-2.5 rounded-full bg-[#2a6950] animate-bounce delay-300' />
        </div>
        <span className='text-xs text-[#574144] font-semibold tracking-wide'>{statusText}</span>
        <span className='text-[10px] text-[#64748b] tracking-wider uppercase font-medium mt-1 text-center'>
          Standar Pelayanan Calon Pengantin Kemenkes RI
        </span>
      </div>
    </div>
  );
}

export default OnboardingScreenView;
