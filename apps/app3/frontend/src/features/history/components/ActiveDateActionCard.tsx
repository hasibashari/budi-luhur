'use client';

import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Button } from '@/src/shared/components/ui/Button';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { formatFullDateText } from '../utils/dateHelpers';

export interface ActiveDateActionCardProps {
  selectedDate: string;
  isToday: boolean;
  activity?: ActivityDateInfo;
  effectiveStatus: 'recorded' | 'missed' | 'pending';
  fallbackTabletName?: string;
  fallbackTime?: string;
  isUpdating: boolean;
  onUpdateStatus: (targetDate: string, status: 'recorded' | 'missed' | 'pending') => void;
}

export function ActiveDateActionCard({
  selectedDate,
  isToday,
  activity,
  effectiveStatus,
  fallbackTabletName = 'Imunisasi TT / Suplementasi Pranikah',
  fallbackTime = '08:00',
  isUpdating,
  onUpdateStatus,
}: ActiveDateActionCardProps) {
  return (
    <Card
      padding='md'
      className='border border-emerald-200 bg-linear-to-br from-emerald-50/40 via-white to-stone-50'
    >
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        {/* Left side: Date & Status Details */}
        <div>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0'>
              <ShieldCheck size={14} />
            </div>
            <span className='text-xs font-bold text-slate-900'>
              {formatFullDateText(selectedDate)}
            </span>
            {isToday && (
              <span className='text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full'>
                Hari Ini
              </span>
            )}
          </div>
          <p className='text-xs text-slate-600 mt-1 pl-8'>
            {activity?.title || fallbackTabletName}
            {' • '}
            Jadwal {activity?.scheduledTime || fallbackTime} WIB
            {activity?.takenAt ? ` (Diverifikasi ${activity.takenAt})` : ''}
          </p>
        </div>

        {/* Right side: Direct Quick Status Action */}
        <div className='flex items-center gap-2 self-start sm:self-auto pl-8 sm:pl-0'>
          {effectiveStatus === 'recorded' && (
            <div className='flex items-center gap-2'>
              <Badge variant='recorded' size='sm'>
                ✓ Telah Diberikan
              </Badge>
              <button
                type='button'
                disabled={isUpdating}
                onClick={() => onUpdateStatus(selectedDate, 'pending')}
                className='text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer'
              >
                Ubah
              </button>
            </div>
          )}

          {effectiveStatus === 'missed' && (
            <div className='flex items-center gap-2'>
              <Badge variant='missed' size='sm'>
                ✕ Terlewat
              </Badge>
              <button
                type='button'
                disabled={isUpdating}
                onClick={() => onUpdateStatus(selectedDate, 'pending')}
                className='text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer'
              >
                Ubah
              </button>
            </div>
          )}

          {effectiveStatus === 'pending' && (
            <div className='flex items-center gap-2'>
              <Button
                variant='primary'
                size='sm'
                shape='pill'
                disabled={isUpdating}
                icon={<CheckCircle2 size={14} />}
                className='text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                onClick={() => onUpdateStatus(selectedDate, 'recorded')}
              >
                Catat Sudah Diberikan
              </Button>
              <Button
                variant='outline'
                size='sm'
                shape='pill'
                disabled={isUpdating}
                icon={<XCircle size={14} />}
                className='text-xs py-1.5 px-3 text-stone-600 border-stone-200 hover:bg-stone-50'
                onClick={() => onUpdateStatus(selectedDate, 'missed')}
              >
                Terlewat
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ActiveDateActionCard;
