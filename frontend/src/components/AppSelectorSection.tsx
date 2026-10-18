import React from 'react';
import { ArrowRight, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { APPS } from '../config/apps';
import { AppLogo } from './AppLogo';

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
            Akses langsung ke portal aplikasi mandiri terpadu untuk kelompok studi dan sekolah mitra
            binaan STIKes Budi Luhur Cimahi.
          </p>
        </div>

        {/* 3 Partner / App Suite Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8'>
          {APPS.map(app => {
            return (
              <div
                key={app.id}
                className='card-academic p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300'
                style={{
                  borderTop: `4px solid ${app.colorScheme.accentHex}`,
                }}
              >
                <div>
                  {/* Top Bar: Official App Logo & Status */}
                  <div className='flex items-center justify-between mb-4'>
                    <AppLogo
                      type={app.logoType}
                      size={48}
                      className='group-hover:scale-105 transition-transform duration-300'
                    />
                    <span className='inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                      <span>Online PWA</span>
                    </span>
                  </div>

                  {/* App Name & Peruntukan */}
                  <div className='mb-2'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-xl sm:text-2xl font-black tracking-tight text-[#202020] transition-colors'>
                        {app.name}
                      </h3>
                      <span
                        className='text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider'
                        style={{
                          backgroundColor: `${app.colorScheme.accentHex}15`,
                          color: app.colorScheme.accentHex,
                        }}
                      >
                        {app.id.toUpperCase()}
                      </span>
                    </div>
                    <p
                      className='text-xs font-semibold mt-1 mb-2.5'
                      style={{ color: app.colorScheme.accentHex }}
                    >
                      {app.tagline}
                    </p>
                  </div>

                  <p className='text-xs text-[#666666] leading-relaxed line-clamp-3 mb-4'>
                    {app.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className='space-y-1.5 pt-3 border-t border-slate-100'>
                    {app.features.slice(0, 2).map((feature, fIndex) => (
                      <div
                        key={fIndex}
                        className='flex items-center text-[11px] text-[#555555] gap-1.5'
                      >
                        <CheckCircle2
                          className='w-3.5 h-3.5 shrink-0'
                          style={{ color: app.colorScheme.accentHex }}
                        />
                        <span className='truncate'>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Single Direct Action Button without target='_blank' */}
                <div className='pt-5 mt-4 border-t border-slate-100'>
                  <a
                    href={app.onboardingUrl}
                    className='w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all duration-200 shadow-xs hover:shadow-md min-h-[44px]'
                    style={{
                      backgroundColor: app.colorScheme.accentHex,
                    }}
                  >
                    <span>Buka Portal {app.name}</span>
                    <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
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
            <span>
              Setiap aplikasi beroperasi dengan basis data mandiri dan sesi peramban terisolasi
              penuh.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
