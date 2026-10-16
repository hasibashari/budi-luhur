import React from 'react';
import { ArrowUpRight, Layers, ShieldCheck, Activity, Heart } from 'lucide-react';
import { APPS } from '../config/apps';

export const AppSelectorSection: React.FC = () => {
  return (
    <section
      id='apps'
      className='py-12 sm:py-16 lg:py-20 bg-slate-50 border-b border-slate-200 scroll-mt-16'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center max-w-2xl mx-auto mb-8 sm:mb-12'>
          <div className='inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] text-xs font-bold uppercase tracking-wider mb-3'>
            <Layers className='w-3.5 h-3.5 text-[#00A3E0]' />
            <span>Ekosistem Aplikasi Digital</span>
          </div>
          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#202020] tracking-tight'>
            Portal Ekosistem Aplikasi
          </h2>
          <div className='title-accent-blue' />
          <p className='mt-3 text-sm sm:text-base text-[#555555] leading-relaxed'>
            Akses langsung ke portal aplikasi mandiri terpadu untuk kelompok studi dan sekolah mitra binaan STIKes Budi Luhur Cimahi.
          </p>
        </div>

        {/* 3 Partner / App Suite Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8'>
          {APPS.map((app, index) => {
            const icons = [Layers, Activity, Heart];
            const AppIcon = icons[index % icons.length];

            return (
              <div
                key={app.id}
                className='card-academic p-5 sm:p-6 bg-white flex flex-col justify-between group hover:-translate-y-1 hover:border-[#005EB8] transition-all duration-300'
              >
                <div>
                  {/* Top Bar: Icon Brand & Status */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005EB8] group-hover:bg-[#005EB8] group-hover:text-white transition-colors duration-200'>
                      <AppIcon className='w-5 h-5' />
                    </div>
                    <span className='inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                      <span>Online</span>
                    </span>
                  </div>

                  {/* App Name & Peruntukan */}
                  <h3 className='text-lg sm:text-xl font-bold text-[#202020] group-hover:text-[#005EB8] transition-colors'>
                    {app.name}
                  </h3>
                  <p className='text-xs font-semibold text-[#00A3E0] mt-0.5 mb-2'>
                    {app.tagline}
                  </p>
                  <p className='text-xs text-[#666666] leading-relaxed line-clamp-2'>
                    {app.description}
                  </p>
                </div>

                {/* Single Direct Action Button */}
                <div className='pt-5 mt-4 border-t border-slate-100'>
                  <a
                    href={app.onboardingUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-[#005EB8] text-slate-700 hover:text-white font-semibold text-xs sm:text-sm transition-all duration-200 min-h-[44px]'
                  >
                    <span>Buka Portal Aplikasi</span>
                    <ArrowUpRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtle Bottom Trust Note */}
        <div className='mt-8 pt-6 border-t border-slate-200/60 text-center'>
          <p className='text-xs text-[#777777] inline-flex items-center gap-1.5'>
            <ShieldCheck className='w-4 h-4 text-emerald-600 inline shrink-0' />
            <span>Setiap aplikasi beroperasi dengan basis data mandiri dan sesi peramban terisolasi penuh.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
