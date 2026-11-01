import { History } from 'lucide-react';

export interface VerificationAuditHistoryItem {
  id: string | number;
  action: string;
  notes?: string | null;
  adminName: string;
  createdAt: string;
}

export interface VerificationAuditHistoryProps {
  history: VerificationAuditHistoryItem[];
  formatDate: (isoStr?: string | null) => string;
}

export function VerificationAuditHistory({ history, formatDate }: VerificationAuditHistoryProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className='p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200 flex flex-col gap-2'>
      <span className='text-xs font-bold text-slate-700 flex items-center gap-1.5'>
        <History size={13} className='text-slate-500' />
        <span>Riwayat Verifikasi Akun</span>
      </span>

      <div className='flex flex-col gap-1.5 text-[11px]'>
        {history.map(h => (
          <div
            key={h.id}
            className='p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between gap-2'
          >
            <div>
              <span className='font-bold text-slate-800 mr-2'>{h.action}</span>
              <span className='text-slate-600'>&ldquo;{h.notes}&rdquo;</span>
              <span className='text-slate-400 ml-1'>oleh {h.adminName}</span>
            </div>
            <span className='text-[10px] text-slate-400 shrink-0'>
              {formatDate(h.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
