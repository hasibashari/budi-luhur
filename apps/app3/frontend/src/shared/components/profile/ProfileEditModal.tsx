'use client';

import React, { ReactNode, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

export interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  submitText?: string;
  isSaving?: boolean;
  errorMessage?: string | null;
  children: ReactNode;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  title = 'Edit Informasi Profil',
  subtitle = 'Perbarui data identitas dan informasi akun Anda',
  submitText = 'Update',
  isSaving = false,
  errorMessage,
  children,
}: ProfileEditModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      {/* Backdrop overlay */}
      <div
        className='fixed inset-0 bg-transparent'
        onClick={() => {
          if (!isSaving) onClose();
        }}
        aria-hidden='true'
      />

      {/* Modal Dialog Content (Centered) */}
      <div
        className='relative z-10 bg-white rounded-3xl shadow-2xl border border-rose-100/80 max-w-lg w-full max-h-[88dvh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-scale-up'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-white'>
          <div className='min-w-0 pr-3'>
            <h3 className='text-base sm:text-lg font-black text-slate-800 truncate leading-tight'>
              {title}
            </h3>
            {subtitle && (
              <p className='text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate'>{subtitle}</p>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            aria-label='Tutup Modal'
            className='w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50'
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body with Smooth Touch Scrolling */}
        <form onSubmit={onSave} className='flex flex-col flex-1 min-h-0 overflow-hidden'>
          <div className='p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain'>
            {errorMessage && (
              <div className='p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2'>
                <AlertCircle size={15} className='text-rose-600 shrink-0' />
                <span>{errorMessage}</span>
              </div>
            )}
            {children}
          </div>

          {/* Sticky Mobile Footer with Safe Area Protection */}
          <div
            className='px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/95 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0'
            style={{
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <button
              type='button'
              onClick={onClose}
              disabled={isSaving}
              className='flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer min-h-[42px] disabled:opacity-50'
            >
              Batal
            </button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              shape='rounded'
              disabled={isSaving}
              icon={isSaving ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
              className='flex-1 sm:flex-initial text-xs py-2.5 px-5 font-bold shadow-md shadow-rose-200 cursor-pointer min-h-[42px]'
            >
              {isSaving ? 'Mengupdate...' : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEditModal;
