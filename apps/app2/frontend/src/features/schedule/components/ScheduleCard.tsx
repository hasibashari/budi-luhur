import { BellRing, Edit3, Trash2, Pill } from 'lucide-react';
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
      variant='hero'
      padding='lg'
      className='relative overflow-hidden border border-teal-100/80 shadow-xl shadow-teal-950/5'
    >
      {/* Decorative glow */}
      <div className='absolute -top-12 -right-12 w-44 h-44 bg-teal-400/10 rounded-full blur-2xl pointer-events-none' />

      {/* Top Row: Status badge + Master Toggle Switch */}
      <div className='flex items-center justify-between gap-3 mb-6 relative z-10'>
        {/* Status Badges */}
        <div className='flex items-center gap-2 flex-wrap'>
          {schedule.isEnabled ? (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-bold'>
              <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
              Alarm Aktif
            </span>
          ) : (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold'>
              <span className='w-2 h-2 rounded-full bg-slate-400' />
              Alarm Nonaktif
            </span>
          )}

          <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 rounded-full text-[11px] font-bold text-teal-700 border border-teal-200'>
            <Pill size={12} />
            <span>1 Tablet</span>
          </span>
        </div>

        {/* Switch Toggle (iOS / Android Style) */}
        <button
          type='button'
          onClick={() => onToggle(schedule.id, !schedule.isEnabled)}
          className={`w-14 h-7.5 rounded-full transition-colors p-1 flex items-center cursor-pointer shadow-inner ${
            schedule.isEnabled ? 'bg-[#0D9488]' : 'bg-slate-300'
          }`}
          aria-label={schedule.isEnabled ? 'Nonaktifkan jadwal' : 'Aktifkan jadwal'}
          title={schedule.isEnabled ? 'Matikan Alarm' : 'Nyalakan Alarm'}
        >
          <div
            className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
              schedule.isEnabled ? 'translate-x-6.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Big Digital Clock Display */}
      <div className='my-2 relative z-10'>
        <div className='flex items-baseline gap-2.5'>
          <span className='text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono'>
            {schedule.time || '20:00'}
          </span>
          <span className='text-lg sm:text-2xl font-bold text-teal-600 font-mono'>
            WIB
          </span>
        </div>

        {/* Day and Frequency description */}
        <div className='flex items-center gap-2 flex-wrap mt-3'>
          <span className='px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs sm:text-sm font-bold border border-teal-100'>
            📅 Setiap Hari
          </span>
          <span className='text-xs text-slate-500 font-medium'>
            (Harian)
          </span>
        </div>

        {/* Tablet info & instructions */}
        <div className='mt-4 p-3.5 rounded-2xl bg-white/90 border border-teal-100/80 shadow-2xs'>
          <div className='text-xs sm:text-sm font-bold text-slate-800'>
            {schedule.title}
          </div>
          {schedule.notes ? (
            <p className='text-xs text-slate-500 mt-1 italic leading-relaxed'>
              💬 {schedule.notes}
            </p>
          ) : (
            <p className='text-xs text-slate-400 mt-1 italic leading-relaxed'>
              💡 Minum 1 tablet pil KB dengan air putih pada jam yang sama setiap hari.
            </p>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className='mt-6 pt-4 border-t border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10'>
        <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
          <BellRing
            size={14}
            className={schedule.isEnabled ? 'text-teal-600' : 'text-slate-400'}
          />
          <span>
            {schedule.remind15MinBefore
              ? 'Pengingat awal: 15 menit sebelumnya'
              : 'Pengingat tepat saat jam minum'}
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
            Ubah Alarm
          </Button>

          <button
            type='button'
            onClick={() => onDelete(schedule)}
            className='p-2 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer'
            title='Hapus Alarm'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
