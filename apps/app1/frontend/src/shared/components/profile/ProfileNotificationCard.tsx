'use client';

import React from 'react';
import { BellRing, BellOff } from 'lucide-react';
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
} from '@/src/shared/utils/notifications';

export interface ProfileNotificationCardProps {
  theme?: 'rose' | 'teal' | 'burgundy';
  title?: string;
  subtitle?: string;
  scheduleTitle?: string;
  activeTime?: string;
  activeDay?: string;
  scheduleLink?: string;
  isEnabled: boolean;
  remind15MinBefore?: boolean;
  soundEnabled?: boolean;
  onToggleEnabled: (enabled: boolean) => Promise<void> | void;
  onToggleRemind15?: (remind15: boolean) => Promise<void> | void;
  onToggleSound?: (sound: boolean) => void;
  onPermissionError?: (message: string) => void;
  toleranceText?: string;
  extraInfo?: string;
}

export function ProfileNotificationCard({
  theme = 'rose',
  title = 'Notifikasi Pengingat',
  subtitle,
  isEnabled,
  onToggleEnabled,
  onPermissionError,
}: ProfileNotificationCardProps) {
  const themeStyles = {
    rose: {
      cardBorder: 'border-rose-100/80',
      iconBg: isEnabled
        ? 'bg-rose-50 text-rose-600 border-rose-200/80'
        : 'bg-stone-100 text-stone-400 border-stone-200',
      activeSwitch: 'bg-rose-600',
    },
    teal: {
      cardBorder: 'border-teal-100/80',
      iconBg: isEnabled
        ? 'bg-teal-50 text-teal-600 border-teal-200/80'
        : 'bg-stone-100 text-stone-400 border-stone-200',
      activeSwitch: 'bg-teal-600',
    },
    burgundy: {
      cardBorder: 'border-[#ffd9de]/80',
      iconBg: isEnabled
        ? 'bg-[#ffd9de]/60 text-[#aa294d] border-[#ffd9de]'
        : 'bg-stone-100 text-stone-400 border-stone-200',
      activeSwitch: 'bg-[#aa294d]',
    },
  }[theme];

  const handleToggle = async () => {
    // Mematikan pengingat
    if (isEnabled) {
      await onToggleEnabled(false);
      return;
    }

    // Mengaktifkan pengingat: Cek dukungan browser
    if (!isNotificationSupported()) {
      onPermissionError?.('Browser tidak mendukung notifikasi.');
      return;
    }

    const currentPerm = getNotificationPermission();

    // Jika izin diblokir sebelumnya di browser
    if (currentPerm === 'denied') {
      onPermissionError?.('Izin notifikasi diblokir di browser.');
      return;
    }

    // Jika izin belum pernah diminta, panggil dialog izin browser
    if (currentPerm === 'default') {
      try {
        const result = await requestNotificationPermission();
        if (result !== 'granted') {
          onPermissionError?.('Izin notifikasi belum diberikan.');
          return;
        }
      } catch {
        return;
      }
    }

    // Hanya jika izin granted, aktifkan switch
    await onToggleEnabled(true);
  };

  return (
    <div
      className={`rounded-3xl bg-white border ${themeStyles.cardBorder} shadow-sm p-4 sm:p-5 flex items-center justify-between gap-4 transition-all`}
    >
      <div className='flex items-center gap-3.5 min-w-0'>
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${themeStyles.iconBg}`}
        >
          {isEnabled ? <BellRing size={20} /> : <BellOff size={20} />}
        </div>
        <div className='min-w-0'>
          <h2 className='text-sm sm:text-base font-bold text-slate-900 truncate'>{title}</h2>
          <p className='text-xs text-slate-500 truncate mt-0.5'>
            {subtitle ||
              (isEnabled ? 'Pengingat otomatis aktif' : 'Pengingat otomatis dinonaktifkan')}
          </p>
        </div>
      </div>

      {/* Switch Toggle */}
      <button
        type='button'
        role='switch'
        aria-checked={isEnabled}
        aria-label={title}
        onClick={handleToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isEnabled ? themeStyles.activeSwitch : 'bg-stone-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            isEnabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default ProfileNotificationCard;
