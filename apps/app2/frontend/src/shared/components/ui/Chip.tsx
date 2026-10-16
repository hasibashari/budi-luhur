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
    ? 'bg-[#0D9488] text-white font-semibold shadow-xs shadow-teal-700/20 border border-[#0D9488]'
    : 'bg-white text-[#334155] border border-[#E2E8F0] hover:bg-[#F0FDFA] hover:text-[#0D9488] hover:border-[#CCFBF1]'

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
