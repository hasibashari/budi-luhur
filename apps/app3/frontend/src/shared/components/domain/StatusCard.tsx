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
    <Card padding='md' className='relative border-stone-200'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <h4 className='text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5'>
          <span>Kunjungan / Konsumsi Suplemen Pranikah Hari Ini</span>
        </h4>

        <Badge variant={status} dot={status === 'pending'} size='sm'>
          {status === 'recorded'
            ? '✓ Sudah Tercatat'
            : status === 'missed'
              ? '✕ Belum Terlaksana'
              : 'Menunggu Konfirmasi'}
        </Badge>
      </div>

      {status === 'pending' && (
        <div>
          <p className='text-xs text-slate-600 mb-3 leading-relaxed'>
            Konfirmasi kunjungan imunisasi TT atau konsumsi suplemen multivitamin pranikah hari ini.
          </p>

          <div className='flex items-center gap-2.5'>
            <Button
              variant='primary'
              size='sm'
              shape='pill'
              className='flex-1 text-xs sm:text-sm min-h-[44px] py-2 bg-[#2a6950] hover:bg-[#1f503d] text-white font-bold cursor-pointer active:scale-95'
              icon={<CheckCircle2 size={16} />}
              onClick={handleSetRecorded}
            >
              Sudah Terlaksana
            </Button>

            <Button
              variant='outline'
              size='sm'
              shape='pill'
              className='text-xs sm:text-sm min-h-[44px] py-2 px-4 text-stone-600 border-stone-200 hover:bg-stone-50 cursor-pointer active:scale-95'
              icon={<XCircle size={16} />}
              onClick={handleSetMissed}
            >
              Terlewat
            </Button>
          </div>
        </div>
      )}

      {status === 'recorded' && (
        <div className='bg-[#aff1d0]/30 border border-[#2a6950]/20 rounded-2xl p-3.5 mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-[#2a6950] text-white flex items-center justify-center shrink-0 shadow-xs'>
              <Sparkles size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-[#0a5139]'>Bagus! Terverifikasi</p>
              <p className='text-[11px] text-[#2a6950] flex items-center gap-1'>
                <Clock size={11} />
                <span>Tercatat pada {recordedTime || '08:15 WIB'}</span>
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-xs text-[#2a6950] hover:underline font-bold px-2.5 py-1.5 cursor-pointer active:scale-90'
          >
            Ubah
          </button>
        </div>
      )}

      {status === 'missed' && (
        <div className='bg-amber-50 border border-amber-200 rounded-2xl p-3 mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0'>
              <XCircle size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-amber-950'>
                Jadwal Belum Terlaksana
              </p>
              <p className='text-[11px] text-amber-800'>
                Tetap pantau jadwal faskes agar tidak terlewat sebelum akad nikah.
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-[11px] text-amber-800 hover:underline font-semibold px-2 py-1 cursor-pointer'
          >
            Ubah
          </button>
        </div>
      )}
    </Card>
  );
}

export default StatusCard;
