import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  Printer,
  QrCode,
  Building2,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { ImmunizationRecord, CertificateVerification } from '@/src/features/user/types';

export interface VaccineCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  faskesName: string;
  partnerName?: string;
  currentTTLevel: number;
  records?: ImmunizationRecord[];
  certificate?: CertificateVerification | null;
  onRequestVerification?: () => Promise<void> | void;
  isRequestingVerification?: boolean;
}

const STATUS_LABEL: Record<CertificateVerification['status'], string> = {
  DRAFT: 'Belum Diajukan',
  PENDING: 'Menunggu Verifikasi Faskes',
  APPROVED: 'Terverifikasi Resmi',
  REJECTED: 'Pengajuan Perlu Perbaikan',
};

export function VaccineCardModal({
  isOpen,
  onClose,
  userName,
  faskesName,
  partnerName,
  currentTTLevel = 3,
  records = [],
  certificate,
  onRequestVerification,
  isRequestingVerification = false,
}: VaccineCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('vaccine-modal-open');
    return () => {
      document.body.classList.remove('vaccine-modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isApproved = certificate?.status === 'APPROVED';
  const certNumber = certificate?.certificateNumber || (isApproved ? 'TT-2026-CATIN-RESMI' : null);

  const doses = Array.from({ length: 5 }, (_, index) => {
    const level = `TT${index + 1}` as ImmunizationRecord['doseLevel'];
    const record = records.find(item => item.doseLevel === level);
    return {
      level,
      status: record
        ? record.verificationStatus === 'VERIFIED'
          ? 'Terverifikasi'
          : 'Menunggu Validasi'
        : 'Belum',
      date: record?.vaccineDate || '-',
      faskes: record?.faskesName || faskesName,
      duration: ['Skrining Awal', '3 Tahun', '5 Tahun', '10 Tahun', 'Seumur Hidup'][index],
    };
  });

  const modalContent = (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='vaccine-card-title'
      className='vaccine-card-modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fade-in'
    >
      <div className='vaccine-card-modal-wrapper relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]'>
        {/* Printable Document Canvas */}
        <div
          ref={cardRef}
          className='vaccine-card-print-document overflow-y-auto flex-1 flex flex-col'
        >
          {/* Card Header (Included in Print) */}
          <div className='px-5 py-4 sm:px-6 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-center justify-between shrink-0 rounded-t-2xl sm:rounded-t-3xl'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-xs shrink-0'>
                <ShieldCheck size={22} className='text-white' />
              </div>
              <div>
                <h3
                  id='vaccine-card-title'
                  className='text-sm sm:text-base font-bold leading-tight'
                >
                  Kartu Vaksin Catin Kemenkes RI
                </h3>
                <p className='text-[11px] sm:text-xs text-rose-100 mt-0.5 font-medium'>
                  {certNumber
                    ? `No: ${certNumber} • E-Sertifikat Imunisasi TT Pranikah`
                    : 'Sertifikat Imunisasi Tetanus Toxoid Pranikah Resmi'}
                </p>
              </div>
            </div>

            {/* Screen-only Close Button */}
            <button
              type='button'
              onClick={onClose}
              className='no-print w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90 shrink-0'
              aria-label='Tutup Kartu Vaksin'
            >
              <X size={18} />
            </button>
          </div>

          {/* Card Body Content */}
          <div className='p-5 sm:p-6 flex flex-col gap-4 text-[#121c2a] bg-white rounded-b-2xl sm:rounded-b-3xl'>
            {/* Institution Letterhead Header */}
            <div className='flex items-center justify-between pb-3 border-b border-stone-200 text-xs'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-xl bg-[#ffd9de] text-[#aa294d] flex items-center justify-center font-black text-xs shrink-0'>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className='font-bold text-slate-900 block text-xs tracking-wide uppercase'>
                    KEMENTERIAN KESEHATAN REPUBLIK INDONESIA
                  </span>
                  <span className='text-[10px] text-slate-500 block'>
                    Standar Pelayanan Skrining Kesehatan Calon Pengantin • Faskes:{' '}
                    {faskesName || 'Puskesmas Mitra TEMANI'}
                  </span>
                </div>
              </div>

              {certificate?.status && (
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border shrink-0 ${
                    isApproved
                      ? 'text-[#0a5139] bg-[#aff1d0]/80 border-[#aff1d0]'
                      : certificate.status === 'PENDING'
                        ? 'text-amber-800 bg-amber-50 border-amber-200'
                        : certificate.status === 'REJECTED'
                          ? 'text-rose-800 bg-rose-50 border-rose-200'
                          : 'text-slate-600 bg-slate-100 border-slate-200'
                  }`}
                >
                  {STATUS_LABEL[certificate.status]}
                </span>
              )}
            </div>

            {/* Catin Identity Grid */}
            <div className='grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#eff4ff] border border-[#d9e3f6]'>
              <div>
                <span className='text-[10px] text-slate-500 uppercase tracking-wider block font-semibold'>
                  Nama Calon Pengantin
                </span>
                <span className='text-xs sm:text-sm font-bold text-slate-900 block truncate mt-0.5'>
                  {userName}
                </span>
              </div>
              <div>
                <span className='text-[10px] text-slate-500 uppercase tracking-wider block font-semibold'>
                  Calon Pasangan
                </span>
                <span className='text-xs sm:text-sm font-bold text-slate-900 block truncate mt-0.5'>
                  {partnerName || 'Tercatat di Faskes'}
                </span>
              </div>
              <div>
                <span className='text-[10px] text-slate-500 uppercase tracking-wider block font-semibold'>
                  Fasilitas Kesehatan Pelaksana
                </span>
                <span className='text-xs font-semibold text-slate-800 block truncate flex items-center gap-1.5 mt-0.5'>
                  <Building2 size={13} className='text-[#2a6950] shrink-0' />
                  <span>{faskesName || 'Puskesmas Mitra TEMANI'}</span>
                </span>
              </div>
              <div>
                <span className='text-[10px] text-slate-500 uppercase tracking-wider block font-semibold'>
                  Status Proteksi Klinis
                </span>
                <span className='text-xs font-bold text-[#2a6950] block mt-0.5'>
                  {currentTTLevel > 0
                    ? `TT${currentTTLevel} Tercatat (Terlindungi)`
                    : 'Belum Ada Dosis Tercatat'}
                </span>
              </div>
            </div>

            {/* Doses History Table */}
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center justify-between'>
                <h4 className='text-xs font-bold text-slate-800 tracking-wide uppercase'>
                  Riwayat Pemberian Dosis Imunisasi (TT 5 Dosis):
                </h4>
              </div>
              <div className='border border-stone-200 rounded-xl overflow-x-auto text-xs'>
                <table className='w-full min-w-[460px] sm:min-w-full text-left'>
                  <thead className='bg-stone-50 border-b border-stone-200 text-slate-700 font-bold'>
                    <tr>
                      <th className='p-2 sm:p-2.5 whitespace-nowrap'>Dosis</th>
                      <th className='p-2 sm:p-2.5 whitespace-nowrap'>Tanggal Pemberian</th>
                      <th className='p-2 sm:p-2.5 whitespace-nowrap'>Masa Perlindungan</th>
                      <th className='p-2 sm:p-2.5 text-right whitespace-nowrap'>Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-stone-100 bg-white'>
                    {doses.map(dose => (
                      <tr key={dose.level} className='hover:bg-slate-50/50'>
                        <td className='p-2 sm:p-2.5 font-bold text-slate-900 whitespace-nowrap'>
                          {dose.level}
                        </td>
                        <td className='p-2 sm:p-2.5 text-slate-600 whitespace-nowrap'>
                          {dose.date}
                        </td>
                        <td className='p-2 sm:p-2.5 text-slate-600 whitespace-nowrap'>
                          {dose.duration}
                        </td>
                        <td className='p-2 sm:p-2.5 text-right whitespace-nowrap'>
                          {dose.status === 'Belum' ? (
                            <span className='text-slate-400 font-medium'>{dose.status}</span>
                          ) : (
                            <span
                              className={`inline-flex items-center justify-end gap-1 font-bold ${
                                dose.status === 'Terverifikasi'
                                  ? 'text-[#0a5139]'
                                  : 'text-amber-700'
                              }`}
                            >
                              <CheckCircle2 size={13} className='shrink-0' /> {dose.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ucapan Penyemangat */}
            <div className='rounded-2xl p-3.5 bg-gradient-to-r from-[#ffd9de]/30 via-[#eff4ff] to-[#aff1d0]/30 border border-[#ffd9de]/60'>
              <div className='flex items-start gap-2.5'>
                <div className='w-8 h-8 shrink-0 rounded-full bg-[#ffd9de] text-[#aa294d] flex items-center justify-center mt-0.5 shrink-0'>
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className='text-xs font-bold text-slate-900'>
                    {currentTTLevel >= 5
                      ? 'Luar biasa — imunisasi TT kamu sudah lengkap sampai TT5!'
                      : 'Terima kasih sudah melangkah melengkapi imunisasi TT!'}
                  </p>
                  <p className='text-[11px] text-slate-600 leading-relaxed mt-0.5'>
                    {currentTTLevel >= 5
                      ? 'Perlindungan seumur hidup sudah terbentuk. Tetap jaga kesehatan dan lakukan pemeriksaan pranikah secara berkala bersama pasangan.'
                      : 'Setiap dosis yang diselesaikan adalah perlindungan nyata bagi dirimu, pasangan, dan calon buah hati. Lanjutkan sampai TT5 sesuai jadwal dari tenaga kesehatan.'}
                  </p>
                  <p className='text-[10px] font-bold text-[#2a6950] mt-1'>
                    Progres: TT{Math.min(currentTTLevel, 5)} dari TT5
                  </p>
                </div>
              </div>
            </div>

            {/* Status Penandatangan / Verifikasi Faskes & QR Seal */}
            <div className='pt-2 flex items-center justify-between border-t border-stone-200 gap-3'>
              <div className='flex items-center gap-2.5'>
                <div className='w-12 h-12 bg-white border border-stone-200 rounded-xl p-1 flex items-center justify-center text-slate-900 shadow-2xs shrink-0'>
                  <QrCode size={38} />
                </div>
                <div className='text-[10px] text-slate-500'>
                  <span className='font-bold text-slate-800 block text-xs'>
                    Validasi Digital TEMANI
                  </span>
                  <span>
                    Pindai untuk memeriksa keabsahan surat keterangan imunisasi TT pranikah.
                  </span>
                </div>
              </div>

              <div className='text-right text-xs'>
                <span className='text-[10px] text-slate-500 block'>
                  Penanggung Jawab Medis / Bidan Faskes:
                </span>
                {isApproved ? (
                  <>
                    <span className='font-bold text-slate-900 block mt-1 underline decoration-[#aa294d]'>
                      {certificate?.signerName || certificate?.reviewedBy || 'Petugas Faskes'}
                    </span>
                    <span className='text-[10px] text-slate-500 block'>
                      {certificate?.signerSip
                        ? `SIP. ${certificate.signerSip}`
                        : faskesName || 'Puskesmas Mitra TEMANI'}
                    </span>
                  </>
                ) : (
                  <span className='text-[11px] font-semibold text-slate-600 block mt-1'>
                    {faskesName || 'Puskesmas Mitra TEMANI'}
                  </span>
                )}
              </div>
            </div>

            {/* Tombol Ajukan Verifikasi (no-print) */}
            {onRequestVerification &&
              (!certificate ||
                certificate.status === 'DRAFT' ||
                certificate.status === 'REJECTED') && (
                <div className='no-print pt-2 flex flex-col gap-1.5 border-t border-stone-100'>
                  {certificate?.note && certificate.status === 'REJECTED' && (
                    <p className='text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2'>
                      Catatan Faskes: {certificate.note}
                    </p>
                  )}
                  <Button
                    variant='primary'
                    size='sm'
                    shape='pill'
                    icon={<Clock size={14} />}
                    disabled={isRequestingVerification}
                    onClick={onRequestVerification}
                    className='bg-[#aa294d] hover:bg-[#8c0f39] text-white font-bold text-xs shadow-xs self-start cursor-pointer active:scale-95'
                  >
                    {isRequestingVerification
                      ? 'Mengirim Pengajuan…'
                      : 'Ajukan Verifikasi Resmi ke Faskes'}
                  </Button>
                </div>
              )}
          </div>
        </div>

        {/* Footer Actions (Screen only, excluded from print) */}
        <div className='no-print px-5 py-3.5 sm:px-6 bg-stone-50 border-t border-stone-200 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 shrink-0'>
          <Button
            variant='outline'
            size='md'
            shape='pill'
            onClick={onClose}
            className='w-full sm:w-auto min-h-[44px] text-xs font-semibold cursor-pointer active:scale-95'
          >
            Tutup
          </Button>
          <Button
            variant='primary'
            size='md'
            shape='pill'
            icon={<Printer size={16} />}
            onClick={handlePrint}
            className='w-full sm:w-auto min-h-[44px] bg-[#aa294d] hover:bg-[#8c0f39] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95'
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

export default VaccineCardModal;
