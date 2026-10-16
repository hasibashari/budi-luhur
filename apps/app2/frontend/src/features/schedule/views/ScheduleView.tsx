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
  ShieldAlert,
  ShieldCheck,
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
const FREQUENCIES = ['Setiap Hari (Rekomendasi Kontrasepsi)', '1x Seminggu (Jadwal Khusus)'];

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form Temp States
  const [tempDay, setTempDay] = useState('Setiap Hari');
  const [tempTime, setTempTime] = useState('20:00');
  const [tempFrequency, setTempFrequency] = useState('Setiap Hari (Rekomendasi Kontrasepsi)');
  const [tempRemind15, setTempRemind15] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        const data = await getUserScheduleAction(user?.id);
        if (isMounted) {
          setSchedule(data);
          if (data) {
            setTempDay(data.dayOfWeek || 'Setiap Hari');
            setTempTime(data.time || '20:00');
            setTempFrequency(
              data.frequency === 'Mingguan' ? '1x Seminggu (Jadwal Khusus)' : 'Setiap Hari (Rekomendasi Kontrasepsi)',
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
    showToast(nextEnabled ? 'Alarm pengingat Pil KB aktif' : 'Alarm pengingat Pil KB dinonaktifkan');

    await updateUserScheduleSettingsAction(schedule.id, {
      isEnabled: nextEnabled,
    });
  };

  const handleOpenModal = () => {
    if (schedule) {
      setTempDay(schedule.dayOfWeek || 'Setiap Hari');
      setTempTime(schedule.time || '20:00');
      setTempFrequency(
        schedule.frequency === 'Mingguan' ? '1x Seminggu (Jadwal Khusus)' : 'Setiap Hari (Rekomendasi Kontrasepsi)',
      );
      setTempRemind15(schedule.remind15MinBefore);
    } else {
      setTempDay('Setiap Hari');
      setTempTime('20:00');
      setTempFrequency('Setiap Hari (Rekomendasi Kontrasepsi)');
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
      showToast('Jadwal pengingat Pil KB berhasil diperbarui!');

      await updateUserScheduleSettingsAction(schedule.id, {
        dayOfWeek: tempDay,
        time: tempTime,
        frequency: updatedFrequency,
        remind15MinBefore: tempRemind15,
      });
    } else {
      setIsModalOpen(false);
      showToast('Jadwal pengingat Pil KB berhasil dibuat!');

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
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-teal-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div>
        <h2 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight'>
          Jadwal Pengingat Pil KB
        </h2>
        <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
          Atur jam minum rutin setiap hari untuk efektivitas perlindungan kontrasepsi 99% optimal
        </p>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16 w-full'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600' />
        </div>
      ) : (
        /* Responsive Grid: Mobile 1-col -> Tablet/Desktop 2-col */
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
          {/* LEFT COLUMN: Active Schedule Card or Empty Schedule Card (md:col-span-7) */}
          <div className='md:col-span-7 flex flex-col gap-5'>
            {schedule ? (
              <Card padding='lg' className='relative border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-slate-50/40 shadow-xs'>
                <div className='flex items-center justify-between gap-2 mb-4'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-teal-800 border border-teal-200 shadow-2xs'>
                    <Pill size={14} className='text-teal-600' />
                    <span>{schedule.dosage || '1 Tablet / Hari'}</span>
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type='button'
                    onClick={handleToggleActive}
                    className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      schedule.isEnabled ? 'bg-teal-600' : 'bg-slate-300'
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
                    Waktu Rutin Minum Pil:
                  </span>
                  <div className='text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2 mt-1'>
                    <span>{schedule.frequency === 'Mingguan' ? schedule.dayOfWeek : 'Setiap Hari'}</span>
                    <span className='text-teal-700 text-xl sm:text-2xl font-bold'>
                      • {schedule.time} WIB
                    </span>
                  </div>
                  <span className='text-xs sm:text-sm font-semibold text-slate-700 mt-2 block'>
                    {schedule.tabletName || 'Pil KB Kombinasi (28 Butir)'}
                  </span>
                  <p className='text-xs text-slate-600 mt-2 bg-white/90 px-3 py-2 rounded-xl border border-teal-100'>
                    💡 {schedule.instructions || 'Disarankan diminum sesudah makan malam pada jam yang sama setiap hari.'}
                  </p>
                </div>

                <div className='mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between'>
                  <span className='text-xs text-slate-500 flex items-center gap-1.5'>
                    <BellRing size={13} className={schedule.isEnabled ? 'text-teal-600' : 'text-slate-400'} />
                    <span>{schedule.remind15MinBefore ? 'Pengingat 15 menit sebelum' : 'Tepat pada jam'}</span>
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
                className='text-center py-10 border-2 border-dashed border-teal-200 bg-teal-50/30'
              >
                <div className='w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3.5 shadow-xs'>
                  <CalendarPlus size={28} />
                </div>
                <h3 className='text-base font-extrabold text-slate-800'>
                  Belum Ada Jadwal Pengingat Pil KB
                </h3>
                <p className='text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5'>
                  Atur jadwal rutin minum Pil KB harian agar Pilluna dapat mengingatkanmu tepat waktu untuk perlindungan optimal.
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

            {/* Quick Recommendation Info */}
            <Card padding='md' className='bg-teal-50/70 border-teal-100 shadow-xs'>
              <h4 className='text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5'>
                <span>Konsistensi Jam Minum Sangat Krusial</span>
                <span className='text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold'>Standar Medis</span>
              </h4>
              <p className='text-xs text-slate-600 leading-relaxed'>
                Meminum Pil KB pada jam yang sama setiap hari menjaga kadar hormon tetap stabil dalam sirkulasi darah, mencegah proses pelepasan sel telur (ovulasi) dengan efektivitas 99%.
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Medical Guidelines & FAQs (md:col-span-5) */}
          <div className='md:col-span-5 flex flex-col gap-4'>
            {/* Panduan Klinis Lupa Minum Pil KB */}
            <Card padding='md' className='border-slate-200/80 shadow-xs bg-white'>
              <div className='flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800 mb-3'>
                <div className='w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100'>
                  <ShieldAlert size={15} />
                </div>
                <h4>Panduan Lupa Minum Pil KB</h4>
              </div>

              <div className='space-y-3 text-xs text-slate-600 leading-relaxed'>
                <div className='p-2.5 rounded-xl bg-slate-50 border border-slate-200/80'>
                  <div className='font-bold text-slate-800 mb-0.5 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-teal-600' />
                    <span>Lupa 1 Pil (&lt; 12 Jam):</span>
                  </div>
                  <p className='text-[11px] text-slate-500'>
                    Segera minum pil yang terlupa begitu ingat. Minum pil berikutnya sesuai jadwal jam rutin biasa (boleh minum 2 pil dalam 1 hari jika waktu berdekatan). Proteksi tetap aman.
                  </p>
                </div>

                <div className='p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80'>
                  <div className='font-bold text-orange-950 mb-0.5 flex items-center gap-1'>
                    <span className='w-1.5 h-1.5 rounded-full bg-orange-600' />
                    <span>Lupa 2 Pil atau &gt; 12 Jam:</span>
                  </div>
                  <p className='text-[11px] text-orange-900/90'>
                    Minum pil terakhir yang terlupa sekarang, buang pil lain yang terlewat. Wajib gunakan pengaman tambahan (kondom) selama 7 hari berturut-turut.
                  </p>
                </div>

                <div className='p-2.5 rounded-xl bg-teal-50/70 border border-teal-100'>
                  <div className='font-bold text-teal-900 mb-0.5 flex items-center gap-1'>
                    <ShieldCheck size={13} className='text-teal-600' />
                    <span>Fase Plasebo (Baris Terakhir):</span>
                  </div>
                  <p className='text-[11px] text-teal-800/90'>
                    Jika lupa pil plasebo (7 butir terakhir), buang pil yang terlewat dan lanjutkan jadwal biasa. Tidak perlu kontrasepsi cadangan.
                  </p>
                </div>
              </div>
            </Card>

            {/* Rekomendasi Jam Minum */}
            <Card padding='md' className='border-slate-200/80 shadow-xs bg-white'>
              <div className='flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-2'>
                <Clock size={15} className='text-teal-600' />
                <span>Rekomendasi Waktu Minum</span>
              </div>
              <p className='text-xs text-slate-500 leading-relaxed'>
                Waktu paling ideal adalah <strong>malam hari (antara 20:00 - 22:00 WIB)</strong> setelah makan malam atau sebelum tidur. Ini efektif mengurangi keluhan mual pada awal adaptasi.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Edit/Create Schedule Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
          {/* Backdrop Click Dismiss */}
          <div className='absolute inset-0' onClick={() => setIsModalOpen(false)} />
          <div className='relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between pb-3 border-b border-slate-100 mb-4'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100'>
                  <CalendarIcon size={16} />
                </div>
                <h3 className='text-sm sm:text-base font-bold text-slate-800'>
                  {schedule ? 'Ubah Jadwal Pengingat Pil KB' : 'Buat Jadwal Pengingat Pil KB'}
                </h3>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer'
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className='flex flex-col gap-3.5'>
              {/* Day Selector (Only when 1x Seminggu) */}
              {tempFrequency.includes('Seminggu') && (
                <div>
                  <label className='text-xs font-semibold text-slate-700 mb-1.5 block'>
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
                <label className='text-xs font-semibold text-slate-700 mb-1 block'>
                  Jam Minum Pil:
                </label>
                <div className='relative flex items-center'>
                  <Clock size={15} className='absolute left-3 text-slate-400 pointer-events-none' />
                  <input
                    type='time'
                    value={tempTime}
                    onChange={e => setTempTime(e.target.value)}
                    className='w-full bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 pl-9 pr-3 py-2 outline-none'
                    required
                  />
                </div>
              </div>

              {/* Frequency Selector */}
              <div>
                <label className='text-xs font-semibold text-slate-700 mb-1 block'>
                  Frekuensi Konsumsi:
                </label>
                <div className='flex flex-col gap-1.5'>
                  {FREQUENCIES.map(f => (
                    <button
                      key={f}
                      type='button'
                      onClick={() => setTempFrequency(f)}
                      className={`text-left text-xs font-medium p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        tempFrequency === f
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{f}</span>
                      {tempFrequency === f && <Check size={13} className='text-teal-600' />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remind 15 min toggle */}
              <div className='flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200'>
                <div className='flex items-center gap-2'>
                  <Bell size={15} className='text-teal-600' />
                  <span className='text-xs font-medium text-slate-700'>
                    Ingatkan 15 Menit Sebelumnya
                  </span>
                </div>
                <input
                  type='checkbox'
                  checked={tempRemind15}
                  onChange={e => setTempRemind15(e.target.checked)}
                  className='w-4 h-4 text-teal-600 accent-teal-600 rounded-md cursor-pointer'
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
