import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileCheck,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentProofType, VerificationDocumentPayload } from '../types';

export interface ProofDocumentUploaderProps {
  document: VerificationDocumentPayload | null;
  onChange: (doc: VerificationDocumentPayload | null) => void;
  error?: string | null;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/pdf',
];

const DOCUMENT_OPTIONS: { type: DocumentProofType; label: string; desc: string }[] = [
  {
    type: 'KK',
    label: 'Kartu Keluarga (KK)',
    desc: 'Halaman identitas keluarga yang jelas',
  },
  {
    type: 'KTP',
    label: 'Kartu Tanda Penduduk (KTP)',
    desc: 'Foto KTP asli akseptor',
  },
  {
    type: 'Buku Nikah',
    label: 'Buku / Surat Nikah',
    desc: 'Halaman identitas atau akta nikah',
  },
];

export function ProofDocumentUploader({
  document,
  onChange,
  error: parentError,
}: ProofDocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<DocumentProofType>(
    document?.documentType || 'KK',
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayError = localError || parentError;

  const handleSelectType = (type: DocumentProofType) => {
    setSelectedType(type);
    if (document) {
      onChange({
        ...document,
        documentType: type,
      });
    }
  };

  const processFile = (file: File) => {
    setLocalError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setLocalError('Format file tidak didukung. Harap unggah file foto (JPG, PNG, WEBP) atau PDF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError('Ukuran file terlalu besar. Maksimal ukuran file adalah 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        onChange({
          documentType: selectedType,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: dataUri,
        });
      }
    };
    reader.onerror = () => {
      setLocalError('Gagal membaca berkas file. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so the same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setLocalError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className='flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200'>
      {/* Header */}
      <div className='flex items-start gap-3'>
        <div className='w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-0.5 shadow-2xs'>
          <FileCheck size={18} />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h2 className='text-sm sm:text-base font-extrabold text-slate-900 tracking-tight'>
              Unggah Bukti Status Pernikahan
            </h2>
            <span className='text-[10px] sm:text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200'>
              Wajib 1 Dokumen
            </span>
          </div>
          <p className='text-xs text-slate-600 mt-0.5 leading-relaxed'>
            Pengguna wajib mengunggah salah satu dokumen resmi sebagai bukti identitas atau status
            pernikahan yang sah.
          </p>
        </div>
      </div>

      {/* Pilihan Jenis Dokumen */}
      <div>
        <label className='block text-xs font-bold text-slate-800 mb-2'>
          Pilih Jenis Dokumen yang Diunggah <span className='text-teal-600'>*</span>
        </label>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          {DOCUMENT_OPTIONS.map(opt => {
            const isSelected = selectedType === opt.type;
            return (
              <button
                key={opt.type}
                type='button'
                onClick={() => handleSelectType(opt.type)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div className='flex items-center justify-between mb-1'>
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-teal-900' : 'text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 size={14} className='text-teal-600 shrink-0 ml-1' />
                  )}
                </div>
                <span className='text-[10px] text-slate-500 leading-snug'>{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className='p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2 animate-fade-in'>
          <AlertCircle size={15} className='shrink-0 text-red-500' />
          <span>{displayError}</span>
        </div>
      )}

      {/* File Dropzone or Preview */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf'
        onChange={handleFileChange}
        className='hidden'
      />

      {!document ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-teal-500 bg-teal-50/70 scale-[0.99]'
              : 'border-slate-300 bg-white hover:border-teal-500 hover:bg-teal-50/20'
          }`}
        >
          <div className='w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-2xs'>
            <UploadCloud size={24} />
          </div>
          <div>
            <p className='text-xs sm:text-sm font-bold text-slate-800'>
              Tarik & lepaskan file atau <span className='text-teal-600 underline'>pilih dokumen</span>
            </p>
            <p className='text-[11px] text-slate-500 mt-1'>
              Mendukung gambar (JPG, PNG, WEBP) atau PDF hingga 5 MB
            </p>
          </div>
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 mt-1'>
            <ShieldCheck size={12} className='text-teal-600' />
            <span>Dokumen tersimpan aman & hanya dapat diakses oleh admin verifikator</span>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <div className='p-4 rounded-2xl bg-white border border-teal-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3.5 min-w-0 flex-1'>
            {document.fileType.startsWith('image/') ? (
              <div className='relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0'>
                <img
                  src={document.fileData}
                  alt={document.fileName}
                  className='w-full h-full object-cover'
                />
              </div>
            ) : (
              <div className='w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0'>
                <FileText size={22} />
                <span className='text-[9px] font-black uppercase mt-0.5 tracking-wider'>PDF</span>
              </div>
            )}

            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-teal-900 truncate max-w-[220px] sm:max-w-xs'>
                  {document.fileName}
                </span>
                <span className='text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0'>
                  {document.documentType}
                </span>
              </div>
              <p className='text-[11px] text-slate-500 mt-0.5'>
                {formatFileSize(document.fileSize)} • Siap dikirim
              </p>
            </div>
          </div>

          {/* Action: Remove / Replace */}
          <div className='flex items-center gap-2 self-end sm:self-center shrink-0'>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors'
            >
              Ganti File
            </button>
            <button
              type='button'
              onClick={handleRemove}
              className='p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors'
              title='Hapus file'
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProofDocumentUploader;

