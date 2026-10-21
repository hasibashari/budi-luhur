'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ProfileMetricItem {
  id: string;
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badgeText?: string;
  badgeColor?: string;
}

export interface ProfileMetricsGridProps {
  title?: string;
  subtitle?: string;
  metrics: ProfileMetricItem[];
  columns?: 2 | 3 | 4;
}

export function ProfileMetricsGrid({
  title = 'Status Kesehatan & Skrining Pranikah',
  subtitle,
  metrics,
  columns = 3,
}: ProfileMetricsGridProps) {
  const colClass =
    columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className='rounded-3xl bg-white border border-stone-200 shadow-sm p-5 sm:p-6'>
      <div className='mb-4 pb-3 border-b border-stone-100 flex items-center justify-between'>
        <div>
          <h2 className='text-sm sm:text-base font-bold text-slate-900'>{title}</h2>
          {subtitle && <p className='text-xs text-slate-500 mt-0.5'>{subtitle}</p>}
        </div>
      </div>

      <div className={`grid ${colClass} gap-3.5`}>
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className='p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-[#aa294d]/40 hover:shadow-xs transition-all flex flex-col justify-between'
            >
              <div className='flex items-start justify-between gap-2 mb-2'>
                <span className='text-xs font-bold text-slate-500'>{metric.label}</span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    metric.iconBgColor || 'bg-emerald-50'
                  } ${metric.iconColor || 'text-emerald-700'}`}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div className='flex items-baseline gap-2'>
                  <span className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight'>
                    {metric.value}
                  </span>
                  {metric.badgeText && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        metric.badgeColor || 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {metric.badgeText}
                    </span>
                  )}
                </div>
                {metric.subtitle && (
                  <p className='text-[11px] font-medium text-slate-500 mt-1 truncate'>
                    {metric.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileMetricsGrid;
