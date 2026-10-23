'use client';

import React, { useRef } from 'react';
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
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { TT_DOSAGE_LIST } from '@/src/shared/constants/domain.constants';

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

export function DigitalImmunizationCertificateModal({
  isOpen,
  onClose,
  catinName,
  catinId,
  partnerName,
  faskesName,
  ttLevel = 2,
  issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
}: DigitalImmunizationCertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateNumber = `TEMANI-TT/${new Date().getFullYear()}/${catinId.replace(/\D/g, '').padStart(6, '0') || '082194'}`;

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in'>
      <div className='absolute inset-0' onClick={onClose} />

      <div className='relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto flex flex-col justify-between'>
        {/* Top Modal Action Bar */}
        <div className='p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 rounded-t-3xl'>
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
              className='w-7 h-7 rounded-full bg-stone-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer'
            >
              <X size={15} />
            </button>
          </div>
        </div>

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
                <span>{issueDate}</span>
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

          {/* Verification Badge & Digital Signature Row */}
          <div className='pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-16 h-16 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-center p-1.5 shadow-2xs'>
                <QrCode size={48} className='text-slate-800' />
              </div>
              <div>
                <span className='text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200'>
                  TERVALIDASI DIGITAL
                </span>
                <p className='text-[11px] text-slate-500 mt-1'>
                  Pindai QR untuk verifikasi keabsahan data di Portal Sistem Kesehatan Pranikah.
                </p>
              </div>
            </div>

            <div className='text-center sm:text-right text-xs'>
              <span className='text-slate-500 block text-[11px]'>
                Penanggung Jawab Medis / Bidan Faskes:
              </span>
              <span className='font-bold text-slate-900 block mt-4 underline decoration-emerald-600'>
                dr. Siti Rahma, Sp.KKLP / Bdn. Kartika, S.Tr.Keb
              </span>
              <span className='text-[10px] text-slate-400 block'>SIP. 19840212 201001 2 004</span>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className='p-4 border-t border-stone-100 bg-stone-50 rounded-b-3xl flex justify-end'>
          <Button
            variant='primary'
            size='sm'
            shape='pill'
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6'
            onClick={onClose}
          >
            Tutup Sertifikat
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DigitalImmunizationCertificateModal;
