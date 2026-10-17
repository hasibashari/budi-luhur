import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Check,
  Bell,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Heart,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { saveUserInitialSetupAction } from '../api/userRepository';
import { Button } from '@/src/shared/components/ui/Button';

const DAYS_OPTIONS = [
  { day: 'Sabtu', desc: 'Rekomendasi Catin (Akhir Pekan)', isRecommended: true },
  { day: 'Minggu', desc: 'Waktu santai persiapan', isRecommended: false },
  { day: 'Jumat', desc: 'Jadwal Poli Pranikah Puskesmas', isRecommended: false },
  { day: 'Senin', desc: 'Awal pekan bugar', isRecommended: false },
  { day: 'Selasa', desc: 'Konsultasi klinik', isRecommended: false },
  { day: 'Rabu', desc: 'Tengah pekan', isRecommended: false },
  { day: 'Kamis', desc: 'Pemeriksaan rutin KUA', isRecommended: false },
];

const TIME_PRESETS = [
  { time: '08:00', label: '08:00 Pagi', desc: 'Jam Buka Faskes / Puskesmas' },
  { time: '13:00', label: '13:00 Siang', desc: 'Istirahat & Edukasi' },
  { time: '19:00', label: '19:00 Malam', desc: 'Waktu Santai Bersama Pasangan' },
];

const TT_HISTORY_PRESETS = [
  { code: 'TT0', label: 'Belum Pernah TT', desc: 'Perlu skrining awal TT1' },
  { code: 'TT1', label: 'Pernah TT1', desc: 'Perlu TT2 min. 4 minggu' },
  { code: 'TT2', label: 'Pernah TT2', desc: 'Perlindungan 3 tahun aktif' },
  { code: 'TT3', label: 'Pernah TT3', desc: 'Perlindungan 5 tahun aktif' },
  { code: 'TT4', label: 'Pernah TT4', desc: 'Perlindungan 10 tahun aktif' },
  { code: 'TT5', label: 'Lengkap (TT5)', desc: 'Perlindungan seumur hidup (>25 th)' },
];

