'use client';

import React from 'react';
import { Flame, Activity, HeartPulse } from 'lucide-react';

export function getHbStatusInfo(hb?: number | null) {
  if (hb === undefined || hb === null || Number.isNaN(hb) || hb <= 0) {
    return {
      text: 'Belum Tes',
      color: 'bg-slate-100 text-slate-600',
      iconBgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
      subtitle: 'Isi hasil tes lab di profil',
    };
  }

  if (hb < 8.0) {
    return {
      text: 'Anemia Berat',
      color: 'bg-rose-100 text-rose-700',
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      subtitle: 'Kadar Hb sangat rendah (< 8.0 g/dL)',
    };
  }

  if (hb < 11.0) {
    return {
      text: 'Anemia Sedang',
      color: 'bg-rose-100 text-rose-700',
      iconBgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      subtitle: 'Kadar Hb rendah (8.0 – 10.9 g/dL)',
    };
  }

  if (hb < 12.0) {
    return {
      text: 'Anemia Ringan',
      color: 'bg-amber-100 text-amber-700',
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      subtitle: 'Mendekati normal (11.0 – 11.9 g/dL)',
    };
  }

  if (hb > 15.5) {
    return {
      text: 'Tinggi',
      color: 'bg-orange-100 text-orange-700',
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      subtitle: 'Di atas batas normal (> 15.5 g/dL)',
    };
  }

  return {
    text: 'Normal',
    color: 'bg-emerald-100 text-emerald-700',
    iconBgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    subtitle: 'Standar normal optimal (12.0 – 15.5 g/dL)',
  };
}

export interface ProfileHealthStripProps {
  streakCount: number;
  hbLevel?: number | null;
  riskLevel?: string | null;
  title?: string;
  badgeLabel?: string;
}

export function ProfileHealthStrip({
  streakCount,
  hbLevel,
  riskLevel,
  title = 'Kesehatan & Rutinitas TTD',
  badgeLabel = 'Kondisi Terkini',
}: ProfileHealthStripProps) {
  const hbStatus = getHbStatusInfo(hbLevel);

  return (
    <div>
      <div className='px-2 mb-1.5 flex items-center justify-between'>
        <h2 className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>{title}</h2>
        {badgeLabel && (
          <span className='text-[10px] font-semibold text-rose-500'>{badgeLabel}</span>
        )}
      </div>

      <div className='rounded-2xl sm:rounded-3xl bg-white border border-rose-100/90 shadow-2xs p-3 sm:p-5'>
        <div className='grid grid-cols-3 divide-x divide-slate-100 text-center'>
          {/* Metric 1: Streak Pekan */}
          <div className='px-1 sm:px-4 py-0.5 sm:py-2 flex flex-col items-center justify-between min-h-[105px] sm:min-h-[120px]'>
            <div className='flex flex-col items-center'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-1 sm:mb-1.5'>
                <Flame size={16} className='sm:w-5 sm:h-5' />
              </div>
              <span className='text-[11px] sm:text-xs font-semibold text-slate-400 leading-tight'>
                Streak
              </span>
              <span className='text-sm sm:text-xl font-black text-slate-800 tracking-tight mt-0.5'>
                {streakCount} Pekan
              </span>
            </div>
            <div className='mt-1.5'>
              <span
                className={`inline-block text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full ${
                  streakCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {streakCount > 0 ? 'Konsisten' : 'Mulai Sekarang'}
              </span>
              <p className='text-[9px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block'>
                Konsumsi mingguan
              </p>
            </div>
          </div>

          {/* Metric 2: Kadar Hb */}
          <div className='px-1 sm:px-4 py-0.5 sm:py-2 flex flex-col items-center justify-between min-h-[105px] sm:min-h-[120px]'>
            <div className='flex flex-col items-center'>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-1.5 ${hbStatus.iconBgColor} ${hbStatus.iconColor}`}
              >
                <Activity size={16} className='sm:w-5 sm:h-5' />
              </div>
              <span className='text-[11px] sm:text-xs font-semibold text-slate-400 leading-tight'>
                Kadar Hb
              </span>
              <span className='text-sm sm:text-xl font-black text-slate-800 tracking-tight mt-0.5'>
                {hbLevel ? `${hbLevel} g/dL` : 'Belum Diisi'}
              </span>
            </div>
            <div className='mt-1.5 flex flex-col items-center'>
              <span
                className={`inline-block text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full ${hbStatus.color}`}
              >
                {hbStatus.text}
              </span>
              <span className='text-[9px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-1 max-w-[100px] sm:max-w-none'>
                {hbStatus.subtitle}
              </span>
            </div>
          </div>

          {/* Metric 3: Risiko Anemia */}
          <div className='px-1 sm:px-4 py-0.5 sm:py-2 flex flex-col items-center justify-between min-h-[105px] sm:min-h-[120px]'>
            <div className='flex flex-col items-center'>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-1.5 ${
                  riskLevel === 'Tinggi'
                    ? 'bg-rose-100 text-rose-600'
                    : riskLevel === 'Sedang'
                      ? 'bg-amber-100 text-amber-600'
                      : riskLevel
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                }`}
              >
                <HeartPulse size={16} className='sm:w-5 sm:h-5' />
              </div>
              <span className='text-[11px] sm:text-xs font-semibold text-slate-400 leading-tight'>
                Risiko
              </span>
              <span className='text-sm sm:text-xl font-black text-slate-800 tracking-tight mt-0.5'>
                {riskLevel || 'Belum Dinilai'}
              </span>
            </div>
            <div className='mt-1.5'>
              <span
                className={`inline-block text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full ${
                  riskLevel === 'Tinggi'
                    ? 'bg-rose-100 text-rose-700'
                    : riskLevel === 'Sedang'
                      ? 'bg-amber-100 text-amber-700'
                      : riskLevel
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                }`}
              >
                {riskLevel === 'Tinggi'
                  ? 'Perhatian'
                  : riskLevel === 'Sedang'
                    ? 'Waspada'
                    : riskLevel
                      ? 'Aman'
                      : 'Belum Dinilai'}
              </span>
              <p className='text-[9px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block'>
                Evaluasi UKS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHealthStrip;
