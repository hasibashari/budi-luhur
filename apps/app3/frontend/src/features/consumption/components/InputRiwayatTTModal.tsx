import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

export interface NewTTRiwayatData {
  doseLevel: string;
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  fileName?: string;
}

export interface InputRiwayatTTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTTRiwayatData) => void;
  defaultDose?: string;
}

export function InputRiwayatTTModal({
  isOpen,
  onClose,
  onSubmit,
  defaultDose = 'TT1',
}: InputRiwayatTTModalProps) {
  const [doseLevel, setDoseLevel] = useState(defaultDose);
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0]);
  const [faskesName, setFaskesName] = useState('Puskesmas Kebayoran, Jakarta Selatan');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${sizeMb} MB`,
      });
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        doseLevel,
        vaccineDate,
        faskesName,
        batchNumber: batchNumber || undefined,
        notes: notes || undefined,
        fileName: selectedFile?.name,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div className='relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]'>
        {/* Modal Header */}
        <div className='px-5 py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-xs'>
              <span className='material-symbols-outlined text-[22px]'>health_and_safety</span>
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold leading-tight'>
                Pencatatan Dosis Mandiri
              </h3>
              <p className='text-[11px] text-rose-100'>Riwayat Imunisasi Tetanus Toxoid (TT)</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form
          onSubmit={handleSubmit}
          className='p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-[#121c2a]'
        >
          {/* Guidance / Context Micro-Banner (Stitch Screen 5) */}
          <div className='relative overflow-hidden rounded-2xl bg-[#eff4ff] p-3.5 border border-[#d9e3f6]'>
            <div className='flex items-start gap-3'>
              <div className='w-9 h-9 rounded-full bg-[#ffd9de] flex items-center justify-center shrink-0 text-[#aa294d]'>
                <span className='material-symbols-outlined text-[20px]'>health_and_safety</span>
              </div>
              <div className='min-w-0 flex-1'>
                <h4 className='text-xs font-bold text-[#121c2a]'>Catat Riwayat Faskes Terdahulu</h4>
                <p className='text-[11px] text-[#574144] mt-0.5 leading-relaxed'>
                  Catat riwayat suntik TT yang sudah pernah kamu dapatkan di Puskesmas, Klinik, atau
                  Rumah Sakit untuk melengkapi status perlindunganmu.
                </p>
              </div>
            </div>
          </div>

          {/* Field 1: Jenis Imunisasi (Dropdown Selector) */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='jenisImunisasi'
                className='text-xs font-bold text-[#121c2a] flex items-center gap-1'
              >
                Pilih Jenis Imunisasi <span className='text-[#aa294d]'>*</span>
              </label>
              <span className='text-[11px] text-[#2a6950] font-semibold flex items-center gap-0.5'>
                <span className='material-symbols-outlined text-[14px]'>verified</span>{' '}
                Terstandarisasi Kemenkes
              </span>
            </div>
            <div className='relative'>
              <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#aa294d]'>
                <span className='material-symbols-outlined text-[20px]'>vaccines</span>
              </div>
              <select
                id='jenisImunisasi'
                value={doseLevel}
                onChange={e => setDoseLevel(e.target.value)}
                className='w-full h-11 pl-11 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm font-semibold shadow-xs appearance-none focus:outline-none focus:border-[#aa294d] transition-all'
                required
              >
                <option value='TT1'>TT1 - Dosis Pertama (Langkah Awal)</option>
                <option value='TT2'>TT2 - Dosis Kedua (Interval 4 Minggu dari TT1)</option>
                <option value='TT3'>TT3 - Dosis Ketiga (Interval 6 Bulan dari TT2)</option>
                <option value='TT4'>TT4 - Dosis Keempat (Interval 1 Tahun dari TT3)</option>
                <option value='TT5'>TT5 - Dosis Kelima (Perlindungan Lengkap &gt;25 Thn)</option>
              </select>
              <div className='absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>keyboard_arrow_down</span>
              </div>
            </div>
            <p className='text-[11px] text-[#574144] px-1'>
              Status ini menentukan estimasi masa durasi kekebalan antibodi maternal.
            </p>
          </div>

          {/* Field 2: Tanggal Pemberian */}
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='tanggalImunisasi'
              className='text-xs font-bold text-[#121c2a] flex items-center gap-1'
            >
              Tanggal Pemberian <span className='text-[#aa294d]'>*</span>
            </label>
            <div className='relative'>
              <input
                id='tanggalImunisasi'
                type='date'
                value={vaccineDate}
                onChange={e => setVaccineDate(e.target.value)}
                className='w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm font-semibold shadow-xs focus:outline-none focus:border-[#aa294d] transition-all'
                required
              />
            </div>
            <p className='text-[11px] text-[#574144] px-1'>
              Berdasarkan tanggal yang tertera pada catatan medis atau buku KIA.
            </p>
          </div>

          {/* Field 3: Tempat Imunisasi / Faskes */}
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='tempatImunisasi'
              className='text-xs font-bold text-[#121c2a] flex items-center gap-1'
            >
              Tempat Imunisasi / Fasilitas Kesehatan <span className='text-[#aa294d]'>*</span>
            </label>
            <div className='relative'>
              <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>local_hospital</span>
              </div>
              <input
                id='tempatImunisasi'
                type='text'
                value={faskesName}
                onChange={e => setFaskesName(e.target.value)}
                placeholder='Puskesmas Kebayoran, Jakarta Selatan'
                className='w-full h-11 pl-11 pr-4 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm shadow-xs focus:outline-none focus:border-[#aa294d] transition-all'
                required
              />
            </div>
          </div>

          {/* Field 4: Nomor Batch Vaksin (Opsional) */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label htmlFor='batchVaksin' className='text-xs font-bold text-[#121c2a]'>
                Nomor Batch / Lot Vaksin
              </label>
              <span className='text-[10px] text-[#574144] bg-stone-100 px-2 py-0.5 rounded-full font-semibold'>
                Opsional
              </span>
            </div>
            <div className='relative'>
              <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>qr_code_2</span>
              </div>
              <input
                id='batchVaksin'
                type='text'
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                placeholder='Contoh: BIO-883C / TT-2024'
                className='w-full h-11 pl-11 pr-4 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm uppercase tracking-wider shadow-xs focus:outline-none focus:border-[#aa294d] transition-all'
              />
            </div>
          </div>

          {/* Field 5: Unggah Bukti / Buku KIA */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-bold text-[#121c2a]'>
                Unggah Bukti Vaksin / Buku KIA
              </label>
              <span className='text-[10px] text-[#574144] bg-stone-100 px-2 py-0.5 rounded-full font-semibold'>
                Maks. 5MB
              </span>
            </div>

            <div
              onClick={() => document.getElementById('buktiVaksinInput')?.click()}
              className='relative w-full rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 hover:border-[#aa294d] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group'
            >
              <input
                id='buktiVaksinInput'
                type='file'
                accept='image/*,.pdf'
                onChange={handleFileChange}
                className='hidden'
              />

              {!selectedFile ? (
                <div className='flex flex-col items-center py-2'>
                  <div className='w-12 h-12 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] mb-2 group-hover:scale-105 transition-transform'>
                    <span className='material-symbols-outlined text-[24px]'>add_a_photo</span>
                  </div>
                  <p className='text-xs font-bold text-[#121c2a]'>
                    Ketuk untuk mengambil foto / unggah dokumen
                  </p>
                  <p className='text-[11px] text-[#574144] mt-0.5 max-w-[280px]'>
                    Foto halaman cap TT pada Buku KIA atau Kartu Vaksin Calon Pengantin
                  </p>
                  <div className='flex items-center gap-1.5 mt-2 text-[#aa294d] text-[11px] font-semibold'>
                    <span className='material-symbols-outlined text-[14px]'>image</span> JPG, PNG,
                    atau PDF
                  </div>
                </div>
              ) : (
                <div className='w-full flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200'>
                  <div className='flex items-center gap-2.5 overflow-hidden'>
                    <div className='w-9 h-9 rounded-lg bg-[#aff1d0] text-[#0a5139] flex items-center justify-center shrink-0'>
                      <span className='material-symbols-outlined text-[18px]'>check_circle</span>
                    </div>
                    <div className='text-left truncate'>
                      <p className='text-xs font-bold text-[#121c2a] truncate'>
                        {selectedFile.name}
                      </p>
                      <p className='text-[11px] text-[#574144]'>{selectedFile.size} • Terlampir</p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='w-8 h-8 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors shrink-0'
                    title='Hapus file'
                  >
                    <span className='material-symbols-outlined text-[18px]'>delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Field 6: Keterangan Tambahan */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label htmlFor='keterangan' className='text-xs font-bold text-[#121c2a]'>
                Keterangan Tambahan
              </label>
              <span className='text-[10px] text-[#574144] bg-stone-100 px-2 py-0.5 rounded-full font-semibold'>
                Opsional
              </span>
            </div>
            <textarea
              id='keterangan'
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Contoh: Tidak ada efek samping, cap faskes jelas pada buku KIA.'
              className='w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs shadow-xs focus:outline-none focus:border-[#aa294d] transition-all resize-none'
            />
          </div>

          {/* Reassurance Micro-Card (Stitch Screen 5) */}
          <div className='rounded-xl bg-[#aff1d0]/30 p-3 flex items-center gap-2.5 border border-[#aff1d0]/50'>
            <div className='w-7 h-7 rounded-full bg-[#aff1d0] flex items-center justify-center text-[#0a5139] shrink-0'>
              <span className='material-symbols-outlined text-[16px]'>verified_user</span>
            </div>
            <p className='text-[11px] text-[#0a5139] flex-1 leading-snug'>
              Data yang kamu simpan akan diverifikasi oleh Bidan atau Tenaga Medis saat pemeriksaan
              pra-nikah di Puskesmas.
            </p>
          </div>

          {/* Submit Action */}
          <div className='pt-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full h-12 rounded-full bg-[#aa294d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(170,41,77,0.3)] hover:bg-[#cb4364] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50'
            >
              <span className='material-symbols-outlined text-[18px]'>save</span>
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Riwayat Imunisasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputRiwayatTTModal;
