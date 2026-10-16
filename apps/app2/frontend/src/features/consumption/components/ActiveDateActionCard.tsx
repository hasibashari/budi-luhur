'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
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
  fallbackTabletName = 'Pil KB Harian',
  fallbackTime = '20:00',
  isUpdating,
  onUpdateStatus,
}: ActiveDateActionCardProps) {
  return (
    <Card
      padding='md'
      className='border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-slate-50/30 to-white shadow-xs'
    >
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        {/* Left side: Date & Status Details */}
        <div>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-extrabold text-slate-800'>
              {formatFullDateText(selectedDate)}
            </span>
            {isToday && (
              <span className='text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full'>
                Hari Ini
              </span>
            )}
          </div>
          <p className='text-xs text-slate-500 mt-0.5'>
            {activity?.title || fallbackTabletName}
            {' • '}
            Jadwal {activity?.scheduledTime || fallbackTime} WIB
            {activity?.takenAt ? ` (Diminum ${activity.takenAt})` : ''}
          </p>
        </div>

        {/* Right side: Direct Quick Status Action */}
        <div className='flex items-center gap-2'>
          {effectiveStatus === 'recorded' && (
            <div className='flex items-center gap-2'>
              <Badge variant='recorded' size='sm'>
                ✓ Selesai
              </Badge>
              <button
                type='button'
                disabled={isUpdating}
                onClick={() => onUpdateStatus(selectedDate, 'pending')}
                className='text-[11px] font-semibold text-slate-500 hover:text-teal-700 hover:underline cursor-pointer'
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
                className='text-[11px] font-semibold text-slate-500 hover:text-teal-700 hover:underline cursor-pointer'
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
                className='text-xs py-1.5 px-3'
                onClick={() => onUpdateStatus(selectedDate, 'recorded')}
              >
                {isUpdating ? '...' : 'Sudah Minum'}
              </Button>
              <Button
                variant='outline'
                size='sm'
                shape='pill'
                disabled={isUpdating}
                className='text-xs py-1.5 px-3 text-slate-600 border-slate-300 hover:bg-slate-50'
                icon={<XCircle size={14} />}
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
