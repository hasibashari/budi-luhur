import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  CalendarClock,
  BellRing,
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
  currentTTLevel = 0,
  nextScheduleDate,
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
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs hover:shadow-md transition-all active:scale-[0.98] group'
        >
          <div className='w-11 h-11 rounded-xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d] transition-transform group-hover:scale-105 shadow-2xs mb-3'>
            <BookOpen size={20} />
          </div>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#aa294d] transition-colors'>
              Edukasi Catin
            </h3>
            <ChevronRight
              size={15}
              className='text-[#8b7074] group-hover:text-[#aa294d] transition-colors'
            />
          </div>
        </Link>

        {/* 2. Riwayat Vaksin */}
        <Link
          to='/user/imunisasi?tab=riwayat'
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs hover:shadow-md transition-all active:scale-[0.98] group'
        >
          <div className='w-11 h-11 rounded-xl bg-[#aff1d0] flex items-center justify-center text-[#2a6950] transition-transform group-hover:scale-105 shadow-2xs mb-3'>
            <ClipboardCheck size={20} />
          </div>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#2a6950] transition-colors'>
              Riwayat Vaksin
            </h3>
            <ChevronRight
              size={15}
              className='text-[#8b7074] group-hover:text-[#2a6950] transition-colors'
            />
          </div>
        </Link>

        {/* 3. Jadwal TT */}
        <Link
          to='/user/schedule'
          className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs hover:shadow-md transition-all active:scale-[0.98] group'
        >
          <div className='w-11 h-11 rounded-xl bg-[#dee9fc] flex items-center justify-center text-[#cb4364] transition-transform group-hover:scale-105 shadow-2xs mb-3'>
            <CalendarClock size={20} />
          </div>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#cb4364] transition-colors'>
              Jadwal TT{nextLevel}
            </h3>
            <ChevronRight
              size={15}
              className='text-[#8b7074] group-hover:text-[#cb4364] transition-colors'
            />
          </div>
        </Link>

        {/* 4. Pengingat Vaksin */}
        <div className='flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#eff4ff] shadow-xs hover:shadow-md transition-all group'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-11 h-11 rounded-xl bg-[#ffd9dd] flex items-center justify-center text-[#ac254b] shadow-2xs'>
              <BellRing size={20} />
            </div>
            <button
              type='button'
              onClick={handleToggleReminder}
              aria-label={
                reminderActive ? 'Nonaktifkan pengingat imunisasi' : 'Aktifkan pengingat imunisasi'
              }
              className='cursor-pointer text-[#2a6950] hover:opacity-80 active:scale-95 transition-transform'
              title={reminderActive ? 'Pengingat Aktif' : 'Pengingat Nonaktif'}
            >
              {reminderActive ? (
                <ToggleRight size={24} className='text-[#2a6950]' />
              ) : (
                <ToggleLeft size={24} className='text-[#8b7074]' />
              )}
            </button>
          </div>
          <div className='flex items-center justify-between'>
            <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] group-hover:text-[#ac254b] transition-colors'>
              Pengingat
            </h3>
            <Link
              to='/user/profile?section=reminder'
              className='text-[10px] font-bold text-[#aa294d] hover:underline flex items-center gap-0.5 cursor-pointer'
            >
              <span>{reminderActive ? 'Aktif' : 'Nonaktif'}</span>
              <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickAction;
