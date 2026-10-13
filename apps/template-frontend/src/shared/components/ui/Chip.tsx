'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: React.ReactNode
  size?: 'sm' | 'md'
}

export function Chip({
  children,
  active = false,
  icon,
  size = 'md',
  className,
  ...props
}: ChipProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 cursor-pointer select-none active:scale-[0.97]'

  const sizeStyles = {
    sm: 'text-xs px-3 py-1 gap-1.5',
    md: 'text-sm px-4 py-1.5 gap-2',
  }

  const stateStyles = active
    ? 'bg-[#e11d48] text-white font-semibold shadow-sm shadow-rose-500/20 border border-[#e11d48]'
    : 'bg-white text-[#475569] border border-[#fce7f3] hover:bg-[#fff1f2] hover:text-[#e11d48] hover:border-[#fbcfe8]'

  return (
    <button
      type="button"
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          stateStyles,
          className
        )
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
