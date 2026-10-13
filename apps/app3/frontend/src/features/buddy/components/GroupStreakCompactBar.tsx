'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { BuddyGroupItem } from '../types';

interface GroupStreakCompactBarProps {
  group: BuddyGroupItem;
}

export default function GroupStreakCompactBar({ group }: GroupStreakCompactBarProps) {
  const completed = group.weeklyCompletedCount || 0;
  const total = group.weeklyTotalCount || group.memberCount || 1;
  const percent = group.weeklyCompletionRate || Math.round((completed / total) * 100);
  const isAllCompleted = completed >= total && total > 0;

  return (
    <div className='shrink-0 bg-rose-50/60 border-b border-rose-100/80 px-3.5 sm:px-4 py-2 flex items-center justify-between gap-3 text-xs'>
      {/* Adherence Status */}
      <div className='flex items-center gap-1.5 min-w-0 truncate'>
        {isAllCompleted ? (
          <CheckCircle2 size={14} className='text-emerald-600 shrink-0' />
        ) : (
          <Sparkles size={14} className='text-rose-500 shrink-0' />
        )}
        <span className='truncate font-medium text-slate-700'>
          {isAllCompleted ? (
            <span className='text-emerald-700 font-bold'>
              Semua ({total}/{total}) sudah minum TTD pekan ini 🎉
            </span>
          ) : (
            <>
              <strong className='text-slate-900 font-bold'>
                {completed}/{total}
              </strong>{' '}
              siswi sudah minum pekan ini
            </>
          )}
        </span>
      </div>

      {/* Progress Bar & Percentage */}
      <div className='flex items-center gap-2 shrink-0'>
        <div className='w-16 sm:w-24 h-1.5 bg-rose-200/50 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAllCompleted ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(6, percent))}%` }}
          />
        </div>
        <span
          className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-md ${
            isAllCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
