'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Pill,
  Bell,
  BellRing,
  Info,
  Check,
  X,
  Edit3,
  Sparkles,
  Plus,
  CalendarPlus,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { Chip } from '@/src/shared/components/ui/Chip';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import {
  getUserScheduleAction,
  createUserScheduleAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '@/src/features/user/api/userRepository';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const FREQUENCIES = ['1x Seminggu', 'Setiap Hari (Terapi Khusus)'];

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form Temp States
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

  const handleToggleActive = async () => {
    if (!schedule) return;
    const nextEnabled = !schedule.isEnabled;
    setSchedule(prev => (prev ? { ...prev, isEnabled: nextEnabled } : null));
    showToast(nextEnabled ? 'Pengingat TTD diaktifkan' : 'Pengingat TTD dinonaktifkan');

    await updateUserScheduleSettingsAction(schedule.id, {
      isEnabled: nextEnabled,
    });
  };

  const handleOpenModal = () => {
    if (schedule) {
      setTempDay(schedule.dayOfWeek);
      setTempTime(schedule.time);
      setTempFrequency(
        schedule.frequency === 'Mingguan' ? '1x Seminggu' : 'Setiap Hari (Terapi Khusus)',
      );
      setTempRemind15(schedule.remind15MinBefore);
    } else {
      setTempDay('Sabtu');
      setTempTime('20:00');
      setTempFrequency('1x Seminggu');
      setTempRemind15(true);
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
      showToast('Jadwal pengingat berhasil diperbarui! ✨');

      await updateUserScheduleSettingsAction(schedule.id, {
        dayOfWeek: tempDay,
        time: tempTime,
        frequency: updatedFrequency,
        remind15MinBefore: tempRemind15,
      });
    } else {
      setIsModalOpen(false);
      showToast('Jadwal pengingat berhasil dibuat! 🎉');

      await createUserScheduleAction(user?.id || 'usr_1', {
        dayOfWeek: tempDay,
        timeSlot: tempTime,
        frequency: updatedFrequency === 'Harian' ? 'daily' : 'weekly',
        remind15MinBefore: tempRemind15,
      });
    }

    const fresh = await getUserScheduleAction(user?.id);
    if (fresh) {
      setSchedule(fresh);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-amber-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div>
        <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
          Jadwal Pengingat TTD
        </h2>
        <p className='text-xs sm:text-sm text-[#64748b]'>
          Atur waktu rutin konsumsi Tablet Tambah Darah setiap minggu
        </p>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e11d48]' />
        </div>
      ) : (
        /* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* LEFT COLUMN: Active Schedule Card or Empty Schedule Card (md:col-span-7) */}
          <div className='md:col-span-7 flex flex-col gap-5'>
            {schedule ? (
              <Card variant='hero' padding='lg' className='relative'>
                <div className='flex items-center justify-between gap-2 mb-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full text-xs font-bold text-[#e11d48] border border-rose-200'>
                    <Pill size={14} />
                    <span>{schedule.dosage}</span>
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type='button'
                    onClick={handleToggleActive}
                    className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      schedule.isEnabled ? 'bg-[#e11d48]' : 'bg-slate-300'
                    }`}
                    aria-label='Toggle Status Pengingat'
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                        schedule.isEnabled ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className='my-3'>
                  <span className='text-xs text-[#64748b] font-medium block'>
                    Hari & Waktu Rutin:
                  </span>
                  <div className='text-2xl sm:text-4xl font-extrabold text-[#1e293b] tracking-tight flex items-baseline gap-2 mt-1'>
                    <span>{schedule.dayOfWeek}</span>
                    <span className='text-[#e11d48] text-xl sm:text-2xl font-bold'>
                      • {schedule.time} WIB
                    </span>
                  </div>
                  <span className='text-xs sm:text-sm font-semibold text-[#475569] mt-2 block'>
                    {schedule.tabletName}
                  </span>
                  {schedule.instructions && (
                    <p className='text-xs text-[#64748b] mt-2 italic bg-white/80 px-3 py-1.5 rounded-lg border border-rose-100'>
                      💡 {schedule.instructions}
                    </p>
                  )}
                </div>

                <div className='mt-5 pt-4 border-t border-rose-200 flex items-center justify-between'>
                  <span className='text-xs text-[#64748b] flex items-center gap-1'>
                    <BellRing size={13} className='text-[#e11d48]' />
                    {schedule.remind15MinBefore ? 'Pengingat 15 menit sebelum' : 'Tepat pada jam'}
                  </span>

                  <Button
                    variant='primary'
                    size='sm'
                    shape='pill'
                    icon={<Edit3 size={13} />}
                    onClick={handleOpenModal}
                  >
                    Ubah Jadwal
                  </Button>
                </div>
              </Card>
            ) : (
              <Card
                padding='lg'
                className='text-center py-10 border-2 border-dashed border-[#fce7f3] bg-[#fffbfb]'
              >
                <div className='w-14 h-14 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center mx-auto mb-3.5 shadow-xs'>
                  <CalendarPlus size={28} />
                </div>
                <h3 className='text-base font-extrabold text-[#1e293b]'>
                  Belum Ada Jadwal Pengingat
                </h3>
                <p className='text-xs sm:text-sm text-[#64748b] max-w-sm mx-auto mt-1 mb-5'>
                  Atur jadwal mingguan konsumsi Tablet Tambah Darah agar FEMORY dapat mengingatkanmu
                  tepat waktu.
                </p>
                <Button
                  variant='primary'
                  size='md'
                  shape='pill'
                  icon={<Plus size={16} />}
                  onClick={handleOpenModal}
                >
                  Buat Jadwal Pengingat
                </Button>
              </Card>
            )}

            {/* Quick Frequency Info */}
            <Card padding='md' className='bg-[#fff5f7]'>
              <h4 className='text-xs font-bold text-[#1e293b] mb-1'>
                Kenapa Cukup 1x Seminggu? 🩸
              </h4>
              <p className='text-xs text-[#475569] leading-relaxed'>
                Bagi remaja putri sehat, suplementasi TTD mingguan sudah cukup efektif untuk
                mencukupi simpanan zat besi tanpa menimbulkan penumpukan berlebihan.
              </p>
            </Card>

            {/* Auto-Reminder & Auto-Missed Tolerance Info */}
            <Card padding='md' className='bg-[#f0fdf4] border border-[#bbf7d0]'>
              <div className='flex items-center gap-2 text-xs font-bold text-[#166534] mb-1.5'>
                <BellRing size={14} className='text-[#16a34a]' />
                <span>Pengingat Otomatis & Toleransi Waktu</span>
              </div>
              <ul className='space-y-1.5 text-[11px] text-[#15803d] leading-relaxed'>
                <li className='flex items-start gap-1.5'>
                  <span className='font-bold text-[#16a34a]'>•</span>
                  <span>
                    <strong>Notifikasi Otomatis:</strong> Aplikasi akan membunyikan audio chime dan
                    mengirim notifikasi saat jam jadwal tiba (atau 15 menit sebelumnya).
                  </span>
                </li>
                <li className='flex items-start gap-1.5'>
                  <span className='font-bold text-[#16a34a]'>•</span>
                  <span>
                    <strong>Otomatis Terlewat:</strong> Jika melewati jam jadwal lebih dari 60 menit
                    dan belum dicatat, status akan otomatis ditandai <em>Terlewat</em> (kamu tetap
                    bisa mengubahnya sewaktu-waktu jika sudah meminumnya).
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          {/* RIGHT COLUMN: Medical Guidelines & FAQs (md:col-span-5) */}
          <div className='md:col-span-5 flex flex-col gap-4'>
            <Card padding='md'>
              <div className='flex items-center gap-2 text-sm sm:text-base font-bold text-[#1e293b] mb-3'>
                <div className='w-7 h-7 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shrink-0'>
                  <Info size={15} />
                </div>
                <h4>Petunjuk Minum TTD</h4>
              </div>

              <ul className='space-y-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed'>
                <li className='flex items-start gap-2'>
                  <span className='text-rose-500 font-bold'>•</span>
                  <span>
                    <strong>1 Tablet / Minggu:</strong> Minum rutin di hari yang sama.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-rose-500 font-bold'>•</span>
                  <span>
                    <strong>Setelah Makan:</strong> Mencegah perut tidak nyaman atau mual.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-rose-500 font-bold'>•</span>
                  <span>
                    <strong>Hindari Teh & Kopi:</strong> Beri jeda 2 jam agar zat besi terserap
                    optimal.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-rose-500 font-bold'>•</span>
                  <span>
                    <strong>Air Putih / Jus Jeruk:</strong> Vitamin C melipatgandakan penyerapan zat
                    besi.
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Edit/Create Schedule Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          {/* Backdrop Click Dismiss */}
          <div className='absolute inset-0' onClick={() => setIsModalOpen(false)} />
          <div className='relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 shadow-2xl border border-[#fce7f3] max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between pb-3 border-b border-[#fce7f3] mb-4'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-rose-100 text-[#e11d48] flex items-center justify-center'>
                  <CalendarIcon size={16} />
                </div>
                <h3 className='text-sm sm:text-base font-bold text-[#1e293b]'>
                  {schedule ? 'Ubah Jadwal Pengingat' : 'Buat Jadwal Pengingat'}
                </h3>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-7 h-7 rounded-full bg-slate-100 text-[#64748b] hover:text-[#1e293b] flex items-center justify-center transition-colors cursor-pointer'
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className='flex flex-col gap-3.5'>
              {/* Day Selector (Only when 1x Seminggu) */}
              {tempFrequency.includes('Seminggu') && (
                <div>
                  <label className='text-xs font-semibold text-[#1e293b] mb-1.5 block'>
                    Pilih Hari:
                  </label>
                  <div className='flex flex-wrap gap-1.5'>
                    {DAYS_OF_WEEK.map(d => (
                      <Chip key={d} size='sm' active={tempDay === d} onClick={() => setTempDay(d)}>
                        {d}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selector */}
              <div>
                <label className='text-xs font-semibold text-[#1e293b] mb-1 block'>
                  Jam Minum:
                </label>
                <div className='relative flex items-center'>
                  <Clock size={15} className='absolute left-3 text-[#94a3b8] pointer-events-none' />
                  <input
                    type='time'
                    value={tempTime}
                    onChange={e => setTempTime(e.target.value)}
                    className='w-full bg-slate-50 text-[#1e293b] font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#e11d48] pl-9 pr-3 py-2 outline-none'
                    required
                  />
                </div>
              </div>

              {/* Frequency Selector */}
              <div>
                <label className='text-xs font-semibold text-[#1e293b] mb-1 block'>
                  Frekuensi:
                </label>
                <div className='flex flex-col gap-1.5'>
                  {FREQUENCIES.map(f => (
                    <button
                      key={f}
                      type='button'
                      onClick={() => setTempFrequency(f)}
                      className={`text-left text-xs font-medium p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        tempFrequency === f
                          ? 'border-[#e11d48] bg-rose-50 text-[#be123c] font-bold'
                          : 'border-slate-200 bg-white text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      <span>{f}</span>
                      {tempFrequency === f && <Check size={13} className='text-[#e11d48]' />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remind 15 min toggle */}
              <div className='flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200'>
                <div className='flex items-center gap-2'>
                  <Bell size={15} className='text-[#e11d48]' />
                  <span className='text-xs font-medium text-[#1e293b]'>
                    Ingatkan 15 Menit Sebelumnya
                  </span>
                </div>
                <input
                  type='checkbox'
                  checked={tempRemind15}
                  onChange={e => setTempRemind15(e.target.checked)}
                  className='w-4 h-4 text-[#e11d48] accent-[#e11d48] rounded-md cursor-pointer'
                />
              </div>

              {/* Modal Buttons */}
              <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  className='flex-1'
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type='submit' variant='primary' size='sm' shape='pill' className='flex-1'>
                  {schedule ? 'Simpan' : 'Buat Jadwal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
