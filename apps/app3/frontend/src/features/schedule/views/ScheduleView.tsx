'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  ShieldCheck,
  Bell,
  BellRing,
  Info,
  Check,
  X,
  Edit3,
  Sparkles,
  Plus,
  CalendarPlus,
  Building2,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { Chip } from '@/src/shared/components/ui/Chip';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { TTIntervalGuideCard } from '../components/TTIntervalGuideCard';
import {
  getUserScheduleAction,
  createUserScheduleAction,
  updateUserScheduleSettingsAction,
  UserScheduleData,
} from '@/src/features/user/api/userRepository';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const FREQUENCIES = ['1x Seminggu (Konsultasi Rutin)', 'Sesuai Janji Temu Imunisasi TT'];

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form Temp States
  const [tempDay, setTempDay] = useState('Sabtu');
  const [tempTime, setTempTime] = useState('08:00');
  const [tempFrequency, setTempFrequency] = useState('1x Seminggu (Konsultasi Rutin)');
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
              data.frequency === 'Harian'
                ? 'Sesuai Janji Temu Imunisasi TT'
                : '1x Seminggu (Konsultasi Rutin)',
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
    showToast(nextEnabled ? 'Pengingat kunjungan faskes diaktifkan' : 'Pengingat faskes dinonaktifkan');

    await updateUserScheduleSettingsAction(schedule.id, {
      isEnabled: nextEnabled,
    });
  };

  const handleOpenModal = () => {
    if (schedule) {
      setTempDay(schedule.dayOfWeek);
      setTempTime(schedule.time);
      setTempFrequency(
        schedule.frequency === 'Mingguan'
          ? '1x Seminggu (Konsultasi Rutin)'
          : 'Sesuai Janji Temu Imunisasi TT',
      );
      setTempRemind15(schedule.remind15MinBefore);
    } else {
      setTempDay('Sabtu');
      setTempTime('08:00');
      setTempFrequency('1x Seminggu (Konsultasi Rutin)');
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
      showToast('Jadwal kunjungan faskes berhasil diperbarui');

      await updateUserScheduleSettingsAction(schedule.id, {
        dayOfWeek: tempDay,
        time: tempTime,
        frequency: updatedFrequency,
        remind15MinBefore: tempRemind15,
      });
    } else {
      setIsModalOpen(false);
      showToast('Jadwal kunjungan faskes berhasil dibuat');

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
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-amber-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div>
        <h2 className='text-xl sm:text-2xl font-bold text-slate-900 tracking-tight'>
          Jadwal & Pengingat Imunisasi TT Calon Pengantin
        </h2>
        <p className='text-xs sm:text-sm text-slate-600 mt-0.5'>
          Kelola janji temu suntik vaksin TT di Puskesmas dan waktu pengingat persiapan kesehatan pranikah
        </p>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600' />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* LEFT COLUMN: Active Schedule Card or Empty Schedule Card (md:col-span-7) */}
          <div className='md:col-span-7 flex flex-col gap-5'>
            {schedule ? (
              <Card padding='lg' className='relative border-emerald-200 bg-linear-to-br from-emerald-50/40 via-white to-stone-50'>
                <div className='flex items-center justify-between gap-2 mb-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs'>
                    <ShieldCheck size={14} className='text-emerald-600' />
                    <span>{schedule.tabletName || 'Imunisasi TT Pranikah'}</span>
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type='button'
                    onClick={handleToggleActive}
                    className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      schedule.isEnabled ? 'bg-emerald-600' : 'bg-stone-300'
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
                  <span className='text-xs text-slate-500 font-medium block'>
                    Hari & Waktu Kunjungan Rutin:
                  </span>
                  <div className='text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2 mt-1'>
                    <span>{schedule.dayOfWeek}</span>
                    <span className='text-emerald-700 text-xl sm:text-2xl font-bold'>
                      • {schedule.time} WIB
                    </span>
                  </div>
                  <span className='text-xs sm:text-sm font-semibold text-slate-700 mt-2 block'>
                    Poli KIA / Imunisasi Catin
                  </span>
                  {schedule.instructions && (
                    <p className='text-xs text-slate-600 mt-2 italic bg-white px-3 py-2 rounded-xl border border-stone-200'>
                      💡 {schedule.instructions}
                    </p>
                  )}
                </div>

                <div className='mt-5 pt-4 border-t border-emerald-100 flex items-center justify-between'>
                  <span className='text-xs text-slate-500 flex items-center gap-1.5'>
                    <BellRing size={14} className='text-emerald-700' />
                    {schedule.remind15MinBefore ? 'Pengingat 15 menit sebelumnya' : 'Tepat pada jam kunjungan'}
                  </span>

                  <Button
                    variant='primary'
                    size='sm'
                    shape='pill'
                    icon={<Edit3 size={13} />}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                    onClick={handleOpenModal}
                  >
                    Ubah Jadwal
                  </Button>
                </div>
              </Card>
            ) : (
              <Card
                padding='lg'
                className='text-center py-10 border-2 border-dashed border-emerald-200 bg-emerald-50/20'
              >
                <div className='w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3.5 shadow-xs'>
                  <CalendarPlus size={28} />
                </div>
                <h3 className='text-base font-bold text-slate-900'>
                  Belum Ada Jadwal Kunjungan Faskes
                </h3>
                <p className='text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1 mb-5'>
                  Atur jadwal kunjungan ke Puskesmas agar PRELUNA dapat mengingatkan jadwal imunisasi TT dan pengambilan surat keterangan sehat tepat waktu.
                </p>
                <Button
                  variant='primary'
                  size='md'
                  shape='pill'
                  icon={<Plus size={16} />}
                  className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                  onClick={handleOpenModal}
                >
                  Buat Jadwal Kunjungan
                </Button>
              </Card>
            )}

            {/* Quick Guidance Info Card */}
            <Card padding='md' className='bg-stone-50 border-stone-200'>
              <h4 className='text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5'>
                <Building2 size={14} className='text-emerald-700' />
                <span>Pelayanan Poli Pranikah di Puskesmas</span>
              </h4>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Pelayanan imunisasi TT dan skrining pranikah umumnya dilayani pada jam kerja (Senin–Jumat pukul 08:00–14:00 WIB, Sabtu pukul 08:00–12:00 WIB). Bawa KTP dan surat pengantar dari kelurahan/KUA saat berkunjung.
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Kemenkes Interval Guide & FAQs (md:col-span-5) */}
          <div className='md:col-span-5 flex flex-col gap-4'>
            <TTIntervalGuideCard />
          </div>
        </div>
      )}

      {/* Edit/Create Schedule Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          <div className='absolute inset-0' onClick={() => setIsModalOpen(false)} />
          <div className='relative z-10 w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between pb-3 border-b border-stone-100 mb-4'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center'>
                  <CalendarIcon size={16} />
                </div>
                <h3 className='text-sm sm:text-base font-bold text-slate-900'>
                  {schedule ? 'Ubah Jadwal Kunjungan' : 'Buat Jadwal Kunjungan'}
                </h3>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-7 h-7 rounded-full bg-stone-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer'
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className='flex flex-col gap-4'>
              {/* Day Selector */}
              <div>
                <label className='text-xs font-bold text-slate-800 mb-1.5 block'>
                  Pilih Hari Kunjungan:
                </label>
                <div className='flex flex-wrap gap-1.5'>
                  {DAYS_OF_WEEK.map(d => (
                    <Chip key={d} size='sm' active={tempDay === d} onClick={() => setTempDay(d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Time Selector */}
              <div>
                <label className='text-xs font-bold text-slate-800 mb-1 block'>
                  Jam Pelayanan Faskes:
                </label>
                <div className='relative flex items-center'>
                  <Clock size={15} className='absolute left-3 text-slate-400 pointer-events-none' />
                  <input
                    type='time'
                    value={tempTime}
                    onChange={e => setTempTime(e.target.value)}
                    className='w-full bg-stone-50 text-slate-900 font-semibold text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-emerald-600 pl-9 pr-3 py-2.5 outline-none'
                    required
                  />
                </div>
              </div>

              {/* Remind 15 min toggle */}
              <div className='flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200'>
                <div className='flex items-center gap-2'>
                  <Bell size={15} className='text-emerald-700' />
                  <span className='text-xs font-semibold text-slate-800'>
                    Pengingat 15 Menit Sebelumnya
                  </span>
                </div>
                <input
                  type='checkbox'
                  checked={tempRemind15}
                  onChange={e => setTempRemind15(e.target.checked)}
                  className='w-4.5 h-4.5 accent-emerald-600 rounded cursor-pointer'
                />
              </div>

              {/* Modal Buttons */}
              <div className='flex items-center gap-2 pt-3 border-t border-stone-100'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  className='flex-1 border-stone-200 text-slate-700'
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  size='sm'
                  shape='pill'
                  className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                >
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
