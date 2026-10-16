'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'recorded' | 'missed' | 'pending' | 'streak' | 'primary' | 'neutral' | 'protected' | 'today' | 'placebo'
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

  const variantStyles: Record<string, string> = {
    recorded: 'bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]',
    protected: 'bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]',
    missed: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    pending: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
    today: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
    placebo: 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]',
    streak: 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-xs shadow-teal-700/20',
    primary: 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]',
    neutral: 'bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]',
  }

  const dotColors: Record<string, string> = {
    recorded: 'bg-[#0D9488]',
    protected: 'bg-[#0D9488]',
    missed: 'bg-[#DC2626]',
    pending: 'bg-[#F97316]',
    today: 'bg-[#F97316]',
    placebo: 'bg-[#94A3B8]',
    streak: 'bg-white',
    primary: 'bg-[#0D9488]',
    neutral: 'bg-[#64748B]',
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