export function SetupProfileView() {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 Form States (Identitas Catin & Faskes)
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodType, setBloodType] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hbLevel, setHbLevel] = useState<string>('');

  // Step 2 Form States (Rencana Akad, Riwayat TT, & Jadwal)
  const [partnerName, setPartnerName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [lastTTStatus, setLastTTStatus] = useState('TT0');
  const [selectedDay, setSelectedDay] = useState('Sabtu');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [remind15Min, setRemind15Min] = useState(true);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolOrOrg.trim()) {
      setErrorMessage('Silakan masukkan nama Puskesmas rujukan, KUA, atau faskes domisili Anda.');
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
      const notesMeta = [
        partnerName.trim() ? `Pasangan: ${partnerName.trim()}` : '',
        weddingDate ? `Rencana Akad: ${weddingDate}` : '',
        lastTTStatus ? `Status TT Awal: ${lastTTStatus}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await saveUserInitialSetupAction(authUser.id, {
        schoolOrOrg: schoolOrOrg.trim(),
        dateOfBirth: dateOfBirth || undefined,
        bloodType: bloodType || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        hbLevel: hbLevel ? Number(hbLevel) : undefined,
        notes: notesMeta || undefined,
        schedule: {
          dayOfWeek: selectedDay,
          timeSlot: selectedTime,
          remind15MinBefore: remind15Min,
          frequency: 'weekly',
          tabletName: 'Imunisasi TT / Suplementasi Pranikah',
          dosage: '1 dosis / edukasi berkala',
          instructions: 'Kunjungi Puskesmas/Faskes sesuai jadwal untuk imunisasi TT dan verifikasi surat keterangan sehat pranikah.',
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
        setErrorMessage(res.error || 'Gagal menyimpan data profil pranikah.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem saat menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex-1 min-h-[100dvh] w-full bg-linear-to-b from-emerald-50/50 via-stone-50 to-emerald-50/30 flex flex-col justify-center items-center p-3.5 sm:p-6 md:p-8 pb-6 sm:pb-8 box-border relative overflow-x-hidden'>
      {/* Decorative desktop ambient shapes */}
      <div className='hidden md:block absolute top-12 left-12 w-72 h-72 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none' />

      <div className='w-full max-w-xl min-h-[560px] bg-white rounded-3xl border border-stone-200 shadow-xl shadow-emerald-950/5 p-5 sm:p-8 relative z-10 flex flex-col justify-between my-auto'>
        {/* Top Header & Progress */}
        <div>
          <div className='mb-4 sm:mb-5'>
            <div className='flex items-center justify-between mb-2.5'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs'>
                  <ShieldCheck size={18} />
                </div>
                <span className='font-bold text-lg sm:text-xl tracking-tight text-slate-900'>
                  PRELUNA
                </span>
                <span className='text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200'>
                  Catin Care
                </span>
              </div>
              <span className='text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200'>
                Langkah {step} dari 2
              </span>
            </div>

            {/* Progress Bar */}
            <div className='w-full h-2 bg-stone-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-emerald-600 transition-all duration-500 rounded-full'
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Title & Greeting */}
          <div className='mb-4 sm:mb-5 text-left'>
            <h1 className='text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2'>
              <span>
                {step === 1 ? 'Lengkapi Data Kesehatan Catin' : 'Rencana Pranikah & Jadwal Faskes'}
              </span>
            </h1>
            <p className='text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed'>
              {step === 1
                ? `Selamat datang, ${authUser?.name || 'Calon Pengantin'}! Lengkapi faskes rujukan dan parameter kesehatan awal untuk sertifikasi kesehatan pranikah.`
                : 'Atur rencana tanggal pernikahan, riwayat status imunisasi TT Anda saat ini, dan waktu pengingat kunjungan faskes.'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className='mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
              <AlertCircle size={16} className='text-rose-600 shrink-0' />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* STEP 1: Data Catin & Faskes */}
        {step === 1 && (
          <form
            onSubmit={handleNextStep}
            className='flex-1 flex flex-col justify-between animate-fade-in'
          >
            <div className='space-y-4'>
              {/* Puskesmas / KUA / Faskes Field (Required) */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                  Puskesmas Rujukan / KUA / Domisili <span className='text-emerald-700'>*</span>
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-3.5 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700'>
                    <Building2 size={15} />
                  </div>
                  <input
                    type='text'
                    placeholder='Contoh: Puskesmas Kebayoran Baru / KUA Jaksel'
                    value={schoolOrOrg}
                    onChange={e => setSchoolOrOrg(e.target.value)}
                    required
                    className='w-full bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 pl-12 sm:pl-13 pr-4 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs'
                  />
                </div>
              </div>

              {/* Date of Birth & Blood Type (2-column) */}
              <div className='grid grid-cols-2 gap-3'>
                {/* Date of Birth */}
                <div className='min-w-0'>
                  <label className='block text-xs font-bold text-slate-800 mb-1.5 truncate'>
                    Tanggal Lahir{' '}
                    <span className='text-slate-400 font-normal text-[10px] sm:text-[11px]'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700'>
                      <Calendar size={13} />
                    </div>
                    <input
                      type='date'
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className='w-full min-w-0 bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 pl-10 sm:pl-11 pr-2.5 sm:pr-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs'
                    />
                  </div>
                </div>

                {/* Blood Type */}
                <div className='min-w-0'>
                  <label className='block text-xs font-bold text-slate-800 mb-1.5 truncate'>
                    Gol. Darah & Rhesus{' '}
                    <span className='text-slate-400 font-normal text-[10px] sm:text-[11px]'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700'>
                      <Droplets size={13} />
                    </div>
                    <select
                      value={bloodType}
                      onChange={e => setBloodType(e.target.value)}
                      className='w-full min-w-0 bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs cursor-pointer'
                    >
                      <option value=''>Pilih Golongan</option>
                      <option value='A+'>A (Rhesus +)</option>
                      <option value='B+'>B (Rhesus +)</option>
                      <option value='AB+'>AB (Rhesus +)</option>
                      <option value='O+'>O (Rhesus +)</option>
                      <option value='A-'>A (Rhesus -)</option>
                      <option value='B-'>B (Rhesus -)</option>
                      <option value='AB-'>AB (Rhesus -)</option>
                      <option value='O-'>O (Rhesus -)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Height, Weight, Hb Level (3-column compact) */}
              <div className='grid grid-cols-3 gap-2.5 sm:gap-3'>
                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-slate-800 mb-1.5 truncate text-center sm:text-left'>
                    Tinggi <span className='text-slate-400 font-normal text-[10px]'>(cm)</span>
                  </label>
                  <input
                    type='number'
                    placeholder='160'
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 px-2 sm:px-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-slate-800 mb-1.5 truncate text-center sm:text-left'>
                    Berat <span className='text-slate-400 font-normal text-[10px]'>(kg)</span>
                  </label>
                  <input
                    type='number'
                    placeholder='52'
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 px-2 sm:px-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-slate-800 mb-1.5 truncate text-center sm:text-left'>
                    Hb Lab <span className='text-slate-400 font-normal text-[10px]'>(g/dL)</span>
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    placeholder='12.5'
                    value={hbLevel}
                    onChange={e => setHbLevel(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 px-2 sm:px-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs text-center'
                  />
                </div>
              </div>

              {/* Informative Note */}
              <div className='p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5'>
                <Activity size={16} className='text-emerald-700 shrink-0 mt-0.5' />
                <p className='text-[11px] text-emerald-900 leading-relaxed'>
                  Pemeriksaan hemoglobin (Hb) dan status gizi sangat penting bagi calon ibu untuk mencegah anemia pranikah dan risiko stunting pada keturunan kelak.
                </p>
              </div>
            </div>

            {/* Step 1 Bottom Action Row */}
            <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-stone-100 flex items-center justify-end'>
              <Button
                type='submit'
                variant='primary'
                size='md'
                shape='pill'
                icon={<ArrowRight size={16} />}
                className='w-full sm:w-auto px-8 py-3 font-bold shadow-md shadow-emerald-900/10 text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white'
              >
                Lanjut ke Rencana Pranikah
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Rencana Pranikah & Jadwal Imunisasi TT */}
        {step === 2 && (
          <form
            onSubmit={handleFinalSubmit}
            className='flex-1 flex flex-col justify-between animate-fade-in'
          >
            <div className='space-y-4'>
              {/* Partner Name & Wedding Date (2 cols) */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                    Nama Calon Pasangan
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700'>
                      <Heart size={13} />
                    </div>
                    <input
                      type='text'
                      placeholder='Nama lengkap pasangan'
                      value={partnerName}
                      onChange={e => setPartnerName(e.target.value)}
                      className='w-full bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                    Rencana Akad Nikah (Hari H)
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700'>
                      <Calendar size={13} />
                    </div>
                    <input
                      type='date'
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      className='w-full bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-stone-200 pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-colors shadow-2xs'
                    />
                  </div>
                </div>
              </div>

              {/* TT History Preset */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                  Riwayat Imunisasi TT Saat Ini
                </label>
                <div className='grid grid-cols-3 sm:grid-cols-6 gap-1.5'>
                  {TT_HISTORY_PRESETS.map(preset => (
                    <button
                      key={preset.code}
                      type='button'
                      onClick={() => setLastTTStatus(preset.code)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        lastTTStatus === preset.code
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-2xs ring-1 ring-emerald-600'
                          : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50 font-medium'
                      }`}
                    >
                      <span className='block text-xs font-bold'>{preset.code}</span>
                      <span className='block text-[9px] text-slate-500 leading-tight truncate mt-0.5'>
                        {preset.label.replace('Pernah ', '')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selector */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                  Pilih Hari Konsultasi / Kunjungan Rutin
                </label>
                <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5'>
                  {DAYS_OPTIONS.map(opt => (
                    <button
                      key={opt.day}
                      type='button'
                      onClick={() => setSelectedDay(opt.day)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer relative ${
                        selectedDay === opt.day
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-2xs'
                          : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50 font-medium'
                      }`}
                    >
                      {opt.isRecommended && (
                        <span className='absolute -top-1.5 -right-1 px-1 py-0.2 bg-amber-500 text-[7px] font-bold text-white rounded-full shadow-2xs'>
                          Kemenkes
                        </span>
                      )}
                      <span className='block text-xs'>{opt.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Presets & Custom Time */}
              <div>
                <label className='block text-xs font-bold text-slate-800 mb-1.5'>
                  Pilih Jam Kunjungan / Notifikasi
                </label>
                <div className='grid grid-cols-3 gap-2 mb-2'>
                  {TIME_PRESETS.map(preset => (
                    <button
                      key={preset.time}
                      type='button'
                      onClick={() => setSelectedTime(preset.time)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedTime === preset.time
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-2xs'
                          : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className='block text-xs font-bold'>{preset.time}</span>
                      <span className='block text-[10px] text-slate-500 leading-none mt-0.5'>
                        {preset.label.split(' ')[1]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className='flex items-center justify-between gap-2 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200'>
                  <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
                    <Clock size={14} className='text-slate-400' />
                    <span>Jam kustom:</span>
                  </div>
                  <input
                    type='time'
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className='bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600'
                  />
                </div>
              </div>

              {/* Notification Toggle */}
              <div className='p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white flex items-center justify-center text-emerald-700 shadow-2xs shrink-0'>
                    <Bell size={14} />
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-slate-800 leading-tight'>
                      Pengingat 15 Menit Sebelumnya
                    </span>
                    <span className='block text-[10px] sm:text-[11px] text-slate-600 leading-tight mt-0.5'>
                      Notifikasi pengingat jadwal imunisasi TT & cek laboratorium
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={remind15Min}
                  onChange={e => setRemind15Min(e.target.checked)}
                  className='w-4.5 h-4.5 accent-emerald-600 rounded cursor-pointer shrink-0 ml-2'
                />
              </div>
            </div>

            {/* Step 2 Bottom Action Row */}
            <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-stone-100 flex items-center justify-between gap-3'>
              <button
                type='button'
                onClick={() => setStep(1)}
                className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer'
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
                className='flex-1 sm:flex-initial px-6 sm:px-8 py-3 font-bold shadow-md shadow-emerald-900/10 text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white'
              >
                {isSaving ? 'Menyimpan...' : 'Simpan & Masuk Beranda'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SetupProfileView;
