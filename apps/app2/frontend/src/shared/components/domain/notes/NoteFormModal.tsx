'use client';

import React, { ReactNode, useEffect } from 'react';
import { X, CalendarHeart } from 'lucide-react';

export interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  isSaving?: boolean;
}

// Backward compatibility alias
export type SymptomFormModalProps = NoteFormModalProps;

export function NoteFormModal({
  isOpen,
  onClose,
  title = 'Catatan Kesehatan Harian',
  subtitle = 'Catat kondisi tubuh, adaptasi pil, dan gejala Anda',
  children,
  isSaving = false,
}: NoteFormModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200'>
      {/* Click outside backdrop */}
      <div
        className='fixed inset-0 bg-transparent'
        onClick={() => {
          if (!isSaving) onClose();
        }}
        aria-hidden='true'
      />

      {/* Modal Dialog Content (Mobile Bottom-Sheet / Desktop Centered Card) */}
      <div
        className='relative z-10 w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='note-modal-title'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-soft/60'>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary border border-primary-soft'>
              <CalendarHeart className='w-5 h-5' />
            </div>
            <div className='min-w-0'>
              <h3 id='note-modal-title' className='text-sm sm:text-base font-extrabold text-ink truncate'>
                {title}
              </h3>
              {subtitle && (
                <p className='text-[11px] sm:text-xs text-muted truncate'>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='w-8 h-8 rounded-full bg-surface text-muted hover:bg-slate-200 hover:text-ink flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shrink-0 ml-2'
            aria-label='Tutup dialog'
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className='p-4 sm:p-5 overflow-y-auto flex-1'>
          {children}
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const SymptomFormModal = NoteFormModal;

export default NoteFormModal;
