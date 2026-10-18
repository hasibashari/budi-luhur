'use client';

import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface CrudModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  onSubmit: () => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  submitting?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

export function CrudModalDialog({
  open,
  onClose,
  title,
  onSubmit,
  submitText = 'Simpan',
  cancelText = 'Batal',
  submitting = false,
  maxWidth = 'sm',
  children,
}: CrudModalDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !submitting) {
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
  }, [open, submitting, onClose]);

  if (!open) return null;

  const maxWidthClasses = {
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      {/* Click outside backdrop */}
      <div
        className='absolute inset-0'
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative z-10 w-full ${
          maxWidthClasses[maxWidth] || 'max-w-lg'
        } bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl border border-[#eff4ff] flex flex-col max-h-[88dvh] sm:max-h-[85vh] overflow-hidden`}
      >
        {/* Mobile Pull Drag Indicator Bar */}
        <div className="sm:hidden w-full pt-2 pb-1 flex justify-center bg-[#fff5f7]">
          <div className="w-12 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className='flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-[#ffd9de]/60 bg-[#fff5f7]/80'>
          <h3 className='text-base sm:text-lg font-bold text-[#121c2a] leading-snug'>{title}</h3>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='w-9 h-9 rounded-full bg-white text-[#574144] hover:bg-[#ffd9de] hover:text-[#aa294d] active:scale-90 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50'
            aria-label='Tutup Modal'
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className='p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-[#121c2a]'>{children}</div>

        {/* Footer Actions */}
        <div
          className='flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#ffd9de]/60 bg-[#fff5f7]/40'
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#574144] hover:text-[#121c2a] hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onSubmit}
            disabled={submitting}
            className='w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#aa294d] hover:bg-[#cb4364] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50'
          >
            {submitting ? 'Menyimpan...' : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrudModalDialog;
