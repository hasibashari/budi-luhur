import { useState } from 'react';
import { Plus, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { playNotificationTone } from '@/src/shared/utils/notifications';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import useNotificationPermission from '@/src/shared/hooks/useNotificationPermission';
import { useDailySchedules } from '../hooks/useDailySchedules';
import { DailySchedule } from '../types';
import {
  ScheduleEmptyState,
  ScheduleCard,
  ScheduleFormModal,
  ScheduleGuideCard,
  FormState,
} from '../components';

const DEFAULT_FORM: FormState = {
  title: 'Minum Pil KB',
  timeSlot: '20:00',
  notes: '',
  remind15MinBefore: true,
  isEnabled: true,
};

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
  const [isTestingSound, setIsTestingSound] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleTestSound = () => {
    setIsTestingSound(true);
    playNotificationTone();
    showToast('🔔 Nada alarm pengingat berbunyi!');
    setTimeout(() => setIsTestingSound(false), 1200);
  };

  /**
   * Pastikan izin notifikasi sudah diberikan sebelum jadwal aktif.
   * `requestNotificationPermission()` juga mendaftarkan Web Push subscription,
   * sehingga pengingat tetap bisa dikirim backend saat aplikasi tertutup.
   * Dibungkus try/catch agar tidak pernah melempar error tak tertangani di perangkat non-standar.
   */
  const ensureNotificationPermission = async (): Promise<boolean> => {
    if (isGranted) return true;
    try {
      return await Promise.race([
        requestNotificationPermission(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 2500)),
      ]);
    } catch {
      return false;
    }
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
    setIsSaving(true);
    try {
      const cleanTitle = (data.title || '').trim() || 'Minum Pil KB';
      const cleanTime = (data.timeSlot || '').trim() || '20:00';

      let res: { success: boolean; error?: string };
      if (modalMode === 'create') {
        res = await createSchedule({
          title: cleanTitle,
          timeSlot: cleanTime,
          notes: (data.notes || '').trim(),
          remind15MinBefore: data.remind15MinBefore ?? true,
          isEnabled: data.isEnabled ?? true,
        });
      } else {
        if (!data.id) return;
        res = await updateSchedule(data.id, {
          title: cleanTitle,
          timeSlot: cleanTime,
          notes: (data.notes || '').trim(),
          remind15MinBefore: data.remind15MinBefore ?? true,
        });
      }

      if (!res.success) {
        showToast(res.error || (modalMode === 'create' ? 'Gagal membuat jadwal.' : 'Gagal memperbarui jadwal.'));
        return;
      }

      // Berhasil disimpan ke server/DB, tutup modal segera
      setIsModalOpen(false);

      // Minta izin notifikasi secara aman (non-blocking untuk proses simpan)
      let permissionOk = isGranted;
      if (data.isEnabled !== false && !isGranted) {
        permissionOk = await ensureNotificationPermission();
      }

      showToast(
        modalMode === 'create'
          ? permissionOk
            ? 'Jadwal baru berhasil dibuat! 🎉'
            : 'Jadwal tersimpan, tetapi izin notifikasi belum aktif. 🔕'
          : 'Jadwal berhasil diperbarui! ✨',
      );
    } catch (err: any) {
      console.error('ScheduleView handleSaveModal error:', err);
      showToast(err?.message || 'Terjadi kesalahan sistem saat menyimpan jadwal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, next: boolean) => {
    const res = await toggleSchedule(id, next);
    if (!res.success) {
      showToast(res.error || 'Gagal memperbarui status jadwal.');
      return;
    }

    let permissionOk = isGranted;
    if (next && !isGranted) {
      permissionOk = await ensureNotificationPermission();
    }

    showToast(
      next
        ? permissionOk
          ? 'Jadwal diaktifkan 🔔'
          : 'Jadwal aktif, tetapi izin notifikasi ditolak. 🔕'
        : 'Jadwal dinonaktifkan.',
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

      {/* Screen Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight'>
              Pengaturan Alarm Pil KB
            </h2>
            <span className='px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold'>
              Harian
            </span>
          </div>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Atur dan kelola waktu rutin pengingat minum Pil KB sesuai kebutuhanmu
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button
            variant='outline'
            size='sm'
            shape='pill'
            icon={
              <Volume2
                size={14}
                className={isTestingSound ? 'animate-pulse text-teal-600' : ''}
              />
            }
            onClick={handleTestSound}
            className='text-xs font-bold'
          >
            {isTestingSound ? 'Membunyikan...' : 'Uji Suara Alarm'}
          </Button>

          {schedules.length === 0 && (
            <Button
              variant='primary'
              size='sm'
              shape='pill'
              icon={<Plus size={14} />}
              onClick={handleOpenAdd}
              className='text-xs font-bold shadow-sm shadow-teal-500/20'
            >
              Atur Jadwal
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center py-20 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent' />
        </div>
      ) : (
        /* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* LEFT COLUMN: Alarm Control Card or Empty State (md:col-span-7) */}
          <div className='md:col-span-7 flex flex-col gap-5'>
            {schedules.length === 0 ? (
              <ScheduleEmptyState onAdd={handleOpenAdd} />
            ) : (
              <ScheduleCard
                schedule={schedules[0]}
                onToggle={handleToggle}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
              />
            )}

            {/* Quick Helper: How Pilluna's 4-stage reminder works */}
            <Card padding='md' className='bg-slate-50 border border-slate-200/80'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5'>
                  <HelpCircle size={16} />
                </div>
                <div className='space-y-1.5'>
                  <h4 className='text-xs sm:text-sm font-bold text-slate-800'>
                    Bagaimana Pengingat Otomatis Pilluna Bekerja?
                  </h4>
                  <p className='text-xs text-slate-500 leading-relaxed'>
                    Kamu cukup menentukan <strong>satu jam patokan</strong> rutin setiap hari. Sistem akan mengawal kepatuhanmu secara dinamis:
                  </p>
                  <ul className='text-[11px] sm:text-xs text-slate-600 space-y-1 pt-1'>
                    <li className='flex items-center gap-1.5'>
                      <span>🌅</span>
                      <span><strong>Pagi (07:00 WIB)</strong>: Notifikasi awal jadwal minum hari ini</span>
                    </li>
                    <li className='flex items-center gap-1.5'>
                      <span>⏳</span>
                      <span><strong>15 Menit Sebelum</strong>: Aba-aba persiapan minum pil & air putih</span>
                    </li>
                    <li className='flex items-center gap-1.5'>
                      <span>🔔</span>
                      <span><strong>Tepat Waktu</strong>: Alarm nada dering utama berbunyi</span>
                    </li>
                    <li className='flex items-center gap-1.5'>
                      <span>🌙</span>
                      <span><strong>Malam Hari (21:30 WIB)</strong>: Pengingat tambahan jika belum dicatat</span>
                    </li>
                  </ul>
                  <p className='text-[11px] text-teal-700 italic pt-1'>
                    💡 Begitu kamu menandai &ldquo;Sudah Minum&rdquo;, seluruh pengingat susulan untuk sisa hari itu otomatis dihentikan.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Medical Guidelines & FAQs (md:col-span-5) */}
          <div className='md:col-span-5 flex flex-col gap-4'>
            <ScheduleGuideCard />
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
          onTestSound={handleTestSound}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title='Hapus Jadwal Ini?'
        message={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus jadwal "${deleteTarget.title}"? Jadwal akan dihapus permanen dan tidak bisa dikembalikan.`
            : ''
        }
        confirmText='Ya, Hapus'
        cancelText='Batal'
        loading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
