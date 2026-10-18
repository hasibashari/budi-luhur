import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { TT_DOSAGE_LIST, TTLevelInfo } from '@/src/shared/constants/domain.constants';

export interface TTIntervalGuideCardProps {
  defaultOpenMobile?: boolean;
}

export function TTIntervalGuideCard({ defaultOpenMobile = false }: TTIntervalGuideCardProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(defaultOpenMobile);

  return (
    <Card padding='md' className='border-[#eff4ff] bg-white shadow-xs transition-all'>
      {/* Header: Clickable toggle on Mobile (< md), Static Header on Desktop (>= md) */}
      <div className='w-full'>
        <button
          type='button'
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          aria-expanded={isOpenMobile}
          className='w-full md:pointer-events-none flex items-center justify-between gap-2.5 text-left cursor-pointer md:cursor-default group focus:outline-none min-h-[44px]'
        >
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-9 h-9 rounded-xl bg-[#aff1d0] text-[#2a6950] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 md:group-hover:scale-100 transition-transform'>
              <ShieldCheck size={20} />
            </div>
            <div className='min-w-0'>
              <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] md:group-hover:text-[#121c2a] transition-colors leading-tight truncate'>
                Aturan Interval Dosis TT
              </h4>
              <span className='text-[10px] sm:text-[11px] text-[#574144] font-normal block truncate'>
                Standar Resmi Kementerian Kesehatan RI
              </span>
            </div>
          </div>

          {/* Mobile Only: Toggle Badge & Chevron (< md) */}
          <div className='flex md:hidden items-center gap-2 shrink-0'>
            <span className='text-[10px] font-bold text-[#aa294d] bg-[#ffd9de]/70 px-2.5 py-0.5 rounded-full'>
              {isOpenMobile ? 'Sembunyikan' : 'Lihat 5 Dosis'}
            </span>
            <div
              className={`p-1.5 rounded-full text-[#8b7074] group-hover:text-[#aa294d] group-hover:bg-[#ffd9de]/40 transition-transform duration-200 ${
                isOpenMobile ? 'rotate-180 text-[#aa294d]' : ''
              }`}
            >
              <ChevronDown size={18} />
            </div>
          </div>

          {/* Desktop Only: Badge Status (>= md) */}
          <div className='hidden md:flex items-center gap-1.5 shrink-0'>
            <span className='text-[11px] font-bold text-[#2a6950] bg-[#aff1d0]/70 px-3 py-1 rounded-full'>
              5 Tahap Imunisasi Lengkap
            </span>
          </div>
        </button>
      </div>

      {/* Content:
          - Mobile (< md): Dikontrol oleh state isOpenMobile (accordion)
          - Desktop (>= md): Selalu tampil permanen (expanded)
      */}
      <div
        className={`space-y-3.5 mt-3.5 pt-3.5 border-t border-[#eff4ff] ${
          isOpenMobile ? 'block' : 'hidden md:block'
        } animate-fade-in`}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3'>
          {TT_DOSAGE_LIST.map((dose: TTLevelInfo, idx: number) => (
            <div
              key={dose.level}
              className={`p-3 rounded-xl border border-[#eff4ff] bg-[#eff4ff]/40 flex items-start gap-2.5 text-xs transition-colors hover:bg-[#eff4ff] ${
                idx === 4 ? 'md:col-span-2 bg-gradient-to-r from-[#eff4ff]/60 to-[#ffd9de]/30' : ''
              }`}
            >
              <span className='font-bold text-[#2a6950] bg-[#aff1d0] px-2 py-0.5 rounded-md shrink-0 text-[11px]'>
                {dose.level}
              </span>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between gap-1'>
                  <span className='font-bold text-[#121c2a] text-xs truncate'>
                    {dose.name.split(' (')[0]}
                  </span>
                  <span className='text-[10px] font-semibold text-[#aa294d] shrink-0'>
                    {dose.protectionDuration.split(' (')[0]}
                  </span>
                </div>
                <p className='text-[11px] text-[#574144] mt-0.5 leading-snug'>
                  <strong>Interval:</strong> {dose.interval}
                </p>
                <p className='text-[10px] text-[#8b7074] mt-0.5 italic'>
                  {dose.kemenkesRecommendation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Crucial Note for Catin */}
        <div className='p-3 sm:p-3.5 rounded-xl bg-[#ffd9de]/50 border border-[#ffd9de] text-[#8c0f39] text-xs flex items-start gap-2.5'>
          <Info size={16} className='text-[#aa294d] shrink-0 mt-0.5' />
          <p className='text-[11px] leading-relaxed'>
            <strong>Penting Bagi Catin:</strong> Dosis TT2 wajib diterima minimal{' '}
            <strong>30 hari sebelum akad nikah</strong> agar antibodi protektif terhadap bakteri{' '}
            <em>Clostridium tetani</em> telah matang untuk melindungi ibu dan calon bayi.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default TTIntervalGuideCard;
