import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Calendar,
  Clock,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Check,
  Bell,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { saveUserInitialSetupAction } from '../api/userRepository';
import { Button } from '@/src/shared/components/ui/Button';

const DAYS_OPTIONS = [
  { day: 'Sabtu', desc: 'Rekomendasi UKS (Akhir Pekan)', isRecommended: true },
  { day: 'Minggu', desc: 'Waktu santai di rumah', isRecommended: false },
  { day: 'Jumat', desc: 'Program TTD Bersama di Sekolah', isRecommended: false },
  { day: 'Senin', desc: 'Awal pekan bugar', isRecommended: false },
  { day: 'Selasa', desc: 'Hari biasa', isRecommended: false },
  { day: 'Rabu', desc: 'Tengah pekan', isRecommended: false },
  { day: 'Kamis', desc: 'Hari biasa', isRecommended: false },
];

const TIME_PRESETS = [
  { time: '20:00', label: '20:00 Malam', desc: 'Rekomendasi UKS (8 malam / sebelum tidur)' },
  { time: '19:00', label: '19:00 Malam', desc: 'Setelah makan malam' },
  { time: '21:00', label: '21:00 Malam', desc: 'Menjelang tidur' },
];

export function SetupProfileView() {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 Form States (Identitas Siswi & Sekolah)
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodType, setBloodType] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hbLevel, setHbLevel] = useState<string>('');

  // Step 2 Form States (Jadwal Pengingat TTD)
  const [selectedDay, setSelectedDay] = useState('Sabtu');
  const [selectedTime, setSelectedTime] = useState('20:00');
  const [remind15Min, setRemind15Min] = useState(true);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolOrOrg.trim()) {
      setErrorMessage('Silakan masukkan nama asal sekolah atau kelas Anda.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) {
      setErrorMessage('Sesi pengguna tidak valid. Silakan login kembali.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await saveUserInitialSetupAction(authUser.id, {
        schoolOrOrg: schoolOrOrg.trim(),
        dateOfBirth: dateOfBirth || undefined,
        bloodType: bloodType || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        hbLevel: hbLevel ? Number(hbLevel) : undefined,
        schedule: {
          dayOfWeek: selectedDay,
          timeSlot: selectedTime,
          remind15MinBefore: remind15Min,
          frequency: 'weekly',
          tabletName: 'Tablet Tambah Darah (TTD)',
          dosage: '1 tablet',
        },
      });

      if (res.success) {
        updateUser({
          schoolOrOrg: schoolOrOrg.trim(),
          isProfileComplete: true,
          hbLevel: hbLevel ? Number(hbLevel) : undefined,
        });
        navigate('/user/dashboard');
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan data setup profil.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem saat menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex-1 min-h-[100dvh] w-full bg-gradient-to-b from-[#fff5f7] via-[#ffe4e6]/30 to-[#fff5f7] flex flex-col justify-center items-center p-3.5 sm:p-6 md:p-8 pb-6 sm:pb-8 box-border relative overflow-x-hidden'>
      {/* Decorative desktop ambient bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl pointer-events-none' />

      <div className='w-full max-w-lg min-h-[540px] sm:min-h-[580px] bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100/90 shadow-2xl shadow-rose-950/5 p-5 sm:p-8 relative z-10 flex flex-col justify-between my-auto'>
        {/* Top Header & Progress */}
        <div>
          <div className='mb-3.5 sm:mb-5'>
            <div className='flex items-center justify-between mb-2 sm:mb-2.5'>
              <div className='flex items-center gap-1.5'>
                <span className='font-black text-lg sm:text-xl tracking-tight text-slate-800'>
                  FEMORY
                </span>
                <span className='text-base'>🌸</span>
              </div>
              <span className='text-[11px] sm:text-xs font-bold text-rose-600 bg-rose-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-rose-200'>
                Langkah {step} dari 2
              </span>
            </div>

            {/* Progress Bar */}
            <div className='w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-[#e11d48] transition-all duration-500 rounded-full'
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Title & Greeting */}
          <div className='mb-4 sm:mb-5 text-left'>
            <h1 className='text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
              <span>{step === 1 ? 'Lengkapi Data Dirimu ✨' : 'Atur Jadwal Minum TTD ⏰'}</span>
            </h1>
            <p className='text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed'>
              {step === 1
                ? `Halo, ${authUser?.name || 'Siswi Sehat'}! Masukkan asal sekolah dan data kesehatanmu untuk personalisasi pemantauan.`
                : 'Pilih hari dan jam pengingat rutin mingguan yang paling nyaman untukmu minum Tablet Tambah Darah.'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className='mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
              <AlertCircle size={16} className='text-rose-600 shrink-0' />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* STEP 1: Data Siswi & Sekolah */}
        {step === 1 && (
          <form
            onSubmit={handleNextStep}
            className='flex-1 flex flex-col justify-between animate-fade-in'
          >
            <div className='space-y-3.5 sm:space-y-4'>
              {/* School / Class Field (Required) */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                  Asal Sekolah & Kelas <span className='text-[#e11d48]'>*</span>
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-3.5 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                    <School size={15} />
                  </div>
                  <input
                    type='text'
                    placeholder='Contoh: SMA Negeri 1 Jakarta / Kelas X-3'
                    value={schoolOrOrg}
                    onChange={e => setSchoolOrOrg(e.target.value)}
                    required
                    className='w-full bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 pl-12 sm:pl-13 pr-4 py-2.5 sm:py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
                  />
                </div>
              </div>

              {/* Date of Birth & Blood Type (2-column) */}
              <div className='grid grid-cols-2 gap-2.5 sm:gap-3.5'>
                {/* Date of Birth */}
                <div className='min-w-0'>
                  <label className='block text-xs font-bold text-slate-800 mb-1.5 truncate'>
                    Tanggal Lahir{' '}
                    <span className='text-slate-400 font-normal text-[10px] sm:text-[11px]'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                      <Calendar size={13} />
                    </div>
                    <input
                      type='date'
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className='w-full min-w-0 bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 pl-10 sm:pl-11 pr-2.5 sm:pr-3 py-2.5 sm:py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
                    />
                  </div>
                </div>

                {/* Blood Type */}
                <div className='min-w-0'>
                  <label className='block text-xs font-bold text-slate-800 mb-1.5 truncate'>
                    Gol. Darah{' '}
                    <span className='text-slate-400 font-normal text-[10px] sm:text-[11px]'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                      <Droplets size={13} />
                    </div>
                    <select
                      value={bloodType}
                      onChange={e => setBloodType(e.target.value)}
                      className='w-full min-w-0 bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs cursor-pointer'
                    >
                      <option value=''>Pilih Golongan</option>
                      <option value='A'>A</option>
                      <option value='B'>B</option>
                      <option value='AB'>AB</option>
                      <option value='O'>O</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Height, Weight, Hb Level (3-column compact) */}
              <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-slate-800 mb-1.5 truncate text-center sm:text-left'>
                    Tinggi <span className='text-slate-400 font-normal text-[10px]'>(cm)</span>
                  </label>
                  <input
                    type='number'
                    placeholder='158'
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 sm:py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-slate-800 mb-1.5 truncate text-center sm:text-left'>
                    Berat <span className='text-slate-400 font-normal text-[10px]'>(kg)</span>
                  </label>
                  <input
                    type='number'
                    placeholder='48'
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 sm:py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-slate-800 mb-1.5 truncate text-center sm:text-left'>
                    Hb Lab <span className='text-slate-400 font-normal text-[10px]'>(g/dL)</span>
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    placeholder='12.4'
                    value={hbLevel}
                    onChange={e => setHbLevel(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 sm:py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs text-center'
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Bottom Action Row */}
            <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-rose-100/60 sm:border-transparent flex items-center justify-end'>
              <Button
                type='submit'
                variant='primary'
                size='md'
                shape='pill'
                icon={<ArrowRight size={16} />}
                className='w-full sm:w-auto px-8 py-3 font-bold shadow-md shadow-rose-500/20 text-xs sm:text-sm flex items-center justify-center gap-2'
              >
                Lanjut ke Jadwal
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Pengaturan Jadwal Minum TTD */}
        {step === 2 && (
          <form
            onSubmit={handleFinalSubmit}
            className='flex-1 flex flex-col justify-between animate-fade-in'
          >
            <div className='space-y-3.5 sm:space-y-4'>
              {/* Day Selector - Responsive Grid (4 cols on mobile, 7 cols on desktop) */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-2'>
                  Pilih Hari Minum TTD (1x Seminggu)
                </label>
                <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2'>
                  {DAYS_OPTIONS.map(opt => (
                    <button
                      key={opt.day}
                      type='button'
                      onClick={() => setSelectedDay(opt.day)}
                      className={`py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        selectedDay === opt.day
                          ? 'bg-rose-50 border-[#e11d48] text-[#e11d48] shadow-xs font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      {opt.isRecommended && (
                        <span className='absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-[#e11d48] text-[8px] font-black text-white rounded-full shadow-2xs'>
                          UKS
                        </span>
                      )}
                      <span className='block text-xs sm:text-sm'>{opt.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Presets & Custom Time */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-2'>
                  Pilih Jam Minum Obat
                </label>
                <div className='grid grid-cols-3 gap-2 mb-2'>
                  {TIME_PRESETS.map(preset => (
                    <button
                      key={preset.time}
                      type='button'
                      onClick={() => setSelectedTime(preset.time)}
                      className={`py-2 sm:py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                        selectedTime === preset.time
                          ? 'bg-rose-50 border-[#e11d48] text-[#e11d48] shadow-xs font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className='block text-xs sm:text-sm font-black'>{preset.time}</span>
                      <span className='block text-[10px] text-slate-400 leading-none mt-0.5'>
                        {preset.label.split(' ')[1]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Time Input */}
                <div className='flex items-center justify-between gap-2 bg-slate-50/80 px-3.5 py-2 rounded-2xl border border-slate-200'>
                  <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
                    <Clock size={14} className='text-slate-400' />
                    <span>Jam kustom:</span>
                  </div>
                  <input
                    type='time'
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className='bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#e11d48]'
                  />
                </div>
              </div>

              {/* Notification Toggle */}
              <div className='p-3 sm:p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white flex items-center justify-center text-[#e11d48] shadow-2xs shrink-0'>
                    <Bell size={14} />
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-slate-800 leading-tight'>
                      Pengingat 15 Menit Sebelumnya
                    </span>
                    <span className='block text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5'>
                      Kirim notifikasi push sebelum waktu minum
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={remind15Min}
                  onChange={e => setRemind15Min(e.target.checked)}
                  className='w-4.5 h-4.5 accent-[#e11d48] rounded cursor-pointer shrink-0 ml-2'
                />
              </div>
            </div>

            {/* Step 2 Bottom Action Row */}
            <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-rose-100/60 sm:border-transparent flex items-center justify-between gap-3'>
              <button
                type='button'
                onClick={() => setStep(1)}
                className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer'
              >
                <ArrowLeft size={15} />
                <span>Kembali</span>
              </button>

              <Button
                type='submit'
                variant='primary'
                size='md'
                shape='pill'
                disabled={isSaving}
                icon={
                  isSaving ? <Loader2 size={15} className='animate-spin' /> : <Check size={15} />
                }
                className='flex-1 sm:flex-initial px-5 sm:px-7 py-3 font-bold shadow-md shadow-rose-500/20 text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2'
              >
                {isSaving ? 'Menyimpan...' : 'Simpan & Mulai 🌸'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SetupProfileView;
