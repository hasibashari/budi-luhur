import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';
import { APPS } from '../config/apps';
import { AppLogo } from './AppLogo';

export const AppSelectorSection: React.FC = () => {
  return (
    <section
      id='apps'
      className='py-8 sm:py-14 lg:py-16 bg-slate-50 border-b border-slate-200 scroll-mt-16'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center max-w-2xl mx-auto mb-6 sm:mb-10'>
          <div className='inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] text-xs font-bold uppercase tracking-wider mb-2.5'>
            <Layers className='w-3.5 h-3.5 text-[#00A3E0]' />
            <span>Ekosistem Aplikasi Digital</span>
          </div>
          <h2 className='text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#202020] tracking-tight'>
            Portal Ekosistem Aplikasi
          </h2>
          <div className='title-accent-blue' />
          <p className='mt-2.5 text-xs sm:text-base text-[#555555] leading-relaxed'>
            Aplikasi mandiri terpadu STIKes Budi Luhur Cimahi.
          </p>
        </div>

        {/* ─── Minimalist Logo Dock (Responsive for Mobile, Tablet & Desktop) ─── */}
        <div className='flex justify-center items-start gap-3.5 sm:gap-8 lg:gap-14 pb-2 pt-1'>
          {APPS.map(app => {
            return (
              <a
                key={app.id}
                href={app.onboardingUrl}
                className='group flex flex-col items-center cursor-pointer transition-all duration-300 w-24 sm:w-28 lg:w-32 text-center'
                aria-label={`Buka Portal ${app.name}`}
              >
                {/* Logo Icon Card */}
                <div
                  className='w-18 h-18 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 bg-white border border-slate-200/90 shadow-2xs sm:shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-active:scale-95 relative'
                  style={{
                    boxShadow: `0 4px 16px ${app.colorScheme.accentHex}18`,
                  }}
                >
                  {/* Desktop Logo */}
                  <AppLogo
                    type={app.logoType}
                    size={56}
                    className='transition-transform duration-300 group-hover:scale-105 hidden sm:flex'
                  />
                  {/* Mobile Logo */}
                  <AppLogo
                    type={app.logoType}
                    size={38}
                    className='transition-transform duration-300 group-hover:scale-105 sm:hidden'
                  />

                  {/* Accent Ring on Hover */}
                  <div
                    className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
                    style={{
                      border: `2px solid ${app.colorScheme.accentHex}`,
                    }}
                  />
                </div>

                {/* App Label under Logo */}
                <div className='mt-2 select-none w-full'>
                  <span className='font-black text-xs sm:text-sm lg:text-base text-[#202020] block tracking-tight group-hover:text-[#005EB8] transition-colors truncate'>
                    {app.name}
                  </span>
                  <p
                    className='text-[10px] sm:text-[11px] font-semibold mt-0.5 line-clamp-1'
                    style={{ color: app.colorScheme.accentHex }}
                  >
                    {app.shortTagline || app.tagline}
                  </p>
                  <div className='inline-flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] text-emerald-600 font-semibold'>
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                    <span>PWA Online</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Subtle Bottom Trust Note */}
        <div className='mt-6 pt-5 border-t border-slate-200/60 text-center'>
          <p className='text-[11px] sm:text-xs text-[#777777] inline-flex items-center gap-1.5'>
            <ShieldCheck className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 inline shrink-0' />
            <span>Aplikasi beroperasi dengan basis data mandiri.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
