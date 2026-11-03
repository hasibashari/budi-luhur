import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NoteSectionCardProps {
  icon: React.ReactNode;
  iconColorClassName?: string;
  title: string;
  subtitle?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const NoteSectionCard: React.FC<NoteSectionCardProps> = ({
  icon,
  iconColorClassName = 'text-primary',
  title,
  subtitle,
  className,
  children,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col sm:flex-row items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 sm:p-4 transition-colors hover:border-primary-soft shadow-2xs',
          className,
        ),
      )}
    >
      <div className='flex items-center gap-2.5 sm:block shrink-0'>
        <div
          className={twMerge(
            clsx(
              'flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle',
              iconColorClassName,
            ),
          )}
        >
          {icon}
        </div>
        <div className='block sm:hidden'>
          <h4 className='text-xs font-bold text-slate-900'>
            {title}
            {subtitle && (
              <span className='block text-[11px] font-normal text-slate-500 mt-0.5'>{subtitle}</span>
            )}
          </h4>
        </div>
      </div>
      <div className='flex-1 min-w-0 w-full'>
        <div className='hidden sm:flex items-center justify-between mb-2.5'>
          <h4 className='text-sm font-bold text-slate-900'>
            {title}
            {subtitle && (
              <span className='ml-1.5 text-xs font-normal text-slate-500'>{subtitle}</span>
            )}
          </h4>
        </div>
        {children}
      </div>
    </div>
  );
};

export default NoteSectionCard;
