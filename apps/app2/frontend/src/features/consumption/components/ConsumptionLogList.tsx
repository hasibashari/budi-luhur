'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarCheck, Calendar as CalendarIcon, Filter, Check } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { ConsumptionLog } from '../types';
import { formatShortDate } from '../utils/dateHelpers';
import { StatusFilterOption } from './DateFilterBar';

export interface ConsumptionLogListProps {
  logs: ConsumptionLog[];
  filterLabel?: string;
  statusFilter?: StatusFilterOption;
  onStatusFilterChange?: (status: StatusFilterOption) => void;
}

export function ConsumptionLogList({
  logs,
  filterLabel,
  statusFilter = 'ALL',
  onStatusFilterChange,
}: ConsumptionLogListProps) {
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterPopoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterPopoverRef.current &&
        !statusFilterPopoverRef.current.contains(event.target as Node)
      ) {
        setIsStatusFilterOpen(false);
      }
    }
    if (isStatusFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusFilterOpen]);

  return (
    <Card padding='lg' className='relative overflow-visible border border-slate-200/80 shadow-xs bg-white'>
      <div className='flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2'>
            <CalendarCheck size={18} className='text-teal-600' />
            <span>Riwayat Aktivitas ({logs.length})</span>
          </h4>
          {filterLabel && filterLabel !== 'Semua catatan' && (
            <span className='hidden sm:inline-block text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200'>
              {filterLabel}
            </span>
          )}
        </div>

        {/* Right Side: Status Filter Icon-Only Dropdown */}
        {onStatusFilterChange && (
          <div className='relative' ref={statusFilterPopoverRef}>
            <button
              type='button'
              onClick={() => setIsStatusFilterOpen(prev => !prev)}
              className={`relative inline-flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isStatusFilterOpen || statusFilter !== 'ALL'
                  ? 'bg-teal-50 border-teal-600 text-teal-700 ring-2 ring-teal-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200 hover:text-teal-700'
              }`}
              title='Filter Status Konsumsi'
              aria-label='Filter Status Konsumsi'
            >
              <Filter size={15} />
              {statusFilter !== 'ALL' && (
                <span className='absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white' />
              )}
            </button>

            {/* Status Filter Popover Menu */}
            {isStatusFilterOpen && (
              <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-fade-in'>
                <div className='px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1'>
                  Filter Status
                </div>
                <div className='space-y-0.5'>
                  {[
                    { id: 'ALL', label: 'Semua Status', icon: '📋' },
                    { id: 'ON_TIME', label: 'Hanya Selesai (✓)', icon: '✅' },
                    { id: 'MISSED', label: 'Hanya Terlewat (✕)', icon: '⚠️' },
                  ].map(option => {
                    const isSelected = statusFilter === option.id;
                    return (
                      <button
                        key={option.id}
                        type='button'
                        onClick={() => {
                          onStatusFilterChange(option.id as StatusFilterOption);
                          setIsStatusFilterOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 text-teal-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className='flex items-center gap-2'>
                          <span className='text-xs'>{option.icon}</span>
                          <span>{option.label}</span>
                        </span>
                        {isSelected && <Check size={14} className='text-teal-600 shrink-0' />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='flex flex-col divide-y divide-slate-100'>
        {logs.length > 0 ? (
          logs.map(log => {
            const isCompleted = log.status === 'ON_TIME' || log.status === 'LATE';
            return (
              <div
                key={log.id}
                className='py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3'
              >
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-xs sm:text-sm font-bold text-slate-800'>{log.title}</span>
                    <span className='text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100'>
                      {formatShortDate(log.scheduledDate)}
                    </span>
                  </div>
                  <p className='text-xs text-slate-500 mt-0.5'>
                    Jadwal: {log.scheduledTime} WIB {log.takenAt ? `• Diminum ${log.takenAt}` : ''}
                  </p>
                  {log.notes && (
                    <p className='text-[11px] text-slate-400 italic mt-0.5'>{log.notes}</p>
                  )}
                </div>

                <div className='shrink-0'>
                  {isCompleted ? (
                    <Badge variant='recorded' size='sm'>
                      ✓ Selesai
                    </Badge>
                  ) : (
                    <Badge variant='missed' size='sm'>
                      ✕ Terlewat
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className='py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2'>
            <CalendarIcon size={26} className='text-slate-300' />
            <span>Tidak ada riwayat konsumsi untuk filter yang dipilih.</span>
          </div>
        )}
      </div>
    </Card>
  );
}
