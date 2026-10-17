import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TT_DOSAGE_LIST, TTLevelInfo } from '@/src/shared/constants/domain.constants';

export interface ImmunityStatusBannerProps {
  currentDoseLevel?: number; // 0 to 5
  lastVaccinationDate?: string;
  nextAppointmentDate?: string;
  partnerName?: string;
}

export function ImmunityStatusBanner({
  currentDoseLevel = 2,
  lastVaccinationDate,
  nextAppointmentDate,
}: ImmunityStatusBannerProps) {
  // Index from 0 to 4 (e.g. currentDoseLevel = 2 -> TT2 at index 1)
  const safeIdx = Math.max(0, Math.min(currentDoseLevel - 1, TT_DOSAGE_LIST.length - 1));
  const activeLevelInfo: TTLevelInfo = TT_DOSAGE_LIST[safeIdx] || TT_DOSAGE_LIST[0];
  const isFullyProtected = currentDoseLevel >= 5;
  const nextLevelInfo: TTLevelInfo | null = currentDoseLevel < 5 ? TT_DOSAGE_LIST[currentDoseLevel] || null : null;

  return (
    <div className='w-full rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 sm:p-6 shadow-xl shadow-emerald-950/15 border border-emerald-600/30 relative overflow-hidden'>
      {/* Decorative ambient elements */}
      <div className='absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none' />
      <div className='absolute -left-10 -bottom-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none' />

      {/* Header Row */}
      <div className='relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-600/40'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner'>
            <ShieldCheck size={26} className='text-emerald-200' />
          </div>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-[10px] font-black uppercase tracking-wider bg-emerald-900/60 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-500/30'>
                Kemenkes RI • Standar TT Pranikah
              </span>
              <span className='text-xs font-semibold text-emerald-200'>
                {isFullyProtected ? 'Status T Lengkap' : `Tahap ${currentDoseLevel} dari 5 Dosis`}
              </span>
            </div>
            <h3 className='text-lg sm:text-xl font-bold tracking-tight text-white mt-1'>
              {isFullyProtected
                ? 'Perlindungan Seumur Hidup (>25 Th)'
                : `Status: ${activeLevelInfo.name} (${activeLevelInfo.protectionDuration})`}
            </h3>
          </div>
        </div>

        <Link
          to='/user/history'
          className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 shrink-0 self-start sm:self-auto cursor-pointer'
        >
          <span>Buku Riwayat TT</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 5-Dose Interactive Progress Step Tracker */}
      <div className='relative z-10 mt-5'>
        <div className='grid grid-cols-5 gap-1.5 sm:gap-2.5 mb-2'>
          {TT_DOSAGE_LIST.map((dose: TTLevelInfo, index: number) => {
            const doseNumber = index + 1;
            const isCompleted = doseNumber <= currentDoseLevel;
            const isCurrent = doseNumber === currentDoseLevel;
            const isNext = doseNumber === currentDoseLevel + 1;

            return (
              <div
                key={dose.level}
                className={`flex flex-col items-center p-2 sm:p-2.5 rounded-2xl transition-all border text-center ${
                  isCurrent
                    ? 'bg-amber-400/20 border-amber-300 text-amber-200 shadow-md ring-2 ring-amber-400/40'
                    : isCompleted
                      ? 'bg-white/15 border-emerald-400/30 text-white'
                      : isNext
                        ? 'bg-white/5 border-dashed border-white/30 text-emerald-200'
                        : 'bg-black/10 border-white/10 text-emerald-300/40 opacity-70'
                }`}
              >
                <div className='mb-1'>
                  {isCompleted ? (
                    <CheckCircle2 size={18} className='text-amber-300' />
                  ) : (
                    <Clock size={16} className='text-white/60' />
                  )}
                </div>
                <span className='text-xs font-black tracking-tight'>{dose.level}</span>
                <span className='text-[9px] sm:text-[10px] leading-tight truncate w-full mt-0.5 opacity-90'>
                  {dose.protectionDuration.split(' ')[0]} {dose.protectionDuration.split(' ')[1] || ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Track */}
        <div className='w-full h-1.5 bg-emerald-950/40 rounded-full overflow-hidden mt-1'>
          <div
            className='h-full bg-linear-to-r from-amber-400 to-emerald-300 rounded-full transition-all duration-700'
            style={{ width: `${Math.min(100, (currentDoseLevel / 5) * 100)}%` }}
          />
        </div>
      </div>

      {/* Informational Guidance Footer Banner */}
      <div className='relative z-10 mt-4 pt-3 border-t border-emerald-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-100'>
        <div className='flex items-center gap-2'>
          <Sparkles size={14} className='text-amber-300 shrink-0' />
          <span>
            {nextLevelInfo
              ? `Jadwal Dosis Berikutnya: ${nextLevelInfo.name} (${nextLevelInfo.interval})`
              : 'Selamat! Status imunisasi TT Anda telah lengkap untuk perlindungan seumur hidup.'}
          </span>
        </div>

        {nextAppointmentDate ? (
          <span className='text-amber-200 font-semibold text-[11px] bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-amber-400/30'>
            Janji Faskes: {nextAppointmentDate}
          </span>
        ) : lastVaccinationDate ? (
          <span className='text-emerald-200 text-[11px]'>Terakhir suntik: {lastVaccinationDate}</span>
        ) : null}
      </div>
    </div>
  );
}

export default ImmunityStatusBanner;
