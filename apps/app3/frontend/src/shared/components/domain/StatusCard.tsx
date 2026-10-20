'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type ConsumptionStatus = 'recorded' | 'missed' | 'pending';

export interface StatusCardProps {
  initialStatus?: ConsumptionStatus;
  initialRecordedTime?: string;
  onStatusChange?: (newStatus: ConsumptionStatus) => void;
}

export function StatusCard({
  initialStatus = 'pending',
  initialRecordedTime = '',
  onStatusChange,
}: StatusCardProps) {
  const [prevInitialStatus, setPrevInitialStatus] = useState(initialStatus);
  const [status, setStatus] = useState<ConsumptionStatus>(initialStatus);

  const [prevInitialRecordedTime, setPrevInitialRecordedTime] = useState(initialRecordedTime);
  const [recordedTime, setRecordedTime] = useState<string>(initialRecordedTime);

  if (initialStatus !== prevInitialStatus) {
    setPrevInitialStatus(initialStatus);
    setStatus(initialStatus);
  }

  if (initialRecordedTime !== prevInitialRecordedTime) {
    setPrevInitialRecordedTime(initialRecordedTime);
    setRecordedTime(initialRecordedTime);
  }

  const handleSetRecorded = () => {
    const timeStr =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setStatus('recorded');
    setRecordedTime(timeStr);
    onStatusChange?.('recorded');
  };

  const handleSetMissed = () => {
    setStatus('missed');
    onStatusChange?.('missed');
  };

  const handleReset = () => {
    setStatus('pending');
    onStatusChange?.('pending');
  };

  return (
    <Card padding='md' className='relative border-stone-200 p-4 sm:p-5 md:p-6 transition-all'>
      {/* Header: Tumpuk di mobile sangat kecil, sejajar di sm ke atas */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4'>
        <h4 className='text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug'>
          Kunjungan / Konsumsi Suplemen Pranikah Hari Ini
        </h4>

        <div className='self-start sm:self-auto shrink-0'>
          <Badge variant={status} dot={status === 'pending'} size='sm'>
            {status === 'recorded'
              ? '✓ Sudah Tercatat'
              : status === 'missed'
                ? '✕ Belum Terlaksana'
                : 'Menunggu Konfirmasi'}
          </Badge>
        </div>
      </div>

      {/* State: Pending */}
      {status === 'pending' && (
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-3.5 md:gap-6'>
          <p className='text-xs sm:text-sm text-slate-600 leading-relaxed flex-1'>
            Konfirmasi kunjungan imunisasi TT atau konsumsi suplemen multivitamin pranikah hari ini.
          </p>

          {/* Tombol: Full-width stack di mobile kecil, berdampingan di sm, proporsional di desktop */}
          <div className='flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0'>
            <Button
              variant='primary'
              size='sm'
              shape='pill'
              className='flex-1 sm:flex-initial text-xs sm:text-sm min-h-[42px] sm:min-h-[44px] py-2 px-4 sm:px-5 bg-[#2a6950] hover:bg-[#1f503d] text-white font-bold cursor-pointer active:scale-95 justify-center'
              icon={<CheckCircle2 className='w-4 h-4 shrink-0' />}
              onClick={handleSetRecorded}
            >
              Sudah Terlaksana
            </Button>

            <Button
              variant='outline'
              size='sm'
              shape='pill'
              className='text-xs sm:text-sm min-h-[42px] sm:min-h-[44px] py-2 px-4 text-stone-600 border-stone-200 hover:bg-stone-50 cursor-pointer active:scale-95 justify-center'
              icon={<XCircle className='w-4 h-4 shrink-0' />}
              onClick={handleSetMissed}
            >
              Terlewat
            </Button>
          </div>
        </div>
      )}

      {/* State: Recorded */}
      {status === 'recorded' && (
        <div className='bg-[#aff1d0]/30 border border-[#2a6950]/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mt-1 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3'>
          <div className='flex items-center gap-2.5 sm:gap-3.5 min-w-0'>
            <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2a6950] text-white flex items-center justify-center shrink-0 shadow-xs'>
              <Sparkles className='w-4 h-4 sm:w-5 sm:h-5' />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm md:text-base font-bold text-[#0a5139] truncate'>
                Bagus! Terverifikasi
              </p>
              <p className='text-[11px] sm:text-xs text-[#2a6950] flex items-center gap-1 mt-0.5'>
                <Clock className='w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0' />
                <span className='truncate'>Tercatat pada {recordedTime || '08:15 WIB'}</span>
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-xs sm:text-sm text-[#2a6950] hover:bg-[#2a6950]/10 rounded-lg font-bold px-3 py-1.5 cursor-pointer active:scale-90 transition-colors self-end xs:self-center shrink-0'
          >
            Ubah
          </button>
        </div>
      )}

      {/* State: Missed */}
      {status === 'missed' && (
        <div className='bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0'>
              <XCircle className='w-4 h-4 sm:w-5 sm:h-5' />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm md:text-base font-bold text-amber-950'>
                Jadwal Belum Terlaksana
              </p>
              <p className='text-[11px] sm:text-xs text-amber-800 leading-relaxed mt-0.5'>
                Tetap pantau jadwal faskes agar tidak terlewat sebelum akad nikah.
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-xs sm:text-sm text-amber-800 hover:bg-amber-200/50 rounded-lg font-semibold px-3 py-1.5 cursor-pointer active:scale-90 transition-colors self-end sm:self-center shrink-0'
          >
            Ubah
          </button>
        </div>
      )}
    </Card>
  );
}

export default StatusCard;
