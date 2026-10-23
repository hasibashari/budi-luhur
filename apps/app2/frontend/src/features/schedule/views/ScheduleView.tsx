import React, { useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  BellRing,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  X,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import useNotificationPermission from '@/src/shared/hooks/useNotificationPermission';
import { useDailySchedules } from '../hooks/useDailySchedules';
import { DailySchedule, CreateDailySchedulePayload } from '../types';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const TIME_PRESETS = [
  { time: '07:00', label: '07:00 Pagi', desc: 'Setelah sarapan' },
  { time: '13:00', label: '13:00 Siang', desc: 'Setelah makan' },
  { time: '20:00', label: '20:00 Malam', desc: 'Sebelum tidur' },
];

interface FormState extends CreateDailySchedulePayload {
  id?: string;
}

const DEFAULT_FORM: FormState = {
  title: '',
  timeSlot: '20:00',
  notes: '',
  remind15MinBefore: true,
  isEnabled: true,
};

// ─── Sub-component: Empty State ───────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card
      padding='lg'
      className='text-center py-12 sm:py-16 border-2 border-dashed border-teal-200 bg-teal-50/20 rounded-3xl'
    >
      <div className='w-16 h-16 rounded-3xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4 shadow-sm'>
        <BellOff size={32} />
      </div>
      <h3 className='text-lg font-black text-slate-900 tracking-tight'>
        Belum Ada Jadwal Harian ⏰
      </h3>
      <p className='text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6 leading-relaxed'>
        Kamu belum memiliki jadwal pengingat. Buat jadwal harianmu sekarang agar Pilluna dapat
        mengingatkanmu tepat waktu setiap hari.
      </p>
      <Button
        variant='primary'
        size='md'
        shape='pill'
        icon={<Plus size={16} />}
        onClick={onAdd}
        className='font-bold shadow-md shadow-teal-500/20 text-xs px-6 py-2.5'
      >
        Buat Jadwal Pertama
      </Button>
    </Card>
  );
}

// ─── Sub-component: Schedule Card ─────────────────────────────────────────────

interface ScheduleCardProps {
  schedule: DailySchedule;
  onToggle: (id: string, next: boolean) => void;
  onEdit: (schedule: DailySchedule) => void;
  onDelete: (schedule: DailySchedule) => void;
}

