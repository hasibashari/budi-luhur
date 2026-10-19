import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarDays, BookOpen, Ribbon } from 'lucide-react';

export interface QuickActionItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'schedule',
    label: 'Pengingat',
    sublabel: 'Alarm 20:00',
    href: '/user/schedule',
    icon: Clock,
    iconBg: 'bg-orange-50 text-orange-600 border border-orange-100',
    iconColor: '#EA580C',
  },
  {
    id: 'history',
    label: 'Kalender',
    sublabel: 'Blister 28 Pil',
    href: '/user/history',
    icon: CalendarDays,
    iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
    iconColor: '#0D9488',
  },
  {
    id: 'education',
    label: 'Edukasi',
    sublabel: 'Panduan Pil',
    href: '/user/education',
    icon: BookOpen,
    iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
    iconColor: '#0284C7',
  },
  {
    id: 'sadari',
    label: 'SADARI',
    sublabel: 'Periksa Payudara',
    href: '/user/sadari',
    icon: Ribbon,
    iconBg: 'bg-teal-50/80 text-teal-700 border border-teal-200/60',
    iconColor: '#0F766E',
  },
];

export interface QuickActionProps {
  className?: string;
}

export function QuickAction({ className = '' }: QuickActionProps) {
  return (
    <div className={`w-full bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs ${className}`}>
      <div className='flex items-center justify-between mb-2.5'>
        <h4 className='text-xs sm:text-sm font-bold text-slate-800 tracking-tight'>
          Menu Cepat
        </h4>
        <span className='text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100'>
          Akses Cepat
        </span>
      </div>

      <div className='grid grid-cols-4 gap-1.5 sm:gap-2'>
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              to={action.href}
              className='flex flex-col items-center group text-center p-1 sm:p-1.5 rounded-xl hover:bg-slate-50 transition-colors'
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs group-active:scale-95 ${action.iconBg}`}
              >
                <Icon size={19} strokeWidth={1.75} />
              </div>
              <span className='text-[11px] font-bold text-slate-700 group-hover:text-teal-700 mt-1.5 transition-colors leading-tight truncate w-full'>
                {action.label}
              </span>
              <span className='hidden sm:block text-[9px] text-slate-400 truncate w-full mt-0.5'>
                {action.sublabel}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export const ClinicalQuickActions = QuickAction;
export default QuickAction;
