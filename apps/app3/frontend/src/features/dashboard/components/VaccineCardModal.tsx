import React, { useRef } from 'react';
import {
  X,
  ShieldCheck,
  Printer,
  QrCode,
  Building2,
  CheckCircle2,
  User,
  Heart,
  Award,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { ImmunizationRecord } from '@/src/features/user/types';

export interface VaccineCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  faskesName: string;
  partnerName?: string;
  currentTTLevel: number;
  records?: ImmunizationRecord[];
  catinId?: string;
}

export function VaccineCardModal({
  isOpen,
  onClose,
  userName,
  faskesName,
  partnerName,
  currentTTLevel = 0,
  records = [],
  catinId,
}: VaccineCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateNumber = `KEMENKES-TT/${new Date().getFullYear()}/${(catinId || userName || 'CATIN')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8)}`;

  const issueDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const protectionLabels = [
    'Skrining Awal (Tidak ada masa proteksi)',
    '3 Tahun Perlindungan',
    '5 Tahun Perlindungan',
    '10 Tahun Perlindungan',
    'Seumur Hidup (≥25 Tahun Perlindungan)',
  ];

  const intervals = [
    'Dosis awal skrining pranikah',
    'Minimal 4 minggu setelah TT1',
    'Minimal 6 bulan setelah TT2',
    'Minimal 1 tahun setelah TT3',
    'Minimal 1 tahun setelah TT4',
  ];

  const doses = Array.from({ length: 5 }, (_, index) => {
    const level = `TT${index + 1}` as ImmunizationRecord['doseLevel'];
    const record = records.find(item => item.doseLevel === level);
    const isCompleted = index + 1 <= currentTTLevel || (record && record.verificationStatus === 'VERIFIED');
    
    return {
      level,
      status: record
        ? record.verificationStatus === 'VERIFIED'
          ? 'Terverifikasi'
          : 'Menunggu Validasi'
        : isCompleted
          ? 'Tercatat'
          : 'Belum Diberikan',
      date: record?.vaccineDate || (isCompleted ? 'Tercatat di Kohort' : '-'),
      faskes: record?.faskesName || faskesName || 'Faskes Layanan Catin',
      duration: protectionLabels[index],
      interval: intervals[index],
      isCompleted,
    };
  });

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in'>
      {/* Backdrop click to close */}
      <div className='absolute inset-0 no-print' onClick={onClose} />

      <div className='relative z-10 w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]'>
        {/* Top Modal Header / Action Bar - Hidded on Print */}
        <div className='no-print px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-sm'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shadow-xs'>
              <Award size={18} className='text-amber-300' />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold leading-tight'>
                Sertifikat Vaksinasi TT Calon Pengantin
              </h3>
              <p className='text-[10px] sm:text-[11px] text-emerald-100'>
                Dokumen Resmi Standar Pelayanan Pranikah Kementerian Kesehatan RI
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handlePrint}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95'
            >
              <Printer size={14} />
              <span>Cetak / PDF</span>
            </button>
            <button
              type='button'
              onClick={onClose}
              className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90'
              aria-label='Tutup Modal'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className='overflow-y-auto flex-1 p-3 sm:p-6 bg-stone-100/60'>
          {/* Certificate Container with Official Frame */}
          <div
            ref={cardRef}
            className='vaccine-card-printable certificate-printable w-full bg-white border-[3px] border-emerald-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-sm text-slate-900 relative'
          >
            {/* Inner Border Frame */}
            <div className='border-2 border-emerald-700/60 rounded-xl sm:rounded-2xl p-4 sm:p-7 relative overflow-hidden bg-radial from-white via-white to-emerald-50/20'>
              {/* Watermark Background Seal */}
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none'>
                <ShieldCheck size={420} className='text-emerald-950' />
              </div>

              {/* Certificate Header (Kop Resmi Kemenkes RI) */}
              <div className='text-center pb-4 border-b-2 border-emerald-800/70 relative'>
                {/* Official Crest Badge */}
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
                  Sertifikat Imunisasi Tetanus Toxoid
                </h1>
                <p className='text-[10px] sm:text-xs font-semibold text-emerald-800 italic uppercase tracking-wider'>
                  Certificate of Tetanus Toxoid (TT) Immunization
                </p>
                <div className='mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-950 font-mono font-bold'>
                  <span>Nomor Dokumen:</span>
                  <span className='text-emerald-800'>{certificateNumber}</span>
                </div>
              </div>

              {/* Identity Details Card (Data Calon Pengantin) */}
              <div className='my-4 rounded-xl bg-slate-50/80 border border-emerald-900/15 p-3.5 sm:p-4 text-xs'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3'>
                  <div>
                    <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider block'>
                      Nama Calon Pengantin / Full Name
                    </span>
                    <span className='text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5'>
                      <User size={13} className='text-emerald-700 shrink-0' />
                      <span className='truncate'>{userName}</span>
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
                      Fasilitas Kesehatan / Health Facility
                    </span>
                    <span className='text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5'>
                      <Building2 size={13} className='text-emerald-700 shrink-0' />
                      <span className='truncate'>{faskesName || 'Puskesmas Wilayah Domisili'}</span>
                    </span>
                  </div>

                  <div>
                    <span className='text-[10px] font-bold text-slate-500 uppercase tracking-wider block'>
                      Status Imunisasi TT / Protection Level
                    </span>
                    <span className='text-xs font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5'>
                      <FileCheck size={13} className='text-emerald-700 shrink-0' />
                      <span>
                        {currentTTLevel > 0
                          ? `TT${currentTTLevel} (${protectionLabels[Math.min(currentTTLevel - 1, 4)]})`
                          : 'Belum Ada Dosis Tercatat'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Dose Table (Riwayat Dosis TT1 - TT5) */}
              <div className='my-4'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5'>
                    <span>Catatan Klinis Vaksinasi Tetanus Toxoid (TT1 – TT5)</span>
                  </h4>
                  <span className='text-[10px] text-slate-500 font-medium'>
                    Vaksin: TT Adsorbed 0.5 mL IM
                  </span>
                </div>

                <div className='border border-stone-200 rounded-xl overflow-hidden shadow-2xs'>
                  <table className='w-full text-left text-[11px] sm:text-xs'>
                    <thead className='bg-emerald-800 text-white font-bold'>
                      <tr>
                        <th className='py-2 px-2.5 sm:px-3 text-center w-14'>Dosis</th>
                        <th className='py-2 px-2.5 sm:px-3'>Tanggal Pemberian</th>
                        <th className='py-2 px-2.5 sm:px-3'>Masa Perlindungan</th>
                        <th className='py-2 px-2.5 sm:px-3 text-right'>Status Medis</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-stone-100 bg-white'>
                      {doses.map((dose, idx) => (
                        <tr
                          key={dose.level}
                          className={dose.isCompleted ? 'bg-emerald-50/30' : idx % 2 === 1 ? 'bg-stone-50/40' : 'bg-white'}
                        >
                          <td className='py-2.5 px-2.5 sm:px-3 text-center font-bold text-emerald-950'>
                            {dose.level}
                          </td>
                          <td className='py-2.5 px-2.5 sm:px-3 font-medium text-slate-700'>
                            {dose.date}
                          </td>
                          <td className='py-2.5 px-2.5 sm:px-3 text-slate-600'>
                            <span className='font-semibold text-slate-800'>{dose.duration}</span>
                            <span className='block text-[10px] text-slate-400'>{dose.interval}</span>
                          </td>
                          <td className='py-2.5 px-2.5 sm:px-3 text-right'>
                            {dose.isCompleted ? (
                              <span className='inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full'>
                                <CheckCircle2 size={11} className='text-emerald-700' />
                                <span>{dose.status}</span>
                              </span>
                            ) : (
                              <span className='text-[10px] font-medium text-slate-400'>
                                Belum Terjadwal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ucapan Penyemangat / Edukasi Pranikah */}
              <div className='my-3 rounded-xl p-3 bg-gradient-to-r from-[#fff7ed] via-[#fefce8] to-[#f0fdf4] border border-amber-200/90 text-xs'>
                <div className='flex items-start gap-2.5'>
                  <div className='w-7 h-7 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mt-0.5'>
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <p className='text-[11px] font-bold text-slate-900 leading-tight'>
                      {currentTTLevel >= 5
                        ? 'Luar Biasa — Imunisasi TT Lengkap Seumur Hidup!'
                        : 'Langkah Nyata Melindungi Pasangan & Buah Hati'}
                    </p>
                    <p className='text-[10px] text-slate-600 leading-relaxed mt-0.5'>
                      {currentTTLevel >= 5
                        ? 'Kekebalan jangka panjang terhadap infeksi tetanus maternal dan neonatal telah terbentuk penuh. Tetap terapkan pola hidup bersih dan sehat bersama pasangan.'
                        : 'Setiap dosis yang telah diselesaikan memberikan proteksi aktif. Terus ikuti jadwal berikutnya di fasilitas pelayanan kesehatan sampai TT5.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signatures & Security Validation Section */}
              <div className='pt-3 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4'>
                {/* QR Code Validation */}
                <div className='flex items-center gap-3'>
                  <div className='w-14 h-14 bg-white border border-stone-300 rounded-xl p-1 flex items-center justify-center text-slate-900 shadow-2xs shrink-0'>
                    <QrCode size={44} />
                  </div>
                  <div className='text-[10px] text-slate-500 max-w-[210px]'>
                    <span className='font-bold text-slate-900 block'>Validasi Resmi TEMANI</span>
                    <span>Pindai QR ini untuk memastikan keaslian sertifikat di basis data kesehatan pranikah.</span>
                  </div>
                </div>

                {/* Circular Validation Seal */}
                <div className='hidden sm:flex items-center justify-center'>
                  <div className='w-20 h-20 rounded-full border-2 border-dashed border-emerald-700 p-1 flex items-center justify-center select-none text-center bg-emerald-50/50'>
                    <div className='rounded-full border border-emerald-800 w-full h-full flex flex-col items-center justify-center p-0.5'>
                      <span className='text-[7px] font-black text-emerald-900 tracking-wider'>KEMENKES RI</span>
                      <ShieldCheck size={14} className='text-emerald-700 my-0.5' />
                      <span className='text-[6px] font-bold text-emerald-800 leading-none'>TERVALIDASI</span>
                    </div>
                  </div>
                </div>

                {/* Issuer & Signature Block */}
                <div className='text-center sm:text-right text-xs'>
                  <span className='text-[10px] text-slate-400 block'>
                    Diterbitkan di {faskesName || 'Faskes Pelaksana'}, {issueDateFormatted}
                  </span>
                  <span className='text-[10px] font-semibold text-slate-600 block mt-0.5'>
                    Penanggung Jawab Imunisasi Catin
                  </span>
                  <div className='mt-3'>
                    <span className='font-bold text-slate-900 block text-xs underline decoration-emerald-700 decoration-1'>
                      Tim Medis / Bidan Pengelola TT
                    </span>
                    <span className='text-[9px] text-slate-400 block'>
                      Sertifikat Sah & Terdaftar Sistem Kesehatan Pranikah
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Action Buttons - Hidden on Print */}
        <div className='no-print px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 shrink-0'>
          <Button
            variant='outline'
            size='md'
            shape='pill'
            onClick={onClose}
            className='w-full sm:w-auto min-h-[42px] text-xs font-semibold cursor-pointer active:scale-95'
          >
            Tutup
          </Button>
          <Button
            variant='primary'
            size='md'
            shape='pill'
            icon={<Printer size={16} />}
            onClick={handlePrint}
            className='w-full sm:w-auto min-h-[42px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95'
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VaccineCardModal;
