import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Clock, ArrowRight, BellRing, ShieldCheck, Sparkles } from 'lucide-react';
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
    <Card padding='lg' className='relative overflow-hidden border border-teal-200/80 bg-gradient-to-br from-teal-50/60 via-white to-slate-50/50 shadow-xs'>
      {/* Top Header Row */}
      <div className='flex items-center justify-between gap-2 mb-3'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-teal-200 text-xs font-semibold text-teal-800 shadow-2xs'>
          <Pill size={14} className='text-teal-600' />
          <span>Jadwal Pil KB Berikutnya</span>
        </div>

        <span className='text-[11px] font-bold px-2.5 py-0.5 bg-teal-600 text-white rounded-full shadow-xs shadow-teal-600/30'>
          {schedule.daysRemaining === 0 ? 'Hari Ini' : `${schedule.daysRemaining} hari lagi`}
        </span>
      </div>

      {/* Main Schedule Content */}
      <div className='my-2'>
        <h3 className='text-xl sm:text-2xl font-bold text-slate-800 tracking-tight'>
          {schedule.nextDate}
        </h3>
        <p className='text-sm sm:text-base font-semibold text-teal-700 flex items-center gap-1.5 mt-1'>
          <Clock size={16} />
          <span>Pukul {schedule.time} WIB</span>
          <span className='text-slate-400 text-xs font-normal'>• {schedule.dosage || '1 Tablet'}</span>
        </p>
      </div>

      <div className='text-xs text-slate-600 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-teal-100 mt-3 leading-relaxed space-y-1'>
        <div className='flex items-center gap-1.5 font-bold text-teal-900'>
          <Sparkles size={13} className='text-teal-600' />
          <span>Tips Bidan Pilluna:</span>
        </div>
        <p className='text-[11px] text-slate-600'>
          Minum pil pada jam yang sama di malam hari setelah makan malam. Jika terlambat kurang dari 12 jam, segera minum begitu ingat.
        </p>
      </div>

      {/* Bottom Action */}
      <div className='mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between'>
        <span className='text-xs font-medium text-slate-600 flex items-center gap-1.5'>
          <BellRing size={13} className={schedule.isEnabled ? 'text-teal-600' : 'text-slate-400'} />
          <span>{schedule.isEnabled ? 'Alarm Aktif' : 'Alarm Nonaktif'}</span>
        </span>

        <Link
          to='/user/schedule'
          className='inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors group'
        >
          <span>Ubah Jadwal</span>
          <ArrowRight size={13} className='transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </Card>
  );
}
