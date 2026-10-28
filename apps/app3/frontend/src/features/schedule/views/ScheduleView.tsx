'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Share2,
  CalendarClock,
  ShieldCheck,
  Info,
  Plus,
  Bell,
  BellRing,
  BellOff,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Sparkles,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import useNotificationPermission from '@/src/shared/hooks/useNotificationPermission';
import { TT_DOSAGE_LEVELS, TT_DOSAGE_LIST } from '@/src/shared/constants/domain.constants';
import { TTIntervalGuideCard } from '../components/TTIntervalGuideCard';
import { useTTSchedules } from '../hooks/useTTSchedules';
import { CreateTTSchedulePayload, TTStage, TTSchedule } from '../types';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const TIME_PRESETS = [
  { time: '08:00', label: '08:00 Pagi', desc: 'Jam buka Puskesmas' },
  { time: '10:00', label: '10:00 Pagi', desc: 'Antrean lebih longgar' },
  { time: '13:00', label: '13:00 Siang', desc: 'Sesi poli siang' },
];

interface FormState extends CreateTTSchedulePayload {
  id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateId(value: string): string {
  if (!value) return '–';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function daysUntil(value: string): number {
  const target = new Date(`${value}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((targetUtc - todayUtc) / 86_400_000);
}

function countdownLabel(value: string): string {
  const diff = daysUntil(value);
  if (diff < 0) return `Terlewat ${Math.abs(diff)} hari`;
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  return `${diff} hari lagi`;
}

function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}

function getNextStage(current?: string): TTStage {
  const level = Number(String(current || 'TT0').replace('TT', '')) || 0;
  const next = Math.min(Math.max(level + 1, 1), 5);
  return `TT${next}` as TTStage;
}

function formatReminderSummary(schedule: TTSchedule): string {
  if (!schedule.isEnabled) return 'Pengingat nonaktif';
  const active: string[] = [];
  if (schedule.remind1MonthBefore) active.push('H-1 bln');
  if (schedule.remind1DayBefore) active.push('H-1 hr');
  if (schedule.remind30MinBefore) active.push('30 mnt');
  if (schedule.remind15MinBefore) active.push('15 mnt');

  if (active.length === 0) return 'Tepat waktu';
  return `Pengingat ${active.join(', ')}`;
}

function buildDefaultForm(userTTStatus?: string): FormState {
  return {
    stage: getNextStage(userTTStatus),
    scheduledDate: '',
    timeSlot: '08:00',
    dosage: '1 dosis (0.5 mL)',
    notes: '',
    remind1MonthBefore: false,
    remind1DayBefore: true,
    remind30MinBefore: true,
    remind15MinBefore: true,
    isEnabled: true,
  };
}

// ─── Sub-component: Empty State ───────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card
      padding='lg'
      className='text-center py-12 border-2 border-dashed border-[#ffd9de] bg-[#fff5f6]/40 rounded-3xl'
    >
      <div className='w-16 h-16 rounded-3xl bg-[#ffd9de] text-[#aa294d] flex items-center justify-center mx-auto mb-4 shadow-sm'>
        <BellOff size={30} />
      </div>
      <h3 className='text-base sm:text-lg font-black text-[#121c2a] tracking-tight'>
        Belum Ada Jadwal Imunisasi TT 💉
      </h3>
      <p className='text-xs sm:text-sm text-[#574144] max-w-sm mx-auto mt-2 mb-6 leading-relaxed'>
        Tambahkan jadwal TT1 sampai TT5 agar TEMANI dapat mengingatkan tanggal kunjungan imunisasi
        ke faskes.
      </p>
      <Button
        variant='primary'
        size='md'
        shape='pill'
        icon={<Plus size={16} />}
        onClick={onAdd}
        className='font-bold shadow-md text-xs px-6 py-2.5 bg-[#aa294d] hover:bg-[#8c0f39] text-white'
      >
        Buat Jadwal TT Pertama
      </Button>
    </Card>
  );
}

// ─── Sub-component: Schedule Card ─────────────────────────────────────────────

interface ScheduleCardProps {
  schedule: TTSchedule;
  onToggle: (id: string, next: boolean) => void;
  onRecordResult: (schedule: TTSchedule) => void;
  onEdit: (schedule: TTSchedule) => void;
  onDelete: (schedule: TTSchedule) => void;
}

function ScheduleCard({ schedule, onToggle, onRecordResult, onEdit, onDelete }: ScheduleCardProps) {
  const dose = TT_DOSAGE_LEVELS[schedule.stage];
  const isCompleted = schedule.status === 'completed';

  return (
    <Card
      padding='lg'
      className={`relative overflow-hidden border shadow-sm ${
        isCompleted ? 'border-emerald-100 bg-emerald-50/30' : 'border-[#ffd9de] bg-white'
      }`}
    >
      <div className='absolute -top-10 -right-10 w-32 h-32 bg-[#ffd9de]/30 rounded-full blur-2xl pointer-events-none' />

      <div className='relative z-10 flex items-start justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2.5'>
          <span className='inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#ffd9de] text-[#8c0f39] text-xs font-black'>
            {schedule.stage}
          </span>
          <div className='min-w-0'>
            <h3 className='text-sm sm:text-base font-black text-[#121c2a] truncate'>
              {schedule.title || `Imunisasi ${schedule.stage}`}
            </h3>
            <span className='text-[11px] text-[#8b7074]'>{dose?.name || 'Dosis TT'}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isCompleted ? 'Selesai' : 'Pending'}
          </span>
          <button
            type='button'
            onClick={() => onToggle(schedule.id, !schedule.isEnabled)}
            aria-label={schedule.isEnabled ? 'Nonaktifkan pengingat' : 'Aktifkan pengingat'}
            className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
              schedule.isEnabled ? 'bg-[#aa294d]' : 'bg-stone-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                schedule.isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className='relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3'>
        <div className='flex items-center gap-2 text-xs text-[#574144] bg-[#eff4ff] rounded-xl px-3 py-2'>
          <CalendarIcon size={14} className='text-[#aa294d] shrink-0' />
          <span className='font-semibold text-[#121c2a]'>
            {formatDateId(schedule.scheduledDate)}
          </span>
        </div>
        <div className='flex items-center gap-2 text-xs text-[#574144] bg-[#eff4ff] rounded-xl px-3 py-2'>
          <Clock size={14} className='text-[#aa294d] shrink-0' />
          <span className='font-semibold text-[#121c2a]'>{schedule.time || '–'} WIB</span>
        </div>
      </div>

      {schedule.notes && (
        <p className='relative z-10 text-[11px] text-[#574144] italic leading-relaxed mb-3'>
          💬 {schedule.notes}
        </p>
      )}

      <div className='relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-[#ffd9de]/60'>
        <div className='flex items-center gap-1.5 text-[11px] text-[#8b7074] font-medium min-w-0'>
          <BellRing
            size={13}
            className={schedule.isEnabled ? 'text-[#aa294d]' : 'text-stone-400'}
          />
          <span className='truncate'>
            {formatReminderSummary(schedule)}
          </span>
        </div>

        <div className='flex items-center gap-1.5 shrink-0'>
          {!isCompleted && (
            <button
              type='button'
              onClick={() => onRecordResult(schedule)}
              className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            >
              <Check size={12} />
              Catat Hasil
            </button>
          )}
          <button
            type='button'
            onClick={() => onEdit(schedule)}
            aria-label='Ubah jadwal'
            className='min-w-[36px] min-h-[36px] p-2 rounded-full text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 flex items-center justify-center transition-colors cursor-pointer active:scale-95'
          >
            <Edit3 size={15} />
          </button>
          <button
            type='button'
            onClick={() => onDelete(schedule)}
            aria-label='Hapus jadwal'
            className='min-w-[36px] min-h-[36px] p-2 rounded-full text-[#8b7074] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer active:scale-95'
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Sub-component: Form Modal ────────────────────────────────────────────────

interface ScheduleFormModalProps {
  mode: 'create' | 'edit';
  initial: FormState;
  onClose: () => void;
  onSave: (data: FormState) => Promise<void>;
  isSaving: boolean;
}

function ScheduleFormModal({ mode, initial, onClose, onSave, isSaving }: ScheduleFormModalProps) {
  const [form, setForm] = useState<FormState>({ ...initial });
  const dose = TT_DOSAGE_LEVELS[form.stage];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave(form);
  };

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={() => !isSaving && onClose()} />
      <div className='relative z-10 w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]'>
        {/* Modal Header */}
        <div className='px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-xs'>
              <CalendarClock size={18} className='text-white' />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold leading-tight'>
                {mode === 'create' ? 'Buat Jadwal TT' : 'Ubah Jadwal TT'}
              </h3>
              <p className='text-[11px] text-rose-100'>
                {mode === 'create'
                  ? 'Tentukan tahap & tanggal imunisasi'
                  : 'Perbarui detail jadwal'}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => !isSaving && onClose()}
            aria-label='Tutup Modal'
            className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex-1 flex flex-col min-h-0 overflow-hidden'>
          <div className='p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-[#121c2a]'>
            <div>
              <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
                Tahap Imunisasi TT <span className='text-[#aa294d]'>*</span>
              </label>
              <div className='grid grid-cols-5 gap-1.5'>
                {TT_DOSAGE_LIST.map(item => (
                  <button
                    key={item.level}
                    type='button'
                    onClick={() => set('stage', item.level as TTStage)}
                    className={`min-h-[44px] py-2 rounded-xl border text-center transition-all cursor-pointer ${
                      form.stage === item.level
                        ? 'bg-[#ffd9de]/70 border-[#aa294d] text-[#8c0f39] font-bold ring-1 ring-[#aa294d]'
                        : 'bg-white border-stone-200 text-[#574144] hover:bg-stone-50'
                    }`}
                  >
                    <span className='block text-xs font-black'>{item.level}</span>
                  </button>
                ))}
              </div>
              {dose && (
                <div className='mt-2 p-3 rounded-xl bg-[#eff4ff] border border-[#d9e3f6]/60'>
                  <p className='text-[11px] text-[#574144] leading-relaxed'>
                    <strong className='text-[#121c2a]'>Interval:</strong> {dose.interval}
                    <br />
                    <strong className='text-[#121c2a]'>Proteksi:</strong> {dose.protectionDuration}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
                Tanggal Jadwal Imunisasi <span className='text-[#aa294d]'>*</span>
              </label>
              <input
                type='date'
                value={form.scheduledDate}
                min={mode === 'create' ? todayKey() : undefined}
                onChange={event => set('scheduledDate', event.target.value)}
                required
                className='w-full bg-white text-[#121c2a] font-medium text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] px-3.5 py-2.5 outline-none transition-all'
              />
            </div>

            <div>
              <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
                Jam Kunjungan (format 24 jam)
              </label>
              <div className='grid grid-cols-3 gap-2 mb-2.5'>
                {TIME_PRESETS.map(preset => (
                  <button
                    key={preset.time}
                    type='button'
                    onClick={() => set('timeSlot', preset.time)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      form.timeSlot === preset.time
                        ? 'bg-[#ffd9de]/70 border-[#aa294d] text-[#8c0f39] font-bold'
                        : 'bg-white border-stone-200 text-[#574144] hover:bg-stone-50'
                    }`}
                  >
                    <span className='block text-xs font-black'>{preset.time}</span>
                    <span className='block text-[10px] text-[#8b7074] mt-0.5'>{preset.desc}</span>
                  </button>
                ))}
              </div>
              <div className='flex items-center justify-between gap-2 bg-[#fff0f2]/60 px-3.5 py-2 rounded-xl border border-[#ffd9de]'>
                <div className='flex items-center gap-2 text-xs text-[#574144] font-medium'>
                  <Clock size={14} className='text-[#aa294d]' />
                  <span>Jam kustom:</span>
                </div>
                <input
                  type='time'
                  value={form.timeSlot}
                  onChange={event => set('timeSlot', event.target.value)}
                  required
                  className='bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold text-[#121c2a] outline-none focus:border-[#aa294d]'
                />
              </div>
            </div>

            {/* Opsi Pengingat Multi-select */}
            <div className='p-3.5 bg-[#fff0f2] rounded-2xl border border-[#ffd9de] space-y-2.5'>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#aa294d] shadow-2xs shrink-0'>
                  <Bell size={13} />
                </div>
                <div className='flex-1 min-w-0'>
                  <span className='block text-xs font-bold text-[#121c2a] leading-tight'>
                    Waktu Pengingat Notifikasi
                  </span>
                  <span className='block text-[10px] text-[#8b7074] leading-tight mt-0.5'>
                    Pilih waktu notifikasi (bisa dipilih salah satu atau semuanya)
                  </span>
                </div>
              </div>

              <div className='space-y-1.5 pt-1 border-t border-[#ffd9de]/70'>
                {/* 1. H-1 Bulan */}
                <label className='flex items-center justify-between p-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#ffd9de]/60 transition-colors cursor-pointer select-none'>
                  <div className='pr-2'>
                    <span className='block text-xs font-semibold text-[#121c2a] leading-tight'>
                      H-1 Bulan Sebelumnya
                    </span>
                    <span className='block text-[10px] text-[#8b7074] leading-tight mt-0.5'>
                      Notifikasi 30 hari sebelum jadwal untuk persiapan
                    </span>
                  </div>
                  <input
                    type='checkbox'
                    checked={form.remind1MonthBefore ?? false}
                    onChange={event => set('remind1MonthBefore', event.target.checked)}
                    className='w-4.5 h-4.5 accent-[#aa294d] rounded-md cursor-pointer shrink-0'
                  />
                </label>

                {/* 2. H-1 Hari */}
                <label className='flex items-center justify-between p-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#ffd9de]/60 transition-colors cursor-pointer select-none'>
                  <div className='pr-2'>
                    <span className='block text-xs font-semibold text-[#121c2a] leading-tight'>
                      H-1 Hari Sebelumnya
                    </span>
                    <span className='block text-[10px] text-[#8b7074] leading-tight mt-0.5'>
                      Notifikasi 1 hari sebelum kunjungan faskes
                    </span>
                  </div>
                  <input
                    type='checkbox'
                    checked={form.remind1DayBefore ?? true}
                    onChange={event => set('remind1DayBefore', event.target.checked)}
                    className='w-4.5 h-4.5 accent-[#aa294d] rounded-md cursor-pointer shrink-0'
                  />
                </label>

                {/* 3. 30 Menit */}
                <label className='flex items-center justify-between p-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#ffd9de]/60 transition-colors cursor-pointer select-none'>
                  <div className='pr-2'>
                    <span className='block text-xs font-semibold text-[#121c2a] leading-tight'>
                      30 Menit Sebelumnya
                    </span>
                    <span className='block text-[10px] text-[#8b7074] leading-tight mt-0.5'>
                      Notifikasi persiapan awal sebelum jam kunjungan
                    </span>
                  </div>
                  <input
                    type='checkbox'
                    checked={form.remind30MinBefore ?? true}
                    onChange={event => set('remind30MinBefore', event.target.checked)}
                    className='w-4.5 h-4.5 accent-[#aa294d] rounded-md cursor-pointer shrink-0'
                  />
                </label>

                {/* 4. 15 Menit */}
                <label className='flex items-center justify-between p-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#ffd9de]/60 transition-colors cursor-pointer select-none'>
                  <div className='pr-2'>
                    <span className='block text-xs font-semibold text-[#121c2a] leading-tight'>
                      15 Menit Sebelumnya
                    </span>
                    <span className='block text-[10px] text-[#8b7074] leading-tight mt-0.5'>
                      Notifikasi pengingat singkat menjelang kunjungan faskes
                    </span>
                  </div>
                  <input
                    type='checkbox'
                    checked={form.remind15MinBefore ?? true}
                    onChange={event => set('remind15MinBefore', event.target.checked)}
                    className='w-4.5 h-4.5 accent-[#aa294d] rounded-md cursor-pointer shrink-0'
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className='p-4 sm:p-5 bg-stone-50 border-t border-stone-100 flex items-center gap-2.5 shrink-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              className='flex-1 min-h-[44px] text-xs font-bold cursor-pointer active:scale-95'
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
              className='flex-1 min-h-[44px] text-xs font-bold bg-[#aa294d] hover:bg-[#8c0f39] text-white shadow-xs cursor-pointer active:scale-95'
              disabled={isSaving}
              icon={isSaving ? <Loader2 size={14} className='animate-spin' /> : undefined}
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

