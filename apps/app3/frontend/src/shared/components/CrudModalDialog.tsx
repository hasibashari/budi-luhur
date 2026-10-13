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
        } bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#fce7f3] flex flex-col max-h-[85dvh] sm:max-h-[85vh] overflow-hidden`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-[#fce7f3] bg-[#fff5f7]/50'>
          <h3 className='text-base sm:text-lg font-bold text-[#1e293b] leading-snug'>{title}</h3>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='w-8 h-8 rounded-full bg-slate-100 text-[#64748b] hover:bg-rose-100 hover:text-[#e11d48] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50'
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className='p-5 overflow-y-auto flex-1 flex flex-col gap-4'>{children}</div>

        {/* Footer Actions */}
        <div
          className='flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#fce7f3] bg-[#fff5f7]/30'
          style={{
            paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-bold text-[#64748b] hover:text-[#1e293b] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onSubmit}
            disabled={submitting}
            className='w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#e11d48] hover:bg-[#be123c] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50'
          >
            {submitting ? 'Menyimpan...' : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrudModalDialog;
