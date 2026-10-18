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
    <div className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in'>
      <div
        className='absolute inset-0'
        onClick={() => {
          if (!loading) onClose();
        }}
      />
      <div
        className='relative z-10 w-full max-w-sm bg-white rounded-t-[28px] sm:rounded-2xl p-5 sm:p-6 shadow-2xl border-t sm:border border-[#ffd9de]/80 text-center flex flex-col items-center'
        style={{
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Mobile Pull Indicator */}
        <div className='w-12 h-1.5 bg-slate-300 rounded-full mb-4 sm:hidden shrink-0' />

        <div className='w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-inner'>
          <AlertTriangle size={26} />
        </div>

        <h3 className='text-base sm:text-lg font-bold text-[#121c2a] leading-snug'>{title}</h3>

        <p className='text-xs sm:text-sm text-[#64748b] mt-2 mb-6 leading-relaxed'>{message}</p>

        <div className='flex flex-col-reverse sm:flex-row items-center gap-2.5 w-full'>
          <button
            type='button'
            onClick={onClose}
            disabled={loading}
            className='w-full sm:flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold text-[#64748b] hover:text-[#121c2a] hover:bg-slate-100 active:scale-95 rounded-xl transition-all cursor-pointer disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={loading}
            className='w-full sm:flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#aa294d] hover:bg-[#8c0f39] active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50'
          >
            {loading ? 'Menghapus...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;
