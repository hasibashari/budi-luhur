import React, { useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Smile,
  Zap,
  Droplet,
  Star,
  Scale,
  FileText,
  Save,
  Sparkles,
  Check,
} from 'lucide-react';
import { Chip } from '@/src/shared/components/ui/Chip';
import { Button } from '@/src/shared/components/ui/Button';
import { NoteSectionCard } from './NoteSectionCard';
import {
  ClinicalAdvice,
  formatIndonesianDate,
  getLocalDateString,
  MoodType,
  PainLevel,
  BleedingType,
  WeightTrend,
  MOOD_OPTIONS,
  PAIN_OPTIONS,
  BLEEDING_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  WEIGHT_OPTIONS,
} from '../types/notes.types';

export interface DailyNoteFormProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  mood: MoodType;
  onMoodChange: (mood: MoodType) => void;
  pain: PainLevel;
  onPainChange: (pain: PainLevel) => void;
  bleeding: BleedingType;
  onBleedingChange: (bleeding: BleedingType) => void;
  sideEffects: string[];
  onToggleSideEffect: (id: string) => void;
  weightStatus: WeightTrend;
  onWeightStatusChange: (status: WeightTrend) => void;
  weightKg: string;
  onWeightKgChange: (kg: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  activeAdvices: ClinicalAdvice[];
  onSave: () => void | Promise<void>;
  isSaving: boolean;
  isSavedToast: boolean;
  saveError: string | null;
  showInlineSave?: boolean;
}

// Backward compatibility alias
export type SymptomDailyFormProps = DailyNoteFormProps;

