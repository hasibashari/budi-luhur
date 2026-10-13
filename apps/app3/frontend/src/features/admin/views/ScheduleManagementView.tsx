import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, BellRing, Edit, Trash2 } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import SendReminderModal from '../components/SendReminderModal';
import ScheduleFormModal from '../components/ScheduleFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { MobileFilterChips } from '@/src/shared/components/ui/MobileFilterChips';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  getSchedulesAction,
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
  sendReminderNudgeAction,
} from '../api/scheduleRepository';
import { getUsersAction } from '../api/userManagementRepository';
import { MedicationSchedule, ManagedUser } from '../types/admin.types';
import {
  INITIAL_SCHEDULE_FORM_DATA,
  ScheduleFormData,
  ScheduleCategory,
} from '../constants/schedule.constants';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';

export default function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('Semua');
  const [submitting, setSubmitting] = useState(false);

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ScheduleFormData>(INITIAL_SCHEDULE_FORM_DATA);

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: scheduleToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    userId?: string;
    userName: string;
    userPhone?: string;
    scheduleId?: string;
    medicationName?: string;
    dosage?: string;
    timeSlot?: string;
  }>({
    userName: '',
  });

  const loadData = useCallback(async () => {
    const [s, u] = await Promise.all([getSchedulesAction(), getUsersAction()]);
    setSchedules(s);
    setUsers(u);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const [s, u] = await Promise.all([getSchedulesAction(), getUsersAction()]);
      if (isMounted) {
        setSchedules(s);
        setUsers(u);
      }
    };

    fetchData();

    // Cross-Tab Sync via BroadcastChannel
    const unsubscribe = subscribeRealtimeEvent(event => {
      if (
        event.type === 'MEDICATION_TAKEN' ||
        event.type === 'SCHEDULE_UPDATED' ||
        event.type === 'NUDGE_DISMISSED'
      ) {
        fetchData();
      }
    });

    // Multi-device polling
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData();
      }
    }, 8000);

    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Quick lookup user details for avatar & school
  const userMap = useMemo(() => {
    const map = new Map<string, ManagedUser>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const filteredSchedules = schedules.filter(s => {
    const name = s.userName || s.patientName || '';
    const id = s.userId || s.patientId || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFrequency =
      frequencyFilter === 'Semua' ||
      (frequencyFilter === 'Harian' && s.frequency === 'Harian') ||
      (frequencyFilter === 'Mingguan' && s.frequency !== 'Harian');
    return matchesSearch && matchesFrequency;
  });

  const onOpenAdd = () => {
    handleOpenAdd({
      userId: users[0]?.id || 'usr_1',
      patientId: users[0]?.id || 'usr_1',
    });
  };

  const onOpenEdit = (schedule: MedicationSchedule) => {
    handleOpenEdit(schedule.id, {
      userId: schedule.userId || schedule.patientId || 'usr_1',
      patientId: schedule.userId || schedule.patientId || 'usr_1',
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      frequency: schedule.frequency === 'Harian' ? 'Harian' : '1x Seminggu',
      dayOfWeek: schedule.dayOfWeek || 'Sabtu',
      timeSlot: schedule.timeSlots.join(', '),
      category: (schedule.category as ScheduleCategory) || 'TTD Rutin',
      instructions: schedule.instructions,
    });
  };

  const handleSaveSchedule = async () => {
    if (!formData.medicationName) {
      showToast('Nama obat / suplemen wajib diisi', 'error');
      return;
    }

    const rawSlots = formData.timeSlot
      .split(/[,;]+/)
      .map(s => s.trim().replace('.', ':'))
      .filter(s => s.length > 0);

    const timeSlotsArray = rawSlots.length > 0 ? rawSlots : ['20:00'];
    const today = new Date().toISOString().split('T')[0];

    setSubmitting(true);
    const isDaily = formData.frequency === 'Harian';
    const cleanDayOfWeek = isDaily ? 'Setiap Hari' : formData.dayOfWeek || 'Sabtu';
    const targetUserId = formData.userId || formData.patientId || users[0]?.id || 'usr_1';

    try {
      if (editingId) {
        const res = await updateScheduleAction(editingId, {
          userId: targetUserId,
          patientId: targetUserId,
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          dayOfWeek: cleanDayOfWeek,
          timeSlots: timeSlotsArray,
          category: formData.category,
          instructions: formData.instructions,
        });

        if (res.success) {
          await loadData();
          publishRealtimeEvent('SCHEDULE_UPDATED', {
            userId: targetUserId,
            patientId: targetUserId,
            scheduleId: editingId,
          });
          handleCloseModal();
          showToast('Jadwal berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui jadwal', 'error');
        }
      } else {
        const res = await createScheduleAction({
          userId: targetUserId,
          patientId: targetUserId,
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          dayOfWeek: cleanDayOfWeek,
          timeSlots: timeSlotsArray,
          startDate: today,
          endDate: '2026-12-31',
          category: formData.category,
          instructions:
            formData.instructions ||
            'Minum 1 tablet setelah sarapan atau sebelum tidur dengan air putih.',
        });

        if (res.success) {
          await loadData();
          publishRealtimeEvent('SCHEDULE_UPDATED', {
            userId: targetUserId,
            patientId: targetUserId,
          });
          handleCloseModal();
          showToast('Jadwal baru berhasil disimpan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal membuat jadwal', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
      const res = await deleteScheduleAction(scheduleToDelete);
      if (res.success) {
        await loadData();
        publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: scheduleToDelete });
        showToast('Jadwal berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus jadwal', 'error');
      }
    }
    handleCloseDelete();
  };

  const handleOpenReminder = (schedule: MedicationSchedule) => {
    const targetUserId = schedule.userId || schedule.patientId || '';
    const userObj = users.find(u => u.id === targetUserId);
    const name = schedule.userName || schedule.patientName || userObj?.name || 'Siswi';
    setReminderData({
      userId: targetUserId,
      userName: name,
      userPhone: userObj?.phone || '0812-3456-7890',
      scheduleId: schedule.id,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      timeSlot: schedule.timeSlots.join(', ') + ' WIB',
    });
    setReminderModalOpen(true);
  };

  const handleSendSuccess = async (channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.userId) {
      await sendReminderNudgeAction({
        userId: reminderData.userId,
        patientId: reminderData.userId,
        senderName: 'Pembina UKS FEMORY',
        senderRole: 'Pembina UKS',
        scheduleId: reminderData.scheduleId,
        medicationName: reminderData.medicationName,
        dosage: reminderData.dosage,
        timeSlot: reminderData.timeSlot,
        message: messageSent,
        channel,
      });
      await loadData();
      publishRealtimeEvent('NUDGE_SENT', {
        userId: reminderData.userId,
        patientId: reminderData.userId,
      });
    }
  };

  const columns: Column<MedicationSchedule>[] = [
    {
      id: 'user',
      label: 'Siswi (Pengguna)',
      width: '30%',
      renderCell: schedule => {
        const targetUserId = schedule.userId || schedule.patientId || '';
        const user = userMap.get(targetUserId);
        const name = schedule.userName || schedule.patientName || user?.name || 'Siswi';
        return (
          <div className='flex items-center gap-3'>
            <Avatar
              src={user?.avatarUrl}
              name={name}
              size='sm'
              ringClassName='ring-1 ring-pink-100 shadow-2xs'
            />
            <div className='min-w-0'>
              <div className='font-bold text-slate-800 text-sm truncate'>{name}</div>
              <div className='text-xs text-slate-400 truncate'>
                {targetUserId} • {user?.schoolOrOrg || 'UKS Sekolah'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'medication',
      label: 'Obat & Dosis',
      width: '28%',
      renderCell: schedule => (
        <div>
          <div className='font-bold text-slate-900 text-sm'>{schedule.medicationName}</div>
          <div className='text-xs text-slate-500 mt-0.5'>
            {schedule.dosage} • {schedule.frequency}
          </div>
        </div>
      ),
    },
    {
      id: 'scheduleTime',
      label: 'Waktu Minum',
      width: '18%',
      renderCell: schedule => (
        <div>
          <div className='font-semibold text-slate-800 text-xs sm:text-sm'>
            {schedule.frequency === 'Harian' || schedule.frequency === 'daily'
              ? 'Setiap Hari'
              : schedule.dayOfWeek || 'Sabtu'}
          </div>
          <div className='flex gap-1 flex-wrap mt-0.5'>
            {schedule.timeSlots?.length > 0 ? (
              schedule.timeSlots.map((time, idx) => (
                <span
                  key={idx}
                  className='px-2 py-0.5 rounded-full border border-pink-100 bg-rose-50/50 text-[11px] font-bold text-rose-700'
                >
                  {time} WIB
                </span>
              ))
            ) : (
              <span className='text-xs text-slate-400'>20:00 WIB</span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'todayStatus',
      label: 'Status Minum',
      width: '14%',
      renderCell: schedule => {
        if (schedule.todayStatus === 'COMPLETED') {
          return (
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span>
              Sudah
            </span>
          );
        }
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold'>
            <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
            Belum
          </span>
        );
      },
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: schedule => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Ingatkan Siswi'
            onClick={() => handleOpenReminder(schedule)}
            className='p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer'
          >
            <BellRing size={16} />
          </button>
          <button
            type='button'
            title='Edit Jadwal'
            onClick={() => onOpenEdit(schedule)}
            className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Jadwal'
            onClick={() => handleDeleteRequest(schedule.id)}
            className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title='Manajemen Jadwal Obat'
        subtitle='Tetapkan instruksi dosis, frekuensi, serta jadwal pengingat otomatis untuk setiap siswi/pengguna.'
      />

      {/* Filter Bar with MobileFilterChips */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-pink-100 bg-white shadow-sm flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari nama obat atau siswi...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[180px]'>
              <select
                value={frequencyFilter}
                onChange={e => setFrequencyFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Frekuensi</option>
                <option value='Mingguan'>1x Seminggu</option>
                <option value='Harian'>Harian</option>
              </select>
            </div>
          </div>

          <button
            type='button'
            onClick={onOpenAdd}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 shadow-sm transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <Plus size={18} />
            <span>Buat Jadwal Baru</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-slate-100 pt-2.5'>
          <p className='text-[11px] font-bold text-slate-400 mb-1.5'>Filter Frekuensi Minum:</p>
          <MobileFilterChips
            selectedValue={frequencyFilter}
            onSelect={setFrequencyFilter}
            options={[
              { label: 'Semua', value: 'Semua' },
              { label: '1x Seminggu', value: 'Mingguan' },
              { label: 'Harian', value: 'Harian' },
            ]}
          />
        </div>
      </div>

      {/* Schedule Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredSchedules}
        emptyMessage='Tidak ada jadwal yang ditemukan.'
        renderMobileCard={schedule => {
          const targetUserId = schedule.userId || schedule.patientId || '';
          const user = userMap.get(targetUserId);
          const name = schedule.userName || schedule.patientName || user?.name || 'Siswi';
          return (
            <div className='p-4 rounded-2xl border border-pink-100 bg-white shadow-xs flex flex-col gap-3.5'>
              {/* Header: User Avatar + Name + Status */}
              <div className='flex items-center justify-between gap-2.5'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar
                    src={user?.avatarUrl}
                    name={name}
                    size='lg'
                    ringClassName='ring-2 ring-pink-100 shadow-xs'
                  />
                  <div className='min-w-0'>
                    <h4 className='font-bold text-slate-900 text-sm sm:text-base leading-tight truncate'>
                      {name}
                    </h4>
                    <p className='text-xs text-slate-500 mt-0.5 truncate'>
                      {targetUserId} • {user?.schoolOrOrg || 'UKS Sekolah'}
                    </p>
                  </div>
                </div>

                {schedule.todayStatus === 'COMPLETED' ? (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] shrink-0'>
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span>
                    Sudah
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] shrink-0'>
                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
                    Belum
                  </span>
                )}
              </div>

              {/* Middle Details Box */}
              <div className='p-3 rounded-xl bg-[#fff5f7] border border-pink-100 space-y-1.5 text-xs'>
                <div className='flex justify-between items-center'>
                  <span className='text-slate-500 font-medium'>Nama Obat:</span>
                  <span className='font-bold text-slate-900'>{schedule.medicationName}</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-slate-500 font-medium'>Dosis & Aturan:</span>
                  <span className='font-bold text-slate-800'>
                    {schedule.dosage} • {schedule.frequency}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-slate-500 font-medium'>Waktu Minum:</span>
                  <span className='font-bold text-slate-800'>
                    {schedule.frequency === 'Harian' || schedule.frequency === 'daily'
                      ? 'Setiap Hari'
                      : schedule.dayOfWeek || 'Sabtu'}
                    , {schedule.timeSlots.join(', ')} WIB
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className='flex items-center justify-between gap-2 pt-1 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => handleOpenReminder(schedule)}
                  className='flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs transition-all cursor-pointer min-h-[44px]'
                >
                  <BellRing size={16} />
                  <span>Ingatkan Siswi</span>
                </button>

                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Edit Jadwal'
                    onClick={() => onOpenEdit(schedule)}
                    className='w-11 h-11 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type='button'
                    title='Hapus Jadwal'
                    onClick={() => handleDeleteRequest(schedule.id)}
                    className='w-11 h-11 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />

      {/* Add/Edit Schedule Modal Component */}
      <ScheduleFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        users={users}
        submitting={submitting}
        onClose={handleCloseModal}
        onSave={handleSaveSchedule}
        onUpdateFormData={updateFormData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus jadwal ini? Data yang dihapus tidak dapat dikembalikan.'
        confirmText='Hapus Jadwal'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        userName={reminderData.userName}
        userPhone={reminderData.userPhone}
        userId={reminderData.userId}
        medicationName={reminderData.medicationName}
        dosage={reminderData.dosage}
        timeSlot={reminderData.timeSlot}
        onSendSuccess={handleSendSuccess}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </div>
  );
}
