import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import {
  getAdminVerificationDetailAction,
  approveUserVerificationAction,
  rejectUserVerificationAction,
  getAdminVerificationDocumentUrl,
} from '../api/adminRepository';
import { AdminVerificationDetail } from '../types/admin.types';
import { Button } from '@/src/shared/components/ui/Button';
import apiClient from '@/src/shared/api/client';
import { VerificationBioCard } from './verification/VerificationBioCard';
import { VerificationScreeningList } from './verification/VerificationScreeningList';
import { VerificationDocumentCard } from './verification/VerificationDocumentCard';
import { VerificationAuditHistory } from './verification/VerificationAuditHistory';

export interface VerificationDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function VerificationDetailModal({
  userId,
  isOpen,
  onClose,
  onStatusUpdated,
}: VerificationDetailModalProps) {
  const [detail, setDetail] = useState<AdminVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reject Form State
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [openingDoc, setOpeningDoc] = useState(false);

  const handleOpenDocument = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!detail) return;
    setOpeningDoc(true);
    try {
      const res = await apiClient.get(`/admin/verifications/${detail.userId}/document`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: detail.documentFileType || 'application/octet-stream',
      });
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
    } catch {
      // Fallback: tokenized direct URL
      const fallbackUrl = getAdminVerificationDocumentUrl(detail.userId);
      window.open(fallbackUrl, '_blank');
    } finally {
      setOpeningDoc(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      setActionError(null);
      setIsRejectMode(false);
      setRejectReason('');

      getAdminVerificationDetailAction(userId).then(res => {
        setDetail(res);
        setIsLoading(false);
      });
    } else {
      setDetail(null);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, userId, isSubmitting, onClose]);

  if (!isOpen || !userId) return null;

  const handleApprove = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    setActionError(null);

    const res = await approveUserVerificationAction(userId);
    setIsSubmitting(false);

    if (res.success) {
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } else {
      setActionError(res.error || 'Gagal menyetujui verifikasi pengguna.');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!rejectReason.trim()) {
      setActionError('Alasan penolakan pendaftaran wajib disertakan.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = await rejectUserVerificationAction(userId, rejectReason.trim());
    setIsSubmitting(false);

    if (res.success) {
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } else {
      setActionError(res.error || 'Gagal menolak verifikasi pengguna.');
    }
  };

  const screening = detail?.screeningAnswers || {};
  const docUrl = detail ? getAdminVerificationDocumentUrl(detail.userId) : '';

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const modalContent = (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in'
      onClick={e => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className='relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[92vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 shrink-0'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center shadow-2xs'>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-extrabold text-slate-900 leading-tight'>
                Pemeriksaan Berkas & Skrining Akseptor
              </h3>
              <p className='text-xs text-slate-500'>
                {detail ? `ID Pengguna: ${detail.userId}` : 'Memuat data...'}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5'>
          {isLoading ? (
            <div className='py-12 flex flex-col items-center justify-center gap-2.5 text-slate-500'>
              <Loader2 size={24} className='animate-spin text-teal-600' />
              <span className='text-xs font-semibold'>Memuat berkas verifikasi...</span>
            </div>
          ) : !detail ? (
            <div className='py-12 text-center text-xs text-slate-500'>
              Data berkas verifikasi tidak ditemukan.
            </div>
          ) : (
            <>
              {/* Status Alert Banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  detail.status === 'Pending'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : detail.status === 'Approved'
                      ? 'bg-teal-50 border-teal-200 text-teal-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className='flex items-center gap-2.5'>
                  {detail.status === 'Pending' ? (
                    <Clock size={18} className='text-amber-600 shrink-0' />
                  ) : detail.status === 'Approved' ? (
                    <CheckCircle2 size={18} className='text-teal-600 shrink-0' />
                  ) : (
                    <XCircle size={18} className='text-rose-600 shrink-0' />
                  )}
                  <div>
                    <span className='text-xs font-bold block'>
                      Status Saat Ini:{' '}
                      {detail.status === 'Pending'
                        ? 'Menunggu Pemeriksaan Admin'
                        : detail.status === 'Approved'
                          ? 'Telah Disetujui'
                          : 'Ditolak'}
                    </span>
                    <span className='text-[11px] opacity-80'>
                      Diajukan pada {formatDate(detail.submittedAt)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    detail.status === 'Pending'
                      ? 'bg-amber-200/80 text-amber-900'
                      : detail.status === 'Approved'
                        ? 'bg-teal-200/80 text-teal-900'
                        : 'bg-rose-200/80 text-rose-900'
                  }`}
                >
                  {detail.status}
                </span>
              </div>

              {/* Rejection Note if Rejected */}
              {detail.status === 'Rejected' && detail.rejectionReason && (
                <div className='p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900'>
                  <span className='font-bold block mb-1 text-rose-950 flex items-center gap-1.5'>
                    <AlertTriangle size={14} className='text-rose-600' />
                    Catatan Alasan Penolakan:
                  </span>
                  <p className='text-slate-700 bg-white p-2.5 rounded-xl border border-rose-100 font-medium leading-relaxed'>
                    &ldquo;{detail.rejectionReason}&rdquo;
                  </p>
                </div>
              )}

              {/* Modular Sub-components */}
              <VerificationBioCard detail={detail} />
              <VerificationScreeningList screening={screening} />
              <VerificationDocumentCard
                detail={detail}
                docUrl={docUrl}
                openingDoc={openingDoc}
                onOpenDocument={handleOpenDocument}
              />
              <VerificationAuditHistory history={detail.history || []} formatDate={formatDate} />

              {/* Action Error Banner */}
              {actionError && (
                <div className='p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2'>
                  <AlertTriangle size={16} className='shrink-0' />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Rejection Form Input (If in Reject Mode) */}
              {isRejectMode && (
                <form
                  onSubmit={handleReject}
                  className='p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col gap-3 animate-fade-in'
                >
                  <div>
                    <label className='block text-xs font-bold text-rose-950 mb-1'>
                      Alasan Penolakan Pendaftaran <span className='text-rose-600'>*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder='Contoh: Dokumen KK/Buku Nikah buram dan tidak terbaca jelas. Mohon unggah ulang foto yang lebih tajam.'
                      rows={3}
                      className='w-full p-3 rounded-xl border border-rose-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500'
                      required
                    />
                  </div>

                  <div className='flex items-center justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setIsRejectMode(false)}
                      disabled={isSubmitting}
                    >
                      Batal
                    </Button>
                    <Button
                      type='submit'
                      variant='primary'
                      size='sm'
                      className='bg-rose-600 hover:bg-rose-700 border-rose-600 text-white'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={13} className='animate-spin' />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        'Kirim Penolakan'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {detail && !isRejectMode && (
          <div className='p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsRejectMode(true)}
              disabled={isSubmitting || detail.status === 'Rejected'}
              className='text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200'
            >
              <XCircle size={15} />
              <span>Tolak Pendaftaran</span>
            </Button>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='primary'
                size='sm'
                onClick={handleApprove}
                disabled={isSubmitting || detail.status === 'Approved'}
                className='bg-teal-600 hover:bg-teal-700 border-teal-600 text-white'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className='animate-spin' />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Setujui Pendaftaran</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

export default VerificationDetailModal;
