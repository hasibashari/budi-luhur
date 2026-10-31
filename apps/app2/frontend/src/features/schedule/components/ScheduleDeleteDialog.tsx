import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { DailySchedule } from '../types';

export interface ScheduleDeleteDialogProps {
  schedule: DailySchedule;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ScheduleDeleteDialog({
  schedule,
  isDeleting,
  onCancel,
  onConfirm,
}: ScheduleDeleteDialogProps) {
  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={() => !isDeleting && onCancel()} />
      <div className='relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-red-100 text-center'>
        <div className='w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5'>
          <AlertCircle size={24} />
        </div>
        <h3 className='text-base font-black text-slate-900'>Hapus Jadwal Ini?</h3>
        <p className='text-xs text-slate-500 mt-1.5 mb-1 leading-relaxed'>
          <strong>"{schedule.title}"</strong>
        </p>
        <p className='text-xs text-slate-400 mb-5'>
          Jadwal akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            disabled={isDeleting}
            className='flex-1 text-xs font-bold'
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='primary'
            size='sm'
            shape='pill'
            disabled={isDeleting}
            className='flex-1 text-xs font-bold bg-red-600 hover:bg-red-700 border-red-600'
            onClick={onConfirm}
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </div>
      </div>
    </div>
  );
}

