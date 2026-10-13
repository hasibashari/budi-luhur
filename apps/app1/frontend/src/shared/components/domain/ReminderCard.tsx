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
    <Card variant='hero' padding='lg' className='relative overflow-hidden'>
      {/* Decorative background circle */}
      <div className='absolute -right-8 -bottom-8 w-36 h-36 bg-rose-400/10 rounded-full blur-2xl pointer-events-none' />

      {/* Top Header Row */}
      <div className='flex items-center justify-between gap-2 mb-3'>
        <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200 text-xs font-semibold text-[#be123c]'>
          <Pill size={14} className='text-[#e11d48]' />
          <span>Pengingat TTD Berikutnya</span>
        </div>

        <span className='text-[11px] font-bold px-2.5 py-0.5 bg-rose-500 text-white rounded-full shadow-sm shadow-rose-500/20'>
          Tinggal {schedule.daysRemaining} hari lagi
        </span>
      </div>

      {/* Main Schedule Content */}
      <div className='my-2'>
        <h3 className='text-xl sm:text-2xl font-bold text-[#1e293b] tracking-tight'>
          {schedule.nextDate}
        </h3>
        <p className='text-sm sm:text-base font-semibold text-[#e11d48] flex items-center gap-1.5 mt-1'>
          <Clock size={16} />
          <span>Pukul {schedule.time} WIB</span>
          <span className='text-slate-400 text-xs font-normal'>• {schedule.dosage}</span>
        </p>
      </div>

      <p className='text-xs text-[#64748b] bg-white/60 backdrop-blur-xs p-2.5 rounded-xl border border-rose-100 mt-3 leading-relaxed'>
        💡 <strong className='text-[#1e293b]'>Tips Sehat:</strong> Minum TTD setelah sarapan atau
        sebelum tidur bersama segelas air putih atau jus jeruk.
      </p>

      {/* Bottom Action */}
      <div className='mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between'>
        <span className='text-xs font-medium text-[#64748b] flex items-center gap-1'>
          <BellRing size={13} className='text-rose-500' />
          {schedule.isEnabled ? 'Pengingat Aktif' : 'Pengingat Nonaktif'}
        </span>

        <Link
          to='/user/schedule'
          className='inline-flex items-center gap-1 text-xs font-bold text-[#e11d48] hover:text-[#be123c] transition-colors group'
        >
          <span>Ubah Jadwal</span>
          <ArrowRight size={13} className='transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </Card>
  );
}
