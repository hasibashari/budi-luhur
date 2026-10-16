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
          <p className='text-xs sm:text-sm text-[#4A5E78] mb-3 leading-relaxed'>
            Catat konsumsi pil KB hari ini untuk menjaga proteksi kontrasepsi optimal.
          </p>

          <div className='flex items-center gap-2'>
            <Button
              variant='primary'
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
              className='text-xs sm:text-sm py-2 px-3.5 text-slate-600 border-slate-300 hover:bg-slate-50'
              icon={<XCircle size={16} />}
              onClick={handleSetMissed}
            >
              Terlewat
            </Button>
          </div>
        </div>
      )}

      {status === 'recorded' && (
        <div className='bg-teal-50 border border-teal-200/80 rounded-xl p-3 mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-teal-600/30'>
              <Sparkles size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-slate-800'>Pil KB Hari Ini Tercatat</p>
              <p className='text-[11px] text-teal-700 font-medium flex items-center gap-1'>
                <Clock size={11} />
                <span>Diminum pada {recordedTime || '20:00 WIB'}</span>
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-[11px] text-teal-700 hover:underline font-semibold px-2 py-1 cursor-pointer'
          >
            Ubah
          </button>
        </div>
      )}

      {status === 'missed' && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-3 mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0'>
              <XCircle size={16} />
            </div>
            <div>
              <p className='text-xs sm:text-sm font-bold text-slate-800'>
                Jadwal Hari Ini Terlewat
              </p>
              <p className='text-[11px] text-red-600 font-medium'>
                Segera minum begitu ingat dan baca panduan lupa minum di Edukasi/Luna!
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-[11px] text-red-600 hover:underline font-semibold px-2 py-1 cursor-pointer'
          >
            Ubah
          </button>
        </div>
      )}
    </Card>
  );
}
