import React, { useRef } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Printer,
  QrCode,
  Building2,
  CheckCircle2,
  Sparkles,
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
}

export function VaccineCardModal({
  isOpen,
  onClose,
  userName,
  faskesName,
  partnerName,
  currentTTLevel = 3,
  records = [],
}: VaccineCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const verifiedCount = records.filter(record => record.verificationStatus === 'VERIFIED').length;

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div className='relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh]'>
        {/* Mobile Pull Drag Indicator Bar */}
        <div className='sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-gradient-to-r from-[#aa294d] to-[#cb4364]'>
          <div className='w-12 h-1.5 rounded-full bg-white/40' />
        </div>

        {/* Header */}
        <div className='px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-xs'>
              <ShieldCheck size={20} className='text-white' />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold leading-tight'>
                Kartu Vaksin Catin Kemenkes RI
              </h3>
              <p className='text-[11px] text-rose-100'>
                Sertifikat Imunisasi Tetanus Toxoid Pranikah
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90'
            aria-label='Tutup Kartu Vaksin'
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Body - Printable Area */}
        <div
          ref={cardRef}
          className='vaccine-card-printable p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-[#121c2a]'
        >
          {/* Institution Header */}
          <div className='flex items-center justify-between pb-3 border-b border-stone-200 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 rounded-lg bg-[#ffd9de] text-[#aa294d] flex items-center justify-center font-black text-xs'>
                P
              </div>
              <div>
                <span className='font-bold text-slate-800 block'>KEMENTERIAN KESEHATAN RI</span>
                <span className='text-[10px] text-slate-500'>
                  Program Skrining Kesehatan Calon Pengantin
                </span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                verifiedCount > 0 ? 'bg-[#aff1d0] text-[#0a5139]' : 'bg-[#fff3cd] text-[#8a5a00]'
              }`}
            >
              {verifiedCount > 0
                ? `${verifiedCount} Dosis Terverifikasi`
                : 'Belum Ada Dosis Terverifikasi'}
            </span>
          </div>

          {/* Catin Identity */}
          <div className='grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#eff4ff] border border-[#d9e3f6]'>
            <div>
              <span className='text-[10px] text-slate-500 uppercase tracking-wider block'>
                Nama Catin
              </span>
              <span className='text-xs sm:text-sm font-bold text-slate-900 block truncate'>
                {userName}
              </span>
            </div>
            <div>
              <span className='text-[10px] text-slate-500 uppercase tracking-wider block'>
                Calon Pasangan
              </span>
              <span className='text-xs sm:text-sm font-bold text-slate-900 block truncate'>
                {partnerName || 'Tercatat di KUA'}
              </span>
            </div>
            <div>
              <span className='text-[10px] text-slate-500 uppercase tracking-wider block'>
                Faskes Pelaksana
              </span>
              <span className='text-xs font-semibold text-slate-800 block truncate flex items-center gap-1'>
                <Building2 size={12} className='text-[#2a6950]' />
                {faskesName}
              </span>
            </div>
            <div>
              <span className='text-[10px] text-slate-500 uppercase tracking-wider block'>
                Status Proteksi
              </span>
              <span className='text-xs font-bold text-[#2a6950] block'>
                {currentTTLevel > 0 ? `TT${currentTTLevel} Tercatat` : 'Belum ada dosis tercatat'}
              </span>
            </div>
          </div>

          {/* Doses History Table */}
          <div>
            <h4 className='text-xs font-bold text-slate-800 mb-2'>
              Riwayat Pemberian Dosis (TT 5 Dosis):
            </h4>
            <div className='border border-stone-200 rounded-xl overflow-hidden text-[11px]'>
              <table className='w-full text-left'>
                <thead className='bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold'>
                  <tr>
                    <th className='p-2'>Dosis</th>
                    <th className='p-2'>Tanggal</th>
                    <th className='p-2'>Proteksi</th>
                    <th className='p-2 text-right'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-stone-100'>
                  {doses.map(dose => (
                    <tr key={dose.level} className='hover:bg-slate-50/50'>
                      <td className='p-2 font-bold text-slate-800'>{dose.level}</td>
                      <td className='p-2 text-slate-600'>{dose.date}</td>
                      <td className='p-2 text-slate-600'>{dose.duration}</td>
                      <td className='p-2 text-right'>
                        {dose.status === 'Belum' ? (
                          <span className='text-slate-400'>{dose.status}</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold ${
                              dose.status === 'Terverifikasi' ? 'text-[#2a6950]' : 'text-amber-700'
                            }`}
                          >
                            <CheckCircle2 size={12} /> {dose.status}
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
          <div className='rounded-2xl p-3.5 bg-gradient-to-r from-[#fff7ed] via-[#fefce8] to-[#f0fdf4] border border-amber-200'>
            <div className='flex items-start gap-2.5'>
              <div className='w-8 h-8 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center'>
                <Sparkles size={16} />
              </div>
              <div>
                <p className='text-[11px] sm:text-xs font-bold text-slate-900'>
                  {currentTTLevel >= 5
                    ? 'Luar biasa — imunisasi TT kamu sudah lengkap sampai TT5!'
                    : 'Terima kasih sudah melangkah sejauh ini!'}
                </p>
                <p className='text-[10px] sm:text-[11px] text-slate-600 leading-relaxed mt-1'>
                  {currentTTLevel >= 5
                    ? 'Perlindungan seumur hidup sudah terbentuk. Tetap jaga kesehatan dan lakukan pemeriksaan pranikah secara berkala bersama pasangan.'
                    : `Setiap dosis yang diselesaikan adalah perlindungan nyata bagi dirimu, pasangan, dan calon buah hati. Lanjutkan sampai TT5 sesuai jadwal dari tenaga kesehatan — sedikit lagi, manfaatnya bertahan puluhan tahun.`}
                </p>
                <p className='text-[10px] font-semibold text-emerald-700 mt-1.5'>
                  Progres: TT{Math.min(currentTTLevel, 5)} dari TT5
                </p>
              </div>
            </div>
          </div>

          {/* QR Verification & Seal */}
          <div className='pt-2 flex items-center justify-between border-t border-stone-100'>
            <div className='flex items-center gap-2'>
              <div className='w-12 h-12 bg-white border border-stone-200 rounded-xl p-1 flex items-center justify-center text-slate-800 shadow-2xs'>
                <QrCode size={36} />
              </div>
              <div className='text-[10px] text-slate-500'>
                <span className='font-bold text-slate-800 block'>Validasi Digital TEMANI</span>
                <span>Pindai untuk memeriksa keaslian surat keterangan imunisasi TT.</span>
              </div>
            </div>
            <div className='text-right'>
              <span className='text-[10px] text-slate-400 block'>Diterbitkan oleh</span>
              <span className='text-[11px] font-bold text-[#aa294d]'>{faskesName}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='px-5 pt-3.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 bg-stone-50 border-t border-stone-200 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5'>
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
            className='w-full sm:w-auto min-h-[44px] bg-[#aa294d] hover:bg-[#cb4364] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95'
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VaccineCardModal;
