'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.',
  confirmText = 'Hapus Permanen',
  cancelText = 'Batal',
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !loading) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div
        className='absolute inset-0'
        onClick={() => {
          if (!loading) onClose();
        }}
      />
      <div className='relative z-10 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#fce7f3] text-center flex flex-col items-center'>
        <div className='w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-inner'>
          <AlertTriangle size={26} />
        </div>

        <h3 className='text-base sm:text-lg font-bold text-[#1e293b] leading-snug'>{title}</h3>

        <p className='text-xs sm:text-sm text-[#64748b] mt-2 mb-6 leading-relaxed'>{message}</p>

        <div className='flex flex-col-reverse sm:flex-row items-center gap-2.5 w-full'>
          <button
            type='button'
            onClick={onClose}
            disabled={loading}
            className='w-full sm:flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-[#64748b] hover:text-[#1e293b] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={loading}
            className='w-full sm:flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#e11d48] hover:bg-[#be123c] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50'
          >
            {loading ? 'Menghapus...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;
