import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  X,
  BookOpen,
  ExternalLink,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { CreateDailySchedulePayload } from '../types';

export const TIME_PRESETS = [
  { time: '07:00', label: '07:00 Pagi', desc: 'Setelah sarapan' },
  { time: '13:00', label: '13:00 Siang', desc: 'Setelah makan' },
  { time: '20:00', label: '20:00 Malam', desc: 'Sebelum tidur' },
];

export interface FormState extends CreateDailySchedulePayload {
  id?: string;
}

export interface ScheduleFormModalProps {
  mode: 'create' | 'edit';
  initial: FormState;
  onClose: () => void;
  onSave: (data: FormState) => Promise<void>;
  isSaving: boolean;
  onTestSound?: () => void;
}

function normalizeTimeSlot(val?: string): string {
  if (!val) return '20:00';
  const trimmed = val.trim();
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return trimmed;
}

export function ScheduleFormModal({
  mode,
  initial,
  onClose,
  onSave,
  isSaving,
  onTestSound,
}: ScheduleFormModalProps) {
  const [form, setForm] = useState<FormState>({
    ...initial,
    title: initial.title || 'Minum Pil KB',
    timeSlot: normalizeTimeSlot(initial.timeSlot),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = (form.title || '').trim() || 'Minum Pil KB';
    const cleanTime = normalizeTimeSlot(form.timeSlot);
    try {
      await onSave({
        ...form,
        title: cleanTitle,
        timeSlot: cleanTime,
      });
    } catch (error) {
      console.error('Failed to submit schedule form:', error);
    }
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={() => !isSaving && onClose()} />
      <div className='relative z-10 w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto'>
        {/* Modal Header */}
        <div className='flex items-center justify-between pb-3.5 border-b border-teal-100 mb-4'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center'>
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-black text-slate-900'>
                {mode === 'create' ? 'Atur Jam Minum Pil' : 'Ubah Jam Minum Pil'}
              </h3>
              <span className='text-[11px] text-slate-500'>
                {mode === 'create'
                  ? 'Tentukan satu jam rutin setiap hari'
                  : 'Perbarui jam rutin pengingat pil KB'}
              </span>
            </div>
          </div>
          <button
            type='button'
            onClick={() => !isSaving && onClose()}
            className='w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer'
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Banner Informasi Edukasi Penggunaan Pil KB */}
          <div className='p-3 sm:p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/90 text-teal-950 flex items-start gap-2.5 shadow-2xs'>
            <div className='w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5'>
              <BookOpen size={15} />
            </div>
            <div className='flex-1 text-xs leading-relaxed'>
              <p className='font-medium text-slate-700'>
                Apakah Ibu sudah mengetahui cara memulai penggunaan pil KB? Jika belum, silakan klik{' '}
                <Link
                  to='/user/education'
                  className='font-bold text-teal-700 underline underline-offset-2 hover:text-teal-900 inline-flex items-center gap-0.5'
                >
                  menu Edukasi
                  <ExternalLink size={11} className='inline' />
                </Link>{' '}
                yang tersedia untuk mempelajari tata cara memulai penggunaan pil KB dengan benar.
              </p>
            </div>
          </div>

          {/* Nama Kegiatan */}
          <div>
            <label className='text-xs font-bold text-slate-800 mb-1.5 block'>
              Nama Kegiatan / Pengingat <span className='text-teal-600'>*</span>
            </label>
            <input
              type='text'
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder='Cth: Minum Pil KB, Olahraga Pagi...'
              required
              className='w-full bg-slate-50 text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 px-3.5 py-2.5 outline-none transition-all'
            />
          </div>

          {/* Jam Pelaksanaan */}
          <div>
            <label className='text-xs font-bold text-slate-800 mb-1.5 block'>
              Jam Pelaksanaan (format 24 jam):
            </label>
            {/* Time Presets */}
            <div className='grid grid-cols-3 gap-2 mb-2.5'>
              {TIME_PRESETS.map(preset => (
                <button
                  key={preset.time}
                  type='button'
                  onClick={() => set('timeSlot', preset.time)}
                  className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    form.timeSlot === preset.time
                      ? 'bg-teal-50 border-teal-600 text-teal-700 shadow-2xs font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className='block text-xs font-black'>{preset.time}</span>
                  <span className='block text-[10px] text-slate-400 mt-0.5'>{preset.desc}</span>
                </button>
              ))}
            </div>
            {/* Custom Time */}
            <div className='flex items-center justify-between gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200'>
              <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
                <Clock size={14} className='text-slate-400' />
                <span>Jam kustom:</span>
              </div>
              <input
                type='time'
                step='60'
                value={form.timeSlot}
                onChange={e => set('timeSlot', e.target.value)}
                className='bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-teal-600'
                required
              />
            </div>
          </div>

          {/* Catatan Opsional */}
          <div>
            <label className='text-xs font-bold text-slate-800 mb-1.5 block'>
              Catatan <span className='text-slate-400 font-normal'>(Opsional)</span>
            </label>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              placeholder='Tambahkan catatan singkat...'
              rows={2}
              className='w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 px-3.5 py-2.5 outline-none transition-all resize-none'
            />
          </div>

          {/* Remind 15 min toggle */}
          <div className='flex items-center justify-between p-3 bg-teal-50/60 rounded-2xl border border-teal-100'>
            <div className='flex items-center gap-2.5'>
              <div className='w-7 h-7 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-2xs'>
                <Bell size={14} />
              </div>
              <div>
                <span className='block text-xs font-bold text-slate-800 leading-tight'>
                  Pengingat 15 Menit Sebelumnya
                </span>
                <span className='block text-[10px] text-slate-500 leading-tight mt-0.5'>
                  Notifikasi awal sebelum jadwal
                </span>
              </div>
            </div>
            <input
              type='checkbox'
              checked={form.remind15MinBefore ?? true}
              onChange={e => set('remind15MinBefore', e.target.checked)}
              className='w-4.5 h-4.5 accent-teal-600 rounded-md cursor-pointer'
            />
          </div>

          {/* Otomatisasi Pengingat Cerdas */}
          <div className='p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-teal-950 space-y-2 shadow-2xs'>
            <div className='flex items-center gap-2 text-xs font-bold text-teal-900'>
              <Sparkles size={14} className='text-teal-600' />
              <span>Otomatisasi Pengingat Pilluna</span>
            </div>
            <p className='text-[11px] text-slate-600 leading-relaxed'>
              Dengan mengatur jam di atas, sistem akan mengawal kepatuhanmu secara otomatis:
            </p>
            <div className='grid grid-cols-2 gap-2 text-[10px] text-slate-700 font-medium pt-0.5'>
              <div className='p-2 bg-white rounded-xl border border-teal-100 flex items-center gap-1.5'>
                <span>🌅</span>
                <span>Pagi: Info Harian</span>
              </div>
              <div className='p-2 bg-white rounded-xl border border-teal-100 flex items-center gap-1.5'>
                <span>⏳</span>
                <span>15m: Persiapan</span>
              </div>
              <div className='p-2 bg-white rounded-xl border border-teal-100 flex items-center gap-1.5'>
                <span>🔔</span>
                <span>Tepat: Alarm Chime</span>
              </div>
              <div className='p-2 bg-white rounded-xl border border-teal-100 flex items-center gap-1.5'>
                <span>🌙</span>
                <span>Malam: Susulan</span>
              </div>
            </div>
          </div>

          {/* Sound test preview button */}
          {onTestSound && (
            <button
              type='button'
              onClick={onTestSound}
              className='inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer'
            >
              <Volume2 size={14} className='text-teal-600' />
              <span>Uji Bunyi Suara Alarm</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className='flex items-center gap-2 pt-3 border-t border-slate-100'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              className='flex-1 text-xs font-bold'
              onClick={() => !isSaving && onClose()}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              shape='pill'
              className='flex-1 text-xs font-bold shadow-md shadow-teal-500/20'
              disabled={isSaving}
            >
              {isSaving
                ? 'Menyimpan...'
                : mode === 'create'
                  ? 'Simpan Jadwal 🔔'
                  : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
