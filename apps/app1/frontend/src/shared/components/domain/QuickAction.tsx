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
    iconBg: 'bg-[#FAF0F4] text-[#B8285F] border border-[#F0DFE7]',
    iconColor: '#B8285F',
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    href: '/user/history',
    icon: CalendarCheck,
    iconBg: 'bg-[#ECFDF5] text-[#0D9488] border border-[#A7F3D0]',
    iconColor: '#0D9488',
  },
  {
    id: 'education',
    label: 'Edukasi',
    href: '/user/education',
    icon: BookOpen,
    iconBg: 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]',
    iconColor: '#0284C7',
  },
  {
    id: 'buddy',
    label: 'Buddy',
    href: '/user/buddy',
    icon: Flame,
    iconBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    iconColor: '#D97706',
  },
  {
    id: 'consultation',
    label: 'Konsultasi',
    href: '/user/consultation',
    icon: Bot,
    iconBg: 'bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]',
    iconColor: '#9333EA',
  },
];

export function QuickAction() {
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-2.5'>
        <h3 className='text-sm font-bold text-[#1E1F24]'>Menu Cepat</h3>
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
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs group-active:scale-95 ${action.iconBg}`}
              >
                <Icon size={20} />
              </div>
              <span className='text-[11px] font-medium text-[#525866] group-hover:text-[#B8285F] mt-1.5 transition-colors leading-tight line-clamp-1'>
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
