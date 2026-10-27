import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { ONBOARDING_SLIDES } from '../constants/slides';
import { useAuth } from '@/src/features/auth';

export function OnboardingView() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch Swipe Gesture State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = ONBOARDING_SLIDES.length;
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;
  const slide = ONBOARDING_SLIDES[currentSlide];
  const IllustrationComponent = slide.illustration;

  const handleFinish = useCallback(
    (target: string = '/auth/login') => {
      completeOnboarding();
      navigate(target, { replace: true });
    },
    [completeOnboarding, navigate],
  );

  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish('/auth/register');
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

  // Dynamic Badge Color mapping based on accentColor
  const getBadgeStyle = (accent: 'ruby' | 'gold' | 'sage') => {
    switch (accent) {
      case 'ruby':
        return 'bg-[#ffd9de] text-[#8c0f39] border-[#ffb3c0]';
      case 'gold':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
      case 'sage':
        return 'bg-[#ecfdf5] text-[#166534] border-[#aff1d0]';
      default:
        return 'bg-[#ffd9de] text-[#8c0f39] border-[#ffb3c0]';
    }
  };

  return (
    <div className='min-h-[100dvh] h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-[#fafaf9] via-[#fff5f6] to-[#fafaf9] flex items-center justify-center p-0 sm:p-4 md:p-6 select-none overflow-hidden box-border relative'>
      {/* Decorative desktop ambient bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-72 h-72 bg-[#ffd9de]/50 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-[#aff1d0]/25 rounded-full blur-3xl pointer-events-none' />

      {/* Main Container: 100dvh for mobile/PWA, Elevated Card for tablet/desktop */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:min-h-[580px] sm:max-h-[680px] max-w-full sm:max-w-md md:max-w-lg bg-white/95 sm:bg-white backdrop-blur-md sm:rounded-3xl sm:border sm:border-[#ffd9de] sm:shadow-2xl sm:shadow-rose-950/10 flex flex-col justify-between p-5 sm:p-7 transition-all duration-300 relative z-10 box-border overflow-hidden'
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
                className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#ffd9de]/60 hover:bg-[#ffd9de] text-[#8c0f39] flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs'
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className='w-11 h-11' />
            )}
          </div>

          {/* App Name at top center */}
          <div className='flex items-center gap-1.5'>
            <span className='font-black text-lg sm:text-xl tracking-widest text-[#8c0f39] uppercase'>
              TEMANI
            </span>
            <span className='text-base sm:text-lg'>💍</span>
          </div>

          {/* Skip Button */}
          <div className='min-w-[44px] flex items-center justify-end'>
            {!isLast ? (
              <button
                type='button'
                onClick={() => handleFinish('/auth/login')}
                className='min-h-[44px] text-xs sm:text-sm font-semibold text-[#64748b] hover:text-[#8c0f39] px-3 py-2 transition-colors cursor-pointer rounded-full hover:bg-[#ffd9de]/40 active:scale-95 flex items-center justify-center'
              >
                Lewati
              </button>
            ) : (
              <div className='w-11 h-11' />
            )}
          </div>
        </div>

        {/* Center Slide Visual & Content */}
        <div
          key={slide.id}
          className='flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto py-2 sm:py-4 animate-fade-in w-full max-w-sm mx-auto overflow-hidden'
        >
          {/* Custom TEMANI Illustration */}
          <div className='mb-4 sm:mb-6 shrink-0 transition-transform duration-300 hover:scale-105'>
            <IllustrationComponent size={145} className='sm:w-[160px] sm:h-[160px]' />
          </div>

          {/* Tagline Badge */}
          <div className='mb-2.5'>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold shadow-2xs ${getBadgeStyle(
                slide.accentColor,
              )}`}
            >
              <Sparkles
                size={12}
                className={slide.accentColor === 'gold' ? 'text-amber-600' : 'text-[#aa294d]'}
              />
              <span>{slide.tagline}</span>
            </span>
          </div>

          {/* Slide Title */}
          <h2 className='text-xl sm:text-2xl md:text-[25px] font-black text-[#121c2a] tracking-tight mb-2 leading-snug'>
            {slide.title}
          </h2>

          {/* Slide Description */}
          <p className='text-xs sm:text-sm text-[#574144] leading-relaxed max-w-xs font-medium'>
            {slide.description}
          </p>
        </div>

        {/* Bottom Area: Progress Dots & Action Buttons */}
        <div className='shrink-0 w-full flex flex-col gap-3.5 sm:gap-4 pb-safe pb-3 sm:pb-2 pt-2'>
          {/* Pagination Interactive Dots with expanded tap target */}
          <div className='flex items-center justify-center gap-1.5'>
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => setCurrentSlide(idx)}
                className='p-2 flex items-center justify-center cursor-pointer'
                aria-label={`Ke slide ${idx + 1}`}
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-8 bg-[#aa294d] shadow-xs'
                      : 'w-2.5 bg-[#ffd9de] hover:bg-[#ffb3c0]'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Action Button(s) - 48px minimum height */}
          {!isLast ? (
            <button
              type='button'
              onClick={handleNext}
              className='w-full min-h-[48px] py-3.5 px-6 rounded-full bg-[#aa294d] hover:bg-[#8c0f39] text-white text-sm sm:text-base font-bold shadow-lg shadow-rose-950/20 hover:shadow-xl active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer'
            >
              <span>Lanjutkan</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <div className='w-full flex flex-col gap-2'>
              <button
                type='button'
                onClick={() => handleFinish('/auth/register')}
                className='w-full min-h-[48px] py-3.5 px-6 rounded-full bg-[#aa294d] hover:bg-[#8c0f39] text-white text-sm sm:text-base font-bold shadow-lg shadow-rose-950/20 hover:shadow-xl active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer'
              >
                <span>Mulai Sekarang (Daftar)</span>
                <Check size={18} />
              </button>

              <button
                type='button'
                onClick={() => handleFinish('/auth/login')}
                className='w-full min-h-[44px] py-2 text-center text-xs sm:text-sm text-[#574144] hover:text-[#aa294d] transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95'
              >
                <span>Sudah punya akun?</span>
                <span className='font-bold text-[#aa294d] underline underline-offset-4 decoration-[#ffd9de]'>
                  Masuk
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingView;
