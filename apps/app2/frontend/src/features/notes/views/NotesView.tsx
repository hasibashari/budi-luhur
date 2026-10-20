import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  SymptomHealthCard,
  DailyHealthLog,
} from '@/src/shared/components/domain/SymptomHealthCard';
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
      <div className='flex min-h-[50vh] items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary' />
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
      <SymptomHealthCard
        initialLogs={logs}
        onSaveLog={async log => {
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
