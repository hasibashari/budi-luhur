import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ImmunizationRecord, TTDatePrecision, TTInfoSource } from '@/src/features/user/types';

export interface NewTTRiwayatData {
  doseLevel: string;
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  infoSource: TTInfoSource;
  datePrecision: TTDatePrecision;
}

export type SubmitTTRiwayatResult = {
  success: boolean;
  error?: string;
  warnings?: string[];
};

export interface InputRiwayatTTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTTRiwayatData) => Promise<SubmitTTRiwayatResult>;
  defaultDose?: string;
  /** Diisi saat mode perbaikan data (edit). */
  initialData?: ImmunizationRecord | null;
}

function todayInputValue() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export function InputRiwayatTTModal({
  isOpen,
  onClose,
  onSubmit,
  defaultDose = 'TT1',
  initialData = null,
}: InputRiwayatTTModalProps) {
  const [doseLevel, setDoseLevel] = useState(defaultDose);
  const [vaccineDate, setVaccineDate] = useState(todayInputValue);
  const [faskesName, setFaskesName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [infoSource, setInfoSource] = useState<TTInfoSource>('self_reported');
  const [datePrecision, setDatePrecision] = useState<TTDatePrecision>('exact');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sinkronkan isi form setiap kali modal dibuka (baru / edit).
  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    setIsSubmitting(false);
    if (initialData) {
      setDoseLevel(initialData.doseLevel);
      setVaccineDate(
        initialData.vaccineDate ? String(initialData.vaccineDate).slice(0, 10) : todayInputValue(),
      );
      setFaskesName(initialData.faskesName || '');
      setBatchNumber(initialData.batchNumber || '');
      setNotes(initialData.notes || '');
      setInfoSource(initialData.infoSource || 'self_reported');
      setDatePrecision(initialData.datePrecision || 'exact');
    } else {
      setDoseLevel(defaultDose);
      setVaccineDate(todayInputValue());
      setFaskesName('');
      setBatchNumber('');
      setNotes('');
      setInfoSource('self_reported');
      setDatePrecision('exact');
    }
  }, [isOpen, initialData, defaultDose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faskesName.trim()) {
      setFormError('Nama fasilitas kesehatan wajib diisi.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        doseLevel,
        vaccineDate,
        faskesName: faskesName.trim(),
        batchNumber: batchNumber || undefined,
        notes: notes || undefined,
        infoSource,
        datePrecision,
      });
      if (!result.success) {
        setFormError(result.error || 'Gagal menyimpan riwayat imunisasi.');
        return;
      }
      onClose();
    } catch {
      setFormError('Terjadi kendala sistem saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div className='relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh]'>
        {/* Mobile Pull Drag Indicator Bar */}
        <div className='sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-gradient-to-r from-[#aa294d] to-[#cb4364]'>
          <div className='w-12 h-1.5 rounded-full bg-white/40' />
        </div>

        {/* Modal Header */}
        <div className='px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-xs'>
              <span className='material-symbols-outlined text-[22px]'>health_and_safety</span>
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold leading-tight'>
                {initialData ? 'Perbaiki Riwayat Dosis' : 'Pencatatan Dosis Mandiri'}
              </h3>
              <p className='text-[11px] text-rose-100'>Riwayat Imunisasi Tetanus Toxoid (TT)</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90'
            aria-label='Tutup Modal Pencatatan'
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
                <h4 className='text-xs font-bold text-[#121c2a]'>
                  {initialData
                    ? 'Perbaiki Data yang Sudah Tercatat'
                    : 'Catat Riwayat Faskes Terdahulu'}
                </h4>
                <p className='text-[11px] text-[#574144] mt-0.5 leading-relaxed'>
                  Catat riwayat suntik TT yang sudah pernah kamu dapatkan di Puskesmas, Klinik, atau
                  Rumah Sakit. Data tersimpan sebagai menunggu validasi hingga diperiksa tenaga
                  kesehatan.
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
                placeholder='Nama faskes tempat imunisasi'
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

          {/* Field 5: Sumber Data */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='sumberData' className='text-xs font-bold text-[#121c2a]'>
              Sumber Data <span className='text-[#aa294d]'>*</span>
            </label>
            <div className='relative'>
              <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#aa294d]'>
                <span className='material-symbols-outlined text-[20px]'>source</span>
              </div>
              <select
                id='sumberData'
                value={infoSource}
                onChange={e => setInfoSource(e.target.value as TTInfoSource)}
                className='w-full h-11 pl-11 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm font-semibold shadow-xs appearance-none focus:outline-none focus:border-[#aa294d] transition-all'
              >
                <option value='self_reported'>Diisi mandiri (ingat sendiri)</option>
                <option value='faskes_record'>Disalin dari Buku KIA / KMS</option>
                <option value='health_worker'>Dicatat tenaga kesehatan</option>
              </select>
              <div className='absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>keyboard_arrow_down</span>
              </div>
            </div>
            <p className='text-[11px] text-[#574144] px-1'>
              Sumber data membantu bidan menilai seberapa kuat bukti riwayat ini.
            </p>
          </div>

          {/* Field 6: Presisi Tanggal */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='presisiTanggal' className='text-xs font-bold text-[#121c2a]'>
              Ketepatan Tanggal
            </label>
            <div className='relative'>
              <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>event_available</span>
              </div>
              <select
                id='presisiTanggal'
                value={datePrecision}
                onChange={e => setDatePrecision(e.target.value as TTDatePrecision)}
                className='w-full h-11 pl-11 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm font-semibold shadow-xs appearance-none focus:outline-none focus:border-[#aa294d] transition-all'
              >
                <option value='exact'>Tanggal pasti (sesuai catatan)</option>
                <option value='month'>Hanya ingat bulan & tahun</option>
                <option value='year'>Hanya ingat tahun</option>
              </select>
              <div className='absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>keyboard_arrow_down</span>
              </div>
            </div>
            <p className='text-[11px] text-[#574144] px-1'>
              Isi apa adanya — sistem tidak akan menampilkan tanggal seolah-olah presisi bila kamu
              hanya mengingat bulannya.
            </p>
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

          {/* Reassurance Micro-Card */}
          <div className='rounded-xl bg-[#aff1d0]/30 p-3 flex items-center gap-2.5 border border-[#aff1d0]/50'>
            <div className='w-7 h-7 rounded-full bg-[#aff1d0] flex items-center justify-center text-[#0a5139] shrink-0'>
              <span className='material-symbols-outlined text-[16px]'>verified_user</span>
            </div>
            <p className='text-[11px] text-[#0a5139] flex-1 leading-snug'>
              Data tersimpan dengan status <strong>Menunggu Validasi</strong>. Status baru berubah
              menjadi <strong>Terverifikasi</strong> setelah diperiksa Bidan atau Tenaga Medis di
              Puskesmas.
            </p>
          </div>

          {formError && (
            <div
              role='alert'
              className='rounded-xl bg-[#ffe1e6] border border-[#ffc9d4] px-3.5 py-2.5 text-[11px] font-semibold text-[#a4163a]'
            >
              {formError}
            </div>
          )}

          {/* Submit Action */}
          <div className='pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full h-12 min-h-[48px] rounded-full bg-[#aa294d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(170,41,77,0.3)] hover:bg-[#cb4364] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50'
            >
              <span className='material-symbols-outlined text-[18px]'>save</span>
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : initialData
                    ? 'Simpan Perbaikan'
                    : 'Simpan Riwayat Imunisasi'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputRiwayatTTModal;
