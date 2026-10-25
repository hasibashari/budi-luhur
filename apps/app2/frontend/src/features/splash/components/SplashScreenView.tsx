import React from 'react';
import { SplashIllustration } from './SplashIllustration';

export interface SplashScreenViewProps {
  statusText?: string;
  fullScreen?: boolean;
}

export function SplashScreenView({
  statusText = 'Memuat aplikasi...',
  fullScreen = true,
}: SplashScreenViewProps) {
  return (
    <div
      className={`relative w-full ${
        fullScreen ? 'h-[100dvh] max-h-[100dvh]' : 'h-full min-h-[420px]'
      } bg-gradient-to-b from-[#F8FAFC] via-[#F0FDFA]/60 to-[#F8FAFC] flex flex-col items-center justify-between p-6 sm:p-8 md:p-10 select-none overflow-hidden box-border`}
    >
      <div className='absolute top-1/4 -left-20 w-72 h-72 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-1/4 -right-20 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none' />

      <div className='shrink-0 w-full pt-safe h-6 sm:h-8' />

      <div className='flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto px-4 max-w-sm sm:max-w-md w-full animate-fade-in'>
        <div className='mb-5 sm:mb-6'>
          <SplashIllustration size={135} className='sm:w-[155px] sm:h-[155px]' />
        </div>

        <h1 className='text-3xl sm:text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight flex items-center justify-center gap-2 mb-2'>
          <span>Pilluna</span>
        </h1>

        <p className='text-sm sm:text-base font-semibold text-[#0D9488] tracking-wide max-w-xs sm:max-w-sm leading-snug'>
          Sahabat Setia Minum Pil KB
        </p>
      </div>

      <div className='shrink-0 w-full max-w-xs flex flex-col items-center gap-2.5 pb-safe pb-6 sm:pb-8'>
        <div className='flex items-center gap-2'>
          <span className='w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-bounce delay-0' />
          <span className='w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-bounce delay-150' />
          <span className='w-2.5 h-2.5 rounded-full bg-[#F97316] animate-bounce delay-300' />
        </div>
        <span className='text-xs text-[#64748B] font-medium tracking-wide'>
          {statusText}
        </span>
      </div>
    </div>
  );
}

export default SplashScreenView;
