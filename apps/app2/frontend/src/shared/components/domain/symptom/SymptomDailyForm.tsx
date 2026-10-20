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
import { SymptomSectionCard } from './SymptomSectionCard';
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
} from './symptomHealth.types';

export interface SymptomDailyFormProps {
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
}

export const SymptomDailyForm: React.FC<SymptomDailyFormProps> = ({
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
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* NAVIGASI TANGGAL */}
      <div className='flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 sm:px-4 sm:py-2.5'>
        <div className='flex items-center gap-1 sm:gap-2'>
          <button
            type='button'
            onClick={() => handleShiftDate(-1)}
            className='cursor-pointer rounded-xl p-1.5 text-body transition-colors hover:bg-primary-subtle hover:text-primary'
            aria-label='Hari sebelumnya'
          >
            <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
          <span className='text-xs sm:text-sm md:text-base font-bold text-slate-800'>
            {formatIndonesianDate(selectedDate)}
          </span>
          <button
            type='button'
            onClick={() => handleShiftDate(1)}
            className='cursor-pointer rounded-xl p-1.5 text-body transition-colors hover:bg-primary-subtle hover:text-primary'
            aria-label='Hari berikutnya'
          >
            <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        </div>

        {/* Date Picker Native Trigger */}
        <button
          type='button'
          onClick={openDatePicker}
          className='relative flex cursor-pointer items-center gap-1.5 rounded-xl p-1.5 text-primary transition-colors hover:bg-primary-subtle hover:text-primary-hover'
          aria-label='Pilih tanggal catatan'
        >
          <CalendarIcon className='w-4 h-4 sm:w-5 sm:h-5' />
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

      {/* GRID KATEGORI GEJALA */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5'>
        {/* 1. KATEGORI MOOD */}
        <SymptomSectionCard
          icon={<Smile className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-accent-amber'
          title='Mood'
        >
          <div className='flex flex-wrap gap-1.5 sm:gap-2'>
            {MOOD_OPTIONS.map(item => (
              <Chip
                key={item.id}
                size='sm'
                active={mood === item.id}
                onClick={() => onMoodChange(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </SymptomSectionCard>

        {/* 2. KATEGORI NYERI */}
        <SymptomSectionCard
          icon={<Zap className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Nyeri'
        >
          <div className='flex flex-wrap gap-1.5 sm:gap-2'>
            {PAIN_OPTIONS.map(item => (
              <Chip
                key={item.id}
                size='sm'
                active={pain === item.id}
                onClick={() => onPainChange(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </SymptomSectionCard>

        {/* 3. KATEGORI PENDARAHAN */}
        <SymptomSectionCard
          icon={<Droplet className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Pendarahan'
        >
          <div className='flex flex-wrap gap-1.5 sm:gap-2'>
            {BLEEDING_OPTIONS.map(item => (
              <Chip
                key={item.id}
                size='sm'
                active={bleeding === item.id}
                onClick={() => onBleedingChange(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </SymptomSectionCard>

        {/* 4. KATEGORI EFEK SAMPING (Multi-Select) */}
        <SymptomSectionCard
          icon={<Star className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-accent-amber'
          title='Efek Samping'
          subtitle='(Bisa pilih >1)'
        >
          <div className='flex flex-wrap gap-1.5 sm:gap-2'>
            {SIDE_EFFECT_OPTIONS.map(item => (
              <Chip
                key={item.id}
                size='sm'
                active={sideEffects.includes(item.id)}
                onClick={() => onToggleSideEffect(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </SymptomSectionCard>

        {/* 5. KATEGORI BERAT BADAN */}
        <SymptomSectionCard
          icon={<Scale className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Berat Badan'
          className='md:col-span-2'
        >
          <div className='flex flex-wrap items-center justify-between gap-2.5'>
            <div className='flex flex-wrap gap-1.5 sm:gap-2'>
              {WEIGHT_OPTIONS.map(item => (
                <Chip
                  key={item.id}
                  size='sm'
                  active={weightStatus === item.id}
                  onClick={() => onWeightStatusChange(item.id)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>

            {/* Input Angka Berat Badan */}
            <div className='flex w-full items-center gap-2 rounded-xl border border-primary-soft bg-surface-soft px-3 py-1.5 transition-all focus-within:border-primary focus-within:bg-surface sm:w-44'>
              <Scale className='w-4 h-4 text-slate-500 shrink-0' />
              <input
                type='number'
                step='0.1'
                min='20'
                max='250'
                value={weightKg}
                onChange={e => onWeightKgChange(e.target.value)}
                placeholder='55'
                className='w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none'
              />
              <span className='text-xs font-semibold text-slate-500 shrink-0'>kg</span>
            </div>
          </div>
        </SymptomSectionCard>

        {/* 6. KATEGORI CATATAN TAMBAHAN */}
        <SymptomSectionCard
          icon={<FileText className='w-5 h-5 sm:w-6 sm:h-6' />}
          iconColorClassName='text-primary'
          title='Catatan tambahan'
          className='md:col-span-2'
        >
          <input
            type='text'
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder='Tulis catatan di sini...'
            className='w-full rounded-xl border border-border bg-surface-soft px-3.5 py-2.5 text-xs text-body placeholder:text-muted-soft transition-all focus:border-primary focus:bg-surface focus:outline-none sm:text-sm'
          />
        </SymptomSectionCard>
      </div>

      {/* FEEDBACK EDUKATIF BIDAN */}
      {activeAdvices.length > 0 && (
        <div className='p-3.5 sm:p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 text-xs text-slate-700 space-y-2 transition-all'>
          <div className='flex items-center gap-1.5 text-teal-900 font-bold text-xs sm:text-sm'>
            <Sparkles className='w-4 h-4 text-teal-600 shrink-0' />
            <span>Catatan Klinis Bidan Pilluna</span>
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

      {/* TOMBOL SIMPAN CATATAN */}
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
          className='py-3 sm:py-3.5 text-xs sm:text-sm md:text-base font-bold'
        >
          {isSavedToast ? 'Catatan Berhasil Disimpan!' : 'Simpan Catatan'}
        </Button>
      </div>
    </div>
  );
};
