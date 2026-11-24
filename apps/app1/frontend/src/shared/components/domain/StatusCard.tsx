'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type ConsumptionStatus = 'recorded' | 'missed' | 'pending';

export interface StatusCardProps {
  initialStatus?: ConsumptionStatus;
  status?: ConsumptionStatus;
  initialRecordedTime?: string;
  recordedTime?: string;
  onStatusChange?: (newStatus: ConsumptionStatus) => void;
}

export function StatusCard({
  initialStatus = 'pending',
  status: propStatus,
  initialRecordedTime = '',
  recordedTime: propRecordedTime,
  onStatusChange,
}: StatusCardProps) {
  const effectiveInitialStatus = propStatus ?? initialStatus;
  const effectiveInitialTime = propRecordedTime ?? initialRecordedTime;

  const [status, setStatus] = useState<ConsumptionStatus>(effectiveInitialStatus);
  const [recordedTime, setRecordedTime] = useState<string>(effectiveInitialTime);

  useEffect(() => {
    if (propStatus !== undefined) {
      setStatus(propStatus);
    } else if (initialStatus !== undefined) {
      setStatus(initialStatus);
    }
  }, [propStatus, initialStatus]);

  useEffect(() => {
    if (propRecordedTime !== undefined) {
      setRecordedTime(propRecordedTime);
    } else if (initialRecordedTime !== undefined) {
      setRecordedTime(initialRecordedTime);
    }
  }, [propRecordedTime, initialRecordedTime]);

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
    <Card padding='md' className='relative bg-white'>
      <div className='flex items-center justify-between gap-2 mb-2.5'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm sm:text-base font-bold text-[#1E1F24] leading-tight'>
            Status Minum TTD Hari Ini
          </h3>
        </div>

        <Badge variant={status} dot={status === 'pending'} size='sm'>
          {status === 'recorded'
            ? 'Sudah Dicatat'
            : status === 'missed'
              ? 'Terlewat'
              : 'Belum Minum'}
        </Badge>
      </div>

      {status === 'pending' && (
        <div className='flex flex-col gap-3'>
          <p className='text-xs sm:text-sm text-[#525866] leading-relaxed'>
            Catat konsumsi Tablet Tambah Darah (TTD) hari ini untuk menjaga daya tahan tubuh dan bebas anemia.
          </p>

          <div className='bg-[#FAF0F4] border border-[#F0DFE7] rounded-xl px-3 py-2 flex items-center gap-2'>
            <Sparkles size={14} className='text-[#B8285F] shrink-0' />
            <p className='text-[11px] text-[#861A43] font-medium leading-snug'>
              Tips: Paling baik diminum setelah makan malam bersama air putih atau buah bervitamin C.
            </p>
          </div>

          <div className='flex items-center gap-2.5 pt-1'>
            <Button
              variant='success'
              size='md'
              shape='pill'
              className='flex-1 text-xs sm:text-sm'
              icon={<CheckCircle2 size={16} />}
              onClick={handleSetRecorded}
            >
              Catat Sudah Minum
            </Button>

            <Button
              variant='outline'
              size='md'
              shape='pill'
              className='text-xs sm:text-sm px-4 text-[#8E95A5] border-[#F0DFE7] hover:text-[#B8285F] hover:bg-[#FAF0F4]'
              icon={<XCircle size={15} />}
              onClick={handleSetMissed}
            >
              Terlewat
            </Button>
          </div>
        </div>
      )}

      {status === 'recorded' && (
        <div className='bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-3.5 mt-1 flex items-center justify-between gap-3 animate-fade-in'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-9 h-9 rounded-full bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs shadow-teal-700/20'>
              <CheckCircle2 size={18} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-[#065F46] leading-tight'>
                Hebat! TTD Sudah Dicatat 🌸
              </p>
              <p className='text-[11px] text-[#0D9488] flex items-center gap-1 mt-0.5 font-medium'>
                <Clock size={11} />
                <span>Tercatat pukul {recordedTime || '20:00 WIB'}</span>
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-xs text-[#0D9488] hover:text-[#065F46] font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer shrink-0'
          >
            Ubah
          </button>
        </div>
      )}

      {status === 'missed' && (
        <div className='bg-[#FAF0F4] border border-[#F7CADF] rounded-2xl p-3.5 mt-1 flex items-center justify-between gap-3 animate-fade-in'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-9 h-9 rounded-full bg-[#B8285F] text-white flex items-center justify-center shrink-0'>
              <AlertCircle size={18} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-[#861A43] leading-tight'>
                Jadwal Hari Ini Terlewat
              </p>
              <p className='text-[11px] text-[#A11E50] mt-0.5 leading-snug'>
                Jangan khawatir, kamu masih bisa minum tablet malam ini dan memperbarui catatan.
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleReset}
            className='text-xs text-[#B8285F] hover:text-[#861A43] font-semibold px-2.5 py-1 rounded-lg hover:bg-[#FCE7F0] transition-colors cursor-pointer shrink-0'
          >
            Ubah
          </button>
        </div>
      )}
    </Card>
  );
}
