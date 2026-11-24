'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
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
    'inline-flex items-center justify-center font-semibold whitespace-nowrap touch-manipulation transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8285F]/40';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[42px] gap-2',
    lg: 'text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] sm:min-h-[48px] gap-2.5',
  };

  const shapeStyles = {
    pill: 'rounded-full',
    rounded: 'rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-[#B8285F] text-white hover:bg-[#A11E50] active:bg-[#8D1847] shadow-sm shadow-[#B8285F]/20 hover:shadow-md hover:shadow-[#B8285F]/25',
    outline:
      'bg-transparent border border-[#F0DFE7] text-[#B8285F] hover:bg-[#FAF0F4] hover:border-[#B8285F]',
    soft: 'bg-[#FCE7F0] text-[#861A43] hover:bg-[#F7CADF]',
    ghost: 'bg-transparent text-[#525866] hover:bg-[#FAF0F4] hover:text-[#B8285F]',
    success: 'bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-sm shadow-teal-600/20',
    danger: 'bg-[#E11D48] text-white hover:bg-[#BE123C] shadow-sm shadow-rose-600/20',
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
