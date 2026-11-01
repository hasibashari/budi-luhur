import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
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
  title: '',
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
        <ScheduleEmptyState onAdd={handleOpenAdd} />
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
