'use client';

import React from 'react';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
  }>;
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
  iconBgColor = 'rgba(184, 40, 95, 0.08)',
  iconColor = '#B8285F',
  valueColor = '#1E1F24',
  subtitle,
  extraContent,
}: StatCardProps) {
  return (
    <div className='p-4 bg-white rounded-2xl border border-[#F0DFE7] shadow-[0_2px_10px_rgba(184,40,95,0.02)] hover:shadow-md hover:border-[#EE9CBF] transition-all flex flex-col justify-between'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <span className='text-xs font-semibold text-[#525866] truncate'>{title}</span>
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
          className='text-2xl font-bold tracking-tight block leading-tight'
        >
          {value}
        </span>
        {subtitle && (
          <div className='text-[11px] text-[#525866] mt-0.5 truncate font-medium'>{subtitle}</div>
        )}
        {extraContent && <div className='mt-1.5'>{extraContent}</div>}
      </div>
    </div>
  );
}
