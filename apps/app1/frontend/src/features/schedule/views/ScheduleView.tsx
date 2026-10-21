'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Pill,
  Bell,
  BellRing,
  BellOff,
  Info,
  Check,
  X,
  Edit3,
  Trash2,
  Sparkles,
  Plus,
  Volume2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { playNotificationTone } from '@/src/shared/utils/notifications';
import { publishRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getUserScheduleAction,
  createUserScheduleAction,
  updateUserScheduleSettingsAction,
  deleteUserScheduleAction,
  UserScheduleData,
} from '@/src/features/user/api/userRepository';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const TIME_PRESETS = [
  { time: '20:00', label: '20:00 Malam', desc: 'Sebelum tidur' },
  { time: '19:00', label: '19:00 Malam', desc: 'Setelah makan' },
  { time: '21:00', label: '21:00 Malam', desc: 'Malam santai' },
];
const FREQUENCIES = ['1x Seminggu', 'Setiap Hari (Terapi Khusus)'];

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestingSound, setIsTestingSound] = useState(false);

  // Edit/Create Form Temp States
  const [tempDay, setTempDay] = useState('Sabtu');
  const [tempTime, setTempTime] = useState('20:00');
  const [tempFrequency, setTempFrequency] = useState('1x Seminggu');
  const [tempRemind15, setTempRemind15] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        const data = await getUserScheduleAction(user?.id);
        if (isMounted) {
          setSchedule(data);
          if (data) {
            setTempDay(data.dayOfWeek);
            setTempTime(data.time);
            setTempFrequency(
              data.frequency === 'Harian' ? 'Setiap Hari (Terapi Khusus)' : '1x Seminggu',
            );
            setTempRemind15(data.remind15MinBefore);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load schedule:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleActive = async () => {
    if (!schedule) return;
    const nextEnabled = !schedule.isEnabled;
    setSchedule(prev => (prev ? { ...prev, isEnabled: nextEnabled } : null));

    if (nextEnabled) {
      playNotificationTone();
      showToast('Alarm pengingat TTD diaktifkan! 🔔');
    } else {
      showToast('Alarm pengingat TTD dinonaktifkan.');
    }

    try {
      await updateUserScheduleSettingsAction(schedule.id, {
        isEnabled: nextEnabled,
      });
      publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: schedule.id });
    } catch (err) {
      console.error('Failed to update schedule status:', err);
    }
  };

  const handleTestSound = () => {
    setIsTestingSound(true);
    playNotificationTone();
    showToast('🔔 Nada alarm pengingat berbunyi!');
    setTimeout(() => setIsTestingSound(false), 1200);
  };

  const handleOpenAddModal = () => {
    setTempDay('Sabtu');
    setTempTime('20:00');
    setTempFrequency('1x Seminggu');
    setTempRemind15(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (schedule) {
      setTempDay(schedule.dayOfWeek);
      setTempTime(schedule.time);
      setTempFrequency(
        schedule.frequency === 'Mingguan' ? '1x Seminggu' : 'Setiap Hari (Terapi Khusus)',
      );
      setTempRemind15(schedule.remind15MinBefore);
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFrequency = tempFrequency.includes('Seminggu') ? 'Mingguan' : 'Harian';

    if (schedule) {
      setSchedule(prev =>
        prev
          ? {
              ...prev,
              dayOfWeek: tempDay,
              time: tempTime,
              frequency: updatedFrequency,
              remind15MinBefore: tempRemind15,
            }
          : null,
      );
      setIsModalOpen(false);
      showToast('Pengaturan alarm berhasil diperbarui! ✨');

      await updateUserScheduleSettingsAction(schedule.id, {
        dayOfWeek: tempDay,
        time: tempTime,
        frequency: updatedFrequency,
        remind15MinBefore: tempRemind15,
      });
      publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: schedule.id });
    } else {
      setIsModalOpen(false);
      showToast('Alarm pengingat TTD berhasil dibuat! 🎉');

      const res = await createUserScheduleAction(user?.id || '', {
        dayOfWeek: tempDay,
        timeSlot: tempTime,
        frequency: updatedFrequency === 'Harian' ? 'daily' : 'weekly',
        remind15MinBefore: tempRemind15,
      });
      publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: res.data?.id });
    }

    const fresh = await getUserScheduleAction(user?.id);
    if (fresh) {
      setSchedule(fresh);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!schedule) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserScheduleAction(schedule.id);
      if (res.success) {
        publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: schedule.id });
        setSchedule(null);
        setIsDeleteDialogOpen(false);
        showToast('Alarm pengingat berhasil dihapus.');
      } else {
        showToast(res.error || 'Gagal menghapus alarm.');
      }
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      showToast('Kendala sistem saat menghapus alarm.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in'>
          <Sparkles size={14} className='text-rose-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight'>
              Pengaturan Alarm TTD
            </h2>
            <span className='px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold'>
              Mandiri
            </span>
          </div>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Atur dan kelola waktu rutin pengingat minum Tablet Tambah Darah sesuai kebutuhanmu
          </p>
        </div>

        {/* Action Header Button */}
        <Button
          variant='outline'
          size='sm'
          shape='pill'
          icon={
            <Volume2 size={14} className={isTestingSound ? 'animate-pulse text-rose-600' : ''} />
          }
          onClick={handleTestSound}
          className='self-start sm:self-auto text-xs font-bold'
        >
          {isTestingSound ? 'Membunyikan...' : 'Uji Suara Alarm'}
        </Button>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-20 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
        </div>
      ) : (
        /* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* LEFT COLUMN: Alarm Control Card or Empty State (md:col-span-7) */}
          <div className='md:col-span-7 flex flex-col gap-5'>
            {schedule ? (
              /* ALARM CLOCK HERO CARD */
              <Card
                variant='hero'
                padding='lg'
                className='relative overflow-hidden border border-rose-100/80 shadow-xl shadow-rose-950/5'
              >
                {/* Decorative glow */}
                <div className='absolute -top-12 -right-12 w-44 h-44 bg-rose-400/10 rounded-full blur-2xl pointer-events-none' />

                {/* Top Status & Master Toggle Switch */}
                <div className='flex items-center justify-between gap-3 mb-6 relative z-10'>
                  {/* Status Badge */}
                  <div className='flex items-center gap-2'>
                    {schedule.isEnabled ? (
                      <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-bold'>
                        <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
                        Alarm Aktif
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold'>
                        <span className='w-2 h-2 rounded-full bg-slate-400' />
                        Alarm Nonaktif
                      </span>
                    )}

                    <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 rounded-full text-[11px] font-bold text-rose-700 border border-rose-200'>
                      <Pill size={12} />
                      <span>{schedule.dosage}</span>
                    </span>
                  </div>

                  {/* Switch Toggle (iOS / Android Style) */}
                  <button
                    type='button'
                    onClick={handleToggleActive}
                    className={`w-14 h-7.5 rounded-full transition-colors p-1 flex items-center cursor-pointer shadow-inner ${
                      schedule.isEnabled ? 'bg-[#e11d48]' : 'bg-slate-300'
                    }`}
                    aria-label='Toggle Status Alarm'
                    title={schedule.isEnabled ? 'Matikan Alarm' : 'Nyalakan Alarm'}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                        schedule.isEnabled ? 'translate-x-6.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Big Digital Clock Display */}
                <div className='my-2 relative z-10'>
                  <div className='flex items-baseline gap-2.5'>
                    <span className='text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono'>
                      {schedule.time}
                    </span>
                    <span className='text-lg sm:text-2xl font-bold text-rose-600 font-mono'>
                      WIB
                    </span>
                  </div>

                  {/* Day and Frequency description */}
                  <div className='flex items-center gap-2 flex-wrap mt-3'>
                    <span className='px-3 py-1 bg-rose-50 text-rose-800 rounded-xl text-xs sm:text-sm font-bold border border-rose-100'>
                      📅{' '}
                      {schedule.frequency === 'Harian' || schedule.frequency === 'daily'
                        ? 'Setiap Hari'
                        : `Setiap ${schedule.dayOfWeek}`}
                    </span>
                    <span className='text-xs text-slate-500 font-medium'>
                      (
                      {schedule.frequency === 'Harian' || schedule.frequency === 'daily'
                        ? 'Harian'
                        : '1x Seminggu'}
                      )
                    </span>
                  </div>

                  {/* Tablet info */}
                  <div className='mt-4 p-3 rounded-2xl bg-white/90 border border-rose-100/80 shadow-2xs'>
                    <div className='text-xs sm:text-sm font-bold text-slate-800'>
                      {schedule.tabletName}
                    </div>
                    {schedule.instructions && (
                      <p className='text-xs text-slate-500 mt-1 italic leading-relaxed'>
                        💡 {schedule.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className='mt-6 pt-4 border-t border-rose-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10'>
                  <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
                    <BellRing
                      size={14}
                      className={schedule.isEnabled ? 'text-rose-600' : 'text-slate-400'}
                    />
                    <span>
                      {schedule.remind15MinBefore
                        ? 'Pengingat awal: 15 menit sebelumnya'
                        : 'Pengingat tepat saat jam minum'}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      shape='pill'
                      icon={<Edit3 size={13} />}
                      onClick={handleOpenEditModal}
                      className='text-xs font-bold'
                    >
                      Ubah Alarm
                    </Button>

                    <button
                      type='button'
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className='p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer'
                      title='Hapus Alarm'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              /* EMPTY STATE: ALARM NOT SET */
              <Card
                padding='lg'
                className='text-center py-10 sm:py-14 border-2 border-dashed border-rose-200 bg-rose-50/20 rounded-3xl'
              >
                <div className='w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm'>
                  <BellOff size={32} />
                </div>
                <h3 className='text-lg font-black text-slate-900 tracking-tight'>
                  Belum Ada Alarm Pengingat ⏰
                </h3>
                <p className='text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 mb-6 leading-relaxed'>
                  Kamu belum mengaktifkan alarm pengingat. Tambahkan alarm pengingat sekarang agar
                  FEMORY dapat mengingatkanmu minum Tablet Tambah Darah secara rutin tepat waktu.
                </p>

                <div className='flex items-center justify-center'>
                  <Button
                    variant='primary'
                    size='md'
                    shape='pill'
                    icon={<Plus size={16} />}
                    onClick={handleOpenAddModal}
                    className='font-bold shadow-md shadow-rose-500/20 text-xs px-6 py-2.5'
                  >
                    Tambahkan Alarm Sekarang
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Helper: How the alarm works */}
            <Card padding='md' className='bg-slate-50 border border-slate-200/80'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5'>
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h4 className='text-xs sm:text-sm font-bold text-slate-800'>
                    Bagaimana Alarm FEMORY Bekerja?
                  </h4>
                  <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
                    Saat waktu alarm tiba, aplikasi akan membunyikan nada chime pengingat dan
                    menampilkan banner interaktif di layar. Kamu bisa mencatat konsumsi TTD dengan
                    satu sentuhan.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Medical Guidelines & FAQs (md:col-span-5) */}
          <div className='md:col-span-5 flex flex-col gap-4'>
            {/* Medical Guidelines */}
            <Card padding='md'>
              <div className='flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 mb-3'>
                <div className='w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0'>
                  <Info size={15} />
                </div>
                <h4>Petunjuk Minum TTD</h4>
              </div>

              <ul className='space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed'>
                <li className='flex items-start gap-2.5'>
                  <span className='w-5 h-5 rounded-full bg-rose-50 text-rose-600 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5'>
                    1
                  </span>
                  <span>
                    <strong>1 Tablet / Minggu:</strong> Cukup satu tablet per minggu pada hari dan
                    jam yang konsisten untuk menjaga cadangan zat besi tubuh.
                  </span>
                </li>
                <li className='flex items-start gap-2.5'>
                  <span className='w-5 h-5 rounded-full bg-rose-50 text-rose-600 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5'>
                    2
                  </span>
                  <span>
                    <strong>Minum Setelah Makan:</strong> Sangat dianjurkan setelah makan malam agar
                    tidak menimbulkan sensasi mual atau perih di lambung.
                  </span>
                </li>
                <li className='flex items-start gap-2.5'>
                  <span className='w-5 h-5 rounded-full bg-rose-50 text-rose-600 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5'>
                    3
                  </span>
                  <span>
                    <strong>Hindari Teh & Kopi (Jeda 2 Jam):</strong> Tanin dan kafein dapat
                    mengikat zat besi sehingga sulit diserap oleh tubuh.
                  </span>
                </li>
                <li className='flex items-start gap-2.5'>
                  <span className='w-5 h-5 rounded-full bg-rose-50 text-rose-600 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5'>
                    4
                  </span>
                  <span>
                    <strong>Bagus dengan Air Jeruk:</strong> Vitamin C membantu penyerapan zat besi
                    hingga 2 kali lipat lebih optimal.
                  </span>
                </li>
              </ul>
            </Card>

            {/* Why Weekly Card */}
            <Card padding='md' className='bg-rose-50/60 border border-rose-100'>
              <h4 className='text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5'>
                <span>Kenapa Cukup 1x Seminggu?</span>
                <span>🩸</span>
              </h4>
              <p className='text-xs text-rose-800/80 leading-relaxed'>
                Bagi remaja putri sehat, suplementasi TTD mingguan sudah terbukti secara klinis
                cukup efektif untuk mencegah anemia defisiensi besi tanpa menimbulkan penumpukan
                kadar zat besi berlebih.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Edit/Create Alarm Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          <div className='absolute inset-0' onClick={() => setIsModalOpen(false)} />
          <div className='relative z-10 w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between pb-3.5 border-b border-rose-100 mb-4'>
              <div className='flex items-center gap-2.5'>
                <div className='w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center'>
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h3 className='text-sm sm:text-base font-black text-slate-900'>
                    {schedule ? 'Ubah Pengaturan Alarm' : 'Tambahkan Alarm Baru'}
                  </h3>
                  <span className='text-[11px] text-slate-500'>
                    Tentukan hari dan jam yang paling cocok untukmu
                  </span>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer'
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className='flex flex-col gap-4'>
              {/* Frequency Selector */}
              <div>
                <label className='text-xs font-bold text-slate-800 mb-2 block'>
                  Pilih Frekuensi Alarm:
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {FREQUENCIES.map(f => (
                    <button
                      key={f}
                      type='button'
                      onClick={() => setTempFrequency(f)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        tempFrequency === f
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className='text-xs'>{f}</span>
                      <span className='text-[10px] text-slate-400 mt-0.5'>
                        {f.includes('Seminggu')
                          ? 'Rutin (1 tablet/minggu)'
                          : 'Terapi khusus harian'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selector */}
              {tempFrequency.includes('Seminggu') ? (
                <div>
                  <label className='text-xs font-bold text-slate-800 mb-2 block'>
                    Pilih Hari Minum:
                  </label>
                  <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5'>
                    {DAYS_OF_WEEK.map(d => (
                      <button
                        key={d}
                        type='button'
                        onClick={() => setTempDay(d)}
                        className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          tempDay === d
                            ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{d}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5'>
                  <span className='text-base'>🗓️</span>
                  <span className='leading-relaxed'>
                    Alarm akan berbunyi <strong>setiap hari</strong> pada jam yang ditentukan.
                  </span>
                </div>
              )}

              {/* Time Presets */}
              <div>
                <label className='text-xs font-bold text-slate-800 mb-2 block'>
                  Pilih Jam Minum:
                </label>
                <div className='grid grid-cols-3 gap-2 mb-2'>
                  {TIME_PRESETS.map(preset => (
                    <button
                      key={preset.time}
                      type='button'
                      onClick={() => setTempTime(preset.time)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        tempTime === preset.time
                          ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-2xs font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className='block text-xs font-black'>{preset.time}</span>
                      <span className='block text-[10px] text-slate-400 mt-0.5'>
                        {preset.label.split(' ')[1]}
                      </span>
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
                    value={tempTime}
                    onChange={e => setTempTime(e.target.value)}
                    className='bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-rose-500'
                    required
                  />
                </div>
              </div>

              {/* Advance 15 min toggle */}
              <div className='flex items-center justify-between p-3 bg-rose-50/60 rounded-2xl border border-rose-100'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-2xs'>
                    <Bell size={14} />
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-slate-800 leading-tight'>
                      Pengingat 15 Menit Sebelumnya
                    </span>
                    <span className='block text-[10px] text-slate-500 leading-tight mt-0.5'>
                      Notifikasi awal untuk persiapan
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={tempRemind15}
                  onChange={e => setTempRemind15(e.target.checked)}
                  className='w-4.5 h-4.5 accent-rose-600 rounded-md cursor-pointer'
                />
              </div>

              {/* Sound test preview button */}
              <button
                type='button'
                onClick={handleTestSound}
                className='inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer'
              >
                <Volume2 size={14} className='text-rose-600' />
                <span>Uji Bunyi Suara Alarm</span>
              </button>

              {/* Modal Buttons */}
              <div className='flex items-center gap-2 pt-3 border-t border-slate-100'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  className='flex-1 text-xs font-bold'
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  size='sm'
                  shape='pill'
                  className='flex-1 text-xs font-bold shadow-md shadow-rose-500/20'
                >
                  {schedule ? 'Simpan Perubahan' : 'Pasang Alarm 🔔'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          <div
            className='absolute inset-0'
            onClick={() => !isDeleting && setIsDeleteDialogOpen(false)}
          />
          <div className='relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-100 text-center'>
            <div className='w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5'>
              <AlertCircle size={24} />
            </div>
            <h3 className='text-base font-black text-slate-900'>Hapus Alarm Pengingat?</h3>
            <p className='text-xs text-slate-500 mt-1.5 mb-5 leading-relaxed'>
              Setelah dihapus, FEMORY tidak akan lagi membunyikan alarm pengingat minum TTD untuk
              jadwal ini.
            </p>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                disabled={isDeleting}
                className='flex-1 text-xs font-bold'
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='button'
                variant='primary'
                size='sm'
                shape='pill'
                disabled={isDeleting}
                className='flex-1 text-xs font-bold bg-rose-600 hover:bg-rose-700'
                onClick={handleDeleteSchedule}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
