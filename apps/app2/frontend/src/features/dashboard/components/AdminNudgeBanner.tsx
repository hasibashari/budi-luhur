import { BellRing, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { AdminNudge } from '@/src/features/schedule/types';

export interface AdminNudgeBannerProps {
  nudge: AdminNudge;
  onDismiss: () => void;
  onRecordConsumption: () => void;
}

export function AdminNudgeBanner({
  nudge,
  onDismiss,
  onRecordConsumption,
}: AdminNudgeBannerProps) {
  return (
    <section aria-label='Pengingat Langsung dari Tenaga Medis'>
      <div className='p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 text-white shadow-lg shadow-teal-900/10 border border-teal-600/40 animate-fade-in'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-3.5'>
            <div className='w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 text-white mt-0.5 shadow-inner'>
              <BellRing size={22} className='animate-pulse' />
            </div>
            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full'>
                  Pesan Medis • {nudge.senderName}
                </span>
                <span className='text-[11px] text-teal-200'>{nudge.sentAt}</span>
              </div>
              {nudge.title && (
                <div className='text-xs font-semibold text-teal-200 mt-1'>
                  {nudge.title}
                </div>
              )}
              <h3 className='text-sm sm:text-base font-bold mt-0.5 text-white leading-snug'>
                {nudge.message}
              </h3>
            </div>
          </div>

          <button
            type='button'
            onClick={onDismiss}
            className='text-teal-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0'
            title='Tutup Pengingat'
          >
            <X size={18} />
          </button>
        </div>

        <div className='mt-3.5 pt-3 border-t border-white/20 flex items-center gap-2.5 flex-wrap'>
          <Button
            variant='secondary'
            size='sm'
            shape='pill'
            icon={<CheckCircle2 size={14} />}
            className='font-bold shadow-sm text-xs'
            onClick={onRecordConsumption}
          >
            Catat Minum Sekarang
          </Button>
          <button
            type='button'
            onClick={onDismiss}
            className='text-xs font-semibold text-teal-100 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer'
          >
            Sudah Mengerti
          </button>
        </div>
      </div>
    </section>
  );
}

