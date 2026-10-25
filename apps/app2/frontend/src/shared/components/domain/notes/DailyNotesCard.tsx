'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Edit3 } from 'lucide-react';
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
} from './notes.types';
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

  // Kumpulkan Saran Klinis Bidan secara dinamis berdasarkan input
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

  // Handler Buka Form Catat Hari Ini dari Header
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
      {/* HEADER TITLE & ACTION BUTTON */}
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

        {/* TOMBOL AKSI UTAMA DI HEADER */}
        <Button
          type='button'
          variant={hasTodayLog ? 'soft' : 'primary'}
          size='md'
          shape='pill'
          icon={hasTodayLog ? <Edit3 className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
          onClick={handleOpenToday}
          className='shrink-0 font-bold shadow-xs px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-all'
        >
          <span className='hidden sm:inline'>
            {hasTodayLog ? 'Ubah Catatan Hari Ini' : 'Catat Kondisi Hari Ini'}
          </span>
          <span className='inline sm:hidden'>
            {hasTodayLog ? 'Ubah' : 'Catat'}
          </span>
        </Button>
      </div>

      {/* MAIN CONTAINER CARD: GRAFIK & RIWAYAT */}
      <Card className='rounded-3xl border border-border bg-surface/95 p-3.5 shadow-sm sm:p-5 md:p-6'>
        <NoteHistoryView
          logs={logs}
          onEditLog={handleEditFromHistory}
          onAddNewLog={handleOpenToday}
        />
      </Card>

      {/* MODAL DIALOG / BOTTOM-SHEET FORMULIR CATATAN */}
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
        />
      </NoteFormModal>
    </div>
  );
};

// Backward compatibility alias
export const SymptomHealthCard = DailyNotesCard;

export default DailyNotesCard;
