import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarCheck2, Paperclip, Trash2, X } from 'lucide-react';
import type {
  ImmunizationRecord,
  ImmunizationValidationResult,
  TTDatePrecision,
  TTInfoSource,
  TTVaccineType,
} from '@/src/features/user/types';
import {
  MAX_ATTACHMENT_BYTES,
  validateAttachmentFile,
} from '@/src/features/user/api/userRepository';

export interface NewTTRiwayatData {
  doseLevel: string;
  vaccineType: TTVaccineType;
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
  /** Dipanggil setelah peringatan (bila ada) dikonfirmasi pengguna. */
  onSubmit: (data: NewTTRiwayatData, file: File | null) => Promise<SubmitTTRiwayatResult>;
  /** Dry-run ke server untuk memunculkan peringatan sebelum menyimpan. */
  onValidate: (data: NewTTRiwayatData) => Promise<ImmunizationValidationResult>;
  defaultDose?: string;
  /** Diisi saat mode perbaikan data (edit). */
  initialData?: ImmunizationRecord | null;
  /** Mode menyelesaikan jadwal: bukti kunjungan wajib diunggah. */
  completionSchedule?: {
    stage: string;
    scheduledDate?: string | null;
    time?: string | null;
  } | null;
}

const VACCINE_TYPE_OPTIONS: { value: TTVaccineType; label: string }[] = [
  { value: 'TT', label: 'TT — Tetanus Toxoid' },
  { value: 'Td', label: 'Td — Tetanus-diphtheria' },
  { value: 'DPT', label: 'DPT — Difteri, Pertusis, Tetanus' },
  { value: 'Lainnya', label: 'Lainnya / tidak diketahui' },
];

const INFO_SOURCE_OPTIONS: { value: TTInfoSource; label: string; hint: string }[] = [
  {
    value: 'self_reported',
    label: 'Berdasarkan ingatan',
    hint: 'Tidak ada catatan tertulis, hanya mengingat pernah disuntik.',
  },
  {
    value: 'faskes_record',
    label: 'Berdasarkan buku/kartu imunisasi',
    hint: 'Ada Buku KIA, KMS, atau kartu vaksin yang mencatat tanggalnya.',
  },
  {
    value: 'health_worker',
    label: 'Dicatat tenaga kesehatan',
    hint: 'Pencatatan dilakukan langsung oleh bidan/dokter. Status verifikasi tetap ditentukan nakes.',
  },
];

