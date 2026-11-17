import React, { useState, useEffect } from 'react';
import { X, CalendarClock, User, RefreshCw } from 'lucide-react';
import { getUserYearlyMonitoringAction } from '../api/complianceRepository';
import { YearlyMonitoringData } from '@/src/features/monitoring/types';
import { YearlyMonitoringView } from '@/src/features/monitoring/components/YearlyMonitoringView';
import { ManagedUser } from '../types/admin.types';

export interface StudentYearlyMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ManagedUser | null;
}

export function StudentYearlyMonitoringModal({
  isOpen,
  onClose,
  user,
}: StudentYearlyMonitoringModalProps) {
  const [data, setData] = useState<YearlyMonitoringData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      let isMounted = true;
      setLoading(true);
      getUserYearlyMonitoringAction(user.id)
        .then(result => {
          if (isMounted) {
            setData(result);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to load student yearly monitoring:', err);
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='validator-modal-title'
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in'
    >
      <div className='relative w-full max-w-5xl max-h-[92vh] bg-[#fff5f7] rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden animate-scale-up'>
        {/* Modal Header */}
        <div className='bg-white px-5 sm:px-7 py-4 border-b border-pink-100 flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0'>
              <CalendarClock size={22} />
            </div>
            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full'>
                  EVALUASI VALIDATOR
                </span>
                <span className='text-xs text-slate-500 font-medium'>
                  ID: {user.id}
                </span>
              </div>
              <h3 id='validator-modal-title' className='text-base sm:text-lg font-extrabold text-slate-800 leading-snug'>
                Monitoring Kepatuhan Tahunan: {user.name}
              </h3>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer'
            aria-label='Tutup Modal'
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className='p-4 sm:p-6 overflow-y-auto flex-1'>
          {loading ? (
            <div className='flex flex-col items-center justify-center min-h-[40vh] gap-3'>
              <div className='animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-rose-600' />
              <p className='text-xs font-semibold text-slate-500'>
                Memuat riwayat 1 tahun & rencana jadwal siswi...
              </p>
            </div>
          ) : data ? (
            <YearlyMonitoringView
              data={data}
              isValidatorView={true}
              studentName={user.name}
            />
          ) : (
            <div className='p-12 text-center text-slate-400 text-sm'>
              Data monitoring tahunan untuk siswi ini tidak dapat dimuat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default StudentYearlyMonitoringModal;
