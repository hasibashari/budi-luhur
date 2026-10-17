import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Clock, ArrowRight, BellRing } from 'lucide-react';
import { Card } from '../ui/Card';

export interface ReminderScheduleCardData {
  id?: string;
  dayOfWeek: string;
  time: string;
  tabletName: string;
  dosage: string;
  frequency?: string;
  isEnabled?: boolean;
  remind15MinBefore?: boolean;
  nextDate: string;
  daysRemaining: number;
}

export interface ReminderCardProps {
  schedule: ReminderScheduleCardData;
  onTakeAction?: () => void;
}

export function ReminderCard({ schedule }: ReminderCardProps) {
  return (
    <Card variant='hero' padding='lg' className='relative overflow-hidden border-emerald-100'>
      {/* Decorative background circle */}
      <div className='absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none' />

      {/* Top Header Row */}
      <div className='flex items-center justify-between gap-2 mb-3'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-emerald-200 text-xs font-semibold text-emerald-800'>
          <Pill size={14} className='text-emerald-700' />
          <span>Jadwal Imunisasi & Faskes</span>
        </div>

        <span className='text-[11px] font-bold px-2.5 py-0.5 bg-emerald-600 text-white rounded-full shadow-sm shadow-emerald-600/20'>
          Tinggal {schedule.daysRemaining} hari lagi
        </span>
      </div>

      {/* Main Schedule Content */}
      <div className='my-2'>
        <h3 className='text-xl sm:text-2xl font-bold text-slate-900 tracking-tight'>
          {schedule.nextDate}
        </h3>
        <p className='text-sm sm:text-base font-semibold text-emerald-800 flex items-center gap-1.5 mt-1'>
          <Clock size={16} />
          <span>Pukul {schedule.time} WIB</span>
          <span className='text-slate-400 text-xs font-normal'>• {schedule.dosage}</span>
        </p>
      </div>

      <p className='text-xs text-slate-600 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-emerald-100 mt-3 leading-relaxed'>
        💡 <strong className='text-slate-900'>Tips Pranikah:</strong> Pastikan kondisi tubuh bugar, cukup istirahat, dan sarapan sehat sebelum mengunjungi faskes untuk imunisasi TT.
      </p>

      {/* Bottom Action */}
      <div className='mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between'>
        <span className='text-xs font-medium text-slate-500 flex items-center gap-1'>
          <BellRing size={13} className='text-emerald-600' />
          {schedule.isEnabled ? 'Pengingat Aktif' : 'Pengingat Nonaktif'}
        </span>

        <Link
          to='/user/schedule'
          className='inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors group'
        >
          <span>Ubah Jadwal</span>
          <ArrowRight size={13} className='transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </Card>
  );
}
