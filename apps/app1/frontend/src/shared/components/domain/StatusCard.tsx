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
    <Card padding='md' className='relative'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <h4 className='text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-1.5'>
          <span>Status Hari Ini</span>
        </h4>

        <Badge variant={status} dot={status === 'pending'} size='sm'>
          {status === 'recorded'
            ? '✓ Sudah Dicatat'
            : status === 'missed'
              ? '✕ Terlewat'
              : 'Belum Dicatat'}
        </Badge>
      </div>

      {status === 'pending' && (
        <div>
          <p className='text-xs sm:text-sm text-[#475569] mb-3 leading-relaxed'>
            Catat konsumsi TTD hari ini untuk menjaga streak kesehatanmu.
          </p>

          <div className='flex items-center gap-2'>
            <Button
              variant='success'
              size='sm'
              shape='pill'
              className='flex-1 text-xs sm:text-sm py-2'
              icon={<CheckCircle2 size={16} />}
              onClick={handleSetRecorded}
            >
              Sudah Minum
            </Button>

            <Button
              variant='outline'
              size='sm'
              shape='pill'
              className='text-xs sm:text-sm py-2 px-3.5 text-[#f43f5e] border-[#fecdd3] hover:bg-[#fff1f2]'
              icon={<XCircle size={16} />}
              onClick={handleSetMissed}
            >
              Terlewat
            </Button>
          </div>
        </div>
      )}

      {status === 'recorded' && (
        <div className='bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3 mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30'>
              <Sparkles size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-[#065f46]'>Hebat! TTD Tercatat</p>
              <p className='text-[11px] text-[#047857] flex items-center gap-1'>
                <Clock size={11} />
                <span>Diminum pada {recordedTime || '08:15 WIB'}</span>
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-[11px] text-[#059669] hover:underline font-semibold px-2 py-1'
          >
            Ubah
          </button>
        </div>
      )}

      {status === 'missed' && (
        <div className='bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-3 mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shrink-0'>
              <XCircle size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-[#9f1239]'>
                Jadwal Hari Ini Terlewat
              </p>
              <p className='text-[11px] text-[#be123c]'>
                Jangan patah semangat, jadwalkan kembali besok!
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-[11px] text-[#e11d48] hover:underline font-semibold px-2 py-1'
          >
            Ubah
          </button>
        </div>
      )}
    </Card>
  );
}
