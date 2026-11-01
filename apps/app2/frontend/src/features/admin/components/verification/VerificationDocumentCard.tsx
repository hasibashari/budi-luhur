import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { AdminVerificationDetail } from '../../types/admin.types';

export interface VerificationDocumentCardProps {
  detail: AdminVerificationDetail;
  docUrl: string;
  openingDoc: boolean;
  onOpenDocument: (e: React.MouseEvent) => void;
}

export function VerificationDocumentCard({
  detail,
  docUrl,
  openingDoc,
  onOpenDocument,
}: VerificationDocumentCardProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className='p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold text-slate-900 flex items-center gap-1.5'>
          <FileText size={14} className='text-orange-600' />
          <span>Bukti Dokumen Identitas / Status Pernikahan</span>
        </span>
        <span className='text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200'>
          {detail.documentType}
        </span>
      </div>

      <div className='p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          <div className='w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0'>
            <FileText size={20} />
          </div>
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-slate-900 block truncate'>
              {detail.documentFileName}
            </span>
            <span className='text-[11px] text-slate-500'>
              {detail.documentFileType} • {formatFileSize(detail.documentFileSize)}
            </span>
          </div>
        </div>

        <a
          href={docUrl}
          target='_blank'
          rel='noopener noreferrer'
          onClick={onOpenDocument}
          className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer'
        >
          {openingDoc ? (
            <>
              <Loader2 size={13} className='animate-spin' />
              <span>Membuka...</span>
            </>
          ) : (
            <>
              <span>Buka Dokumen</span>
              <ExternalLink size={13} />
            </>
          )}
        </a>
      </div>
    </div>
  );
}

