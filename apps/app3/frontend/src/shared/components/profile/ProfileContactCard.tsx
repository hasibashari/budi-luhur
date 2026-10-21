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
  title = 'Informasi Kontak & Faskes Rujukan',
  subtitle = 'Data resmi calon pengantin yang terhubung dengan akun Anda',
  items,
  className = '',
}: ProfileContactCardProps) {
  return (
    <div
      className={`rounded-3xl bg-white border border-stone-200 shadow-sm p-5 sm:p-6 ${className}`}
    >
      <div className='mb-4 pb-3 border-b border-stone-100'>
        <h2 className='text-sm sm:text-base font-bold text-slate-900'>{title}</h2>
        {subtitle && <p className='text-xs text-slate-500 mt-0.5'>{subtitle}</p>}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className='flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-[#aa294d]/40 transition-all'
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  item.iconBgColor || 'bg-[#ffd9de]/60'
                } ${item.iconColor || 'text-[#aa294d]'}`}
              >
                <Icon size={18} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
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
