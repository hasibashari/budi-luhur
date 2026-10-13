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
    default: 'bg-white border border-[#fce7f3] shadow-sm shadow-rose-500/5',
    hero: 'bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3]/40 border-1.5 border-[#fecdd3] shadow-md shadow-rose-500/10',
    blush: 'bg-[#fdf2f4] border border-[#fce7f3]',
    flat: 'bg-white border border-[#f1f5f9]',
  }

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          paddingStyles[padding],
          variantStyles[variant],
          hoverable && 'hover:shadow-md hover:border-[#fbcfe8] hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  )
}
