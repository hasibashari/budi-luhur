'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastSeverity } from '../hooks/useToast';

export interface ToastFeedbackProps {
  open: boolean;
  message: string;
  severity?: ToastSeverity;
  onClose: () => void;
  autoHideDuration?: number;
}

export function ToastFeedback({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 4000,
}: ToastFeedbackProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const severityStyles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 size={18} className='text-emerald-600 shrink-0' />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle size={18} className='text-rose-600 shrink-0' />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle size={18} className='text-amber-600 shrink-0' />,
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info size={18} className='text-sky-600 shrink-0' />,
    },
  };

  const style = severityStyles[severity] || severityStyles.success;

  return (
    <div className='fixed bottom-5 right-5 z-50 max-w-sm w-full animate-fade-in pointer-events-auto'>
      <div
        className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-sm ${style.bg}`}
      >
        <div className='mt-0.5'>{style.icon}</div>
        <p className='text-xs sm:text-sm font-semibold flex-1 leading-snug pt-0.5'>{message}</p>
        <button
          type='button'
          onClick={onClose}
          className='p-1 rounded-lg hover:bg-black/5 text-current/70 hover:text-current transition-colors cursor-pointer shrink-0'
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default ToastFeedback;
