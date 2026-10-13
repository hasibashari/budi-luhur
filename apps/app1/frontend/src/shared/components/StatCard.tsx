'use client';

import React from 'react';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string; style?: React.CSSProperties }>;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  subtitle?: React.ReactNode;
  extraContent?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = 'rgba(2, 132, 199, 0.08)',
  iconColor = '#0284c7',
  valueColor = '#0f172a',
  subtitle,
  extraContent,
}: StatCardProps) {
  return (
    <div className='p-4 bg-white rounded-2xl border border-[#fce7f3] shadow-xs hover:shadow-md transition-all flex flex-col justify-between'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <span className='text-xs font-semibold text-[#64748b] truncate'>{title}</span>
        <div
          style={{ backgroundColor: iconBgColor, color: iconColor }}
          className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs'
        >
          <Icon size={16} />
        </div>
      </div>

      <div>
        <span
          style={{ color: valueColor }}
          className='text-2xl font-black tracking-tight block leading-tight'
        >
          {value}
        </span>
        {subtitle && (
          <div className='text-[11px] text-[#64748b] mt-0.5 truncate font-medium'>{subtitle}</div>
        )}
        {extraContent && <div className='mt-1.5'>{extraContent}</div>}
      </div>
    </div>
  );
}
