'use client';

import React, { ReactNode } from 'react';
import { BellRing, BellOff, KeyRound } from 'lucide-react';

export interface ProfileSettingsGroupProps {
  title?: string;
  scheduleData?: {
    isEnabled: boolean;
    dayOfWeek?: string;
    time?: string;
  } | null;
  onToggleScheduleEnabled: (enabled: boolean) => Promise<void> | void;
  onChangePassword?: () => void;
  passwordHelperText?: string;
  extraRows?: ReactNode;
}

export function ProfileSettingsGroup({
  title = 'Daftar Pengaturan',
  scheduleData,
  onToggleScheduleEnabled,
  onChangePassword,
  passwordHelperText = 'Hubungi pembina UKS bila lupa sandi',
  extraRows,
}: ProfileSettingsGroupProps) {
  const isEnabled = scheduleData?.isEnabled ?? true;

  return (
    <div>
      <div className='px-2 mb-1.5'>
        <h2 className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>{title}</h2>
      </div>
      <div className='rounded-2xl sm:rounded-3xl bg-white border border-rose-100/90 shadow-2xs divide-y divide-slate-100 overflow-hidden'>
        {/* Pengingat Minum TTD */}
        <div className='p-3.5 sm:p-4 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3.5 min-w-0'>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                isEnabled
                  ? 'bg-rose-50 text-rose-600 border-rose-200/80'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              {isEnabled ? <BellRing size={17} /> : <BellOff size={17} />}
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-slate-800 truncate'>
                Pengingat Minum TTD
              </p>
              <p className='text-[11px] text-slate-500 truncate mt-0.5'>
                {isEnabled
                  ? `Aktif (${scheduleData?.dayOfWeek || 'Sabtu'}, ${scheduleData?.time || '20:00'} WIB)`
                  : 'Pengingat otomatis dinonaktifkan'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type='button'
            role='switch'
            aria-checked={isEnabled}
            aria-label='Pengingat Minum TTD'
            onClick={() => onToggleScheduleEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled ? 'bg-rose-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Ubah Password */}
        {onChangePassword && (
          <div className='p-3.5 sm:p-4 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3.5 min-w-0'>
              <div className='w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60'>
                <KeyRound size={17} />
              </div>
              <div className='min-w-0'>
                <p className='text-xs sm:text-sm font-bold text-slate-800 truncate'>
                  Kata Sandi Akun
                </p>
                <p className='text-[11px] text-slate-500 truncate mt-0.5'>
                  {passwordHelperText}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={onChangePassword}
              className='text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/60 px-3 py-1.5 rounded-lg border border-rose-200/60 transition-colors cursor-pointer shrink-0'
            >
              Ubah
            </button>
          </div>
        )}

        {extraRows}
      </div>
    </div>
  );
}

export default ProfileSettingsGroup;