export const DailyNoteForm: React.FC<DailyNoteFormProps> = ({
  selectedDate,
  onDateChange,
  mood,
  onMoodChange,
  pain,
  onPainChange,
  bleeding,
  onBleedingChange,
  sideEffects,
  onToggleSideEffect,
  weightStatus,
  onWeightStatusChange,
  weightKg,
  onWeightKgChange,
  notes,
  onNotesChange,
  activeAdvices,
  onSave,
  isSaving,
  isSavedToast,
  saveError,
  showInlineSave = true,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    onDateChange(getLocalDateString(current));
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        input.focus();
        input.click();
      }
    } else {
      input.focus();
      input.click();
    }
  };

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* NAVIGASI TANGGAL (TOUCH-FRIENDLY) */}
      <div className='flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/90 p-2 sm:px-4 sm:py-2.5 shadow-2xs'>
        <div className='flex items-center gap-1 sm:gap-2'>
          <button
            type='button'
            onClick={() => handleShiftDate(-1)}
            className='flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center cursor-pointer rounded-xl text-body transition-colors hover:bg-primary-subtle hover:text-primary active:scale-95 touch-manipulation'
            aria-label='Hari sebelumnya'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <span className='text-xs sm:text-sm font-extrabold text-slate-800 px-1'>
            {formatIndonesianDate(selectedDate)}
          </span>
          <button
            type='button'
            onClick={() => handleShiftDate(1)}
            className='flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center cursor-pointer rounded-xl text-body transition-colors hover:bg-primary-subtle hover:text-primary active:scale-95 touch-manipulation'
            aria-label='Hari berikutnya'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>

        {/* Date Picker Native Trigger */}
        <button
          type='button'
          onClick={openDatePicker}
          className='relative flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary-subtle hover:text-primary-hover active:scale-95 touch-manipulation'
          aria-label='Pilih tanggal catatan'
        >
          <CalendarIcon className='w-4 h-4' />
          <span className='hidden sm:inline'>Pilih Kalender</span>
          <input
            ref={dateInputRef}
            type='date'
            value={selectedDate}
            onChange={e => e.target.value && onDateChange(e.target.value)}
            tabIndex={-1}
            aria-hidden='true'
            className='pointer-events-none absolute h-0 w-0 opacity-0'
          />
        </button>
      </div>

      {/* GRID KARTU PERTANYAAN */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
        {/* 1. MOOD */}
        <NoteSectionCard
          icon={<Smile className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Bagaimana mood Anda?'
        >
          <div className='flex flex-wrap gap-2'>
            {MOOD_OPTIONS.map(opt => (
              <Chip
                key={opt.id}
                size='sm'
                active={mood === opt.id}
                onClick={() => onMoodChange(opt.id)}
                className='min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl'
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </NoteSectionCard>

        {/* 2. NYERI TUBUH */}
        <NoteSectionCard
          icon={<Zap className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Tingkat nyeri tubuh'
        >
          <div className='flex flex-wrap gap-2'>
            {PAIN_OPTIONS.map(opt => (
              <Chip
                key={opt.id}
                size='sm'
                active={pain === opt.id}
                onClick={() => onPainChange(opt.id)}
                className='min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl'
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </NoteSectionCard>

        {/* 3. PENDARAHAN */}
        <NoteSectionCard
          icon={<Droplet className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Pendarahan / flek'
        >
          <div className='flex flex-wrap gap-2'>
            {BLEEDING_OPTIONS.map(opt => (
              <Chip
                key={opt.id}
                size='sm'
                active={bleeding === opt.id}
                onClick={() => onBleedingChange(opt.id)}
                className='min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl'
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </NoteSectionCard>

        {/* 4. BERAT BADAN */}
        <NoteSectionCard
          icon={<Scale className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Berat badan'
        >
          <div className='space-y-2.5 w-full'>
            <div className='flex flex-wrap gap-2'>
              {WEIGHT_OPTIONS.map(opt => (
                <Chip
                  key={opt.id}
                  size='sm'
                  active={weightStatus === opt.id}
                  onClick={() => onWeightStatusChange(opt.id)}
                  className='min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl'
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
            <div className='flex items-center gap-2 pt-1'>
              <span className='text-xs text-slate-500 font-semibold'>Angka:</span>
              <div className='relative w-32'>
                <input
                  type='number'
                  step='0.1'
                  value={weightKg}
                  onChange={e => onWeightKgChange(e.target.value)}
                  placeholder='55.0'
                  className='w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-xs text-body placeholder:text-muted-soft transition-all focus:border-primary focus:bg-surface focus:outline-none sm:text-sm min-h-[42px]'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400'>
                  kg
                </span>
              </div>
            </div>
          </div>
        </NoteSectionCard>

        {/* 5. EFEK SAMPING */}
        <NoteSectionCard
          icon={<Star className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Efek samping adaptasi'
          subtitle='(bisa pilih lebih dari satu)'
          className='md:col-span-2'
        >
          <div className='flex flex-wrap gap-2'>
            {SIDE_EFFECT_OPTIONS.map(opt => (
              <Chip
                key={opt.id}
                size='sm'
                active={sideEffects.includes(opt.id)}
                onClick={() => onToggleSideEffect(opt.id)}
                className='min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl'
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </NoteSectionCard>

        {/* 6. CATATAN TAMBAHAN (TEXTAREA MULTI-BARIS) */}
        <NoteSectionCard
          icon={<FileText className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Catatan tambahan'
          subtitle='(keluhan khusus, waktu gejala, dsb)'
          className='md:col-span-2'
        >
          <textarea
            rows={3}
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder='Tulis catatan kondisi harian di sini...'
            className='w-full rounded-2xl border border-border bg-surface-soft p-3 text-xs text-body placeholder:text-muted-soft transition-all focus:border-primary focus:bg-surface focus:outline-none sm:text-sm resize-none leading-relaxed'
          />
        </NoteSectionCard>
      </div>

      {/* FEEDBACK EDUKATIF MEDIS */}
      {activeAdvices.length > 0 && (
        <div className='p-3.5 sm:p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 text-xs text-slate-700 space-y-2 transition-all shadow-2xs'>
          <div className='flex items-center gap-1.5 text-teal-900 font-bold text-xs sm:text-sm'>
            <Sparkles className='w-4 h-4 text-teal-600 shrink-0' />
            <span>Catatan Klinis Medis Pilluna</span>
          </div>
          <div className='space-y-1.5'>
            {activeAdvices.map((item, idx) => (
              <p key={idx} className='text-[11px] sm:text-xs leading-relaxed text-slate-600'>
                <strong className='text-teal-950'>{item.category}:</strong> {item.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* TOMBOL SIMPAN CATATAN (INLINE JIKA showInlineSave TRUE) */}
      {showInlineSave && (
        <div className='pt-2'>
          {saveError && (
            <p className='mb-2 text-center text-xs font-semibold text-red-600'>{saveError}</p>
          )}
          <Button
            type='button'
            onClick={onSave}
            loading={isSaving}
            fullWidth
            shape='pill'
            icon={
              isSavedToast ? (
                <Check className='w-4 h-4 sm:w-5 sm:h-5' />
              ) : (
                <Save className='w-4 h-4 sm:w-5 sm:h-5' />
              )
            }
            className='min-h-[48px] py-3 text-xs sm:text-sm md:text-base font-bold shadow-md'
          >
            {isSavedToast ? 'Catatan Berhasil Disimpan!' : 'Simpan Catatan'}
          </Button>
        </div>
      )}
    </div>
  );
};

// Re-export alias backward compatibility
export const SymptomDailyForm = DailyNoteForm;

export default DailyNoteForm;
