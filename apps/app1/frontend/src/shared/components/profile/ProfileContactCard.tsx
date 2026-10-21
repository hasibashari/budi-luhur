'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ContactItem {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  fallbackValue?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export interface ProfileContactCardProps {
  title?: string;
  subtitle?: string;
  items: ContactItem[];
  className?: string;
}

export function ProfileContactCard({
  title = 'Data Diri & Pendidikan',
  subtitle,
  items,
  className = '',
}: ProfileContactCardProps) {
  return (
    <div>
      {title && (
        <div className='px-2 mb-1.5'>
          <h2 className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>{title}</h2>
          {subtitle && <p className='text-[11px] text-slate-500 mt-0.5'>{subtitle}</p>}
        </div>
      )}
      <div
        className={`rounded-2xl sm:rounded-3xl bg-white border border-rose-100/90 shadow-2xs divide-y md:divide-y-0 md:divide-x divide-slate-100 md:grid md:grid-cols-3 overflow-hidden ${className}`}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className='p-3.5 sm:p-4.5 flex items-center gap-3.5'>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  item.iconBgColor || 'bg-rose-50 border-rose-100/60'
                } ${item.iconColor || 'text-rose-600'}`}
              >
                <Icon size={17} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                  {item.label}
                </p>
                <p className='text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5'>
                  {item.value || item.fallbackValue || 'Belum diisi'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileContactCard;
