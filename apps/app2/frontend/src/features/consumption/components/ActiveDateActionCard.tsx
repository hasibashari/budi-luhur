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
        <div className='flex items-center sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-teal-100/60'>
          {effectiveStatus === 'recorded' && (
            <div className='flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto'>
              <Badge variant='recorded' size='sm'>
                ✓ Selesai
              </Badge>
              <button
                type='button'
                disabled={isUpdating}
                onClick={() => onUpdateStatus(selectedDate, 'pending')}
                className='text-xs font-semibold text-slate-500 hover:text-teal-700 hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-white/80'
              >
                Ubah
              </button>
            </div>
          )}

          {effectiveStatus === 'missed' && (
            <div className='flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto'>
              <Badge variant='missed' size='sm'>
                ✕ Terlewat
              </Badge>
              <button
                type='button'
                disabled={isUpdating}
                onClick={() => onUpdateStatus(selectedDate, 'pending')}
                className='text-xs font-semibold text-slate-500 hover:text-teal-700 hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-white/80'
              >
                Ubah
              </button>
            </div>
          )}

          {effectiveStatus === 'pending' && (
            <div className='grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto'>
              <Button
                variant='primary'
                size='sm'
                shape='pill'
                disabled={isUpdating}
                icon={<CheckCircle2 size={14} />}
                className='text-xs py-2 px-3 sm:py-1.5 justify-center font-bold shadow-xs'
                onClick={() => onUpdateStatus(selectedDate, 'recorded')}
              >
                {isUpdating ? '...' : 'Sudah Minum'}
              </Button>
              <Button
                variant='outline'
                size='sm'
                shape='pill'
                disabled={isUpdating}
                className='text-xs py-2 px-3 sm:py-1.5 justify-center font-bold text-slate-600 border-slate-300 hover:bg-slate-50'
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
