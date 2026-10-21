'use client';

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
  title = 'Ringkasan & Status',
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
    <div className='rounded-3xl bg-white border border-rose-100/80 shadow-sm p-5 sm:p-6'>
      <div className='mb-4 pb-3 border-b border-slate-100 flex items-center justify-between'>
        <div>
          <h2 className='text-sm sm:text-base font-bold text-slate-800'>{title}</h2>
          {subtitle && <p className='text-xs text-slate-400 mt-0.5'>{subtitle}</p>}
        </div>
      </div>

      <div className={`grid ${colClass} divide-y sm:divide-y-0 sm:divide-x divide-slate-100/80`}>
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={`py-3.5 sm:py-1 ${
                idx === 0 ? 'sm:pr-5' : idx === metrics.length - 1 ? 'sm:pl-5' : 'sm:px-5'
              } flex flex-col justify-between`}
            >
              <div className='flex items-center justify-between gap-2 mb-2'>
                <span className='text-xs font-semibold text-slate-500'>{metric.label}</span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    metric.iconBgColor || 'bg-rose-50'
                  } ${metric.iconColor || 'text-rose-600'}`}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div className='flex items-baseline gap-2 flex-wrap'>
                  <span className='text-xl sm:text-2xl font-black text-slate-800 tracking-tight'>
                    {metric.value}
                  </span>
                  {metric.badgeText && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        metric.badgeColor || 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {metric.badgeText}
                    </span>
                  )}
                </div>
                {metric.subtitle && (
                  <p className='text-[11px] font-medium text-slate-400 mt-1 leading-relaxed'>
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
