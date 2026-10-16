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
  title = 'Informasi Akseptor & Faskes',
  subtitle = 'Data resmi yang terhubung dengan layanan kontrasepsi Anda',
  items,
  className = '',
}: ProfileContactCardProps) {
  return (
    <div
      className={`rounded-3xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6 ${className}`}
    >
      <div className='mb-4 pb-3 border-b border-slate-100'>
        <h2 className='text-sm sm:text-base font-bold text-slate-800'>{title}</h2>
        {subtitle && <p className='text-xs text-slate-400 mt-0.5'>{subtitle}</p>}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className='flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/20 transition-all'
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.iconBgColor || 'bg-teal-50 border border-teal-100'
                } ${item.iconColor || 'text-teal-700'}`}
              >
                <Icon size={18} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
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
