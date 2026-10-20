'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import {
  DailyHealthLog,
  MoodType,
  PainLevel,
  BleedingType,
  WeightTrend,
  SymptomHealthCardProps,
  ClinicalAdvice,
  DUMMY_HISTORY,
  MOOD_OPTIONS,
  PAIN_OPTIONS,
  BLEEDING_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  getLocalDateString,
} from './symptom/symptomHealth.types';
import { SymptomDailyForm } from './symptom/SymptomDailyForm';
import { SymptomHistoryTab } from './symptom/SymptomHistoryTab';

// Re-export types, constants, and subcomponents for backward compatibility
export * from './symptom';

export const SymptomHealthCard: React.FC<SymptomHealthCardProps> = ({
  initialLogs = DUMMY_HISTORY,
  onSaveLog,
}) => {
  // State Navigasi Tab & Tanggal
  const [activeTab, setActiveTab] = useState<'harian' | 'riwayat'>('harian');
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString(new Date()));
  const [logs, setLogs] = useState<DailyHealthLog[]>(initialLogs);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Gagal menyimpan catatan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler Klik Riwayat untuk Lihat/Edit
  const handleEditFromHistory = (logDate: string) => {
    syncFormWithDate(logDate);
    setActiveTab('harian');
  };

  return (
    <div className='mx-auto w-full max-w-6xl'>
      {/* HEADER TITLE */}
      <div className='flex items-center gap-3 mb-4 px-1'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm sm:h-11 sm:w-11'>
          <CalendarIcon className='w-5 h-5 sm:w-6 sm:h-6' />
        </div>
        <div>
          <h2 className='text-lg font-extrabold tracking-tight text-ink sm:text-xl md:text-2xl'>
            Catatan Harian
          </h2>
          <p className='text-xs text-muted sm:text-sm'>
            Pantau kondisi harian dan riwayat adaptasi tubuh Anda
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER CARD */}
      <Card className='rounded-3xl border border-border bg-surface/95 p-3.5 shadow-sm sm:p-5 md:p-6'>
        {/* TAB SWITCHER (Harian | Riwayat) */}
        <div className='mb-4 grid grid-cols-2 rounded-full border border-primary-soft bg-primary-subtle p-1'>
          <button
            type='button'
            onClick={() => setActiveTab('harian')}
            className={`py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'harian'
                ? 'bg-primary text-white shadow-xs'
                : 'text-primary-hover hover:text-primary'
            }`}
          >
            Harian
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('riwayat')}
            className={`py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'riwayat'
                ? 'bg-primary text-white shadow-xs'
                : 'text-primary-hover hover:text-primary'
            }`}
          >
            <span>Riwayat</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === 'riwayat'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-soft text-primary-hover'
              }`}
            >
              {logs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: HARIAN */}
        {activeTab === 'harian' && (
          <SymptomDailyForm
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
        )}

        {/* TAB 2: RIWAYAT */}
        {activeTab === 'riwayat' && (
          <SymptomHistoryTab logs={logs} onEditLog={handleEditFromHistory} />
        )}
      </Card>
    </div>
  );
};

export default SymptomHealthCard;
