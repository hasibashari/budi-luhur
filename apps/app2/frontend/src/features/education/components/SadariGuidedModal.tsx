import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  Info,
  Layers,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { SADARI_STEPS, SADARI_PRESSURE_LEVELS, SadariStepDetail } from '../constants/sadari.constants';

interface SadariGuidedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialStep?: number;
}

export const SadariGuidedModal: React.FC<SadariGuidedModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialStep = 1,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    Math.max(0, Math.min(initialStep - 1, SADARI_STEPS.length - 1))
  );
  const [timerSeconds, setTimerSeconds] = useState(SADARI_STEPS[0].estimatedSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Sync initial step when modal opens
  useEffect(() => {
    if (isOpen) {
      const targetIndex = Math.max(0, Math.min(initialStep - 1, SADARI_STEPS.length - 1));
      setCurrentStepIndex(targetIndex);
      setTimerSeconds(SADARI_STEPS[targetIndex].estimatedSeconds);
      setIsTimerRunning(false);
    }
  }, [isOpen, initialStep]);

  // Listen for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Update timer duration when step changes
  useEffect(() => {
    setTimerSeconds(SADARI_STEPS[currentStepIndex].estimatedSeconds);
    setIsTimerRunning(false);
  }, [currentStepIndex]);

  // Timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  const currentStep: SadariStepDetail = SADARI_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === SADARI_STEPS.length - 1;
  const progressPercent = ((currentStepIndex + 1) / SADARI_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(currentStep.estimatedSeconds);
  };

  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in'
      role='dialog'
      aria-modal='true'
      aria-labelledby='guided-modal-title'
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[86vh] animate-scale-up'>
        {/* Header Bar */}
        <div className='px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0'>
          <div className='flex items-center gap-2.5 sm:gap-3 min-w-0'>
            <span className='w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-xs shadow-teal-600/30 shrink-0'>
              {currentStep.step}
            </span>
            <div className='min-w-0'>
              <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap'>
                <span className='text-[10px] sm:text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 shrink-0'>
                  Langkah {currentStep.step} dari {SADARI_STEPS.length}
                </span>
                <span className='text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate'>
                  {currentStep.badge}
                </span>
              </div>
              <h3 id='guided-modal-title' className='text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate'>
                Praktik Terpandu SADARI
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label='Tutup panduan'
            className='w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer ml-2'
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className='w-full bg-slate-100 h-1.5 shrink-0'>
          <div
            className='bg-teal-600 h-1.5 transition-all duration-300 ease-out'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className='p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 sm:gap-5'>
          {/* Step Main Title */}
          <div>
            <h4 className='text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug'>
              {currentStep.title}
            </h4>
            <p className='text-xs sm:text-sm font-semibold text-teal-800 mt-1 leading-snug'>
              {currentStep.shortDesc}
            </p>
          </div>

          {/* Step Full Instruction Card */}
          <div className='bg-slate-50/90 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 leading-relaxed text-xs sm:text-sm text-slate-700'>
            <p className='leading-relaxed'>{currentStep.instruction}</p>
          </div>

          {/* Visual Note & Tactile Tip Callout */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs'>
            <div className='bg-teal-50/70 border border-teal-200/70 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1'>
              <span className='font-bold text-teal-900 flex items-center gap-1.5 text-xs'>
                <Info size={14} className='text-teal-600 shrink-0' />
                Posisi & Visual Note
              </span>
              <p className='text-slate-700 leading-normal text-[11px] sm:text-xs'>{currentStep.visualNote}</p>
            </div>

            <div className='bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1'>
              <span className='font-bold text-amber-900 flex items-center gap-1.5 text-xs'>
                <Sparkles size={14} className='text-amber-600 shrink-0' />
                Tips Perabaan (Taktil)
              </span>
              <p className='text-slate-700 leading-normal text-[11px] sm:text-xs'>{currentStep.tactileTip}</p>
            </div>
          </div>

          {/* Teknik Perabaan: 3 Tingkat Tekanan Jari (Khusus Langkah Palpasi 5 & 6) */}
          {[5, 6].includes(currentStep.step) && (
            <div className='bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 animate-fade-in'>
              <div className='flex items-center gap-2 mb-2.5'>
                <div className='w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100'>
                  <Layers size={16} />
                </div>
                <div>
                  <h5 className='text-xs sm:text-sm font-bold text-slate-900'>
                    Teknik Perabaan: 3 Tingkat Tekanan Jari
                  </h5>
                  <p className='text-[10px] sm:text-[11px] text-slate-500'>
                    Gunakan bantalan 3 jari tengah dengan gerakan memutar melingkar bertahap:
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1'>
                {SADARI_PRESSURE_LEVELS.map(level => (
                  <div
                    key={level.level}
                    className='bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-2xs'
                  >
                    <div>
                      <div className='flex items-center gap-1.5 mb-1'>
                        <span className='w-4.5 h-4.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0'>
                          {level.level}
                        </span>
                        <span className='text-xs font-bold text-slate-800 truncate'>{level.name}</span>
                      </div>
                      <span className='text-[10px] font-semibold text-teal-700 block mb-1'>
                        Target: {level.target}
                      </span>
                      <p className='text-[11px] text-slate-600 leading-relaxed'>{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timer Helper */}
          <div className='bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs'>
            <div className='flex items-center gap-2.5 sm:gap-3'>
              <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0'>
                <Clock size={19} />
              </div>
              <div>
                <span className='text-xs font-bold text-slate-800 block'>
                  Penghitung Waktu Langkah
                </span>
                <span className='text-[10px] sm:text-[11px] text-slate-500'>
                  Waktu anjuran: {currentStep.estimatedSeconds} detik
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100'>
              <div
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border ${
                  timerSeconds === 0
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                {timerSeconds}s
              </div>
              <div className='flex items-center gap-1.5'>
                <Button
                  size='sm'
                  variant={isTimerRunning ? 'outline' : 'secondary'}
                  shape='rounded'
                  onClick={toggleTimer}
                  className='px-3.5 py-1.5 text-xs font-semibold'
                >
                  {isTimerRunning ? 'Jeda' : <Play size={14} className='fill-current' />}
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  shape='rounded'
                  onClick={handleResetTimer}
                  aria-label='Reset waktu'
                  className='px-2.5 text-slate-500 hover:text-slate-700'
                >
                  <RotateCcw size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Scientific Citation Badge */}
          <div className='flex items-center gap-1.5 text-[11px] text-slate-500 px-1'>
            <BookOpen size={13} className='text-slate-400 shrink-0' />
            <span>Referensi ilmiah: <strong className='text-slate-700'>{currentStep.citation}</strong></span>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className='px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-t border-slate-100 bg-slate-50/90 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4 shrink-0'>
          {/* Step dots: on mobile, take full width on top (w-full order-1), on sm: auto width in middle (sm:w-auto sm:order-2) */}
          <div className='flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto order-1 sm:order-2 py-0.5 sm:py-0'>
            {SADARI_STEPS.map((step, idx) => (
              <button
                key={step.step}
                type='button'
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Ke langkah ${step.step}`}
                className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 sm:w-7 bg-teal-600 shadow-2xs'
                    : idx < currentStepIndex
                    ? 'w-2 sm:w-2.5 bg-teal-300 hover:bg-teal-400'
                    : 'w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <Button
            variant='outline'
            size='sm'
            shape='pill'
            onClick={handlePrev}
            disabled={isFirstStep}
            className='order-2 sm:order-1 flex-1 sm:flex-initial inline-flex items-center justify-center py-2 sm:py-2.5 px-2.5 sm:px-4 text-xs font-semibold'
          >
            <span className='inline-flex items-center gap-1.5'>
              <ArrowLeft size={14} className='shrink-0' />
              <span>Sebelumnya</span>
            </span>
          </Button>

          <Button
            variant='primary'
            size='sm'
            shape='pill'
            onClick={handleNext}
            className='order-3 sm:order-3 flex-1 sm:flex-initial inline-flex items-center justify-center py-2 sm:py-2.5 px-2.5 sm:px-4 text-xs font-bold shadow-sm'
          >
            {isLastStep ? (
              <span className='inline-flex items-center gap-1.5'>
                <CheckCircle2 size={15} className='shrink-0' />
                <span>Selesaikan SADARI</span>
              </span>
            ) : (
              <span className='inline-flex items-center gap-1.5'>
                <span>Langkah Berikutnya</span>
                <ArrowRight size={14} className='shrink-0' />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

