import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  CalendarClock,
  BellRing,
  ArrowRight,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export interface QuickActionProps {
  currentTTLevel?: number;
  nextScheduleDate?: string;
  onToggleReminder?: (isActive: boolean) => void;
}

export function QuickAction({
  currentTTLevel = 3,
  nextScheduleDate = '12 Juli 2026',
  onToggleReminder,
}: QuickActionProps) {
  const [reminderActive, setReminderActive] = useState(true);
  const nextLevel = Math.min(5, currentTTLevel + 1);

  const handleToggleReminder = () => {
    const nextState = !reminderActive;
    setReminderActive(nextState);
    if (onToggleReminder) {
      onToggleReminder(nextState);
    }
  };

  return (
    <div className='flex flex-col gap-3 w-full'>
      <div className='flex items-center justify-between'>
        <h2 className='text-base sm:text-lg font-bold text-[#121c2a]'>Akses Cepat Layanan</h2>
        <Link
          to='/user/imunisasi'
          className='text-xs font-semibold text-[#aa294d] hover:text-[#cb4364] transition-colors'
        >
          Lihat Semua
        </Link>
      </div>

      {/* Grid 4 Menu Pintasan Utama (2x2 Grid) */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        {/* 1. Edukasi Catin */}
        <Link
          to='/user/education'
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.98] group'
        >
          <div className='flex flex-col gap-2.5'>
            <div className='w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d] transition-transform group-hover:scale-105 shadow-2xs'>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors'>
                Edukasi Catin
              </h3>
              <p className='text-[11px] text-[#574144] line-clamp-2 mt-0.5 leading-snug'>
                Panduan & artikel medis pra-nikah terpercaya.
              </p>
            </div>
          </div>
          <div className='mt-3 flex items-center gap-1 text-[#aa294d] font-bold text-xs'>
            <span>Pelajari</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* 2. Riwayat Vaksin */}
        <Link
          to='/user/imunisasi?tab=riwayat'
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.98] group'
        >
          <div className='flex flex-col gap-2.5'>
            <div className='w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-[#aff1d0] flex items-center justify-center text-[#2a6950] transition-transform group-hover:scale-105 shadow-2xs'>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#2a6950] transition-colors'>
                Riwayat Vaksin
              </h3>
              <p className='text-[11px] text-[#574144] line-clamp-2 mt-0.5 leading-snug'>
                Lihat bukti suntik dosis TT1 hingga saat ini.
              </p>
            </div>
          </div>
          <div className='mt-3 flex items-center gap-1 text-[#2a6950] font-bold text-xs'>
            <span>Catatan Dosis & Evaluasi</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* 3. Jadwal TT (Next) */}
        <Link
          to='/user/imunisasi?tab=jadwal'
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.98] group'
        >
          <div className='flex flex-col gap-2.5'>
            <div className='w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-[#dee9fc] flex items-center justify-center text-[#cb4364] transition-transform group-hover:scale-105 shadow-2xs'>
              <CalendarClock size={22} />
            </div>
            <div>
              <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#cb4364] transition-colors'>
                Jadwal TT{nextLevel}
              </h3>
              <p className='text-[11px] text-[#574144] line-clamp-2 mt-0.5 leading-snug'>
                Estimasi suntik booster berikutnya di Puskesmas.
              </p>
            </div>
          </div>
          <div className='mt-3 flex items-center gap-1 text-[#cb4364] font-bold text-xs'>
            <span>{nextScheduleDate}</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        {/* 4. Pengingat Vaksin */}
        <div
          role='button'
          tabIndex={0}
          onClick={handleToggleReminder}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleReminder();
            }
          }}
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer'
        >
          <div className='flex flex-col gap-2.5'>
            <div className='w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-[#ffd9dd] flex items-center justify-center text-[#ac254b] transition-transform group-hover:scale-105 shadow-2xs'>
              <BellRing size={22} />
            </div>
            <div>
              <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#ac254b] transition-colors'>
                Pengingat
              </h3>
              <p className='text-[11px] text-[#574144] line-clamp-2 mt-0.5 leading-snug'>
                Notifikasi otomatis via WhatsApp & Notifikasi Ponsel.
              </p>
            </div>
          </div>
          <div className='mt-3 flex items-center justify-between'>
            <Link
              to='/user/profile?section=reminder'
              onClick={e => e.stopPropagation()}
              className={`text-[11px] font-bold transition-colors hover:underline ${
                reminderActive ? 'text-[#2a6950]' : 'text-[#8b7074]'
              }`}
            >
              {reminderActive ? 'Aktif (WA & App)' : 'Nonaktif'} • Atur
            </Link>
            {reminderActive ? (
              <ToggleRight size={22} className='text-[#2a6950] transition-all' />
            ) : (
              <ToggleLeft size={22} className='text-[#8b7074] transition-all' />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickAction;
