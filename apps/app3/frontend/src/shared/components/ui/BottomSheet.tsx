import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerIcon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  headerIcon,
  children,
  footer,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
}: BottomSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200'
      role='dialog'
      aria-modal='true'
    >
      {/* Click-outside backdrop */}
      <div
        className='absolute inset-0'
        onClick={() => {
          if (closeOnBackdropClick) onClose();
        }}
        aria-hidden='true'
      />

      {/* Sheet / Modal Container */}
      <div
        className={`relative z-10 w-full ${MAX_WIDTH_MAP[maxWidth]} bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-[#ffd9de]/60 flex flex-col max-h-[90dvh] sm:max-h-[88vh] overflow-hidden transition-transform duration-300 transform translate-y-0`}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator Bar */}
        <div className='flex sm:hidden justify-center pt-2.5 pb-1 shrink-0'>
          <div className='w-12 h-1.5 bg-slate-300 rounded-full' />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className='flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-[#e6eeff] bg-[#fffbff] shrink-0'>
            <div className='flex items-center gap-3 min-w-0 pr-2'>
              {headerIcon && (
                <div className='w-9 h-9 rounded-xl bg-[#ffd9de]/60 text-[#aa294d] flex items-center justify-center shrink-0 shadow-2xs'>
                  {headerIcon}
                </div>
              )}
              <div className='min-w-0'>
                {typeof title === 'string' ? (
                  <h3 className='text-base sm:text-lg font-bold text-[#121c2a] truncate leading-tight'>
                    {title}
                  </h3>
                ) : (
                  title
                )}
                {subtitle && (
                  <p className='text-xs text-[#64748b] mt-0.5 truncate leading-none'>{subtitle}</p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type='button'
                onClick={onClose}
                className='min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-slate-100 hover:bg-[#ffd9de]/60 hover:text-[#aa294d] text-[#64748b] flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95'
                aria-label='Tutup'
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className='p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col text-[#121c2a]'>
          {children}
        </div>

        {/* Footer Actions (Respects safe-area on mobile devices) */}
        {footer && (
          <div
            className='px-5 py-3.5 sm:px-6 sm:py-4 border-t border-[#e6eeff] bg-[#f8f9ff]/80 shrink-0'
            style={{
              paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default BottomSheet;
