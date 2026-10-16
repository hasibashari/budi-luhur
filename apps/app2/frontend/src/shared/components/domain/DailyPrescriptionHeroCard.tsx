'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Pill,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type ConsumptionStatus = 'recorded' | 'missed' | 'pending';

export interface DailyPrescriptionHeroCardProps {
  initialStatus?: ConsumptionStatus;
  initialRecordedTime?: string;
  targetTime?: string;
  pillDayNumber?: number;
  totalPills?: number;
  pillType?: 'active' | 'placebo';
  onStatusChange?: (newStatus: ConsumptionStatus) => void;
  className?: string;
}

export function DailyPrescriptionHeroCard({
  initialStatus = 'pending',
  initialRecordedTime = '',
  targetTime = '20:00 WIB',
  pillDayNumber = 14,
  totalPills = 28,
  pillType = 'active',
  onStatusChange,
  className = '',
}: DailyPrescriptionHeroCardProps) {
  const [status, setStatus] = useState<ConsumptionStatus>(initialStatus);
  const [recordedTime, setRecordedTime] = useState<string>(initialRecordedTime);

  // Sync if initial status changes from parent
  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  React.useEffect(() => {
    setRecordedTime(initialRecordedTime);
  }, [initialRecordedTime]);

  const handleSetRecorded = () => {
    const timeStr =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setStatus('recorded');
    setRecordedTime(timeStr);
    onStatusChange?.('recorded');
  };

  const handleSetMissed = () => {
    setStatus('missed');
    onStatusChange?.('missed');
  };

  const handleReset = () => {
    setStatus('pending');
    onStatusChange?.('pending');
  };

  const isPlacebo = pillType === 'placebo';

  return (
    <Card
      padding='lg'
      className={`relative overflow-hidden border border-[#E2E8F0] shadow-sm bg-white ${className}`}
    >
      {/* Top Header: Pill Cycle Position & Protection Badge */}
      <div className='flex items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] mb-4'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0'>
            <Pill size={16} />
          </div>
          <div>
            <h4 className='text-xs font-bold text-[#0F172A] leading-tight'>
              {isPlacebo ? 'Fase Pil Plasebo (Jeda Haid)' : 'Fase Pil Aktif Hormon'}
            </h4>
            <span className='text-[11px] text-[#64748B]'>
              Butir Ke-{pillDayNumber} dari {totalPills} dalam siklus
            </span>
          </div>
        </div>

        <Badge
          variant={status === 'recorded' ? 'protected' : status === 'missed' ? 'missed' : 'today'}
          size='sm'
          dot
        >
          {status === 'recorded'
            ? 'Terlindungi 99%'
            : status === 'missed'
              ? 'Terlewat'
              : 'Menunggu Jam Minum'}
        </Badge>
      </div>

      {/* Main Prescription Details: Target Time & Action Button */}
      {status === 'pending' && (
        <div className='flex flex-col gap-4 animate-fade-in'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-white text-[#F97316] border border-[#FED7AA] flex items-center justify-center shrink-0 shadow-2xs'>
                <Clock size={20} />
              </div>
              <div>
                <span className='text-[10px] uppercase font-bold text-[#64748B] tracking-wider block leading-none'>
                  Jadwal Rutin Hari Ini
                </span>
                <span className='text-base sm:text-lg font-black text-[#0F172A] mt-0.5 block leading-tight'>
                  {targetTime}
                </span>
                <span className='text-[11px] text-[#64748B] mt-0.5 block'>
                  Minum 1 pil dengan air mineral setelah makan.
                </span>
              </div>
            </div>

            <div className='text-left sm:text-right shrink-0'>
              <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-1 rounded-full border border-[#CCFBF1]'>
                <ShieldCheck size={12} />
                Efektivitas 99%
              </span>
            </div>
          </div>

          {/* Primary Action Button (1-Tap Big Confirm Button) */}
          <div className='flex flex-col sm:flex-row items-center gap-2.5 pt-1'>
            <Button
              variant='primary'
              size='lg'
              shape='pill'
              fullWidth
              className='h-12 text-sm sm:text-base font-bold shadow-md shadow-[#0D9488]/20 flex items-center justify-center gap-2'
              icon={<CheckCircle2 size={18} />}
              onClick={handleSetRecorded}
            >
              Konfirmasi Sudah Minum Pil
            </Button>

            <button
              type='button'
              onClick={handleSetMissed}
              className='text-xs font-semibold text-[#64748B] hover:text-[#DC2626] px-3 py-2 transition-colors cursor-pointer self-center sm:self-auto shrink-0'
            >
              Lupa / Terlewat Hari Ini?
            </button>
          </div>
        </div>
      )}

      {/* State Recorded: Calm Medical Confirmation */}
      {status === 'recorded' && (
        <div className='p-4 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs shadow-teal-700/25'>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h5 className='text-sm sm:text-base font-bold text-[#0F172A] leading-tight'>
                Pil Hari Ini Berhasil Diminum
              </h5>
              <p className='text-xs text-[#0D9488] font-medium flex items-center gap-1 mt-0.5'>
                <Clock size={12} />
                <span>Tercatat tepat waktu pukul {recordedTime || targetTime}</span>
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#CCFBF1]'>
            <span className='text-[11px] text-[#64748B] hidden sm:inline'>
              Perlindungan aktif terjaga
            </span>
            <button
              type='button'
              onClick={handleReset}
              className='text-xs font-semibold text-[#64748B] hover:text-[#0D9488] underline cursor-pointer'
            >
              Ubah Catatan
            </button>
          </div>
        </div>
      )}

      {/* State Missed: Calm Clinical Guidance */}
      {status === 'missed' && (
        <div className='p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex flex-col gap-3 animate-fade-in'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-xs shadow-orange-500/20 mt-0.5'>
                <AlertCircle size={20} />
              </div>
              <div>
                <h5 className='text-sm sm:text-base font-bold text-[#0F172A] leading-tight'>
                  Jadwal Pil Hari Ini Terlewat
                </h5>
                <p className='text-xs text-[#C2410C] mt-1 leading-relaxed'>
                  Segera minum 1 pil sekarang begitu teringat, dan minum pil berikutnya pada jam
                  rutin biasa (meskipun harus minum 2 pil dalam satu hari).
                </p>
              </div>
            </div>

            <button
              type='button'
              onClick={handleReset}
              className='text-xs font-bold text-[#C2410C] hover:underline cursor-pointer shrink-0'
            >
              Ubah
            </button>
          </div>

          <div className='flex items-center justify-between pt-2 border-t border-[#FED7AA]/60 text-[11px]'>
            <span className='text-[#64748B]'>
              Jika terlambat &gt;12 jam: gunakan pengaman cadangan selama 7 hari.
            </span>
            <Link
              to='/user/education'
              className='text-[#0D9488] font-bold hover:underline inline-flex items-center gap-1 shrink-0'
            >
              <span>Lihat Panduan Medis</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* Footer Helper Link */}
      <div className='mt-3.5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]'>
        <span className='inline-flex items-center gap-1 text-[11px]'>
          <Info size={13} className='text-[#0D9488]' />
          <span>Aturan: Minum di jam yang sama setiap hari</span>
        </span>
        <Link
          to='/user/education'
          className='text-[#0D9488] hover:text-[#0F766E] font-semibold text-[11px] hover:underline'
        >
          Panduan Lupa Minum Pil
        </Link>
      </div>
    </Card>
  );
}

export default DailyPrescriptionHeroCard;
