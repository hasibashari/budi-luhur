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
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { SADARI_STEPS, SadariStepDetail } from '../constants/sadari.constants';

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
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in'
      role='dialog'
      aria-modal='true'
      aria-labelledby='guided-modal-title'
    >
      <div className='bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up'>
        {/* Header Bar */}
        <div className='px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70'>
          <div className='flex items-center gap-2.5'>
            <span className='w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shadow-teal-600/30'>
              {currentStep.step}
            </span>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200'>
                  Langkah {currentStep.step} dari {SADARI_STEPS.length}
                </span>
                <span className='text-[11px] font-semibold text-slate-500 hidden sm:inline'>
                  {currentStep.badge}
                </span>
              </div>
              <h3 id='guided-modal-title' className='text-sm sm:text-base font-bold text-slate-900 mt-0.5'>
                Panduan Terpandu SADARI
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label='Tutup panduan'
            className='w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className='w-full bg-slate-100 h-1.5'>
          <div
            className='bg-teal-600 h-1.5 transition-all duration-300 ease-out'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className='p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5'>
          {/* Step Main Title */}
          <div>
            <h4 className='text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight'>
              {currentStep.title}
            </h4>
            <p className='text-xs sm:text-sm font-semibold text-teal-800 mt-1'>
              {currentStep.shortDesc}
            </p>
          </div>

          {/* Step Full Instruction Card */}
          <div className='bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 leading-relaxed text-xs sm:text-sm text-slate-700'>
            <p>{currentStep.instruction}</p>
          </div>

          {/* Visual Note & Tactile Tip Callout */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
            <div className='bg-teal-50/70 border border-teal-200/70 rounded-2xl p-3.5 flex flex-col gap-1'>
              <span className='font-bold text-teal-900 flex items-center gap-1.5'>
                <Info size={14} className='text-teal-600 shrink-0' />
                Posisi & Visual Note
              </span>
              <p className='text-slate-700 leading-normal'>{currentStep.visualNote}</p>
            </div>

            <div className='bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 flex flex-col gap-1'>
              <span className='font-bold text-amber-900 flex items-center gap-1.5'>
                <Sparkles size={14} className='text-amber-600 shrink-0' />
                Tips Perabaan (Taktil)
              </span>
              <p className='text-slate-700 leading-normal'>{currentStep.tactileTip}</p>
            </div>
          </div>

          {/* Timer Helper */}
          <div className='bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0'>
                <Clock size={20} />
              </div>
              <div>
                <span className='text-xs font-bold text-slate-800 block'>
                  Penghitung Waktu Langkah
                </span>
                <span className='text-[11px] text-slate-500'>
                  Waktu anjuran: {currentStep.estimatedSeconds} detik
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div
                className={`px-3 py-1 rounded-xl font-mono text-sm font-bold border ${
                  timerSeconds === 0
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                {timerSeconds}s
              </div>
              <Button
                size='sm'
                variant={isTimerRunning ? 'outline' : 'secondary'}
                shape='rounded'
                onClick={toggleTimer}
                className='px-3'
              >
                {isTimerRunning ? 'Jeda' : <Play size={14} />}
              </Button>
              <Button
                size='sm'
                variant='ghost'
                shape='rounded'
                onClick={handleResetTimer}
                aria-label='Reset waktu'
                className='px-2 text-slate-500'
              >
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>

          {/* Scientific Citation Badge */}
          <div className='flex items-center gap-2 text-[11px] text-slate-500 px-1'>
            <BookOpen size={13} className='text-slate-400 shrink-0' />
            <span>Referensi ilmiah: <strong className='text-slate-700'>{currentStep.citation}</strong></span>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className='px-5 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3'>
          <Button
            variant='outline'
            size='sm'
            shape='pill'
            onClick={handlePrev}
            disabled={isFirstStep}
            className='inline-flex items-center gap-1.5'
          >
            <ArrowLeft size={14} />
            <span>Sebelumnya</span>
          </Button>

          {/* Step dots for quick jumping */}
          <div className='hidden sm:flex items-center gap-1.5'>
            {SADARI_STEPS.map((step, idx) => (
              <button
                key={step.step}
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Ke langkah ${step.step}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-teal-600'
                    : idx < currentStepIndex
                    ? 'bg-teal-300'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          <Button
            variant='primary'
            size='sm'
            shape='pill'
            onClick={handleNext}
            className='inline-flex items-center gap-1.5 shadow-sm'
          >
            {isLastStep ? (
              <>
                <CheckCircle2 size={15} />
                <span>Selesaikan SADARI</span>
              </>
            ) : (
              <>
                <span>Langkah Berikutnya</span>
                <ArrowRight size={14} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

