import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Maximize2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { AdminVerificationDetail } from '../../types/admin.types';
import apiClient from '@/src/shared/api/client';

export interface VerificationDocumentCardProps {
  detail: AdminVerificationDetail;
  docUrl?: string;
  openingDoc?: boolean;
  onOpenDocument?: (e: React.MouseEvent) => void;
}

export function VerificationDocumentCard({
  detail,
  docUrl,
  openingDoc,
  onOpenDocument,
}: VerificationDocumentCardProps) {
  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Lightbox Zoom State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf =
    detail.documentFileType === 'application/pdf' ||
    detail.documentFileName.toLowerCase().endsWith('.pdf');

  // Compute source from docUrl prop, detail.documentFileData, or fetched blob
  const computeInitialSrc = () => {
    if (docUrl) return docUrl;
    if (!detail.documentFileData) return null;
    if (detail.documentFileData.startsWith('data:')) return detail.documentFileData;
    const mime = detail.documentFileType || (isPdf ? 'application/pdf' : 'image/jpeg');
    return `data:${mime};base64,${detail.documentFileData}`;
  };

  const directSrc = computeInitialSrc();

  // If detail doesn't include documentFileData, fetch directly on mount
  useEffect(() => {
    if (directSrc) return;

    let isMounted = true;
    setIsFetching(true);
    setFetchError(null);

    apiClient
      .get(`/admin/verifications/${detail.userId}/document`, { responseType: 'blob' })
      .then(res => {
        if (!isMounted) return;
        if (typeof URL.createObjectURL === 'function') {
          const blobUrl = URL.createObjectURL(
            new Blob([res.data], {
              type: detail.documentFileType || (isPdf ? 'application/pdf' : 'image/jpeg'),
            }),
          );
          setFetchedSrc(blobUrl);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Gagal mengambil berkas dokumen verifikasi:', err);
        setFetchError('Gagal memuat pratinjau dokumen dari server.');
      })
      .finally(() => {
        if (isMounted) setIsFetching(false);
      });

    return () => {
      isMounted = false;
      if (fetchedSrc && fetchedSrc.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(fetchedSrc);
      }
    };
  }, [detail.userId, directSrc, isPdf, detail.documentFileType]);

  const activeSrc = directSrc || fetchedSrc;

  const handleDownload = () => {
    if (!activeSrc) return;
    const a = document.createElement('a');
    a.href = activeSrc;
    a.download = detail.documentFileName || `dokumen-${detail.documentType}-${detail.userId}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className='p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3.5'>
      {/* Header Info */}
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold text-slate-900 flex items-center gap-1.5'>
          <FileText size={15} className='text-orange-600' />
          <span>Bukti Dokumen Identitas / Status Pernikahan</span>
        </span>
        <span className='text-[10px] font-extrabold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200'>
          {detail.documentType}
        </span>
      </div>

      {/* File Meta Header Bar */}
      <div className='p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3'>
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

        {/* Action Toolbar */}
        <div className='flex items-center gap-2 shrink-0'>
          {activeSrc && (
            <>
              {!isPdf && (
                <button
                  type='button'
                  onClick={() => setIsLightboxOpen(true)}
                  className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer'
                  title='Perbesar Gambar'
                >
                  <Maximize2 size={13} className='text-slate-600' />
                  <span className='hidden sm:inline'>Perbesar</span>
                </button>
              )}
              <button
                type='button'
                onClick={handleDownload}
                className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors shadow-2xs cursor-pointer'
                title='Unduh Berkas'
              >
                <Download size={13} />
                <span className='hidden sm:inline'>Unduh</span>
              </button>
            </>
          )}

          {/* Fallback button if passed from parent */}
          {(!activeSrc || isFetching) && onOpenDocument && (
            <button
              type='button'
              onClick={onOpenDocument}
              disabled={openingDoc}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer disabled:opacity-50'
            >
              {openingDoc ? (
                <>
                  <Loader2 size={13} className='animate-spin' />
                  <span>Membuka...</span>
                </>
              ) : (
                <span>Buka Dokumen</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Inline Document Preview Box */}
      <div className='rounded-xl border border-slate-200 bg-slate-900/5 overflow-hidden flex flex-col items-center justify-center min-h-[220px] relative'>
        {isFetching ? (
          <div className='p-8 flex flex-col items-center justify-center gap-2 text-slate-500'>
            <Loader2 size={24} className='animate-spin text-teal-600' />
            <span className='text-xs font-medium'>Memuat berkas dokumen...</span>
          </div>
        ) : fetchError ? (
          <div className='p-6 flex flex-col items-center justify-center gap-2 text-rose-600 text-center'>
            <AlertCircle size={24} />
            <span className='text-xs font-semibold'>{fetchError}</span>
            {onOpenDocument && (
              <button
                type='button'
                onClick={onOpenDocument}
                className='mt-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold'
              >
                Coba Buka Dokumen Eksternal
              </button>
            )}
          </div>
        ) : activeSrc ? (
          isPdf ? (
            <div className='w-full'>
              <object
                data={activeSrc}
                type='application/pdf'
                className='w-full h-96 rounded-xl'
                aria-label={detail.documentFileName}
              >
                <div className='p-6 text-center flex flex-col items-center justify-center gap-2'>
                  <FileText size={32} className='text-slate-400' />
                  <p className='text-xs font-bold text-slate-700'>
                    Pratinjau PDF tidak didukung langsung oleh browser Anda.
                  </p>
                  <button
                    type='button'
                    onClick={handleDownload}
                    className='mt-1 px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5'
                  >
                    <Download size={14} />
                    <span>Unduh & Baca PDF ({detail.documentFileName})</span>
                  </button>
                </div>
              </object>
            </div>
          ) : (
            <div
              className='relative w-full flex items-center justify-center p-2 group cursor-zoom-in'
              onClick={() => setIsLightboxOpen(true)}
              title='Klik untuk memperbesar dokumen'
            >
              <img
                src={activeSrc}
                alt={detail.documentFileName}
                className='max-h-80 w-auto object-contain rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-[1.01]'
              />
              <div className='absolute bottom-3 right-3 bg-slate-900/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity'>
                <ZoomIn size={13} />
                <span>Klik untuk perbesar</span>
              </div>
            </div>
          )
        ) : (
          <div className='p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2'>
            <FileText size={28} />
            <span>Dokumen tidak memiliki data berkas.</span>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal for Deep Inspection */}
      {isLightboxOpen && activeSrc && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex flex-col'
        >
          {/* Lightbox Header */}
          <div className='flex items-center justify-between px-4 py-3 bg-slate-900/80 text-white border-b border-slate-800 shrink-0'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='text-xs font-bold truncate max-w-xs sm:max-w-md'>
                {detail.documentFileName} ({detail.documentType})
              </span>
            </div>

            {/* Controls */}
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={handleZoomOut}
                className='p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors'
                title='Zoom Out'
              >
                <ZoomOut size={16} />
              </button>
              <span className='text-xs font-bold text-slate-300 w-12 text-center'>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type='button'
                onClick={handleZoomIn}
                className='p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors'
                title='Zoom In'
              >
                <ZoomIn size={16} />
              </button>
              <button
                type='button'
                onClick={handleResetZoom}
                className='p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors'
                title='Reset Zoom'
              >
                <RotateCcw size={16} />
              </button>
              <button
                type='button'
                onClick={handleDownload}
                className='p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors ml-1'
                title='Unduh Dokumen'
              >
                <Download size={16} />
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className='p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ml-2'
                title='Tutup'
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage with Scroll */}
          <div className='flex-1 overflow-auto flex items-center justify-center p-4'>
            <img
              src={activeSrc}
              alt={detail.documentFileName}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              className='max-w-full max-h-full object-contain transition-transform duration-150 rounded-lg shadow-2xl'
            />
          </div>
        </div>
      )}
    </div>
  );
}
