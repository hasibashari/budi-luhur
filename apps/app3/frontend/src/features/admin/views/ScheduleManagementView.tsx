import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  BellRing,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Heart,
  Syringe,
} from 'lucide-react';
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
  SCHEDULE_CATEGORIES,
  SCHEDULE_CATEGORY_COLORS,
} from '../constants/schedule.constants';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';

export default function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
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

  // Quick lookup user details for avatar & partner
  const userMap = useMemo(() => {
    const map = new Map<string, ManagedUser>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const filteredSchedules = schedules.filter(s => {
    const targetUserId = s.userId || s.patientId || '';
    const user = userMap.get(targetUserId);
    const name = s.userName || s.patientName || user?.name || '';
    const partner = user?.partnerName || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(q) ||
      partner.toLowerCase().includes(q) ||
      s.medicationName.toLowerCase().includes(q) ||
      targetUserId.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'Semua' || s.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'COMPLETED' && s.todayStatus === 'COMPLETED') ||
      (statusFilter === 'PENDING' && s.todayStatus !== 'COMPLETED');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const onOpenAdd = () => {
    handleOpenAdd({
      userId: users[0]?.id || '',
      patientId: users[0]?.id || '',
      medicationName: 'Vaksin TT2 (Syarat Minimal KUA)',
      dosage: '0.5 mL (Intramuskular)',
      frequency: '1x Sesuai Dosis',
      dayOfWeek: 'Sabtu',
      timeSlot: '09:00',
      category: 'Imunisasi TT',
      instructions: 'Hadir ke Puskesmas Gambir membawa KTP dan dokumen skrining pranikah.',
    });
  };

  const onOpenEdit = (schedule: MedicationSchedule) => {
    handleOpenEdit(schedule.id, {
      userId: schedule.userId || schedule.patientId || '',
      patientId: schedule.patientId || schedule.userId || '',
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      frequency: schedule.frequency as any,
      dayOfWeek: schedule.dayOfWeek || 'Sabtu',
      timeSlot: schedule.timeSlots.join(', '),
      category: (schedule.category as ScheduleCategory) || 'Imunisasi TT',
      instructions: schedule.instructions,
    });
  };

  const handleSaveSchedule = async () => {
    if (!formData.medicationName) {
      showToast('Nama vaksin / layanan wajib diisi', 'error');
      return;
    }

    const rawSlots = formData.timeSlot
      .split(/[,;]+/)
      .map(s => s.trim().replace('.', ':'))
      .filter(s => s.length > 0);

    const timeSlotsArray = rawSlots.length > 0 ? rawSlots : ['09:00'];
    const today = new Date().toISOString().split('T')[0];

    setSubmitting(true);
    const isDaily = formData.frequency === 'Harian';
    const cleanDayOfWeek = isDaily ? 'Setiap Hari' : formData.dayOfWeek || 'Sabtu';
    const targetUserId = formData.userId || formData.patientId || users[0]?.id || '';

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
          showToast('Jadwal imunisasi TT/skrining berhasil diperbarui!', 'success');
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
            'Hadir ke Faskes rujukan membawa KTP dan berkas skrining pranikah.',
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
    const name = schedule.userName || schedule.patientName || userObj?.name || 'Calon Pengantin';
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
        senderName: 'Petugas Faskes PRELUNA',
        senderRole: 'Petugas Faskes & KUA',
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
      label: 'Calon Pengantin & Pasangan',
      width: '28%',
      renderCell: schedule => {
        const targetUserId = schedule.userId || schedule.patientId || '';
        const user = userMap.get(targetUserId);
        const name = schedule.userName || schedule.patientName || user?.name || 'Calon Pengantin';
        return (
          <div className='flex items-center gap-3'>
            <Avatar
              src={user?.avatarUrl}
              name={name}
              size='md'
              ringClassName='ring-1 ring-[#ffd9de] shadow-2xs'
            />
            <div className='min-w-0'>
              <div className='font-bold text-[#121c2a] text-sm truncate'>{name}</div>
              {user?.partnerName && (
                <div className='text-[11px] text-[#aa294d] font-semibold flex items-center gap-1 mt-0.5 truncate'>
                  <Heart size={10} className='fill-[#ffd9de] shrink-0' />
                  <span className='truncate'>Pasangan: {user.partnerName}</span>
                </div>
              )}
              <div className='text-xs text-[#8b7074] truncate mt-0.5'>
                {user?.schoolOrOrg || 'Puskesmas Gambir - KUA Gambir'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'medication',
      label: 'Vaksin / Layanan Pranikah',
      width: '28%',
      renderCell: schedule => {
        const cat = schedule.category || 'Imunisasi TT';
        const catStyle = SCHEDULE_CATEGORY_COLORS[cat] || SCHEDULE_CATEGORY_COLORS['Imunisasi TT'];

        return (
          <div>
            <span
              className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border mb-1'
              style={{
                backgroundColor: catStyle.bg,
                color: catStyle.text,
                borderColor: catStyle.border,
              }}
            >
              <Syringe size={10} className='shrink-0' />
              <span>{cat}</span>
            </span>
            <div className='font-bold text-[#121c2a] text-sm'>{schedule.medicationName}</div>
            <div className='text-xs text-[#574144] mt-0.5'>
              {schedule.dosage} • {schedule.frequency}
            </div>
          </div>
        );
      },
    },
    {
      id: 'scheduleTime',
      label: 'Waktu Layanan',
      width: '18%',
      renderCell: schedule => (
        <div>
          <div className='font-bold text-[#121c2a] text-xs sm:text-sm flex items-center gap-1'>
            <Calendar size={12} className='text-[#aa294d]' />
            <span>
              {schedule.frequency === 'Harian' || schedule.frequency === 'daily'
                ? 'Setiap Hari'
                : schedule.dayOfWeek || 'Sabtu'}
            </span>
          </div>
          <div className='flex gap-1 flex-wrap mt-1'>
            {schedule.timeSlots?.length > 0 ? (
              schedule.timeSlots.map((time, idx) => (
                <span
                  key={idx}
                  className='px-2 py-0.5 rounded-full border border-[#dee9fc] bg-[#f8f9ff] text-[11px] font-extrabold text-[#8c0f39]'
                >
                  {time} WIB
                </span>
              ))
            ) : (
              <span className='text-xs text-[#8b7074]'>09:00 WIB</span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'todayStatus',
      label: 'Status Layanan',
      width: '14%',
      renderCell: schedule => {
        if (schedule.todayStatus === 'COMPLETED') {
          return (
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#aff1d0] text-[#0a5139] border border-[#6ee7b7] text-xs font-extrabold'>
              <CheckCircle2 size={12} />
              <span>Sudah</span>
            </span>
          );
        }
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffd9de] text-[#8c0f39] border border-[#fca5a5] text-xs font-extrabold'>
            <Clock size={12} className='animate-pulse' />
            <span>Belum</span>
          </span>
        );
      },
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '12%',
      renderCell: schedule => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Kirim Pengingat TT'
            onClick={() => handleOpenReminder(schedule)}
            className='p-1.5 rounded-lg text-[#aa294d] hover:bg-[#ffd9de]/50 transition-colors cursor-pointer'
          >
            <BellRing size={16} />
          </button>
          <button
            type='button'
            title='Edit Jadwal'
            onClick={() => onOpenEdit(schedule)}
            className='p-1.5 rounded-lg text-[#574144] hover:bg-[#eff4ff] hover:text-[#121c2a] transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Jadwal'
            onClick={() => handleDeleteRequest(schedule.id)}
            className='p-1.5 rounded-lg text-[#cb4364] hover:bg-[#ffd9de]/40 hover:text-[#8c0f39] transition-colors cursor-pointer'
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
        title='Manajemen Jadwal Imunisasi TT & Skrining'
        subtitle='Tetapkan jadwal vaksinasi TT catin, pemeriksaan laboratorium pranikah, dan bimbingan KUA terpadu.'
      />

      {/* Filter Bar */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-[#eff4ff] bg-white shadow-xs flex flex-col gap-3.5'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <div className='relative flex-1'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8b7074]'>
                <Search size={18} />
              </span>
              <input
                type='text'
                placeholder='Cari nama vaksin, layanan, catin, atau pasangan...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all min-h-[44px]'
              />
            </div>

            <div className='hidden sm:block sm:min-w-[190px]'>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm font-medium text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Kategori</option>
                {SCHEDULE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='hidden sm:block sm:min-w-[160px]'>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs sm:text-sm font-medium text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] focus:bg-white transition-all cursor-pointer min-h-[44px]'
              >
                <option value='Semua'>Semua Status</option>
                <option value='COMPLETED'>Sudah Layanan</option>
                <option value='PENDING'>Belum Layanan</option>
              </select>
            </div>
          </div>

          <button
            type='button'
            onClick={onOpenAdd}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#aa294d] text-white font-bold text-xs sm:text-sm hover:bg-[#cb4364] shadow-md shadow-[#aa294d]/20 transition-all cursor-pointer whitespace-nowrap min-h-[44px]'
          >
            <Plus size={18} />
            <span>Buat Jadwal Baru</span>
          </button>
        </div>

        {/* Mobile Horizontal Filter Chips (< sm: 640px) */}
        <div className='block sm:hidden border-t border-[#eff4ff] pt-2.5'>
          <p className='text-[11px] font-bold text-[#8b7074] mb-1.5'>Filter Kategori Layanan:</p>
          <MobileFilterChips
            selectedValue={categoryFilter}
            onSelect={setCategoryFilter}
            options={[
              { label: 'Semua', value: 'Semua' },
              { label: 'Imunisasi TT', value: 'Imunisasi TT' },
              { label: 'Skrining Lab', value: 'Skrining Pranikah' },
              { label: 'Bimbingan KUA', value: 'Bimbingan KUA' },
            ]}
          />
        </div>
      </div>

      {/* Schedule Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredSchedules}
        emptyMessage='Tidak ada jadwal yang sesuai dengan filter pencarian.'
        renderMobileCard={schedule => {
          const targetUserId = schedule.userId || schedule.patientId || '';
          const user = userMap.get(targetUserId);
          const name = schedule.userName || schedule.patientName || user?.name || 'Calon Pengantin';
          const cat = schedule.category || 'Imunisasi TT';
          const catStyle = SCHEDULE_CATEGORY_COLORS[cat] || SCHEDULE_CATEGORY_COLORS['Imunisasi TT'];

          return (
            <div className='p-4 rounded-2xl border border-[#eff4ff] bg-white shadow-xs flex flex-col gap-3.5'>
              {/* Header: User Avatar + Name + Status */}
              <div className='flex items-start justify-between gap-2.5'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar
                    src={user?.avatarUrl}
                    name={name}
                    size='lg'
                    ringClassName='ring-2 ring-[#ffd9de] shadow-xs'
                  />
                  <div className='min-w-0'>
                    <h4 className='font-bold text-[#121c2a] text-sm sm:text-base leading-tight truncate'>
                      {name}
                    </h4>
                    {user?.partnerName && (
                      <p className='text-[11px] text-[#aa294d] font-semibold flex items-center gap-1 mt-0.5 truncate'>
                        <Heart size={10} className='fill-[#ffd9de] shrink-0' />
                        <span className='truncate'>Pasangan: {user.partnerName}</span>
                      </p>
                    )}
                    <p className='text-xs text-[#8b7074] mt-0.5 truncate'>
                      {user?.schoolOrOrg || 'Puskesmas Gambir - KUA Gambir'}
                    </p>
                  </div>
                </div>

                {schedule.todayStatus === 'COMPLETED' ? (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#aff1d0] text-[#0a5139] border border-[#6ee7b7] text-[11px] font-extrabold shrink-0'>
                    <CheckCircle2 size={11} />
                    <span>Sudah</span>
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffd9de] text-[#8c0f39] border border-[#fca5a5] text-[11px] font-extrabold shrink-0'>
                    <Clock size={11} className='animate-pulse' />
                    <span>Belum</span>
                  </span>
                )}
              </div>

              {/* Middle Details Box */}
              <div className='p-3 rounded-xl bg-[#f8f9ff] border border-[#ffd9de]/60 space-y-2 text-xs'>
                <div className='flex justify-between items-center'>
                  <span
                    className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border'
                    style={{
                      backgroundColor: catStyle.bg,
                      color: catStyle.text,
                      borderColor: catStyle.border,
                    }}
                  >
                    <Syringe size={10} />
                    <span>{cat}</span>
                  </span>
                  <span className='font-bold text-[#8c0f39] text-[11px]'>
                    {schedule.dosage}
                  </span>
                </div>

                <div>
                  <div className='font-bold text-[#121c2a] text-sm'>{schedule.medicationName}</div>
                  <div className='text-xs text-[#574144] mt-0.5 flex items-center gap-1'>
                    <Calendar size={11} className='text-[#aa294d]' />
                    <span>
                      {schedule.frequency === 'Harian' || schedule.frequency === 'daily'
                        ? 'Setiap Hari'
                        : schedule.dayOfWeek || 'Sabtu'}
                      , {schedule.timeSlots.join(', ')} WIB
                    </span>
                  </div>
                </div>

                {schedule.instructions && (
                  <p className='text-[11px] text-[#8b7074] italic border-t border-[#eff4ff] pt-1.5'>
                    "{schedule.instructions}"
                  </p>
                )}
              </div>

              {/* Actions Row */}
              <div className='flex items-center justify-between gap-2 pt-1 border-t border-[#eff4ff]'>
                <button
                  type='button'
                  onClick={() => handleOpenReminder(schedule)}
                  className='flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#aa294d] text-white font-bold text-xs hover:bg-[#cb4364] shadow-xs transition-all cursor-pointer min-h-[44px]'
                >
                  <BellRing size={16} />
                  <span>Ingatkan Catin</span>
                </button>

                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Edit Jadwal'
                    onClick={() => onOpenEdit(schedule)}
                    className='w-11 h-11 rounded-xl bg-[#eff4ff] text-[#574144] hover:bg-[#dee9fc] hover:text-[#aa294d] flex items-center justify-center transition-colors cursor-pointer'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type='button'
                    title='Hapus Jadwal'
                    onClick={() => handleDeleteRequest(schedule.id)}
                    className='w-11 h-11 rounded-xl bg-[#ffd9de]/50 text-[#8c0f39] hover:bg-[#ffd9de] flex items-center justify-center transition-colors cursor-pointer'
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
        message='Apakah Anda yakin ingin menghapus jadwal ini? Data jadwal yang dihapus tidak dapat dikembalikan.'
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
