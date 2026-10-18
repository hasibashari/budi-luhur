import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { TT_DOSAGE_LIST, TTLevelInfo } from '@/src/shared/constants/domain.constants';

export function TTIntervalGuideCard() {
  return (
    <Card padding='md' className='border-[#eff4ff] bg-white shadow-xs'>
      <div className='flex items-center gap-2.5 text-sm sm:text-base font-bold text-[#121c2a] mb-3'>
        <div className='w-8 h-8 rounded-xl bg-[#aff1d0] text-[#2a6950] flex items-center justify-center shrink-0 shadow-2xs'>
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] leading-tight'>
            Aturan Interval Dosis TT
          </h4>
          <span className='text-[10px] text-[#574144] font-normal'>
            Standar Resmi Kementerian Kesehatan RI
          </span>
        </div>
      </div>

      <div className='space-y-2 mb-3.5'>
        {TT_DOSAGE_LIST.map((dose: TTLevelInfo) => (
          <div
            key={dose.level}
            className='p-2.5 rounded-xl border border-[#eff4ff] bg-[#eff4ff]/40 flex items-start gap-2.5 text-xs transition-colors hover:bg-[#eff4ff]'
          >
            <span className='font-bold text-[#2a6950] bg-[#aff1d0] px-2 py-0.5 rounded-md shrink-0 text-[11px]'>
              {dose.level}
            </span>
            <div className='flex-1'>
              <div className='flex items-center justify-between gap-1'>
                <span className='font-bold text-[#121c2a] text-xs'>{dose.name.split(' (')[0]}</span>
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
      <div className='p-3 rounded-xl bg-[#ffd9de]/50 border border-[#ffd9de] text-[#8c0f39] text-xs flex items-start gap-2'>
        <Info size={15} className='text-[#aa294d] shrink-0 mt-0.5' />
        <p className='text-[11px] leading-relaxed'>
          <strong>Penting Bagi Catin:</strong> Dosis TT2 wajib diterima minimal{' '}
          <strong>30 hari sebelum akad nikah</strong> agar antibodi protektif terhadap bakteri{' '}
          <em>Clostridium tetani</em> telah matang untuk melindungi ibu dan calon bayi.
        </p>
      </div>
    </Card>
  );
}

export default TTIntervalGuideCard;
