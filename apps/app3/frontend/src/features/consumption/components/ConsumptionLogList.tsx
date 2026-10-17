'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarCheck, Calendar as CalendarIcon, Filter, Check, Syringe, Building2, UserCheck } from 'lucide-react';
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
    <Card padding='lg' className='relative overflow-visible border-stone-200'>
      <div className='flex items-center justify-between mb-4 pb-2.5 border-b border-stone-100'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2'>
            <CalendarCheck size={18} className='text-emerald-700' />
            <span>Buku Catatan Imunisasi TT & Skrining ({logs.length})</span>
          </h4>
          {filterLabel && filterLabel !== 'Semua catatan' && (
            <span className='hidden sm:inline-block text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200'>
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
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-600/20'
                  : 'bg-white border-stone-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
              title='Filter Status Catatan'
              aria-label='Filter Status Catatan'
            >
              <Filter size={15} />
              {statusFilter !== 'ALL' && (
                <span className='absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white' />
              )}
            </button>

            {isStatusFilterOpen && (
              <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 p-1.5 z-50 animate-fade-in'>
                <div className='px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-stone-100 mb-1'>
                  Filter Status
                </div>
                <div className='space-y-0.5'>
                  {[
                    { id: 'ALL', label: 'Semua Status' },
                    { id: 'ON_TIME', label: 'Telah Diberikan (✓)' },
                    { id: 'MISSED', label: 'Terlewat / Tunda (✕)' },
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
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'text-slate-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check size={14} className='text-emerald-700 shrink-0' />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='flex flex-col divide-y divide-stone-100'>
        {logs.length > 0 ? (
          logs.map(log => {
            const isCompleted = log.status === 'ON_TIME' || log.status === 'LATE';
            return (
              <div
                key={log.id}
                className='py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3'
              >
                <div className='flex items-start gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs'>
                    <Syringe size={17} />
                  </div>
                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-xs sm:text-sm font-bold text-slate-900'>{log.title}</span>
                      <span className='text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
                        {formatShortDate(log.scheduledDate)}
                      </span>
                    </div>
                    <p className='text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap'>
                      <span>Waktu: {log.scheduledTime} WIB</span>
                      {log.takenAt && <span>• Diverifikasi: {log.takenAt}</span>}
                    </p>
                    {log.notes && (
                      <p className='text-[11px] text-slate-600 italic mt-0.5 flex items-center gap-1'>
                        <Building2 size={11} className='text-slate-400' />
                        <span>{log.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className='shrink-0'>
                  {isCompleted ? (
                    <Badge variant='recorded' size='sm'>
                      ✓ Diberikan
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
            <CalendarIcon size={26} className='text-emerald-200' />
            <span>Belum ada catatan riwayat imunisasi untuk filter ini.</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ConsumptionLogList;
