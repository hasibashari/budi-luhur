import { BellRing, Edit3, Trash2 } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { DailySchedule } from '../types';

export interface ScheduleCardProps {
  schedule: DailySchedule;
  onToggle: (id: string, next: boolean) => void;
  onEdit: (schedule: DailySchedule) => void;
  onDelete: (schedule: DailySchedule) => void;
}

export function ScheduleCard({ schedule, onToggle, onEdit, onDelete }: ScheduleCardProps) {
  return (
    <Card
      padding='lg'
      className='relative overflow-hidden border border-teal-100/80 bg-gradient-to-br from-teal-50/40 via-white to-slate-50/30 shadow-sm'
    >
      {/* Decorative glow */}
      <div className='absolute -top-10 -right-10 w-36 h-36 bg-teal-400/10 rounded-full blur-2xl pointer-events-none' />

      {/* Top Row: Status badge + Toggle */}
      <div className='flex items-center justify-between gap-3 mb-5 relative z-10'>
        <div className='flex items-center gap-2 flex-wrap'>
          {schedule.isEnabled ? (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 border border-teal-500/20 text-xs font-bold'>
              <span className='w-2 h-2 rounded-full bg-teal-500 animate-pulse' />
              Aktif
            </span>
          ) : (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold'>
              <span className='w-2 h-2 rounded-full bg-slate-400' />
              Nonaktif
            </span>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          type='button'
          onClick={() => onToggle(schedule.id, !schedule.isEnabled)}
          className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
            schedule.isEnabled ? 'bg-teal-600' : 'bg-slate-300'
          }`}
          aria-label={schedule.isEnabled ? 'Nonaktifkan jadwal' : 'Aktifkan jadwal'}
        >
          <div
            className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
              schedule.isEnabled ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Title & Time Display */}
      <div className='my-2 relative z-10'>
        <p className='text-xs text-slate-500 font-medium mb-1'>Nama Kegiatan</p>
        <h3 className='text-base sm:text-lg font-black text-slate-900 tracking-tight mb-3'>
          {schedule.title}
        </h3>

        <div className='flex items-baseline gap-2'>
          <span className='text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono'>
            {schedule.time || '–'}
          </span>
          <span className='text-base sm:text-xl font-bold text-teal-600 font-mono'>WIB</span>
        </div>

        <div className='mt-2.5'>
          <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-100'>
            📅 Setiap Hari
          </span>
        </div>

        {schedule.notes && (
          <div className='mt-3 p-3 rounded-2xl bg-white/90 border border-teal-100/80 shadow-2xs'>
            <p className='text-xs text-slate-500 italic leading-relaxed'>💬 {schedule.notes}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className='mt-5 pt-4 border-t border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10'>
        <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
          <BellRing size={14} className={schedule.isEnabled ? 'text-teal-600' : 'text-slate-400'} />
          <span>
            {schedule.remind15MinBefore
              ? 'Pengingat 15 menit sebelumnya'
              : 'Pengingat tepat pada jam'}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            shape='pill'
            icon={<Edit3 size={13} />}
            onClick={() => onEdit(schedule)}
            className='text-xs font-bold'
          >
            Ubah
          </Button>
          <button
            type='button'
            onClick={() => onDelete(schedule)}
            className='p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
            title='Hapus Jadwal'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
