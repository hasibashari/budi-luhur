'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Award,
  X,
  Printer,
  CheckCircle2,
  QrCode,
  Building2,
  Calendar,
  User,
  Heart,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { TT_DOSAGE_LIST } from '@/src/shared/constants/domain.constants';
import {
  getCertificateVerificationAction,
  requestCertificateVerificationAction,
} from '@/src/features/user/api/userRepository';
import type { CertificateVerification } from '@/src/features/user/types';

export interface DigitalImmunizationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  catinName: string;
  catinId: string;
  partnerName?: string;
  faskesName: string;
  ttLevel?: number;
  issueDate?: string;
}

const STATUS_LABEL: Record<CertificateVerification['status'], string> = {
  DRAFT: 'Belum Diajukan',
  PENDING: 'Menunggu Verifikasi Admin',
  APPROVED: 'Terverifikasi Admin',
  REJECTED: 'Pengajuan Ditolak',
};

export function DigitalImmunizationCertificateModal({
  isOpen,
  onClose,
  catinName,
  catinId,
  partnerName,
  faskesName,
  ttLevel = 0,
  issueDate,
}: DigitalImmunizationCertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      setVerification(await getCertificateVerificationAction());
    } catch {
      setVerification(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    loadStatus();
  }, [isOpen, loadStatus]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const status = verification?.status || 'DRAFT';
  const isApproved = status === 'APPROVED';
  const canRequest = status === 'DRAFT' || status === 'REJECTED';
  const certificateNumber = isApproved
    ? verification?.certificateNumber || '—'
    : verification?.certificateNumber || 'Belum diterbitkan';

  const handleRequestVerification = async () => {
    setIsRequesting(true);
    setFeedback(null);
    try {
      await requestCertificateVerificationAction();
      await loadStatus();
      setFeedback('Pengajuan terkirim. Petugas faskes akan memverifikasi sertifikat Anda.');
    } catch {
      setFeedback('Gagal mengirim pengajuan verifikasi. Coba lagi.');
    } finally {
      setIsRequesting(false);
    }
  };

  const issueDateLabel =
    issueDate ||
    (verification?.reviewedAt
      ? new Date(verification.reviewedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '—');

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={onClose} />

      <div className='relative z-10 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 max-h-[88vh] sm:max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Top Modal Action Bar */}
        <div className='p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center'>
              <Award size={18} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-slate-900 leading-tight'>
                E-Sertifikat Imunisasi TT Catin
              </h3>
              <span className='text-[10px] text-slate-500'>
                Dokumen Resmi Administrasi KUA / Catatan Sipil
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handlePrint}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer'
            >
              <Printer size={13} />
              <span>Cetak / PDF</span>
            </button>
            <button
              type='button'
              onClick={onClose}
              className='w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer active:scale-90'
              aria-label='Tutup Sertifikat'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className='overflow-y-auto flex-1'>
          {/* Certificate Printable Canvas */}
          <div ref={printRef} className='p-6 sm:p-8 space-y-6 text-slate-900'>
            {/* Official Letterhead Header */}
            <div className='text-center pb-5 border-b-2 border-emerald-700/60 relative'>
              <div className='inline-flex items-center justify-center gap-2 mb-1.5'>
                <div className='w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs'>
                  <ShieldCheck size={22} />
                </div>
                <span className='text-xs font-black tracking-widest text-emerald-800 uppercase'>
                  Kementerian Kesehatan RI
                </span>
              </div>
              <h1 className='text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase'>
                Surat Keterangan Imunisasi Tetanus Toxoid
              </h1>
              <p className='text-xs text-slate-500 font-medium'>
                Standar Pelayanan Kesehatan Calon Pengantin • No: {certificateNumber}
              </p>
            </div>

            {/* Catin Personal Bio Table */}
            <div className='bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200 text-xs sm:text-sm space-y-2.5'>
              <div className='grid grid-cols-3 gap-2'>
                <span className='text-slate-500 font-medium'>Nama Calon Pengantin</span>
                <span className='col-span-2 font-bold text-slate-900 flex items-center gap-1.5'>
                  <User size={13} className='text-emerald-700' />
                  <span>{catinName}</span>
                </span>
              </div>

              {partnerName && (
                <div className='grid grid-cols-3 gap-2'>
                  <span className='text-slate-500 font-medium'>Calon Pasangan</span>
                  <span className='col-span-2 font-bold text-slate-900 flex items-center gap-1.5'>
                    <Heart size={13} className='text-amber-600' />
                    <span>{partnerName}</span>
                  </span>
                </div>
              )}

              <div className='grid grid-cols-3 gap-2'>
                <span className='text-slate-500 font-medium'>Faskes Pelaksana</span>
                <span className='col-span-2 font-bold text-slate-900 flex items-center gap-1.5'>
                  <Building2 size={13} className='text-emerald-700' />
                  <span>{faskesName || 'Puskesmas Kecamatan Domisili Catin'}</span>
                </span>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <span className='text-slate-500 font-medium'>Tanggal Penerbitan</span>
                <span className='col-span-2 font-semibold text-slate-800 flex items-center gap-1.5'>
                  <Calendar size={13} className='text-emerald-700' />
                  <span>{issueDateLabel}</span>
                </span>
              </div>
            </div>

            {/* 5-Dose Medical Table */}
            <div>
              <h4 className='text-xs font-bold text-slate-800 uppercase tracking-wider mb-2'>
                Riwayat Vaksinasi Tetanus Toxoid (TT1 – TT5)
              </h4>
              <div className='border border-stone-200 rounded-2xl overflow-hidden'>
                <table className='w-full text-left text-xs'>
                  <thead className='bg-emerald-50/80 border-b border-stone-200 text-emerald-950 font-bold'>
                    <tr>
                      <th className='py-2.5 px-3'>Dosis</th>
                      <th className='py-2.5 px-3'>Masa Perlindungan</th>
                      <th className='py-2.5 px-3'>Status Klinis</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-stone-100 bg-white'>
                    {TT_DOSAGE_LIST.map((dose, idx) => {
                      const isReceived = idx + 1 <= ttLevel;
                      return (
                        <tr key={dose.level} className={isReceived ? 'bg-emerald-50/20' : ''}>
                          <td className='py-2.5 px-3 font-bold text-slate-900'>{dose.level}</td>
                          <td className='py-2.5 px-3 text-slate-600'>
                            {dose.protectionDuration.split(' (')[0]}
                          </td>
                          <td className='py-2.5 px-3'>
                            {isReceived ? (
                              <span className='inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full'>
                                <CheckCircle2 size={12} className='text-emerald-700' />
                                <span>Telah Diberikan</span>
                              </span>
                            ) : (
                              <span className='text-[11px] font-medium text-slate-400'>
                                Belum Waktunya ({dose.interval.split(' ')[0]}{' '}
                                {dose.interval.split(' ')[1] || ''})
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ucapan Penyemangat */}
            <div className='rounded-2xl p-4 bg-gradient-to-r from-[#fff7ed] via-[#fefce8] to-[#f0fdf4] border border-amber-200'>
              <div className='flex items-start gap-3'>
                <div className='w-9 h-9 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center'>
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className='text-xs sm:text-sm font-bold text-slate-900'>
                    Terima kasih sudah melengkapi imunisasi TT!
                  </p>
                  <p className='text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1'>
                    Setiap dosis yang sudah diselesaikan adalah langkah nyata menjaga kesehatan
                    diri, pasangan, dan calon buah hati. Tetap dampingi proses ini sampai dosis
                    kelima sesuai jadwal yang dianjurkan tenaga kesehatan — perjalanan kecil yang
                    hasilnya bertahan puluhan tahun. Semangat, kamu sudah di jalur yang tepat!
                  </p>
                  {ttLevel < 5 && (
                    <p className='text-[11px] font-semibold text-emerald-700 mt-1.5'>
                      Progres saat ini TT{ttLevel} dari TT5 — lanjutkan ke dosis berikutnya sesuai
                      jadwal.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Verifikasi & Tanda Tangan */}
            <div className='pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-16 h-16 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-center p-1.5 shadow-2xs'>
                  <QrCode size={48} className={isApproved ? 'text-slate-800' : 'text-slate-300'} />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isApproved
                        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        : status === 'REJECTED'
                          ? 'text-rose-800 bg-rose-50 border-rose-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                    }`}
                  >
                    {isLoading ? 'MEMUAT STATUS…' : STATUS_LABEL[status]}
                  </span>
                  <p className='text-[11px] text-slate-500 mt-1'>
                    {isApproved
                      ? 'Sertifikat ini telah disetujui petugas faskes dan sah digunakan.'
                      : 'Sertifikat belum sah sebelum disetujui admin/petugas faskes.'}
                  </p>
                </div>
              </div>

              <div className='text-center sm:text-right text-xs'>
                <span className='text-slate-500 block text-[11px]'>
                  Penanggung Jawab Medis / Bidan Faskes:
                </span>
                {isApproved ? (
                  <>
                    <span className='font-bold text-slate-900 block mt-4 underline decoration-emerald-600'>
                      {verification?.signerName || verification?.reviewedBy || 'Petugas Faskes'}
                    </span>
                    <span className='text-[10px] text-slate-400 block'>
                      {verification?.signerSip
                        ? `SIP. ${verification.signerSip}`
                        : 'SIP tidak dicantumkan'}
                    </span>
                  </>
                ) : (
                  <span className='font-semibold text-slate-400 block mt-4 italic'>
                    Menunggu tanda tangan admin
                  </span>
                )}
              </div>
            </div>

            {/* Aksi pengajuan (hanya pengguna; persetujuan tetap di admin) */}
            {!isApproved && (
              <div className='flex flex-col gap-2'>
                {verification?.note && status === 'REJECTED' && (
                  <p className='text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2'>
                    Catatan admin: {verification.note}
                  </p>
                )}
                {canRequest && (
                  <button
                    type='button'
                    onClick={handleRequestVerification}
                    disabled={isRequesting}
                    className='self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50'
                  >
                    <Clock size={14} />
                    {isRequesting ? 'Mengirim…' : 'Ajukan Verifikasi Sertifikat'}
                  </button>
                )}
                {feedback && <p className='text-[11px] text-slate-600'>{feedback}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Footer Close */}
        <div className='p-4 border-t border-stone-100 bg-stone-50 shrink-0 flex items-center justify-end gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            shape='pill'
            className='min-h-[40px] px-5 text-xs font-semibold cursor-pointer active:scale-95'
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            variant='primary'
            size='sm'
            shape='pill'
            icon={<Printer size={15} />}
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[40px] px-5 text-xs shadow-xs cursor-pointer active:scale-95'
            onClick={handlePrint}
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DigitalImmunizationCertificateModal;
