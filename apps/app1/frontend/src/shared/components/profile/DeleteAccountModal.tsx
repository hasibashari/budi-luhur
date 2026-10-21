'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting: boolean;
  error?: string | null;
  title?: string;
  warningItems?: string[];
}

const DEFAULT_WARNING_ITEMS = [
  'Data identitas & profil siswi FEMORY',
  'Seluruh riwayat konsumsi Tablet Tambah Darah (TTD)',
  'Catatan streak & level kepatuhan konsumsi',
  'Jadwal pengingat notifikasi TTD',
  'Koneksi & aktivitas sesama teman (Buddy System)',
];

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error,
  title = 'Hapus Akun Pengguna',
  warningItems = DEFAULT_WARNING_ITEMS,
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmationText.trim().toUpperCase() !== 'HAPUS') {
      setLocalError('Harap ketik kata HAPUS untuk mengonfirmasi.');
      return;
    }
    setLocalError(null);
    onConfirm();
  };

  const isConfirmed = confirmationText.trim().toUpperCase() === 'HAPUS';
  const displayError = localError || error;

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div
        className='fixed inset-0 bg-transparent'
        onClick={() => {
          if (!isDeleting) onClose();
        }}
        aria-hidden='true'
      />

      <div
        className='relative z-10 bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-md w-full max-h-[90dvh] flex flex-col overflow-hidden animate-scale-up'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-rose-50/50'>
          <div className='flex items-center gap-2.5 min-w-0 pr-2'>
            <div className='w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0'>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-black text-rose-900 leading-tight'>
                {title}
              </h3>
              <p className='text-[11px] text-rose-600/80'>
                Tindakan permanen & tak dapat dibatalkan
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={isDeleting}
            aria-label='Tutup Modal'
            className='w-8 h-8 rounded-full bg-rose-100/60 hover:bg-rose-200/60 text-rose-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50'
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-700'>
          <div className='p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2'>
            <p className='font-bold flex items-center gap-1.5'>
              <AlertTriangle size={14} className='text-rose-600 shrink-0' />
              Data yang akan dihapus permanen:
            </p>
            <ul className='list-disc pl-5 space-y-1 text-[11px] text-rose-700'>
              {warningItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {displayError && (
            <div className='p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-semibold'>
              {displayError}
            </div>
          )}

          <div className='space-y-2'>
            <label className='block text-xs font-bold text-slate-700'>
              Ketik kata <span className='text-rose-600 font-extrabold tracking-wider'>HAPUS</span>{' '}
              di bawah ini untuk konfirmasi:
            </label>
            <input
              type='text'
              value={confirmationText}
              onChange={e => {
                setConfirmationText(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder='Ketik HAPUS'
              disabled={isDeleting}
              className='w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-slate-50 text-xs font-bold text-rose-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white'
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          className='px-5 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0'
          style={{
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            type='button'
            onClick={onClose}
            disabled={isDeleting}
            className='flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer min-h-[40px] disabled:opacity-50'
          >
            Batal
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={isDeleting || !isConfirmed}
            className='flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-200 cursor-pointer min-h-[40px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className='animate-spin' />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Hapus Akun</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
