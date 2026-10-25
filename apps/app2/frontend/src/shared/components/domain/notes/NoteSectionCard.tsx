import React from 'react';
import { ChevronRight } from 'lucide-react';
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
          'flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-primary-soft sm:p-4',
          className,
        ),
      )}
    >
      <div
        className={twMerge(
          clsx(
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle sm:h-11 sm:w-11',
            iconColorClassName,
          ),
        )}
      >
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between mb-2'>
          <h4 className='text-xs sm:text-sm font-bold text-slate-900'>
            {title}
            {subtitle && (
              <span className='ml-1 text-[10px] font-normal text-slate-400'>{subtitle}</span>
            )}
          </h4>
          <ChevronRight className='h-4 w-4 shrink-0 text-primary' />
        </div>
        {children}
      </div>
    </div>
  );
};

export default NoteSectionCard;
