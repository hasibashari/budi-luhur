import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  User,
  HeartPulse,
  ExternalLink,
  Loader2,
  Calendar,
  Phone,
  Mail,
  History,
  Droplets,
} from 'lucide-react';
import {
  getAdminVerificationDetailAction,
  approveUserVerificationAction,
  rejectUserVerificationAction,
  getAdminVerificationDocumentUrl,
} from '../api/adminRepository';
import { AdminVerificationDetail } from '../types/admin.types';
import { Button } from '@/src/shared/components/ui/Button';
import apiClient from '@/src/shared/api/client';

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
  const isPending = detail?.status === 'Pending';
  const docUrl = detail ? getAdminVerificationDocumentUrl(detail.userId) : '';

  const screeningList = [
    { no: 1, label: 'Usia Akseptor', val: `${screening.age || '-'} Tahun` },
    { no: 2, label: 'Jumlah Anak', val: `${screening.childrenCount ?? '-'} Anak` },
    {
      no: 3,
      label: 'Sedang Hamil',
      val: screening.isPregnant ? 'Ya' : 'Tidak',
      isWarning: screening.isPregnant === true,
      hint: 'Kontraindikasi mutlak kehamilan',
    },
    {
      no: 4,
      label: 'Kondisi Medis Kontraindikasi',
      val: screening.hasContraindications ? 'Ya' : 'Tidak',
      isWarning: screening.hasContraindications === true,
      hint: 'Memerlukan evaluasi dokter',
    },
    {
      no: 5,
      label: 'Tekanan Darah Tinggi Tidak Terkontrol',
      val: screening.hasHypertension ? 'Ya' : 'Tidak',
      isWarning: screening.hasHypertension === true,
      hint: 'Risiko kardiovaskular',
    },
    {
      no: 6,
      label: 'Riwayat Gumpalan Darah / Stroke',
      val: screening.hasBloodClotOrStroke ? 'Ya' : 'Tidak',
      isWarning: screening.hasBloodClotOrStroke === true,
      hint: 'Risiko tromboemboli (khusus pil kombinasi)',
    },
    {
      no: 7,
      label: 'Kanker Payudara Aktif',
      val: screening.hasBreastCancer ? 'Ya' : 'Tidak',
      isWarning: screening.hasBreastCancer === true,
      hint: 'Sensitif terhadap pengaruh hormon',
    },
    {
      no: 8,
      label: 'Penyakit Hati Berat',
      val: screening.hasSevereLiverDisease ? 'Ya' : 'Tidak',
      isWarning: screening.hasSevereLiverDisease === true,
      hint: 'Gangguan metabolisme steroid',
    },
    {
      no: 9,
      label: 'Bersedia Minum Teratur Setiap Hari',
      val: screening.willingToTakeDaily ? 'Ya' : 'Tidak',
      isWarning: screening.willingToTakeDaily === false,
      hint: 'Kepatuhan harian krusial',
    },
  ];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto'
    >
      <div className='relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col'>
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

              {/* User Bio Card */}
              <div className='p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5'>
                <span className='text-xs font-bold text-slate-800 flex items-center gap-1.5'>
                  <User size={14} className='text-teal-600' />
                  <span>Informasi Akseptor</span>
                </span>

                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs'>
                  <div>
                    <span className='text-[10px] text-slate-400 block font-medium uppercase'>
                      Nama Lengkap
                    </span>
                    <span className='font-bold text-slate-900'>{detail.userName}</span>
                  </div>

                  <div>
                    <span className='text-[10px] text-slate-400 block font-medium uppercase'>
                      Email
                    </span>
                    <span className='font-medium text-slate-700 truncate block'>{detail.userEmail}</span>
                  </div>

                  <div>
                    <span className='text-[10px] text-slate-400 block font-medium uppercase'>
                      Nomor Telepon
                    </span>
                    <span className='font-medium text-slate-700'>{detail.userPhone}</span>
                  </div>

                  <div>
                    <span className='text-[10px] text-slate-400 block font-medium uppercase'>
                      Pilihan Pil KB
                    </span>
                    <span className='font-bold text-teal-700'>{detail.pillType || 'Pil KB Kombinasi'}</span>
                  </div>

                  <div>
                    <span className='text-[10px] text-slate-400 block font-medium uppercase'>
                      Faskes Rujukan
                    </span>
                    <span className='font-medium text-slate-800'>{detail.schoolOrOrg || '-'}</span>
                  </div>

                  <div>
                    <span className='text-[10px] text-slate-400 block font-medium uppercase'>
                      Biometrik
                    </span>
                    <span className='font-medium text-slate-700'>
                      {detail.bloodType ? `Gol. ${detail.bloodType}` : '-'} •{' '}
                      {detail.height ? `${detail.height} cm` : '-'} /{' '}
                      {detail.weight ? `${detail.weight} kg` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 9 Screening Questions Table */}
              <div className='p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-slate-900 flex items-center gap-1.5'>
                    <HeartPulse size={14} className='text-teal-600' />
                    <span>Hasil Skrining Persyaratan Pil KB (9 Pertanyaan)</span>
                  </span>
                  <span className='text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded'>
                    Kriteria Klinis
                  </span>
                </div>

                <div className='flex flex-col divide-y divide-slate-100 text-xs'>
                  {screeningList.map(item => (
                    <div
                      key={item.no}
                      className={`py-2 px-1.5 flex items-center justify-between gap-3 rounded-lg ${
                        item.isWarning ? 'bg-amber-50/70 font-semibold text-amber-950' : ''
                      }`}
                    >
                      <div className='flex items-start gap-2 min-w-0 flex-1'>
                        <span className='w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5'>
                          {item.no}
                        </span>
                        <div>
                          <span className='text-slate-800 font-medium block leading-snug'>
                            {item.label}
                          </span>
                          {item.hint && (
                            <span className='text-[10px] text-slate-400 block leading-tight'>
                              {item.hint}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='shrink-0 text-right'>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                            item.isWarning
                              ? 'bg-amber-200 text-amber-900 border border-amber-300'
                              : item.val === 'Tidak'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.val}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Document Viewer Card */}
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
                    onClick={handleOpenDocument}
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

              {/* Audit History */}
              {detail.history && detail.history.length > 0 && (
                <div className='p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200 flex flex-col gap-2'>
                  <span className='text-xs font-bold text-slate-700 flex items-center gap-1.5'>
                    <History size={13} className='text-slate-500' />
                    <span>Riwayat Verifikasi Akun</span>
                  </span>

                  <div className='flex flex-col gap-1.5 text-[11px]'>
                    {detail.history.map(h => (
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
              )}

              {/* Error Alert */}
              {actionError && (
                <div className='p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2'>
                  <AlertTriangle size={15} className='shrink-0' />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Reject Mode Form */}
              {isRejectMode && (
                <form
                  onSubmit={handleReject}
                  className='p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-3 animate-fade-in'
                >
                  <label className='block text-xs font-bold text-rose-900'>
                    Tuliskan Alasan Penolakan Pendaftaran <span className='text-rose-600'>*</span>
                  </label>
                  <p className='text-[11px] text-rose-700 leading-relaxed'>
                    Alasan ini akan ditampilkan secara langsung kepada pengguna saat mereka masuk ke
                    halaman status verifikasi akun.
                  </p>
                  <textarea
                    rows={3}
                    placeholder='Contoh: Berkas KTP yang diunggah buram dan tidak terbaca jelas. Mohon unggah ulang foto dokumen asli.'
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    required
                    className='w-full p-3 rounded-xl border border-rose-300 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-400/20'
                  />
                  <div className='flex items-center justify-end gap-2.5 pt-1'>
                    <button
                      type='button'
                      onClick={() => setIsRejectMode(false)}
                      className='px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60'
                    >
                      Batal
                    </button>
                    <Button
                      type='submit'
                      variant='danger'
                      size='sm'
                      shape='pill'
                      disabled={isSubmitting || !rejectReason.trim()}
                      icon={isSubmitting ? <Loader2 size={13} className='animate-spin' /> : <XCircle size={13} />}
                      className='px-5 py-2 text-xs font-bold'
                    >
                      {isSubmitting ? 'Mengirim Penolakan...' : 'Konfirmasi Tolak Pendaftaran'}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && detail && !isRejectMode && (
          <div className='p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors'
            >
              Tutup
            </button>

            <div className='flex items-center gap-2'>
              {/* Button Tolak */}
              <Button
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                disabled={isSubmitting}
                onClick={() => setIsRejectMode(true)}
                icon={<XCircle size={15} className='text-rose-600' />}
                className='text-rose-700 border-rose-200 hover:bg-rose-50 text-xs font-bold'
              >
                Tolak Pendaftaran
              </Button>

              {/* Button Setujui */}
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={isSubmitting || detail.status === 'Approved'}
                onClick={handleApprove}
                icon={
                  isSubmitting ? (
                    <Loader2 size={15} className='animate-spin' />
                  ) : (
                    <CheckCircle2 size={15} />
                  )
                }
                className='bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-xs font-bold'
              >
                {isSubmitting
                  ? 'Menyetujui...'
                  : detail.status === 'Approved'
                    ? 'Sudah Disetujui'
                    : 'Setujui Pendaftaran'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationDetailModal;

