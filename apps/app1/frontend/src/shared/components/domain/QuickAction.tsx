import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarCheck, BookOpen, Flame, Bot } from 'lucide-react';

export interface QuickActionItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'schedule',
    label: 'Pengingat',
    href: '/user/schedule',
    icon: Clock,
    iconBg: 'bg-rose-100 text-rose-600',
    iconColor: '#e11d48',
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    href: '/user/history',
    icon: CalendarCheck,
    iconBg: 'bg-emerald-100 text-emerald-600',
    iconColor: '#10b981',
  },
  {
    id: 'education',
    label: 'Edukasi',
    href: '/user/education',
    icon: BookOpen,
    iconBg: 'bg-sky-100 text-sky-600',
    iconColor: '#0284c7',
  },
  {
    id: 'buddy',
    label: 'Buddy',
    href: '/user/buddy',
    icon: Flame,
    iconBg: 'bg-amber-100 text-amber-600',
    iconColor: '#d97706',
  },
  {
    id: 'consultation',
    label: 'Konsultasi',
    href: '/user/consultation',
    icon: Bot,
    iconBg: 'bg-purple-100 text-purple-600',
    iconColor: '#9333ea',
  },
];

export function QuickAction() {
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-2.5'>
        <h4 className='text-sm font-bold text-[#1e293b]'>Menu Cepat</h4>
      </div>

      <div className='grid grid-cols-5 gap-2'>
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              to={action.href}
              className='flex flex-col items-center group text-center'
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-active:scale-95 ${action.iconBg}`}
              >
                <Icon size={22} />
              </div>
              <span className='text-[11px] font-semibold text-[#475569] group-hover:text-[#e11d48] mt-1.5 transition-colors leading-tight line-clamp-1'>
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