function todayInputValue() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export function InputRiwayatTTModal({
  isOpen,
  onClose,
  onSubmit,
  onValidate,
  defaultDose = '',
  initialData = null,
  completionSchedule = null,
}: InputRiwayatTTModalProps) {
  const [doseLevel, setDoseLevel] = useState(defaultDose);
  const [vaccineType, setVaccineType] = useState<TTVaccineType>('TT');
  const [vaccineDate, setVaccineDate] = useState(todayInputValue);
  const [faskesName, setFaskesName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [infoSource, setInfoSource] = useState<TTInfoSource>('self_reported');
  const [datePrecision, setDatePrecision] = useState<TTDatePrecision>('exact');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sinkronkan isi form setiap kali modal dibuka (baru / edit).
  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    setWarnings(null);
    setFileError(null);
    setFile(null);
    setIsSubmitting(false);
    if (initialData) {
      setDoseLevel(initialData.doseLevel);
      setVaccineType(initialData.vaccineType || 'TT');
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
      setVaccineType('TT');
      setVaccineDate(
        completionSchedule?.scheduledDate
          ? String(completionSchedule.scheduledDate).slice(0, 10)
          : todayInputValue(),
      );
      setFaskesName('');
      setBatchNumber('');
      setNotes('');
      setInfoSource('self_reported');
      setDatePrecision('exact');
    }
  }, [isOpen, initialData, defaultDose, completionSchedule]);

  if (!isOpen) return null;

  const buildPayload = (): NewTTRiwayatData => ({
    doseLevel,
    vaccineType,
    vaccineDate,
    faskesName: faskesName.trim(),
    batchNumber: batchNumber || undefined,
    notes: notes || undefined,
    infoSource,
    datePrecision,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) return;
    const error = validateAttachmentFile(selected);
    if (error) {
      setFileError(error);
      setFile(null);
      event.target.value = '';
      return;
    }
    setFileError(null);
    setFile(selected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Pengguna belum memilih dosis: jangan menebak berdasarkan urutan data.
    if (!doseLevel) {
      setFormError('Pilih dosis sesuai yang tertulis pada catatan imunisasi.');
      return;
    }
    if (!faskesName.trim()) {
      setFormError('Nama fasilitas kesehatan wajib diisi.');
      return;
    }
    if (completionSchedule && !file) {
      setFormError(
        'Unggah bukti kunjungan (foto buku KIA/kartu vaksin) untuk menandai jadwal ini selesai.',
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const payload = buildPayload();

      // Tahap 1: minta peringatan interval ke server sebelum menyimpan.
      if (!warnings) {
        const result = await onValidate(payload);
        if (result.errors?.length) {
          setFormError(result.errors[0]);
          return;
        }
        if (result.warnings?.length) {
          setWarnings(result.warnings);
          return;
        }
      }

      // Tahap 2: simpan (setelah peringatan dikonfirmasi, bila ada).
      const saved = await onSubmit(payload, file);
      if (!saved.success) {
        setFormError(saved.error || 'Gagal menyimpan riwayat imunisasi.');
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
          {/* Konteks: menyelesaikan jadwal kunjungan */}
          {completionSchedule && (
            <div className='rounded-2xl bg-[#fff8e6] border border-[#f2d79b] p-3.5 flex items-start gap-2.5'>
              <CalendarCheck2 size={18} className='text-[#a16207] shrink-0 mt-0.5' />
              <div>
                <p className='text-xs font-bold text-[#7a4d00]'>
                  Menyelesaikan jadwal {completionSchedule.stage}
                </p>
                <p className='text-[11px] text-[#7a4d00] leading-relaxed mt-0.5'>
                  Catat hasil kunjungan dan unggah bukti imunisasi. Jadwal akan otomatis berstatus
                  selesai setelah data tersimpan.
                </p>
              </div>
            </div>
          )}

          {/* Field 1: Jenis Vaksin (produk) */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='jenisVaksin' className='text-xs font-bold text-[#121c2a]'>
              Jenis Vaksin <span className='text-[#aa294d]'>*</span>
            </label>
            <div className='relative'>
              <div className='absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#aa294d]'>
                <span className='material-symbols-outlined text-[20px]'>vaccines</span>
              </div>
              <select
                id='jenisVaksin'
                value={vaccineType}
                onChange={e => setVaccineType(e.target.value as TTVaccineType)}
                className='w-full h-11 pl-11 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm font-semibold shadow-xs appearance-none focus:outline-none focus:border-[#aa294d] transition-all'
              >
                {VACCINE_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className='absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>keyboard_arrow_down</span>
              </div>
            </div>
            <p className='text-[11px] text-[#574144] px-1'>
              Pilih sesuai yang tertulis pada catatan vaksin. Bila tidak diketahui, pilih “Lainnya”.
            </p>
          </div>

          {/* Field 2: Dosis ke-berapa (dipilih manual, tidak ditebak sistem) */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='dosisKe'
                className='text-xs font-bold text-[#121c2a] flex items-center gap-1'
              >
                Dosis Ke-berapa <span className='text-[#aa294d]'>*</span>
              </label>
              <span className='text-[11px] text-[#8a5a00] font-semibold flex items-center gap-0.5'>
                <span className='material-symbols-outlined text-[14px]'>info</span>
                Pilih manual
              </span>
            </div>
            <div className='relative'>
              <select
                id='dosisKe'
                value={doseLevel}
                onChange={e => setDoseLevel(e.target.value)}
                className='w-full h-11 px-3.5 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-[#121c2a] text-xs sm:text-sm font-semibold shadow-xs appearance-none focus:outline-none focus:border-[#aa294d] transition-all'
                required
              >
                <option value=''>— Pilih sesuai catatan imunisasi —</option>
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
              Sistem tidak menebak urutan dosis. Isi sesuai buku/kartu imunisasi agar riwayat tidak
              salah label.
            </p>
          </div>

          {/* Field 3: Tanggal Pemberian */}
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
                {INFO_SOURCE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className='absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#574144]'>
                <span className='material-symbols-outlined text-[20px]'>keyboard_arrow_down</span>
              </div>
            </div>
            <p className='text-[11px] text-[#574144] px-1'>
              {INFO_SOURCE_OPTIONS.find(option => option.value === infoSource)?.hint}
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

          {/* Field 8: Bukti Imunisasi (opsional) */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-bold text-[#121c2a]'>Bukti Imunisasi</label>
              <span className='text-[10px] text-[#574144] bg-stone-100 px-2 py-0.5 rounded-full font-semibold'>
                {completionSchedule ? 'Wajib • Maks. 3 MB' : 'Opsional • Maks. 3 MB'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp,application/pdf'
              onChange={handleFileChange}
              className='hidden'
            />

            {file ? (
              <div className='flex items-center justify-between gap-2 rounded-xl border border-[#d9e3f6] bg-[#eff4ff] px-3 py-2.5'>
                <div className='flex items-center gap-2 min-w-0'>
                  <Paperclip size={16} className='text-[#aa294d] shrink-0' />
                  <div className='min-w-0'>
                    <p className='text-xs font-semibold text-[#121c2a] truncate'>{file.name}</p>
                    <p className='text-[10px] text-[#574144]'>
                      {(file.size / 1024).toFixed(0)} KB • terenkripsi saat dikirim
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  aria-label='Hapus berkas bukti'
                  className='w-8 h-8 rounded-full flex items-center justify-center text-[#a4163a] hover:bg-[#ffe1e6] transition-colors shrink-0 cursor-pointer'
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='w-full rounded-xl border-2 border-dashed border-stone-200 hover:border-[#aa294d] bg-stone-50 px-3 py-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#574144] transition-colors cursor-pointer'
              >
                <Paperclip size={15} />
                Lampirkan foto buku KIA / kartu vaksin (opsional)
              </button>
            )}

            {fileError && (
              <p role='alert' className='text-[11px] font-semibold text-[#a4163a] px-1'>
                {fileError}
              </p>
            )}
            <p className='text-[11px] text-[#574144] px-1 leading-relaxed'>
              Berkas disimpan privat dan hanya bisa dibuka oleh kamu dan tenaga kesehatan yang
              menangani. Tidak ada tautan publik yang dibagikan.
            </p>
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

          {warnings && warnings.length > 0 && (
            <div className='rounded-xl bg-[#fff8e6] border border-[#f2d79b] p-3.5 flex flex-col gap-2'>
              <div className='flex items-center gap-2 text-[#7a4d00]'>
                <AlertTriangle size={16} className='shrink-0' />
                <p className='text-xs font-bold'>Tanggal terlihat tidak konsisten</p>
              </div>
              <ul className='list-disc pl-5 flex flex-col gap-1'>
                {warnings.map((warning, index) => (
                  <li key={index} className='text-[11px] text-[#7a4d00] leading-relaxed'>
                    {warning}
                  </li>
                ))}
              </ul>
              <p className='text-[11px] text-[#7a4d00]'>
                Periksa kembali catatan imunisasi. Tekan “Tetap Simpan” hanya bila tanggal memang
                benar.
              </p>
            </div>
          )}

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
              className={`w-full h-12 min-h-12 rounded-full text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(170,41,77,0.3)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 ${
                warnings && warnings.length > 0
                  ? 'bg-[#a16207] hover:bg-[#854d0e]'
                  : 'bg-[#aa294d] hover:bg-[#cb4364]'
              }`}
            >
              <span className='material-symbols-outlined text-[18px]'>
                {warnings && warnings.length > 0 ? 'warning' : 'save'}
              </span>
              <span>
                {isSubmitting
                  ? 'Memproses...'
                  : warnings && warnings.length > 0
                    ? 'Tetap Simpan'
                    : completionSchedule
                      ? 'Selesaikan Jadwal & Simpan'
                      : initialData
                        ? 'Periksa & Simpan Perbaikan'
                        : 'Periksa & Simpan Riwayat'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputRiwayatTTModal;
