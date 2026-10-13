'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWA } from '@/src/shared/hooks/usePWA';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/src/shared/utils/notifications';

const STORAGE_KEY = 'medicore_pwa_banner_dismissed';

function subscribeDismissed(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getDismissedSnapshot() {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}

function getDismissedServerSnapshot() {
  return true;
}

export interface PWAInstallBannerProps {
  /**
   * Position placement for the floating toast. Default is 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center';
  /**
   * Delay in ms before the toast animates in after mount. Default is 1200ms
   */
  delayMs?: number;
  /**
   * Variant compatibility prop
   */
  variant?: 'inline' | 'floating';
}

function subscribeMount() {
  return () => {};
}

function getMountSnapshot() {
  return true;
}

function getMountServerSnapshot() {
  return false;
}

export function PWAInstallBanner({
  position = 'bottom-right',
  delayMs = 1200,
}: PWAInstallBannerProps = {}) {
  const { isPWA, isInstallable, promptInstall } = usePWA();
  const isDismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );
  const mounted = useSyncExternalStore(subscribeMount, getMountSnapshot, getMountServerSnapshot);
  const [visible, setVisible] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setLocalDismissed(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        window.dispatchEvent(new Event('storage'));
      } catch {
        // ignore
      }
    }, 300);
  }, []);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const installed = await promptInstall();
      if (installed && isNotificationSupported() && getNotificationPermission() === 'default') {
        await requestNotificationPermission();
      }
    } finally {
      setInstalling(false);
      handleDismiss();
    }
  };

  // Do not render if in standalone PWA, dismissed, or not yet mounted
  if (!mounted || isPWA || isDismissed || localDismissed) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-5 left-4 sm:bottom-7 sm:left-7 right-4 sm:right-auto';
      case 'top-right':
        return 'top-5 right-4 sm:top-7 sm:right-7 left-4 sm:left-auto';
      case 'bottom-center':
        return 'bottom-5 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto';
      case 'bottom-right':
      default:
        return 'bottom-5 right-4 sm:bottom-7 sm:right-7 left-4 sm:left-auto';
    }
  };

  return (
    <div
      className={`fixed z-[1400] w-[calc(100%-32px)] sm:w-[400px] max-w-full transition-all duration-300 ${getPositionClasses()} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className='relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-2xl border border-white/20 backdrop-blur-lg'>
        {/* Subtle background ambient shine */}
        <div className='absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none blur-xl' />

        <div className='flex items-start justify-between gap-3 relative z-10'>
          {/* Left: Icon & Text content */}
          <div className='flex items-start gap-3.5 flex-1 min-w-0'>
            <div className='w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5'>
              <Smartphone size={20} className='text-white' />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-0.5'>
                <h4 className='font-extrabold text-sm sm:text-base text-white leading-tight'>
                  Pasang FEMORY
                </h4>
                <span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider'>
                  <Sparkles size={10} /> App
                </span>
              </div>

              <p className='text-xs text-rose-100 line-clamp-2 leading-relaxed'>
                Akses cepat jadwal minum TTD & pengingat langsung dari layar utama.
              </p>
            </div>
          </div>

          {/* Close Button Top Right */}
          <button
            onClick={handleDismiss}
            aria-label='Tutup notifikasi instalasi'
            className='p-1 -mr-1 -mt-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        {/* Bottom Actions Row */}
        <div className='flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/20 relative z-10'>
          <button
            onClick={handleDismiss}
            className='px-3 py-1.5 rounded-lg text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-colors cursor-pointer'
          >
            Nanti Saja
          </button>

          {isInstallable && (
            <button
              disabled={installing}
              onClick={handleInstallClick}
              className='inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 shadow-md transition-all cursor-pointer disabled:opacity-50'
            >
              <Download size={13} />
              <span>{installing ? 'Memasang...' : 'Pasang Sekarang'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const PWAInstallToast = PWAInstallBanner;
export default PWAInstallBanner;
