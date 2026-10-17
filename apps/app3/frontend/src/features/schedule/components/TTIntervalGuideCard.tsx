import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { TT_DOSAGE_LIST, TTLevelInfo } from '@/src/shared/constants/domain.constants';

export function TTIntervalGuideCard() {
  return (
    <Card padding='md' className='border-stone-200'>
      <div className='flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 mb-3'>
        <div className='w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100'>
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-slate-900 leading-tight'>
            Aturan Interval Dosis TT
          </h4>
          <span className='text-[10px] text-slate-500 font-normal'>Standar Resmi Kementerian Kesehatan RI</span>
        </div>
      </div>

      <div className='space-y-2.5 mb-4'>
        {TT_DOSAGE_LIST.map((dose: TTLevelInfo, idx: number) => (
          <div
            key={dose.level}
            className='p-2.5 rounded-xl border border-stone-100 bg-stone-50/60 flex items-start gap-2.5 text-xs'
          >
            <span className='font-black text-emerald-800 bg-emerald-100/70 border border-emerald-200/60 px-2 py-0.5 rounded-md shrink-0 text-[11px]'>
              {dose.level}
            </span>
            <div className='flex-1'>
              <div className='flex items-center justify-between gap-1'>
                <span className='font-bold text-slate-900 text-xs'>{dose.name.split(' (')[0]}</span>
                <span className='text-[10px] font-semibold text-emerald-700 shrink-0'>
                  {dose.protectionDuration.split(' (')[0]}
                </span>
              </div>
              <p className='text-[11px] text-slate-600 mt-0.5 leading-relaxed'>
                <strong>Interval:</strong> {dose.interval}
              </p>
              <p className='text-[10px] text-slate-500 mt-0.5 italic'>
                {dose.kemenkesRecommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Crucial Note for Catin */}
      <div className='p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2'>
        <Info size={15} className='text-amber-700 shrink-0 mt-0.5' />
        <p className='text-[11px] leading-relaxed'>
          <strong>Penting Bagi Catin:</strong> Dosis TT2 wajib diterima minimal <strong>30 hari sebelum akad nikah</strong> agar antibodi protektif terhadap bakteri <em>Clostridium tetani</em> telah matang untuk melindungi ibu dan calon bayi.
        </p>
      </div>
    </Card>
  );
}

export default TTIntervalGuideCard;