function ScheduleCard({ schedule, onToggle, onEdit, onDelete }: ScheduleCardProps) {
  return (
    <Card
      padding='lg'
      className='relative overflow-hidden border border-teal-100/80 bg-gradient-to-br from-teal-50/40 via-white to-slate-50/30 shadow-sm'
    >
      {/* Decorative glow */}
      <div className='absolute -top-10 -right-10 w-36 h-36 bg-teal-400/10 rounded-full blur-2xl pointer-events-none' />

      {/* Top Row: Status badge + Toggle */}
      <div className='flex items-center justify-between gap-3 mb-5 relative z-10'>
        <div className='flex items-center gap-2 flex-wrap'>
          {schedule.isEnabled ? (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 border border-teal-500/20 text-xs font-bold'>
              <span className='w-2 h-2 rounded-full bg-teal-500 animate-pulse' />
              Aktif
            </span>
          ) : (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold'>
              <span className='w-2 h-2 rounded-full bg-slate-400' />
              Nonaktif
            </span>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          type='button'
          onClick={() => onToggle(schedule.id, !schedule.isEnabled)}
          className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
            schedule.isEnabled ? 'bg-teal-600' : 'bg-slate-300'
          }`}
          aria-label={schedule.isEnabled ? 'Nonaktifkan jadwal' : 'Aktifkan jadwal'}
        >
          <div
            className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
              schedule.isEnabled ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Title & Time Display */}
      <div className='my-2 relative z-10'>
        <p className='text-xs text-slate-500 font-medium mb-1'>Nama Kegiatan</p>
        <h3 className='text-base sm:text-lg font-black text-slate-900 tracking-tight mb-3'>
          {schedule.title}
        </h3>

        <div className='flex items-baseline gap-2'>
          <span className='text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono'>
            {schedule.time || '–'}
          </span>
          <span className='text-base sm:text-xl font-bold text-teal-600 font-mono'>WIB</span>
        </div>

        <div className='mt-2.5'>
          <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-100'>
            📅 Setiap Hari
          </span>
        </div>

        {schedule.notes && (
          <div className='mt-3 p-3 rounded-2xl bg-white/90 border border-teal-100/80 shadow-2xs'>
            <p className='text-xs text-slate-500 italic leading-relaxed'>💬 {schedule.notes}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className='mt-5 pt-4 border-t border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10'>
        <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
          <BellRing size={14} className={schedule.isEnabled ? 'text-teal-600' : 'text-slate-400'} />
          <span>
            {schedule.remind15MinBefore
              ? 'Pengingat 15 menit sebelumnya'
              : 'Pengingat tepat pada jam'}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            shape='pill'
            icon={<Edit3 size={13} />}
            onClick={() => onEdit(schedule)}
            className='text-xs font-bold'
          >
            Ubah
          </Button>
          <button
            type='button'
            onClick={() => onDelete(schedule)}
            className='p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
            title='Hapus Jadwal'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Sub-component: Schedule Form Modal ───────────────────────────────────────

interface ScheduleFormModalProps {
  mode: 'create' | 'edit';
  initial: FormState;
  onClose: () => void;
  onSave: (data: FormState) => Promise<void>;
  isSaving: boolean;
}

function ScheduleFormModal({ mode, initial, onClose, onSave, isSaving }: ScheduleFormModalProps) {
  const [form, setForm] = useState<FormState>({ ...initial });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
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
                {mode === 'create' ? 'Buat Jadwal Baru' : 'Ubah Jadwal'}
              </h3>
              <span className='text-[11px] text-slate-500'>
                {mode === 'create' ? 'Isi detail jadwal harianmu' : 'Perbarui detail jadwal'}
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

          {/* Info: Harian */}
          <div className='p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600'>
            <Info size={14} className='text-teal-600 shrink-0' />
            <span>
              Jadwal ini akan berlaku <strong>setiap hari</strong> pada jam yang ditentukan.
            </span>
          </div>

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

// ─── Sub-component: Delete Confirm Dialog ─────────────────────────────────────

interface DeleteDialogProps {
  schedule: DailySchedule;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ schedule, isDeleting, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={() => !isDeleting && onCancel()} />
      <div className='relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-red-100 text-center'>
        <div className='w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5'>
          <AlertCircle size={24} />
        </div>
        <h3 className='text-base font-black text-slate-900'>Hapus Jadwal Ini?</h3>
        <p className='text-xs text-slate-500 mt-1.5 mb-1 leading-relaxed'>
          <strong>"{schedule.title}"</strong>
        </p>
        <p className='text-xs text-slate-400 mb-5'>
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
  const { schedules, loading, createSchedule, updateSchedule, toggleSchedule, deleteSchedule } =
    useDailySchedules();
  const { request: requestNotificationPermission, isGranted } = useNotificationPermission();

  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalInitial, setModalInitial] = useState<FormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailySchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  /**
   * Pastikan izin notifikasi sudah diberikan sebelum jadwal aktif.
   * `requestNotificationPermission()` juga mendaftarkan Web Push subscription,
   * sehingga pengingat tetap bisa dikirim backend saat aplikasi tertutup.
   */
  const ensureNotificationPermission = async (): Promise<boolean> => {
    if (isGranted) return true;
    return requestNotificationPermission();
  };

  const handleOpenAdd = () => {
    setModalMode('create');
    setModalInitial({ ...DEFAULT_FORM });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule: DailySchedule) => {
    setModalMode('edit');
    setModalInitial({
      id: schedule.id,
      title: schedule.title,
      timeSlot: schedule.time,
      notes: schedule.notes ?? '',
      remind15MinBefore: schedule.remind15MinBefore,
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
        const res = await createSchedule({
          title: data.title,
          timeSlot: data.timeSlot,
          notes: data.notes,
          remind15MinBefore: data.remind15MinBefore,
          isEnabled: data.isEnabled,
        });
        if (res.success) {
          showToast(
            permissionOk
              ? 'Jadwal baru berhasil dibuat! 🎉'
              : 'Jadwal tersimpan, tetapi izin notifikasi belum aktif. 🔕',
          );
          setIsModalOpen(false);
        } else {
          showToast(res.error || 'Gagal membuat jadwal.');
        }
      } else {
        if (!data.id) return;
        const res = await updateSchedule(data.id, {
          title: data.title,
          timeSlot: data.timeSlot,
          notes: data.notes,
          remind15MinBefore: data.remind15MinBefore,
        });
        if (res.success) {
          showToast('Jadwal berhasil diperbarui! ✨');
          setIsModalOpen(false);
        } else {
          showToast(res.error || 'Gagal memperbarui jadwal.');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, next: boolean) => {
    // Saat mengaktifkan jadwal, pastikan izin notifikasi sudah diberikan.
    const permissionOk = next ? await ensureNotificationPermission() : true;

    const res = await toggleSchedule(id, next);
    showToast(
      res.success
        ? next
          ? permissionOk
            ? 'Jadwal diaktifkan 🔔'
            : 'Jadwal aktif, tetapi izin notifikasi ditolak. 🔕'
          : 'Jadwal dinonaktifkan.'
        : res.error || 'Gagal memperbarui status jadwal.',
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteSchedule(deleteTarget.id);
    setIsDeleting(false);
    if (res.success) {
      showToast('Jadwal berhasil dihapus.');
      setDeleteTarget(null);
    } else {
      showToast(res.error || 'Gagal menghapus jadwal.');
    }
  };

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* Toast Notification */}
      {toast && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in'>
          <Sparkles size={14} className='text-teal-400' />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight'>
              Jadwal Harian
            </h2>
            <span className='px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold'>
              Pengingat
            </span>
          </div>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Atur dan kelola pengingat harian untuk menjaga konsistensi rutin kesehatanmu
          </p>
        </div>

        {schedules.length > 0 && (
          <Button
            variant='primary'
            size='sm'
            shape='pill'
            icon={<Plus size={14} />}
            onClick={handleOpenAdd}
            className='self-start sm:self-auto text-xs font-bold shadow-sm shadow-teal-500/20'
          >
            Tambah Jadwal
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center py-20 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent' />
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState onAdd={handleOpenAdd} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* Left Column: Schedule Cards */}
          <div className='md:col-span-7 flex flex-col gap-4'>
            {schedules.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onToggle={handleToggle}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Right Column: Tips & Info */}
          <div className='md:col-span-5 flex flex-col gap-4'>
            {/* Panduan Jadwal Harian */}
            <Card padding='md' className='bg-teal-50/60 border-teal-100'>
              <div className='flex items-center gap-2 text-sm font-bold text-teal-900 mb-3'>
                <div className='w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0'>
                  <ShieldCheck size={15} />
                </div>
                <h4>Panduan Jadwal Harian</h4>
              </div>
              <ul className='space-y-2.5 text-xs text-teal-800/80 leading-relaxed'>
                <li className='flex items-start gap-2'>
                  <Check size={13} className='text-teal-600 shrink-0 mt-0.5' />
                  <span>Pilih jam yang mudah kamu ingat dan konsisten setiap harinya.</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check size={13} className='text-teal-600 shrink-0 mt-0.5' />
                  <span>
                    Aktifkan pengingat 15 menit sebelumnya agar kamu punya waktu persiapan.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check size={13} className='text-teal-600 shrink-0 mt-0.5' />
                  <span>Kamu bisa memiliki lebih dari satu jadwal harian sesuai kebutuhan.</span>
                </li>
              </ul>
            </Card>

            {/* Info Cara Kerja */}
            <Card padding='md' className='bg-slate-50 border border-slate-200/80'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5'>
                  <Bell size={16} />
                </div>
                <div>
                  <h4 className='text-xs sm:text-sm font-bold text-slate-800'>
                    Cara Kerja Pengingat Harian
                  </h4>
                  <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
                    Setiap jadwal aktif akan membunyikan notifikasi pengingat tepat pada jam yang
                    kamu tentukan setiap hari. Kamu bisa mematikan atau menghapus jadwal kapan saja.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <ScheduleFormModal
          mode={modalMode}
          initial={modalInitial}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirm Dialog */}
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
