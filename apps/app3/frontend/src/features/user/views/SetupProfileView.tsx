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

  // Step 2 Form States (Rencana Pranikah & Jadwal TT)
  const [partnerName, setPartnerName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [lastTTStatus, setLastTTStatus] = useState<string>('TT0');
  const [selectedDay, setSelectedDay] = useState('Sabtu');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [remind15Min, setRemind15Min] = useState(true);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolOrOrg.trim()) {
      setErrorMessage('Puskesmas Rujukan / KUA wajib diisi.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await saveUserInitialSetupAction(authUser?.id || 'me', {
        profile: {
          schoolOrOrg: schoolOrOrg.trim(),
          dateOfBirth: dateOfBirth || undefined,
          bloodType: bloodType || undefined,
          height: height ? Number(height) : undefined,
          weight: weight ? Number(weight) : undefined,
          hbLevel: hbLevel ? Number(hbLevel) : undefined,
          partnerName: partnerName.trim() || undefined,
          weddingDate: weddingDate || undefined,
          ttStatus: lastTTStatus || 'TT0',
        },
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
    <div className='flex-1 min-h-[100dvh] w-full bg-gradient-to-b from-[#fafaf9] via-[#fff5f6] to-[#fafaf9] flex flex-col justify-center items-center px-3.5 sm:px-6 md:px-8 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] box-border relative overflow-x-hidden'>
      {/* Decorative desktop ambient shapes */}
      <div className='hidden md:block absolute top-12 left-12 w-72 h-72 bg-[#ffd9de]/50 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-[#aff1d0]/25 rounded-full blur-3xl pointer-events-none' />

      <div className='w-full max-w-xl min-h-[560px] bg-white rounded-3xl border border-[#ffd9de] shadow-xl shadow-rose-950/5 p-4 sm:p-8 relative z-10 flex flex-col justify-between my-auto'>
        {/* Top Header & Progress */}
        <div>
          <div className='mb-4 sm:mb-5'>
            <div className='flex items-center justify-between mb-2.5'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-[#aa294d] flex items-center justify-center text-white shadow-xs'>
                  <ShieldCheck size={18} />
                </div>
                <span className='font-black text-lg sm:text-xl tracking-tight text-[#8c0f39] uppercase'>
                  PRELUNA
                </span>
                <span className='text-[10px] uppercase font-bold tracking-widest text-[#8c0f39] bg-[#ffd9de] px-2 py-0.5 rounded-md border border-[#ffb3c0]'>
                  Catin Care
                </span>
              </div>
              <span className='text-xs font-bold text-[#8c0f39] bg-[#ffd9de] px-3 py-1 rounded-full border border-[#ffb3c0]'>
                Langkah {step} dari 2
              </span>
            </div>

            {/* Progress Bar */}
            <div className='w-full h-2 bg-stone-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-[#aa294d] transition-all duration-500 rounded-full'
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Title & Greeting */}
          <div className='mb-4 sm:mb-5 text-left'>
            <h1 className='text-xl sm:text-2xl font-bold text-[#121c2a] tracking-tight flex items-center gap-2'>
              <span>
                {step === 1 ? 'Lengkapi Data Kesehatan Catin' : 'Rencana Pranikah & Jadwal Faskes'}
              </span>
            </h1>
            <p className='text-xs sm:text-sm text-[#574144] mt-1 leading-relaxed'>
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
                <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                  Puskesmas Rujukan / KUA / Domisili <span className='text-[#aa294d]'>*</span>
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                    <Building2 size={16} />
                  </div>
                  <input
                    type='text'
                    placeholder='Contoh: Puskesmas Kebayoran Baru / KUA Jaksel'
                    value={schoolOrOrg}
                    onChange={e => setSchoolOrOrg(e.target.value)}
                    required
                    className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 pl-13 pr-4 py-2.5 sm:py-3 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs'
                  />
                </div>
              </div>

              {/* Tanggal Lahir & Golongan Darah (2 cols) */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                    Tanggal Lahir
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                      <Calendar size={14} />
                    </div>
                    <input
                      type='date'
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className='w-full min-h-[48px] min-w-0 bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 pl-12 pr-3 py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                    Golongan Darah
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                      <Droplets size={14} />
                    </div>
                    <select
                      value={bloodType}
                      onChange={e => setBloodType(e.target.value)}
                      className='w-full min-h-[48px] min-w-0 bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 pl-12 pr-3 py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs cursor-pointer'
                    >
                      <option value=''>Pilih Golongan Darah</option>
                      <option value='A'>A</option>
                      <option value='B'>B</option>
                      <option value='AB'>AB</option>
                      <option value='O'>O</option>
                      <option value='Belum Tahu'>Belum Tahu</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parameter Fisik & Lab (3 cols) */}
              <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1.5 truncate text-center sm:text-left'>
                    Tinggi <span className='text-slate-400 font-normal text-[10px]'>(cm)</span>
                  </label>
                  <input
                    type='number'
                    inputMode='numeric'
                    placeholder='160'
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className='w-full min-h-[46px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 px-2 sm:px-3 py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1.5 truncate text-center sm:text-left'>
                    Berat <span className='text-slate-400 font-normal text-[10px]'>(kg)</span>
                  </label>
                  <input
                    type='number'
                    inputMode='numeric'
                    placeholder='50'
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className='w-full min-h-[46px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 px-2 sm:px-3 py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1.5 truncate text-center sm:text-left'>
                    Hb Lab <span className='text-slate-400 font-normal text-[10px]'>(g/dL)</span>
                  </label>
                  <input
                    type='number'
                    inputMode='decimal'
                    step='0.1'
                    placeholder='12.5'
                    value={hbLevel}
                    onChange={e => setHbLevel(e.target.value)}
                    className='w-full min-h-[46px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 px-2 sm:px-3 py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs text-center'
                  />
                </div>
              </div>

              {/* Informative Note */}
              <div className='p-3 rounded-2xl bg-[#ecfdf5] border border-[#aff1d0] flex items-start gap-2.5'>
                <Activity size={16} className='text-[#2a6950] shrink-0 mt-0.5' />
                <p className='text-[11px] text-[#166534] leading-relaxed'>
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
                className='w-full sm:w-auto px-8 min-h-[48px] py-3.5 font-bold shadow-md shadow-rose-950/20 text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#aa294d] hover:bg-[#8c0f39] text-white cursor-pointer active:scale-[0.98]'
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
                  <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                    Nama Calon Pasangan
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                      <Heart size={14} />
                    </div>
                    <input
                      type='text'
                      placeholder='Nama lengkap pasangan'
                      value={partnerName}
                      onChange={e => setPartnerName(e.target.value)}
                      className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 pl-12 pr-3 py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                    Rencana Akad Nikah (Hari H)
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                      <Calendar size={14} />
                    </div>
                    <input
                      type='date'
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-stone-200 pl-12 pr-3 py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#aa294d]/10 transition-colors shadow-2xs'
                    />
                  </div>
                </div>
              </div>

              {/* TT History Preset */}
              <div>
                <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                  Riwayat Imunisasi TT Saat Ini
                </label>
                <div className='grid grid-cols-3 sm:grid-cols-6 gap-1.5'>
                  {TT_HISTORY_PRESETS.map(preset => (
                    <button
                      key={preset.code}
                      type='button'
                      onClick={() => setLastTTStatus(preset.code)}
                      className={`min-h-[44px] py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                        lastTTStatus === preset.code
                          ? 'bg-[#ffd9de]/60 border-[#aa294d] text-[#8c0f39] font-bold shadow-2xs ring-1 ring-[#aa294d]'
                          : 'bg-white border-stone-200 text-[#574144] hover:bg-stone-50 font-medium'
                      }`}
                    >
                      <span className='block text-xs font-bold'>{preset.code}</span>
                      <span className='block text-[9px] text-[#64748b] leading-tight truncate mt-0.5'>
                        {preset.label.replace('Pernah ', '')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selector */}
              <div>
                <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                  Pilih Hari Konsultasi / Kunjungan Rutin
                </label>
                <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5'>
                  {DAYS_OPTIONS.map(opt => (
                    <button
                      key={opt.day}
                      type='button'
                      onClick={() => setSelectedDay(opt.day)}
                      className={`min-h-[44px] py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 relative ${
                        selectedDay === opt.day
                          ? 'bg-[#ffd9de]/60 border-[#aa294d] text-[#8c0f39] font-bold shadow-2xs ring-1 ring-[#aa294d]'
                          : 'bg-white border-stone-200 text-[#574144] hover:bg-stone-50 font-medium'
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
                <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                  Pilih Jam Kunjungan / Notifikasi
                </label>
                <div className='grid grid-cols-3 gap-2 mb-2'>
                  {TIME_PRESETS.map(preset => (
                    <button
                      key={preset.time}
                      type='button'
                      onClick={() => setSelectedTime(preset.time)}
                      className={`min-h-[44px] py-2 px-2 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                        selectedTime === preset.time
                          ? 'bg-[#ffd9de]/60 border-[#aa294d] text-[#8c0f39] font-bold shadow-2xs ring-1 ring-[#aa294d]'
                          : 'bg-white border-stone-200 text-[#574144] hover:bg-stone-50'
                      }`}
                    >
                      <span className='block text-xs font-bold'>{preset.time}</span>
                      <span className='block text-[10px] text-[#64748b] leading-none mt-0.5'>
                        {preset.label.split(' ')[1]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className='flex items-center justify-between gap-2 bg-[#fff0f2]/60 px-3.5 py-2.5 rounded-xl border border-[#ffd9de]'>
                  <div className='flex items-center gap-2 text-xs text-[#574144] font-medium'>
                    <Clock size={15} className='text-[#aa294d]' />
                    <span>Jam kustom:</span>
                  </div>
                  <input
                    type='time'
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className='bg-white min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold text-[#121c2a] outline-none focus:border-[#aa294d]'
                  />
                </div>
              </div>

              {/* Notification Toggle (Card-Clickable) */}
              <div
                onClick={() => setRemind15Min(!remind15Min)}
                className='p-3.5 rounded-2xl bg-[#fff0f2] border border-[#ffd9de] flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform select-none'
              >
                <div className='flex items-center gap-2.5'>
                  <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#aa294d] shadow-2xs shrink-0'>
                    <Bell size={15} />
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-[#121c2a] leading-tight'>
                      Pengingat 15 Menit Sebelumnya
                    </span>
                    <span className='block text-[10px] sm:text-[11px] text-[#574144] leading-tight mt-0.5'>
                      Notifikasi pengingat jadwal imunisasi TT &amp; cek laboratorium
                    </span>
                  </div>
                </div>
                <input
                  type='checkbox'
                  checked={remind15Min}
                  onChange={e => {
                    e.stopPropagation();
                    setRemind15Min(e.target.checked);
                  }}
                  className='w-5 h-5 accent-[#aa294d] rounded cursor-pointer shrink-0 ml-2'
                />
              </div>
            </div>

            {/* Step 2 Bottom Action Row */}
            <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-stone-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3'>
              <button
                type='button'
                onClick={() => setStep(1)}
                className='w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 min-h-[48px] py-3 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-[#574144] text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer active:scale-95'
              >
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>

              <Button
                type='submit'
                variant='primary'
                size='md'
                shape='pill'
                disabled={isSaving}
                icon={
                  isSaving ? <Loader2 size={16} className='animate-spin' /> : <Check size={16} />
                }
                className='w-full sm:w-auto px-8 min-h-[48px] py-3.5 font-bold shadow-md shadow-rose-950/20 text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 bg-[#aa294d] hover:bg-[#8c0f39] text-white cursor-pointer active:scale-[0.98]'
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
