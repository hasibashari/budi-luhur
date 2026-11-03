import { useEffect, useState  } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  DailyNotesCard,
  DailyHealthLog,
} from '@/src/shared/components/domain/notes';
import { getHealthLogsAction, saveHealthLogAction } from '../api/notesRepository';

export default function NotesView() {
  const [logs, setLogs] = useState<DailyHealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealthLogsAction()
      .then(setLogs)
      .catch(() => setError('Catatan belum dapat dimuat. Silakan coba lagi.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        data-testid='notes-skeleton-loader'
        className='mx-auto w-full max-w-6xl space-y-4'
        aria-busy='true'
        aria-label='Memuat catatan harian...'
      >
        {/* Header Skeleton */}
        <div className='flex items-center justify-between gap-3 px-1'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-slate-200 animate-pulse' />
            <div className='space-y-1.5'>
              <div className='h-5 w-36 rounded-md bg-slate-200 animate-pulse' />
              <div className='h-3 w-52 rounded-md bg-slate-200/70 animate-pulse' />
            </div>
          </div>
          <div className='hidden sm:block h-9 w-28 rounded-full bg-slate-200 animate-pulse' />
        </div>

        {/* Hero Card Skeleton */}
        <div className='h-28 rounded-3xl bg-slate-200/80 animate-pulse' />

        {/* Main Card Skeleton */}
        <div className='rounded-3xl border border-border bg-surface p-4 sm:p-6 space-y-4 shadow-sm'>
          <div className='h-44 sm:h-56 rounded-2xl bg-slate-200/70 animate-pulse' />
          <div className='h-10 w-44 rounded-md bg-slate-200/70 animate-pulse' />
          <div className='space-y-3'>
            <div className='h-20 rounded-2xl bg-slate-200/50 animate-pulse' />
            <div className='h-20 rounded-2xl bg-slate-200/50 animate-pulse' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-6xl'>
      {error && (
        <div className='mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      <DailyNotesCard
        initialLogs={logs}
        onSaveLog={async (log: DailyHealthLog) => {
          const result = await saveHealthLogAction(log);
          if (!result.success || !result.log) {
            throw new Error(result.error || 'Gagal menyimpan catatan kesehatan.');
          }
          setLogs(current => [
            result.log!,
            ...current.filter(item => item.logDate !== result.log!.logDate),
          ]);
        }}
      />
    </div>
  );
}
