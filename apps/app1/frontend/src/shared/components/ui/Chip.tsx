'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Chip({
  children,
  active = false,
  icon,
  size = 'md',
  className,
  ...props
}: ChipProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 cursor-pointer select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8285F]/30';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2',
  };

  const stateStyles = active
    ? 'bg-[#B8285F] text-white font-semibold shadow-xs shadow-[#B8285F]/20 border border-[#B8285F]'
    : 'bg-white text-[#525866] border border-[#F0DFE7] hover:bg-[#FAF0F4] hover:text-[#B8285F] hover:border-[#F7CADF]';

  return (
    <button
      type='button'
      className={twMerge(clsx(baseStyles, sizeStyles[size], stateStyles, className))}
      {...props}
    >
      {icon && <span className='shrink-0'>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
