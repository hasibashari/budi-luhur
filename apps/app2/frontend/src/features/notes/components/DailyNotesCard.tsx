import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Edit3, CheckCircle2, Save, Check } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import {
  DailyHealthLog,
  MoodType,
  PainLevel,
  BleedingType,
  WeightTrend,
  DailyNotesCardProps,
  ClinicalAdvice,
  DUMMY_HISTORY,
  MOOD_OPTIONS,
  PAIN_OPTIONS,
  BLEEDING_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  getLocalDateString,
  formatIndonesianDate,
} from '../types/notes.types';
import { DailyNoteForm } from './DailyNoteForm';
import { NoteHistoryView } from './NoteHistoryView';
import { NoteFormModal } from './NoteFormModal';

export const DailyNotesCard: React.FC<DailyNotesCardProps> = ({
  initialLogs = DUMMY_HISTORY,
  onSaveLog,
}) => {
  const todayDateStr = useMemo(() => getLocalDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [logs, setLogs] = useState<DailyHealthLog[]>(initialLogs);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Periksa apakah hari ini sudah memiliki catatan
  const hasTodayLog = useMemo(
    () => logs.some(item => item.logDate === todayDateStr),
    [logs, todayDateStr],
  );

  const todayLog = useMemo(
    () => logs.find(item => item.logDate === todayDateStr),
    [logs, todayDateStr],
  );

  // Cari apakah tanggal yang dipilih sudah punya catatan di database/state
  const existingLog = useMemo(
    () => logs.find(item => item.logDate === selectedDate),
    [logs, selectedDate],
  );

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  // State Form Harian
  const [mood, setMood] = useState<MoodType>(existingLog?.mood || 'bahagia');
  const [pain, setPain] = useState<PainLevel>(existingLog?.pain || 'tidak_ada');
  const [bleeding, setBleeding] = useState<BleedingType>(existingLog?.bleeding || 'haid_normal');
  const [sideEffects, setSideEffects] = useState<string[]>(
    existingLog?.sideEffects || ['tidak_ada'],
  );
  const [weightStatus, setWeightStatus] = useState<WeightTrend>(
    existingLog?.weightStatus || 'stabil',
  );
  const [weightKg, setWeightKg] = useState<string>(existingLog?.weightKg || '55');
  const [notes, setNotes] = useState<string>(existingLog?.notes || '');

  useEffect(() => {
    if (existingLog) {
      setMood(existingLog.mood);
      setPain(existingLog.pain);
      setBleeding(existingLog.bleeding);
      setSideEffects(existingLog.sideEffects);
      setWeightStatus(existingLog.weightStatus);
      setWeightKg(existingLog.weightKg);
      setNotes(existingLog.notes);
      return;
    }

    setMood('bahagia');
    setPain('tidak_ada');
    setBleeding('tidak_ada');
    setSideEffects(['tidak_ada']);
    setWeightStatus('stabil');
    setWeightKg('55');
    setNotes('');
  }, [existingLog]);

  // Sinkronisasi ulang form ketika pengguna mengganti tanggal
  const syncFormWithDate = (newDate: string) => {
    setSelectedDate(newDate);
    setIsSavedToast(false);
    setSaveError(null);
    const found = logs.find(item => item.logDate === newDate);
    if (found) {
      setMood(found.mood);
      setPain(found.pain);
      setBleeding(found.bleeding);
      setSideEffects(found.sideEffects);
      setWeightStatus(found.weightStatus);
      setWeightKg(found.weightKg);
      setNotes(found.notes);
    } else {
      setMood('bahagia');
      setPain('tidak_ada');
      setBleeding('tidak_ada');
      setSideEffects(['tidak_ada']);
      setWeightStatus('stabil');
      setWeightKg('55');
      setNotes('');
    }
  };

  // Handler Multi-select Efek Samping
  const toggleSideEffect = (id: string) => {
    setIsSavedToast(false);
    if (id === 'tidak_ada') {
      setSideEffects(['tidak_ada']);
      return;
    }
    const withoutNone = sideEffects.filter(item => item !== 'tidak_ada');
    if (withoutNone.includes(id)) {
      const updated = withoutNone.filter(item => item !== id);
      setSideEffects(updated.length > 0 ? updated : ['tidak_ada']);
    } else {
      setSideEffects([...withoutNone, id]);
    }
  };

  // Kumpulkan Saran Klinis Medis secara dinamis berdasarkan input
  const activeAdvices = useMemo(() => {
    const list: ClinicalAdvice[] = [];

    const moodObj = MOOD_OPTIONS.find(m => m.id === mood);
    if (moodObj?.advice) list.push({ category: `Mood (${moodObj.label})`, text: moodObj.advice });

    const painObj = PAIN_OPTIONS.find(p => p.id === pain);
    if (painObj?.advice) list.push({ category: `Nyeri (${painObj.label})`, text: painObj.advice });

    const bleedObj = BLEEDING_OPTIONS.find(b => b.id === bleeding);
    if (bleedObj?.advice)
      list.push({ category: `Pendarahan (${bleedObj.label})`, text: bleedObj.advice });

    SIDE_EFFECT_OPTIONS.forEach(se => {
      if (sideEffects.includes(se.id) && se.advice) {
        list.push({ category: `Efek Samping (${se.label})`, text: se.advice });
      }
    });

    return list;
  }, [mood, pain, bleeding, sideEffects]);

  // Handler Simpan Catatan (Upsert ke state & trigger prop onSaveLog)
  const handleSave = async () => {
    const timeStr =
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newEntry: DailyHealthLog = {
      id: existingLog?.id || `log-${Date.now()}`,
      logDate: selectedDate,
      mood,
      pain,
      bleeding,
      sideEffects,
      weightStatus,
      weightKg,
      notes,
      updatedAt: timeStr,
    };

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveLog?.(newEntry);
      setLogs(prev => {
        const exists = prev.some(item => item.logDate === selectedDate);
        if (exists) {
          return prev.map(item => (item.logDate === selectedDate ? newEntry : item));
        }
        return [newEntry, ...prev].sort((a, b) => b.logDate.localeCompare(a.logDate));
      });
      setIsSavedToast(true);
      setTimeout(() => {
        setIsFormModalOpen(false);
        setIsSavedToast(false);
      }, 600);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Gagal menyimpan catatan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Buka Form Catat Hari Ini dari Header / Hero Card
  const handleOpenToday = () => {
    syncFormWithDate(todayDateStr);
    setIsFormModalOpen(true);
  };

  // Handler Klik Riwayat untuk Lihat/Edit
  const handleEditFromHistory = (logDate: string) => {
    syncFormWithDate(logDate);
    setIsFormModalOpen(true);
  };

  return (
    <div className='mx-auto w-full max-w-6xl'>
      {/* HEADER TITLE */}
      <div className='flex items-center justify-between gap-3 mb-4 px-1'>
        <div className='flex items-center gap-2.5 sm:gap-3 min-w-0'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm sm:h-11 sm:w-11'>
            <CalendarIcon className='w-5 h-5 sm:w-6 sm:h-6' />
          </div>
          <div className='min-w-0'>
            <h2 className='text-lg font-extrabold tracking-tight text-ink sm:text-xl md:text-2xl truncate'>
              Catatan Harian
            </h2>
            <p className='text-xs text-muted sm:text-sm truncate'>
              Pantau kondisi harian dan riwayat adaptasi tubuh Anda
            </p>
          </div>
        </div>

        {/* HEADER SHORTCUT BUTTON (HIDDEN ON VERY SMALL MOBILE TO PRIORITIZE HERO CARD) */}
        <div className='hidden sm:block shrink-0'>
          <Button
            type='button'
            variant={hasTodayLog ? 'soft' : 'primary'}
            size='md'
            shape='pill'
            icon={hasTodayLog ? <Edit3 className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
            onClick={handleOpenToday}
            className='font-bold shadow-xs px-4 py-2 text-xs sm:text-sm transition-all'
          >
            {hasTodayLog ? 'Ubah Catatan' : 'Catat Hari Ini'}
          </Button>
        </div>
      </div>

      {/* MOBILE-FIRST HERO STATUS CARD */}
      {hasTodayLog ? (
        <div className='mb-4 rounded-3xl border border-teal-200/90 bg-gradient-to-br from-teal-500/10 via-surface to-teal-500/5 p-4 sm:p-5 shadow-xs'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span
                  data-testid='today-status-badge'
                  className='inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800'
                >
                  <CheckCircle2 className='w-3.5 h-3.5 text-teal-600' />
                  Sudah Dicatat Hari Ini
                </span>
                {todayLog && (
                  <span className='text-[11px] text-slate-500'>
                    Terakhir diperbarui {todayLog.updatedAt}
                  </span>
                )}
              </div>
              <p className='text-xs sm:text-sm text-slate-700 font-medium'>
                Mood: <strong className='text-slate-900 capitalize'>{todayLog?.mood}</strong> · Nyeri:{' '}
                <strong className='text-slate-900 capitalize'>{todayLog?.pain}</strong>
                {todayLog?.notes && ` · "${todayLog.notes.slice(0, 40)}${todayLog.notes.length > 40 ? '...' : ''}"`}
              </p>
            </div>
            <Button
              type='button'
              variant='soft'
              size='md'
              shape='pill'
              icon={<Edit3 className='w-4 h-4' />}
              onClick={handleOpenToday}
              className='min-h-[44px] font-bold text-xs sm:text-sm self-stretch sm:self-auto touch-manipulation'
            >
              Ubah Catatan Hari Ini
            </Button>
          </div>
        </div>
      ) : (
        <div className='mb-4 rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-500/10 via-surface to-amber-500/5 p-4 sm:p-5 shadow-xs'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3.5'>
            <div className='space-y-1'>
              <span
                data-testid='today-status-badge'
                className='inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900'
              >
                <CalendarIcon className='w-3.5 h-3.5 text-amber-700' />
                Belum Dicatat Hari Ini
              </span>
              <p className='text-xs sm:text-sm text-slate-600'>
                Pantau adaptasi pil KB Anda dengan mencatat mood, efek samping, dan keluhan fisik hari ini.
              </p>
            </div>
            <Button
              type='button'
              variant='primary'
              size='md'
              shape='pill'
              icon={<Plus className='w-4 h-4' />}
              onClick={handleOpenToday}
              className='min-h-[48px] font-bold text-xs sm:text-sm self-stretch sm:self-auto touch-manipulation shadow-xs'
            >
              Catat Kondisi Hari Ini
            </Button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER CARD: GRAFIK & RIWAYAT */}
      <Card className='rounded-3xl border border-border bg-surface/95 p-3.5 shadow-sm sm:p-5 md:p-6'>
        <NoteHistoryView
          logs={logs}
          onEditLog={handleEditFromHistory}
          onAddNewLog={handleOpenToday}
        />
      </Card>

      {/* MODAL DIALOG / BOTTOM-SHEET FORMULIR CATATAN DENGAN STICKY FOOTER */}
      <NoteFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          if (!isSaving) {
            setIsFormModalOpen(false);
            setIsSavedToast(false);
            setSaveError(null);
          }
        }}
        title={
          selectedDate === todayDateStr
            ? hasTodayLog
              ? 'Ubah Catatan Hari Ini'
              : 'Catat Kondisi Hari Ini'
            : `Catatan Tanggal ${formatIndonesianDate(selectedDate)}`
        }
        subtitle='Catat kondisi mood, keluhan fisik, dan efek samping adaptasi'
        isSaving={isSaving}
        footer={
          <div className='w-full'>
            {saveError && (
              <p className='mb-2 text-center text-xs font-semibold text-red-600'>{saveError}</p>
            )}
            <Button
              type='button'
              onClick={handleSave}
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
              className='min-h-[48px] py-3 text-xs sm:text-sm md:text-base font-bold shadow-md touch-manipulation'
            >
              {isSavedToast ? 'Catatan Berhasil Disimpan!' : 'Simpan Catatan'}
            </Button>
          </div>
        }
      >
        <DailyNoteForm
          selectedDate={selectedDate}
          onDateChange={syncFormWithDate}
          mood={mood}
          onMoodChange={val => {
            setMood(val);
            setIsSavedToast(false);
          }}
          pain={pain}
          onPainChange={val => {
            setPain(val);
            setIsSavedToast(false);
          }}
          bleeding={bleeding}
          onBleedingChange={val => {
            setBleeding(val);
            setIsSavedToast(false);
          }}
          sideEffects={sideEffects}
          onToggleSideEffect={toggleSideEffect}
          weightStatus={weightStatus}
          onWeightStatusChange={val => {
            setWeightStatus(val);
            setIsSavedToast(false);
          }}
          weightKg={weightKg}
          onWeightKgChange={val => {
            setWeightKg(val);
            setIsSavedToast(false);
          }}
          notes={notes}
          onNotesChange={val => {
            setNotes(val);
            setIsSavedToast(false);
          }}
          activeAdvices={activeAdvices}
          onSave={handleSave}
          isSaving={isSaving}
          isSavedToast={isSavedToast}
          saveError={saveError}
          showInlineSave={false}
        />
      </NoteFormModal>
    </div>
  );
};

// Backward compatibility alias
export const SymptomHealthCard = DailyNotesCard;

export default DailyNotesCard;
