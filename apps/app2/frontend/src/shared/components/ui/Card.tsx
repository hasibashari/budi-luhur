'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hero' | 'blush' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-200'

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  }

  const variantStyles = {
    default: 'bg-white border border-[#E2E8F0] shadow-xs shadow-slate-900/5',
    hero: 'bg-gradient-to-br from-[#F0FDFA] via-[#FFFFFF] to-[#CCFBF1]/30 border border-[#CCFBF1] shadow-xs shadow-teal-900/5',
    blush: 'bg-[#F8FAFC] border border-[#E2E8F0]',
    soft: 'bg-[#F8FAFC] border border-[#E2E8F0]',
    flat: 'bg-white border border-[#F1F5F9]',
  }

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          paddingStyles[padding],
          variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
          hoverable && 'hover:shadow-sm hover:border-[#0D9488]/40 hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  )
}
