'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hero' | 'blush' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const variantStyles = {
    default: 'bg-white border border-[#F0DFE7] shadow-[0_2px_12px_rgba(184,40,95,0.03)]',
    hero: 'bg-gradient-to-br from-[#FFF5F8] via-[#FDF0F4] to-[#FCE7F0] border border-[#F7CADF] shadow-sm shadow-[#B8285F]/5',
    blush: 'bg-[#FAF0F4] border border-[#F0DFE7]',
    flat: 'bg-white border border-[#F4E8EE]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          paddingStyles[padding],
          variantStyles[variant],
          hoverable &&
            'hover:shadow-[0_8px_24px_rgba(184,40,95,0.06)] hover:border-[#EE9CBF] hover:-translate-y-0.5',
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
}