// ─── Sub-component: Delete Dialog ─────────────────────────────────────────────

interface DeleteDialogProps {
  schedule: TTSchedule;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ schedule, isDeleting, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <div className='fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={() => !isDeleting && onCancel()} />
      <div className='relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-red-100 text-center'>
        <div className='w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5'>
          <AlertCircle size={24} />
        </div>
        <h3 className='text-base font-black text-[#121c2a]'>Hapus Jadwal Ini?</h3>
        <p className='text-xs text-[#574144] mt-1.5 mb-1'>
          <strong>
            {schedule.stage} — {formatDateId(schedule.scheduledDate)}
          </strong>
        </p>
        <p className='text-xs text-[#8b7074] mb-5'>
          Jadwal akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            disabled={isDeleting}
            className='flex-1 text-xs font-bold'
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='primary'
            size='sm'
            shape='pill'
            disabled={isDeleting}
            className='flex-1 text-xs font-bold bg-red-600 hover:bg-red-700 border-red-600'
            onClick={onConfirm}
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function ScheduleView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { schedules, loading, createSchedule, updateSchedule, toggleSchedule, deleteSchedule } =
    useTTSchedules();
  const { request: requestNotificationPermission, isGranted } = useNotificationPermission();

  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalInitial, setModalInitial] = useState<FormState>(buildDefaultForm());
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TTSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userTTStatus = (user as { ttStatus?: string } | null)?.ttStatus;
  const currentTTLevel = Number(String(userTTStatus || 'TT0').replace('TT', '')) || 0;

  const nextSchedule = useMemo(
    () =>
      schedules
        .filter(schedule => schedule.status === 'pending' && schedule.isEnabled)
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0],
    [schedules],
  );

  const completedCount = schedules.filter(schedule => schedule.status === 'completed').length;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  };

  /** Pastikan izin notifikasi sudah diberikan sebelum jadwal aktif. */
  const ensureNotificationPermission = async (): Promise<boolean> => {
    if (isGranted) return true;
    return requestNotificationPermission();
  };

  const handleOpenAdd = () => {
    setModalMode('create');
    setModalInitial(buildDefaultForm(userTTStatus));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule: TTSchedule) => {
    setModalMode('edit');
    setModalInitial({
      id: schedule.id,
      stage: schedule.stage,
      scheduledDate: schedule.scheduledDate,
      timeSlot: schedule.time,
      dosage: schedule.dosage,
      notes: schedule.notes ?? '',
      remind15MinBefore: schedule.remind15MinBefore,
      remind1MonthBefore: schedule.remind1MonthBefore ?? false,
      remind1DayBefore: schedule.remind1DayBefore ?? true,
      remind30MinBefore: schedule.remind30MinBefore ?? true,
      isEnabled: schedule.isEnabled,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: FormState) => {
    // Minta izin notifikasi lebih dulu selagi masih dalam konteks klik user.
    const permissionOk = data.isEnabled === false ? true : await ensureNotificationPermission();

    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        const result = await createSchedule({
          stage: data.stage,
          scheduledDate: data.scheduledDate,
          timeSlot: data.timeSlot,
          dosage: data.dosage,
          notes: data.notes,
          remind15MinBefore: data.remind15MinBefore,
          remind1MonthBefore: data.remind1MonthBefore,
          remind1DayBefore: data.remind1DayBefore,
          remind30MinBefore: data.remind30MinBefore,
          isEnabled: data.isEnabled,
        });
        if (result.success) {
          showToast(
            permissionOk
              ? 'Jadwal imunisasi TT berhasil dibuat! 🎉'
              : 'Jadwal tersimpan, tetapi izin notifikasi belum aktif. 🔕',
          );
          setIsModalOpen(false);
        } else {
          showToast(result.error || 'Gagal membuat jadwal TT.');
        }
      } else {
        if (!data.id) return;
        const result = await updateSchedule(data.id, {
          stage: data.stage,
          scheduledDate: data.scheduledDate,
          timeSlot: data.timeSlot,
          dosage: data.dosage,
          notes: data.notes,
          remind15MinBefore: data.remind15MinBefore,
          remind1MonthBefore: data.remind1MonthBefore,
          remind1DayBefore: data.remind1DayBefore,
          remind30MinBefore: data.remind30MinBefore,
        });
        if (result.success) {
          showToast('Jadwal TT berhasil diperbarui! ✨');
          setIsModalOpen(false);
        } else {
          showToast(result.error || 'Gagal memperbarui jadwal TT.');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, next: boolean) => {
    const permissionOk = next ? await ensureNotificationPermission() : true;
    const result = await toggleSchedule(id, next);
    showToast(
      result.success
        ? next
          ? permissionOk
            ? 'Pengingat jadwal diaktifkan 🔔'
            : 'Pengingat aktif, tetapi izin notifikasi ditolak. 🔕'
          : 'Pengingat jadwal dinonaktifkan.'
        : result.error || 'Gagal memperbarui status jadwal.',
    );
  };

  const handleRecordResult = (schedule: TTSchedule) => {
    // Jadwal tidak bisa "diselesaikan" tanpa bukti: arahkan ke form riwayat.
    navigate('/user/imunisasi', {
      state: {
        openDose: schedule.stage,
        scheduleId: schedule.id,
        scheduledDate: schedule.scheduledDate,
        time: schedule.time,
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteSchedule(deleteTarget.id);
    setIsDeleting(false);
    if (result.success) {
      showToast('Jadwal TT berhasil dihapus.');
      setDeleteTarget(null);
    } else {
      showToast(result.error || 'Gagal menghapus jadwal TT.');
    }
  };

  if (loading && schedules.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
      </div>
    );
  }

  const nextDose = nextSchedule ? TT_DOSAGE_LEVELS[nextSchedule.stage] : null;

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-12'>
      {/* Toast */}
      {toast && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm mx-auto sm:mx-0 bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-white/10'>
          <Sparkles size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className='flex items-center justify-between pb-1'>
        <button
          type='button'
          onClick={() => navigate('/user/dashboard')}
          aria-label='Kembali'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] active:scale-90 transition-all cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center'>
          <h1 className='text-base sm:text-lg md:text-xl font-bold text-[#121c2a] leading-tight'>
            Jadwal Imunisasi TT
          </h1>
          <p className='text-[11px] sm:text-xs text-[#574144]'>Rencana Kesehatan Calon Pengantin</p>
        </div>

        <button
          type='button'
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: 'Jadwal Imunisasi TT Pranikah - TEMANI',
                  text: 'Jadwal imunisasi TT pranikah saya di TEMANI.',
                  url: window.location.href,
                })
                .catch(() => {});
            } else {
              showToast('Tautan jadwal disalin ke papan klip');
            }
          }}
          aria-label='Bagikan'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Greeting */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-col'>
          <span className='text-[11px] uppercase tracking-wider text-[#aa294d] font-bold'>
            Rencana Kesehatan Catin
          </span>
          <h2 className='text-base sm:text-lg font-bold text-[#121c2a]'>
            Tetap Terlindungi Bersama
          </h2>
        </div>
        <Button
          variant='primary'
          size='sm'
          shape='pill'
          icon={<Plus size={14} />}
          onClick={handleOpenAdd}
          className='text-xs font-bold bg-[#aa294d] hover:bg-[#8c0f39] text-white shadow-sm shrink-0'
        >
          Tambah
        </Button>
      </div>

      {/* Next Schedule Hero */}
      {nextSchedule && nextDose ? (
        <div className='relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(170,41,77,0.08)] border border-[#eff4ff] overflow-hidden'>
          <div className='absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#ffd9de]/40 blur-2xl pointer-events-none' />

          <div className='relative flex items-start justify-between gap-3 mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-2xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-inner shrink-0'>
                <CalendarClock size={26} />
              </div>
              <div>
                <span className='text-[11px] text-[#574144] block'>Dosis Berikutnya</span>
                <h3 className='text-base sm:text-lg font-bold text-[#aa294d] tracking-tight'>
                  {nextSchedule.stage} — {nextDose.name}
                </h3>
              </div>
            </div>
            <span className='inline-flex items-center gap-1.5 bg-[#aff1d0] text-[#0a5139] text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs'>
              <span className='w-1.5 h-1.5 rounded-full bg-[#2a6950] animate-pulse' />
              {countdownLabel(nextSchedule.scheduledDate)}
            </span>
          </div>

          <div className='bg-[#eff4ff] rounded-xl p-3.5 flex flex-col gap-2 mb-4 border border-[#d9e3f6]/60'>
            <div className='flex items-center gap-2.5'>
              <span className='p-1 rounded-lg bg-[#ffd9de] text-[#aa294d] shrink-0'>
                <CalendarIcon size={18} />
              </span>
              <div className='flex flex-col'>
                <span className='text-[11px] text-[#574144]'>Tanggal Kunjungan</span>
                <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                  {formatDateId(nextSchedule.scheduledDate)} · {nextSchedule.time} WIB
                </span>
                <span className='text-[10px] text-[#8b7074]'>({nextDose.interval})</span>
              </div>
            </div>
          </div>

          <div className='flex items-start gap-3 pt-1'>
            <div className='w-8 h-8 rounded-full bg-[#aff1d0] shrink-0 flex items-center justify-center text-[#0a5139] mt-0.5 shadow-2xs'>
              <ShieldCheck size={18} />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-[#121c2a]'>Manfaat Perlindungan Imun</span>
              <p className='text-[11px] text-[#574144] leading-relaxed mt-0.5'>
                {nextDose.description}{' '}
                <strong className='text-[#2a6950]'>{nextDose.protectionDuration}.</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-[#ecfdf5] rounded-2xl p-4 border border-[#aff1d0] flex items-start gap-3'>
          <ShieldCheck size={20} className='text-[#2a6950] shrink-0 mt-0.5' />
          <div>
            <p className='text-xs font-bold text-[#0a5139]'>Tidak ada jadwal pending</p>
            <p className='text-[11px] text-[#166534] leading-relaxed mt-0.5'>
              Semua jadwal sudah selesai atau belum dibuat. Tambahkan jadwal TT berikutnya bila
              diperlukan.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className='flex items-center gap-2 text-[11px] font-semibold'>
        <span className='px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#574144]'>
          {schedules.length} jadwal
        </span>
        <span className='px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
          {completedCount} selesai
        </span>
        <span className='px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200'>
          {schedules.length - completedCount} pending
        </span>
      </div>

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <EmptyState onAdd={handleOpenAdd} />
      ) : (
        <div className='flex flex-col gap-3.5'>
          {schedules.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onToggle={handleToggle}
              onRecordResult={handleRecordResult}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Progress & Guidance */}
      <TTIntervalGuideCard />

      {/* Clinical note */}
      <div className='bg-[#eff4ff] rounded-2xl p-4 flex gap-3.5 items-start border border-[#d9e3f6]/60 shadow-2xs'>
        <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#aa294d] shrink-0 shadow-2xs mt-0.5'>
          <Info size={18} />
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-bold text-[#121c2a] mb-0.5'>Catatan Bidan & Faskes</span>
          <p className='text-[11px] text-[#574144] leading-relaxed'>
            Pastikan kamu menerima vaksin sesuai interval minimal agar respons antibodi optimal.
            Tunjukkan jadwal ini kepada bidan atau petugas faskes saat kunjungan imunisasi berkala.
          </p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ScheduleFormModal
          mode={modalMode}
          initial={modalInitial}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteDialog
          schedule={deleteTarget}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
