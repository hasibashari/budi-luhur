import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, Check } from 'lucide-react';
import { isStandalonePWA, isIOSDevice } from '../utils/pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (isStandalonePWA()) {
      setIsInstalled(true);
      return;
    }

    const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    const isIosPlatform = isIOSDevice();
    setIsIOS(isIosPlatform);

    // For non-iOS platforms, listen to beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not standalone, show prompt after a short delay
    if (isIosPlatform) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Error launching install prompt:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    // Dismiss for 7 days
    const nextPromptDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_prompt_dismissed_until', nextPromptDate.toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Banner */}
      <aside
        aria-label='Pemasangan Aplikasi PWA'
        className='fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5'
      >
        <div className='relative bg-white/95 backdrop-blur-md border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-blue-900/15 flex flex-col gap-3'>
          {/* Header Row */}
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 p-1 flex items-center justify-center shrink-0 shadow-xs'>
                <img
                  src='/icons/sibiru.png'
                  alt='Logo Aplikasi SIBIRU'
                  className='w-10 h-10 object-contain rounded-lg'
                />
              </div>
              <div>
                <div className='flex items-center gap-1.5'>
                  <span className='px-2 py-0.5 rounded-full bg-blue-100 text-[#005EB8] text-[10px] font-bold tracking-wide uppercase'>
                    PWA Ekosistem
                  </span>
                  <span className='text-xs text-slate-500 font-medium'>STIKes Budi Luhur</span>
                </div>
                <h4 className='text-sm sm:text-base font-bold text-slate-900 leading-snug'>
                  Pasang Aplikasi SIBIRU di Layar Utama
                </h4>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              aria-label='Tutup banner instalasi'
              className='text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0'
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Description */}
          <p className='text-xs text-slate-600 leading-relaxed'>
            Akses cepat ke 3 aplikasi kesehatan mandiri (FEMORY, PILLUNA, PRELUNA) melalui Aplikasi
            SIBIRU langsung dari layar utama perangkat Anda.
          </p>

          {/* Action Button */}
          <div className='flex items-center gap-2 pt-1'>
            <button
              onClick={handleInstallClick}
              className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005EB8] hover:bg-[#004B87] text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer'
            >
              {isIOS ? (
                <>
                  <Smartphone className='w-4 h-4' />
                  <span>Petunjuk Pasang di iPhone</span>
                </>
              ) : (
                <>
                  <Download className='w-4 h-4' />
                  <span>Pasang Aplikasi Sekarang</span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className='px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors'
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Petunjuk iOS Safari */}
      {showIOSGuide && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4'>
          <div className='bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95'>
            <div className='flex items-center justify-between pb-3 border-b border-slate-100 mb-4'>
              <h3 className='font-bold text-slate-900 text-base'>Cara Pasang di iPhone/iPad</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className='text-slate-400 hover:text-slate-600 p-1 rounded-full'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <ol className='space-y-4 text-xs sm:text-sm text-slate-700'>
              <li className='flex items-start gap-3'>
                <div className='w-6 h-6 rounded-full bg-blue-100 text-[#005EB8] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5'>
                  1
                </div>
                <div>
                  Buka website ini menggunakan browser <strong>Safari</strong>.
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-6 h-6 rounded-full bg-blue-100 text-[#005EB8] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5'>
                  2
                </div>
                <div>
                  Ketuk tombol <strong>Bagikan (Share)</strong>{' '}
                  <Share2 className='inline w-4 h-4 text-[#005EB8] mx-1' /> di bar navigasi Safari
                  (bawah atau atas).
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-6 h-6 rounded-full bg-blue-100 text-[#005EB8] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5'>
                  3
                </div>
                <div>
                  Gulir ke bawah dan pilih{' '}
                  <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>{' '}
                  <PlusSquare className='inline w-4 h-4 text-[#005EB8] mx-1' />.
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <div className='w-6 h-6 rounded-full bg-blue-100 text-[#005EB8] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5'>
                  4
                </div>
                <div>
                  Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi siap digunakan!
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className='mt-6 w-full py-3 rounded-xl bg-[#005EB8] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2'
            >
              <Check className='w-4 h-4' /> Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
