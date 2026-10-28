import { ShieldCheck, Info } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { TT_DOSAGE_LIST, TTLevelInfo } from '@/src/shared/constants/domain.constants';

export function TTIntervalGuideCard() {
  return (
    <Card padding='md' className='border-[#eff4ff] bg-white shadow-xs transition-all'>
      {/* Header */}
      <div className='w-full'>
        <div className='w-full flex items-center justify-between gap-2.5 text-left min-h-[44px]'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-9 h-9 rounded-xl bg-[#aff1d0] text-[#2a6950] flex items-center justify-center shrink-0 shadow-2xs'>
              <ShieldCheck size={20} />
            </div>
            <div className='min-w-0'>
              <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] leading-tight truncate'>
                Aturan Interval Dosis TT
              </h4>
              <span className='text-[10px] sm:text-[11px] text-[#574144] font-normal block truncate'>
                Standar Pelayanan Imunisasi Pranikah
              </span>
            </div>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            <span className='text-[11px] font-bold text-[#2a6950] bg-[#aff1d0]/70 px-3 py-1 rounded-full'>
              5 Tahap Imunisasi Lengkap
            </span>
          </div>
        </div>
      </div>

      {/* Content is always visible so users can review all dosage intervals immediately. */}
      <div className='space-y-3.5 mt-3.5 pt-3.5 border-t border-[#eff4ff] animate-fade-in'>
        <div className='grid grid-cols-1 gap-2.5 sm:gap-3'>
          {TT_DOSAGE_LIST.map((dose: TTLevelInfo, idx: number) => (
            <div
              key={dose.level}
              className={`p-3 rounded-xl border border-[#eff4ff] bg-[#eff4ff]/40 flex items-start gap-2.5 text-xs transition-colors hover:bg-[#eff4ff] ${
                idx === 4 ? 'bg-gradient-to-r from-[#eff4ff]/60 to-[#ffd9de]/30' : ''
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
                <p className='text-[10px] text-[#8b7074] mt-0.5 italic'>{dose.recommendation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Crucial Note for Catin */}
        <div className='p-3 sm:p-3.5 rounded-xl bg-[#ffd9de]/50 border border-[#ffd9de] text-[#8c0f39] text-xs flex items-start gap-2.5'>
          <Info size={16} className='text-[#aa294d] shrink-0 mt-0.5' />
          <p className='text-[11px] leading-relaxed'>
            <strong>Pengingat Imunisasi:</strong> Sesuaikan jadwal imunisasi Tetanus Toksoid (TT)
            selanjutnya sesuai interval yang di anjurkan. Pastikan jadwal imunisasimu tercatat agar
            tidak terlewat.
          </p>
        </div>
        <p className='text-[10px] text-[#8b7074] italic'>Sumber: Pedoman Imunisasi Terpadu</p>
      </div>
    </Card>
  );
}

export default TTIntervalGuideCard;
