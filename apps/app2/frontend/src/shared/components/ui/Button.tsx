'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'soft' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  fullWidth = false,
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold whitespace-nowrap touch-manipulation transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 sm:py-2 min-h-[36px] gap-1.5',
    md: 'text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] gap-2',
    lg: 'text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3.5 min-h-[44px] sm:min-h-[48px] gap-2.5',
  };

  const shapeStyles = {
    pill: 'rounded-full',
    rounded: 'rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-[#e11d48] text-white hover:bg-[#be123c] shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/25',
    outline:
      'bg-transparent border-1.5 border-[#fce7f3] text-[#e11d48] hover:bg-[#fff1f2] hover:border-[#e11d48]',
    soft: 'bg-[#ffe4e6] text-[#be123c] hover:bg-[#fecdd3]',
    ghost: 'bg-transparent text-[#64748b] hover:bg-[#fff1f2] hover:text-[#e11d48]',
    success: 'bg-[#10b981] text-white hover:bg-[#059669] shadow-md shadow-emerald-500/20',
    danger: 'bg-[#f43f5e] text-white hover:bg-[#e11d48] shadow-md shadow-rose-500/20',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          shapeStyles[shape],
          variantStyles[variant],
          fullWidth && 'w-full',
          className,
        ),
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className='animate-spin h-4 w-4 text-current'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      ) : icon ? (
        <span className='shrink-0'>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
