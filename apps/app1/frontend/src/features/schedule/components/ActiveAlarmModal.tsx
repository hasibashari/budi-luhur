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
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in'
    >
      <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F0DFE7] overflow-hidden text-center transform transition-all animate-scale-up'>
        {/* Animated header banner */}
        <div className='relative bg-gradient-to-br from-[#B8285F] via-[#CE3B77] to-[#E06397] p-7 text-white overflow-hidden'>
          <div className='absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none' />
          <div className='absolute -bottom-10 -left-10 w-28 h-28 bg-[#B8285F]/20 rounded-full blur-lg pointer-events-none' />

          {/* Ringing Bell Icon with animated ripple */}
          <div className='relative mx-auto w-20 h-20 flex items-center justify-center mb-3'>
            <span className='absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75' />
            <span className='absolute -inset-2 rounded-full bg-white/10 animate-pulse' />
            <div className='relative w-16 h-16 rounded-full bg-white text-[#B8285F] shadow-xl flex items-center justify-center'>
              <BellRing size={30} className='animate-bounce text-[#B8285F]' />
            </div>
          </div>

          <span className='inline-block text-[10px] font-bold uppercase tracking-wider bg-white/25 text-white px-3 py-1 rounded-full mb-1.5 shadow-xs'>
            ALARM AKTIF BERDERING 🔔
          </span>
          <h2 id='alarm-modal-title' className='text-xl sm:text-2xl font-bold tracking-tight text-white'>
            Waktunya Minum TTD!
          </h2>
          <p className='text-xs sm:text-sm text-pink-100 font-medium mt-1 leading-relaxed'>
            Pengingat mingguanmu siap! Ambil tablet dan segelas air putih ya.
          </p>
        </div>

        {/* Content details */}
        <div className='p-6 space-y-4 text-left'>
          <div className='bg-[#FAF0F4] border border-[#F0DFE7] rounded-2xl p-4 space-y-2.5'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-white border border-[#F0DFE7] text-[#B8285F] flex items-center justify-center shrink-0 shadow-2xs'>
                <Pill size={19} />
              </div>
              <div>
                <p className='text-[11px] font-medium text-[#525866] uppercase tracking-wide'>
                  Dosis Terjadwal
                </p>
                <p className='text-sm sm:text-base font-bold text-[#1E1F24]'>
                  {tabletName} ({dosage})
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 pt-2 border-t border-[#F0DFE7]/70'>
              <div className='w-9 h-9 rounded-xl bg-white border border-[#F0DFE7] text-[#B8285F] flex items-center justify-center shrink-0 shadow-2xs'>
                <Clock size={18} />
              </div>
              <div>
                <p className='text-[11px] font-medium text-[#525866] uppercase tracking-wide'>
                  Waktu Jadwal
                </p>
                <p className='text-sm font-semibold text-[#1E1F24]'>{time} WIB</p>
              </div>
            </div>
          </div>

          <div className='bg-[#FAF6F8] rounded-xl p-3 border border-[#F0DFE7] text-[11px] text-[#525866] leading-relaxed'>
            💡 <strong className='text-[#1E1F24] font-semibold'>Anjuran Minum:</strong> {instructions}
          </div>

          {/* Action buttons */}
          <div className='space-y-2 pt-2'>
            <Button
              variant='primary'
              size='lg'
              fullWidth
              shape='pill'
              icon={<CheckCircle2 size={18} />}
              onClick={onConfirmTaken}
              className='text-sm font-bold shadow-md shadow-[#B8285F]/20'
            >
              Sudah Minum Sekarang
            </Button>

            <button
              type='button'
              onClick={onDismiss}
              className='w-full py-2.5 text-xs text-[#525866] hover:text-[#1E1F24] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-full hover:bg-[#FAF0F4]'
            >
              <BellOff size={14} />
              <span>Matikan Alarm Sementara</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
