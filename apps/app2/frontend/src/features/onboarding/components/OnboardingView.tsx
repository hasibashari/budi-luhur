import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles, Pill } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { ONBOARDING_SLIDES } from '../constants/slides';
import { useAuth } from '@/src/features/auth';

export function OnboardingView() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [deletedBanner, setDeletedBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('deleted') === 'true') {
        setDeletedBanner(true);
        setTimeout(() => setDeletedBanner(false), 5000);
      }
    }
  }, []);

  // Touch Swipe Gesture State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = ONBOARDING_SLIDES.length;
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;
  const slide = ONBOARDING_SLIDES[currentSlide];
  const IllustrationComponent = slide.illustration;

  const handleFinish = useCallback(() => {
    completeOnboarding();
    navigate('/auth/login', { replace: true });
  }, [completeOnboarding, navigate]);

  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentSlide, totalSlides, handleFinish]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe && !isLast) {
      handleNext();
    } else if (isRightSwipe && !isFirst) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div className='h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-[#F8FAFC] via-[#F0FDFA]/50 to-[#F8FAFC] flex items-center justify-center p-0 sm:p-4 md:p-6 select-none overflow-hidden box-border'>
      {/* Account Deletion Confirmation Toast */}
      {deletedBanner && (
        <div className='fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in border border-[#334155] max-w-[90vw]'>
          <Check size={14} className='text-[#0D9488] shrink-0' />
          <span>Akun dan data Anda telah berhasil dihapus secara permanen.</span>
        </div>
      )}

      {/* Decorative desktop ambient bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-64 h-64 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none' />

      {/* Main Container: 100dvh for mobile/PWA, Elevated Card for tablet/desktop */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:min-h-[580px] sm:max-h-[680px] max-w-full sm:max-w-md md:max-w-lg bg-white/95 sm:bg-white backdrop-blur-md sm:rounded-3xl sm:border sm:border-border sm:shadow-2xl sm:shadow-teal-900/10 flex flex-col justify-between p-5 sm:p-7 transition-all duration-300 relative z-10 box-border overflow-hidden'
      >
        {/* Top Header: Navigation Back, App Name/Logo at top, and Skip Button */}
        <div className='shrink-0 w-full flex items-center justify-between pt-safe pb-2'>
          {/* Back Button or invisible spacer */}
          <div className='w-12 flex items-center justify-start'>
            {!isFirst ? (
              <button
                type='button'
                onClick={handlePrev}
                aria-label='Kembali ke slide sebelumnya'
                className='w-8 h-8 rounded-full bg-primary-subtle hover:bg-primary-soft text-primary flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs border border-primary-soft'
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <div className='w-8 h-8' />
            )}
          </div>

          {/* App Name at top center */}
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white flex items-center justify-center shadow-xs'>
              <Pill size={14} className='rotate-45' />
            </div>
            <span className='font-black text-lg sm:text-xl tracking-tight text-ink'>
              Pilluna
            </span>
          </div>

          {/* Skip Button */}
          <div className='w-12 flex items-center justify-end'>
            {!isLast ? (
              <button
                type='button'
                onClick={handleFinish}
                className='text-xs sm:text-sm font-semibold text-muted hover:text-primary px-2 py-1 transition-colors cursor-pointer rounded-lg hover:bg-primary-subtle'
              >
                Lewati
              </button>
            ) : (
              <div className='w-8 h-8' />
            )}
          </div>
        </div>

        {/* Center Slide Visual & Content */}
        <div
          key={slide.id}
          className='flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto py-2 sm:py-4 animate-fade-in w-full max-w-sm mx-auto overflow-hidden'
        >
          {/* 3D Medical Vector Mascot / Icon Illustration */}
          <div className='mb-4 sm:mb-6 shrink-0 transition-transform duration-300 hover:scale-105'>
            <IllustrationComponent size={145} className='sm:w-[160px] sm:h-[160px]' />
          </div>

          {/* Tagline Badge */}
          <div className='mb-2.5'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-subtle border border-primary-soft text-[11px] sm:text-xs font-bold text-primary shadow-2xs'>
              <Sparkles size={12} className='text-primary' />
              <span>{slide.tagline}</span>
            </span>
          </div>

          {/* Punchy Title */}
          <h2 className='text-xl sm:text-2xl md:text-[26px] font-black text-ink tracking-tight mb-2 leading-snug'>
            {slide.title}
          </h2>

          {/* Short 1-Sentence Description */}
          <p className='text-xs sm:text-sm text-muted leading-relaxed max-w-xs font-medium'>
            {slide.description}
          </p>
        </div>

        {/* Bottom Area: Progress Dots & Next/Get Started Button */}
        <div className='shrink-0 w-full flex flex-col gap-4 sm:gap-5 pb-safe pb-4 sm:pb-2 pt-2'>
          {/* Pagination Interactive Dots */}
          <div className='flex items-center justify-center gap-2'>
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-8 bg-primary shadow-xs'
                    : 'w-2 bg-primary-soft hover:bg-primary-light'
                }`}
                aria-label={`Ke slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Primary Action Button */}
          <Button
            variant='primary'
            size='lg'
            shape='pill'
            fullWidth
            icon={isLast ? <Check size={18} /> : <ArrowRight size={18} />}
            onClick={handleNext}
            className='shadow-lg shadow-teal-700/20 py-3 sm:py-3.5 text-sm sm:text-base font-bold transition-all cursor-pointer active:scale-[0.99]'
          >
            {isLast ? 'Mulai Sekarang' : 'Lanjutkan'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingView;
