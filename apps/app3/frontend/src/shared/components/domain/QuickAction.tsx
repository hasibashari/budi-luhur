import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, BookOpen, Bot, Award } from 'lucide-react';

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
    id: 'history',
    label: 'Catat TT',
    href: '/user/history',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    iconColor: '#059669',
  },
  {
    id: 'schedule',
    label: 'Jadwal Faskes',
    href: '/user/schedule',
    icon: Clock,
    iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    iconColor: '#d97706',
  },
  {
    id: 'consultation',
    label: 'Luna AI',
    href: '/user/consultation',
    icon: Bot,
    iconBg: 'bg-teal-50 text-teal-700 border border-teal-200/60',
    iconColor: '#0d9488',
  },
  {
    id: 'education',
    label: 'Edukasi',
    href: '/user/education',
    icon: BookOpen,
    iconBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    iconColor: '#2563eb',
  },
  {
    id: 'certificate',
    label: 'E-Sertifikat',
    href: '/user/profile',
    icon: Award,
    iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    iconColor: '#047857',
  },
];

export function QuickAction() {
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-2.5'>
        <h4 className='text-xs sm:text-sm font-bold text-slate-900'>Layanan Cepat Pranikah</h4>
      </div>

      <div className='grid grid-cols-5 gap-1.5 sm:gap-2'>
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              to={action.href}
              className='flex flex-col items-center group text-center'
            >
              <div
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-active:scale-95 shadow-2xs ${action.iconBg}`}
              >
                <Icon size={20} />
              </div>
              <span className='text-[10px] sm:text-[11px] font-semibold text-slate-600 group-hover:text-emerald-700 mt-1.5 transition-colors leading-tight line-clamp-1'>
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickAction;
