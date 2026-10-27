'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Info,
  Search,
  Syringe,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import SendReminderModal from '../components/SendReminderModal';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { MobileFilterChips } from '@/src/shared/components/ui/MobileFilterChips';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { useToast } from '@/src/shared/hooks/useToast';
import { getSchedulesAction } from '../api/scheduleRepository';
import { getUsersAction } from '../api/userManagementRepository';
import { MedicationSchedule, ManagedUser } from '../types/admin.types';
import { SCHEDULE_CATEGORY_COLORS } from '../constants/schedule.constants';
import { subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';

const CATEGORY_FILTERS = ['Semua', 'Imunisasi TT', 'Skrining Pranikah', 'Bimbingan Pranikah'].map(
  value => ({ label: value, value }),
);
const STATUS_FILTERS = ['Semua', 'PENDING', 'COMPLETED'].map(value => ({
  label: value === 'PENDING' ? 'Menunggu' : value === 'COMPLETED' ? 'Selesai' : value,
  value,
}));

function formatDateId(value?: string) {
  if (!value) return 'Belum dijadwalkan';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    userId?: string;
    userName: string;
    userPhone?: string;
    scheduleId?: string;
    medicationName?: string;
    dosage?: string;
    timeSlot?: string;
  }>({ userName: '' });

  const { open: toastOpen, message: toastMsg, severity: toastSeverity, hideToast } = useToast();

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

    // Sinkronisasi: perubahan dari sisi pengguna langsung memicu muat ulang.
    const unsubscribe = subscribeRealtimeEvent(event => {
      if (
        event.type === 'MEDICATION_TAKEN' ||
        event.type === 'SCHEDULE_UPDATED' ||
        event.type === 'NUDGE_DISMISSED'
      ) {
        fetchData();
      }
    });

    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData();
      }
    }, 8000);

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, ManagedUser>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const filteredSchedules = useMemo(
    () =>
      schedules.filter(schedule => {
        const targetUserId = schedule.userId || schedule.patientId || '';
        const user = userMap.get(targetUserId);
        const name = schedule.userName || schedule.patientName || user?.name || '';
        const partner = schedule.partnerName || user?.partnerName || '';
        const q = searchQuery.toLowerCase();

        const matchesSearch =
          q === '' ||
          name.toLowerCase().includes(q) ||
          partner.toLowerCase().includes(q) ||
          schedule.medicationName.toLowerCase().includes(q) ||
          targetUserId.toLowerCase().includes(q);

        const matchesCategory =
          categoryFilter === 'Semua' || schedule.category === categoryFilter;
        const matchesStatus =
          statusFilter === 'Semua' ||
          (statusFilter === 'COMPLETED' && schedule.todayStatus === 'COMPLETED') ||
          (statusFilter === 'PENDING' && schedule.todayStatus !== 'COMPLETED');

        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [schedules, userMap, searchQuery, categoryFilter, statusFilter],
  );

  const handleOpenReminder = (schedule: MedicationSchedule) => {
    const targetUserId = schedule.userId || schedule.patientId || '';
    const user = userMap.get(targetUserId);
    setReminderData({
      userId: targetUserId,
      userName: schedule.userName || user?.name || 'Calon Pengantin',
      userPhone: user?.phone || undefined,
      scheduleId: schedule.id,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      timeSlot: schedule.timeSlots.join(', '),
    });
    setReminderModalOpen(true);
  };

  return (
    <div className='flex flex-col gap-5 w-full'>
      <AdminHeader
        title='Monitoring Jadwal Imunisasi'
        subtitle='Jadwal di bawah ini dibuat dan dikelola oleh calon pengantin. Admin hanya memantau.'
      />

      <div className='flex items-start gap-2.5 rounded-2xl border border-[#d9e3f6] bg-[#eff4ff] p-3.5'>
        <Info size={17} className='text-[#aa294d] shrink-0 mt-0.5' />
        <p className='text-[11px] sm:text-xs text-[#574144] leading-relaxed'>
          Data jadwal bersumber dari satu tabel yang sama dengan aplikasi pengguna, sehingga
          perubahan yang dilakukan calon pengantin langsung terlihat di sini. Admin tidak dapat
          menambah, mengubah, atau menghapus jadwal.
        </p>
      </div>

      {/* Search & Filters */}
      <div className='flex flex-col gap-3'>
        <div className='relative w-full'>
          <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b7074]'>
            <Search size={16} />
          </div>
          <input
            type='text'
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder='Cari nama catin, pasangan, atau jenis layanan...'
            className='w-full min-h-11 pl-10 pr-4 rounded-2xl bg-white border border-[#eff4ff] text-sm text-[#121c2a] placeholder-[#8b7074] focus:outline-none focus:border-[#aa294d] transition-all'
          />
        </div>

        <MobileFilterChips
          options={CATEGORY_FILTERS}
          selectedValue={categoryFilter}
          onSelect={setCategoryFilter}
        />
        <MobileFilterChips
          options={STATUS_FILTERS}
          selectedValue={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      {filteredSchedules.length === 0 ? (
        <div className='rounded-3xl border border-dashed border-[#d9e3f6] bg-white p-10 text-center'>
          <div className='w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center mx-auto mb-3'>
            <Calendar size={26} />
          </div>
          <h3 className='text-sm font-bold text-[#121c2a]'>Belum ada jadwal</h3>
          <p className='text-xs text-[#574144] mt-1 max-w-sm mx-auto'>
            Jadwal akan muncul setelah calon pengantin membuatnya di aplikasi. Anda dapat
            mengingatkan mereka untuk melengkapi jadwal imunisasi TT.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3.5'>
          {filteredSchedules.map(schedule => {
            const targetUserId = schedule.userId || schedule.patientId || '';
            const user = userMap.get(targetUserId);
            const partnerName = schedule.partnerName || user?.partnerName;
            const isCompleted =
              schedule.todayStatus === 'COMPLETED' || schedule.status === 'Selesai';
            const categoryColor =
              SCHEDULE_CATEGORY_COLORS[schedule.category] || SCHEDULE_CATEGORY_COLORS.default;
            const isTt = Boolean(schedule.ttLevel);

            return (
              <div
                key={schedule.id}
                className='rounded-2xl border border-[#eff4ff] bg-white p-4 shadow-xs flex flex-col gap-3'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <Avatar src={user?.avatarUrl} name={schedule.userName} size='sm' />
                    <div className='min-w-0'>
                      <p className='text-sm font-bold text-[#121c2a] truncate'>
                        {schedule.userName || user?.name || 'Calon Pengantin'}
                      </p>
                      {partnerName && (
                        <p className='text-[11px] text-[#574144] flex items-center gap-1 truncate'>
                          <Heart size={11} className='text-[#aa294d]' /> Pasangan: {partnerName}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {isCompleted ? 'Selesai' : 'Menunggu'}
                  </span>
                </div>

                <div className='flex flex-wrap items-center gap-1.5'>
                  <span
                    className='px-2 py-0.5 rounded-full text-[10px] font-bold'
                    style={{
                      backgroundColor: categoryColor.bg,
                      color: categoryColor.text,
                    }}
                  >
                    {schedule.category}
                  </span>
                  {isTt && (
                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd9de] text-[#8c0f39]'>
                      <Syringe size={11} /> {schedule.ttLevel}
                    </span>
                  )}
                </div>

                <div className='rounded-xl bg-[#eff4ff] px-3 py-2 flex flex-col gap-1'>
                  <div className='flex items-center gap-1.5 text-[11px] text-[#574144]'>
                    <Calendar size={12} className='text-[#aa294d]' />
                    <span>{formatDateId(schedule.scheduledDate || schedule.startDate)}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-[11px] text-[#574144]'>
                    <Clock size={12} className='text-[#aa294d]' />
                    <span>{schedule.timeSlots.join(', ')} WIB</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-[11px] text-[#574144]'>
                    <BellRing
                      size={12}
                      className={schedule.isEnabled ? 'text-[#aa294d]' : 'text-stone-400'}
                    />
                    <span>{schedule.isEnabled ? 'Pengingat aktif' : 'Pengingat nonaktif'}</span>
                  </div>
                </div>

                {schedule.instructions && (
                  <p className='text-[11px] text-[#8b7074] italic'>“{schedule.instructions}”</p>
                )}

                <button
                  type='button'
                  onClick={() => handleOpenReminder(schedule)}
                  className='w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#aa294d] text-white font-bold text-xs hover:bg-[#cb4364] shadow-xs transition-all cursor-pointer min-h-11'
                >
                  <BellRing size={15} />
                  Ingatkan Catin
                </button>
              </div>
            );
          })}
        </div>
      )}

      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        userName={reminderData.userName}
        userPhone={reminderData.userPhone}
        userId={reminderData.userId}
        scheduleId={reminderData.scheduleId}
        medicationName={reminderData.medicationName}
        dosage={reminderData.dosage}
        timeSlot={reminderData.timeSlot}
        onSendSuccess={() => loadData()}
      />

      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </div>
  );
}
