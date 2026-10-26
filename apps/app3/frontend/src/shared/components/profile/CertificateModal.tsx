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
  FileCheck,
  AlertCircle,
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
  APPROVED: 'Terverifikasi & Sah',
  REJECTED: 'Pengajuan Perlu Perbaikan',
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
    ? verification?.certificateNumber || `KEMENKES-TT/${new Date().getFullYear()}/${catinId.toUpperCase().slice(0, 8)}`
    : verification?.certificateNumber || 'DRAFT-BELUM-TERVERIFIKASI';

  const handleRequestVerification = async () => {
    setIsRequesting(true);
    setFeedback(null);
    try {
      await requestCertificateVerificationAction();
      await loadStatus();
      setFeedback('Pengajuan verifikasi berhasil dikirim. Petugas faskes akan meninjau data Anda.');
    } catch {
      setFeedback('Gagal mengirim pengajuan verifikasi. Silakan coba lagi.');
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
      : new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }));

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in'>
      {/* Backdrop click to close */}
      <div className='absolute inset-0 no-print' onClick={onClose} />

      <div className='relative z-10 w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 max-h-[92vh] overflow-hidden flex flex-col'>
        {/* Top Modal Action Bar - Hidden on Print */}
        <div className='no-print p-4 sm:p-4.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shrink-0'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-white/15 text-amber-300 flex items-center justify-center shadow-xs'>
              <Award size={18} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold leading-tight'>
                E-Sertifikat Imunisasi TT Calon Pengantin
              </h3>
              <span className='text-[10px] text-emerald-100 block'>
                Dokumen Resmi Administrasi KUA / Catatan Sipil & Kemenkes RI
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handlePrint}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95'
            >
              <Printer size={13} />
              <span>Cetak / PDF</span>
            </button>
            <button
              type='button'
              onClick={onClose}
              className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90'
              aria-label='Tutup Sertifikat'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className='overflow-y-auto flex-1 p-3 sm:p-6 bg-stone-100/60'>
          {/* Certificate Printable Canvas */}
          <div
            ref={printRef}
            className='certificate-printable vaccine-card-printable w-full bg-white border-[3px] border-emerald-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-sm text-slate-900 relative'
          >
            {/* Inner Border Frame */}
            <div className='border-2 border-emerald-700/60 rounded-xl sm:rounded-2xl p-4 sm:p-7 relative overflow-hidden bg-radial from-white via-white to-emerald-50/20'>
              {/* Watermark Background Seal */}
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none'>
                <ShieldCheck size={420} className='text-emerald-950' />
              </div>

              {/* Official Letterhead Header */}
              <div className='text-center pb-4 border-b-2 border-emerald-800/70 relative'>
                <div className='inline-flex items-center justify-center gap-2.5 mb-1.5'>
                  <div className='w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-amber-300 flex items-center justify-center shadow-md border border-amber-300/40'>
                    <ShieldCheck size={24} className='text-emerald-50' />
                  </div>
                  <div className='text-left'>
                    <span className='text-[10px] sm:text-xs font-black tracking-[0.18em] text-emerald-900 uppercase block'>
                      Kementerian Kesehatan RI
                    </span>
                    <span className='text-[8px] sm:text-[9px] font-semibold tracking-wider text-slate-500 uppercase block'>
                      Ministry of Health • Republic of Indonesia
                    </span>
                  </div>
                </div>

                <h1 className='text-base sm:text-xl font-black text-slate-950 tracking-tight uppercase mt-1'>
                  Surat Keterangan Imunisasi Tetanus Toxoid
                </h1>
                <p className='text-[10px] sm:text-xs font-semibold text-emerald-800 italic uppercase tracking-wider'>
                  Official Certificate of Premarital Tetanus Toxoid Immunization
                </p>
                <div className='mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-950 font-mono font-bold'>
                  <span>No. Registrasi:</span>
                  <span className='text-emerald-800'>{certificateNumber}</span>
                </div>
              </div>

              {/* Catin Personal Bio Table */}
              <div className='my-4 rounded-xl bg-slate-50/80 border border-emerald-900/15 p-3.5 sm:p-4 text-xs'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3'>
                  <div>
                    <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider block'>
                      Nama Calon Pengantin / Full Name
                    </span>
                    <span className='text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5'>
                      <User size={13} className='text-emerald-700 shrink-0' />
                      <span className='truncate'>{catinName}</span>
                    </span>
                  </div>

                  <div>
                    <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider block'>
                      Calon Pasangan / Fiancé(e) Name
                    </span>
                    <span className='text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5'>
                      <Heart size={13} className='text-rose-600 shrink-0' />
                      <span className='truncate'>{partnerName || 'Tercatat di KUA / Catatan Sipil'}</span>
                    </span>
                  </div>

                  <div>
                    <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider block'>
                      Fasilitas Pelaksana / Administering Facility
                    </span>
                    <span className='text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5'>
                      <Building2 size={13} className='text-emerald-700 shrink-0' />
                      <span className='truncate'>{faskesName || 'Puskesmas Kecamatan Domisili Catin'}</span>
                    </span>
                  </div>

                  <div>
                    <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider block'>
                      Tanggal Penerbitan / Date of Issue
                    </span>
                    <span className='text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5'>
                      <Calendar size={13} className='text-emerald-700 shrink-0' />
                      <span>{issueDateLabel}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Dose Medical Table */}
              <div className='my-4'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider'>
                    Riwayat Vaksinasi Tetanus Toxoid (TT1 – TT5)
                  </h4>
                  <span className='text-[10px] text-slate-500 font-medium'>
                    Protokol Imunisasi Pranikah Kemenkes
                  </span>
                </div>
                <div className='border border-stone-200 rounded-xl overflow-hidden shadow-2xs'>
                  <table className='w-full text-left text-[11px] sm:text-xs'>
                    <thead className='bg-emerald-800 text-white font-bold'>
                      <tr>
                        <th className='py-2 px-2.5 sm:px-3 text-center w-14'>Dosis</th>
                        <th className='py-2 px-2.5 sm:px-3'>Masa Perlindungan</th>
                        <th className='py-2 px-2.5 sm:px-3 text-right'>Status Klinis</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-stone-100 bg-white'>
                      {TT_DOSAGE_LIST.map((dose, idx) => {
                        const isReceived = idx + 1 <= ttLevel;
                        return (
                          <tr key={dose.level} className={isReceived ? 'bg-emerald-50/30' : idx % 2 === 1 ? 'bg-stone-50/40' : 'bg-white'}>
                            <td className='py-2.5 px-2.5 sm:px-3 text-center font-bold text-emerald-950'>{dose.level}</td>
                            <td className='py-2.5 px-2.5 sm:px-3 text-slate-700'>
                              <span className='font-semibold text-slate-800'>{dose.protectionDuration.split(' (')[0]}</span>
                              <span className='block text-[10px] text-slate-400'>{dose.interval}</span>
                            </td>
                            <td className='py-2.5 px-2.5 sm:px-3 text-right'>
                              {isReceived ? (
                                <span className='inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full'>
                                  <CheckCircle2 size={11} className='text-emerald-700' />
                                  <span>Telah Diberikan</span>
                                </span>
                              ) : (
                                <span className='text-[10px] font-medium text-slate-400'>
                                  Belum Waktunya ({dose.interval.split(' ')[0]} {dose.interval.split(' ')[1] || ''})
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
              <div className='my-3 rounded-xl p-3 bg-gradient-to-r from-[#fff7ed] via-[#fefce8] to-[#f0fdf4] border border-amber-200/90 text-xs'>
                <div className='flex items-start gap-2.5'>
                  <div className='w-7 h-7 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mt-0.5'>
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <p className='text-[11px] font-bold text-slate-900 leading-tight'>
                      Terima kasih sudah melengkapi imunisasi TT pranikah!
                    </p>
                    <p className='text-[10px] text-slate-600 leading-relaxed mt-0.5'>
                      Setiap dosis yang sudah diselesaikan adalah langkah nyata menjaga kesehatan diri, pasangan, dan calon buah hati.
                      Perjalanan kecil dengan hasil perlindungan hingga puluhan tahun.
                    </p>
                    {ttLevel < 5 && (
                      <p className='text-[10px] font-bold text-emerald-700 mt-1'>
                        Progres saat ini TT{ttLevel} dari TT5 — lanjutkan dosis berikutnya sesuai jadwal fasilitas kesehatan.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Verifikasi & Tanda Tangan */}
              <div className='pt-3 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-14 h-14 bg-white border border-stone-300 rounded-xl flex items-center justify-center p-1 shadow-2xs shrink-0'>
                    <QrCode size={44} className={isApproved ? 'text-slate-900' : 'text-slate-400'} />
                  </div>
                  <div className='max-w-[210px]'>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border inline-block ${
                        isApproved
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                          : status === 'REJECTED'
                            ? 'text-rose-800 bg-rose-50 border-rose-200'
                            : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {isLoading ? 'MEMUAT STATUS…' : STATUS_LABEL[status]}
                    </span>
                    <p className='text-[10px] text-slate-500 mt-0.5 leading-snug'>
                      {isApproved
                        ? 'Sertifikat telah disetujui & disahkan oleh tenaga medis penanggung jawab.'
                        : 'Sertifikat resmi aktif setelah disetujui petugas faskes/KUA.'}
                    </p>
                  </div>
                </div>

                {/* Circular Official Seal */}
                <div className='hidden sm:flex items-center justify-center'>
                  <div className='w-20 h-20 rounded-full border-2 border-dashed border-emerald-700 p-1 flex items-center justify-center select-none text-center bg-emerald-50/50'>
                    <div className='rounded-full border border-emerald-800 w-full h-full flex flex-col items-center justify-center p-0.5'>
                      <span className='text-[7px] font-black text-emerald-900 tracking-wider'>KEMENKES RI</span>
                      <ShieldCheck size={14} className='text-emerald-700 my-0.5' />
                      <span className='text-[6px] font-bold text-emerald-800 leading-none'>
                        {isApproved ? 'TERVERIFIKASI' : 'DRAFT TEMANI'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='text-center sm:text-right text-xs'>
                  <span className='text-[10px] text-slate-400 block'>
                    Penanggung Jawab Medis / Bidan Faskes:
                  </span>
                  {isApproved ? (
                    <div className='mt-2'>
                      <span className='font-bold text-slate-900 block text-xs underline decoration-emerald-700'>
                        {verification?.signerName || verification?.reviewedBy || 'Petugas Faskes Penguji'}
                      </span>
                      <span className='text-[9px] text-slate-500 block mt-0.5'>
                        {verification?.signerSip ? `SIP. ${verification.signerSip}` : 'Surat Izin Praktik Terdaftar Kemenkes'}
                      </span>
                    </div>
                  ) : (
                    <div className='mt-2'>
                      <span className='font-semibold text-slate-400 block text-xs italic'>
                        Menunggu Tanda Tangan Faskes
                      </span>
                      <span className='text-[9px] text-slate-400 block mt-0.5'>
                        Verifikasi otomatis via sistem TEMANI
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Request Action Panel - Hidden on Print */}
          {!isApproved && (
            <div className='no-print mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs flex flex-col gap-2.5'>
              <div className='flex items-start gap-2'>
                <AlertCircle size={16} className='text-amber-700 shrink-0 mt-0.5' />
                <div>
                  <p className='font-bold text-amber-950'>
                    {status === 'PENDING'
                      ? 'Pengajuan Sedang Dalam Peninjauan'
                      : status === 'REJECTED'
                        ? 'Pengajuan Membutuhkan Revisi'
                        : 'Sertifikat Belum Diajukan ke Petugas'}
                  </p>
                  <p className='text-amber-800 mt-0.5 text-[11px] leading-relaxed'>
                    {status === 'PENDING'
                      ? 'Petugas kesehatan sedang memvalidasi riwayat imunisasi Anda. Anda tetap dapat mencetak salinan draft ini.'
                      : status === 'REJECTED'
                        ? `Catatan petugas: ${verification?.note || 'Mohon periksa kembali kesesuaian riwayat TT Anda.'}`
                        : 'Klik tombol di bawah untuk mengajukan permohonan penerbitan tanda tangan sah petugas faskes.'}
                  </p>
                </div>
              </div>

              {canRequest && (
                <div className='pt-1'>
                  <button
                    type='button'
                    onClick={handleRequestVerification}
                    disabled={isRequesting}
                    className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95'
                  >
                    <Clock size={13} />
                    <span>{isRequesting ? 'Mengirim Pengajuan…' : 'Ajukan Verifikasi Sertifikat Sekarang'}</span>
                  </button>
                </div>
              )}

              {feedback && (
                <p className='text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 p-2 rounded-xl border border-emerald-200'>
                  {feedback}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className='no-print p-4 border-t border-stone-100 bg-stone-50 shrink-0 flex items-center justify-end gap-2.5'>
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
            className='bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[40px] px-5 text-xs shadow-xs cursor-pointer active:scale-95'
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
