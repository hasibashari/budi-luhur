'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'recorded' | 'missed' | 'pending' | 'streak' | 'primary' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1 leading-tight',
    md: 'text-xs px-3 py-1 gap-1.5 leading-tight',
  };

  const variantStyles = {
    recorded: 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
    missed: 'bg-[#FAF0F4] text-[#861A43] border border-[#F7CADF]',
    pending: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    streak: 'bg-gradient-to-r from-amber-500 to-[#B8285F] text-white shadow-xs',
    primary: 'bg-[#FCE7F0] text-[#861A43] border border-[#F7CADF]',
    neutral: 'bg-[#F1F3F7] text-[#525866] border border-[#E2E6EE]',
  };

  const dotColors = {
    recorded: 'bg-[#10B981]',
    missed: 'bg-[#B8285F]',
    pending: 'bg-[#F59E0B]',
    streak: 'bg-white',
    primary: 'bg-[#B8285F]',
    neutral: 'bg-[#8E95A5]',
  };

  return (
    <span
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className),
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
        />
      )}
      {icon && <span className='shrink-0'>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
