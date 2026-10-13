'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'recorded' | 'missed' | 'pending' | 'streak' | 'primary' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
  icon?: React.ReactNode
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
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none'

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  }

  const variantStyles = {
    recorded: 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]',
    missed: 'bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]',
    pending: 'bg-[#fef3c7] text-[#d97706] border border-[#fde68a]',
    streak: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm shadow-orange-500/20',
    primary: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
    neutral: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  }

  const dotColors = {
    recorded: 'bg-[#10b981]',
    missed: 'bg-[#f43f5e]',
    pending: 'bg-[#f59e0b]',
    streak: 'bg-white',
    primary: 'bg-[#e11d48]',
    neutral: 'bg-[#94a3b8]',
  }

  return (
    <span
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
