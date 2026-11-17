import React from 'react';
import { BellRing, BellOff, CheckCircle2, Pill, Clock } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

export interface ActiveAlarmModalProps {
  isOpen: boolean;
  tabletName?: string;
  time?: string;
  dosage?: string;
  instructions?: string;
  onConfirmTaken: () => void;
  onDismiss: () => void;
}

export function ActiveAlarmModal({
  isOpen,
  tabletName = 'Tablet Tambah Darah (TTD)',
  time = '20:00',
  dosage = '1 Tablet',
  instructions = 'Minum setelah makan malam dengan air putih untuk penyerapan optimal.',
  onConfirmTaken,
  onDismiss,
}: ActiveAlarmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='alarm-modal-title'
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in'
    >
      <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden text-center transform transition-all animate-scale-up'>
        {/* Animated header banner with pulsing ring */}
        <div className='relative bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-7 text-white overflow-hidden'>
          <div className='absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none' />
          <div className='absolute -bottom-10 -left-10 w-28 h-28 bg-rose-400/20 rounded-full blur-lg pointer-events-none' />

          {/* Ringing Bell Icon with animated ripple */}
          <div className='relative mx-auto w-20 h-20 flex items-center justify-center mb-3'>
            <span className='absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75' />
            <span className='absolute -inset-2 rounded-full bg-white/10 animate-pulse' />
            <div className='relative w-16 h-16 rounded-full bg-white text-rose-600 shadow-xl flex items-center justify-center'>
              <BellRing size={32} className='animate-bounce text-rose-600' />
            </div>
          </div>

          <span className='inline-block text-[11px] font-black uppercase tracking-wider bg-white/25 text-white px-3 py-1 rounded-full mb-1 shadow-xs'>
            ALARM BERDERING AKTIF 🔔
          </span>
          <h2 id='alarm-modal-title' className='text-xl sm:text-2xl font-black tracking-tight text-white'>
            Waktunya Minum TTD!
          </h2>
          <p className='text-xs sm:text-sm text-rose-100 font-medium mt-1'>
            Alarm akan berbunyi terus sampai kamu mengambil tindakan di bawah ini.
          </p>
        </div>

        {/* Content details */}
        <div className='p-6 space-y-4 text-left'>
          <div className='bg-rose-50/70 border border-rose-100 rounded-2xl p-4 space-y-2.5'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-white border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs'>
                <Pill size={20} />
              </div>
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                  Dosis Terjadwal
                </p>
                <p className='text-sm sm:text-base font-bold text-slate-800'>
                  {tabletName} ({dosage})
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 pt-1 border-t border-rose-100/70'>
              <div className='w-9 h-9 rounded-xl bg-white border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs'>
                <Clock size={19} />
              </div>
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                  Jadwal Waktu
                </p>
                <p className='text-sm font-bold text-slate-800'>{time} WIB</p>
              </div>
            </div>
          </div>

          <p className='text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100'>
            💡 <strong>Petunjuk:</strong> {instructions}
          </p>

          {/* Action buttons */}
          <div className='flex flex-col gap-2.5 pt-2'>
            <Button
              type='button'
              onClick={onConfirmTaken}
              className='w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]'
            >
              <CheckCircle2 size={19} className='text-white' />
              <span>Sudah Minum TTD 🌸</span>
            </Button>

            <button
              type='button'
              onClick={onDismiss}
              className='w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors'
            >
              <BellOff size={16} className='text-slate-500' />
              <span>Matikan Alarm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
