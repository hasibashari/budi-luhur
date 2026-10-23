import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Heart,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { saveUserInitialSetupAction } from '../api/userRepository';
import { Button } from '@/src/shared/components/ui/Button';

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
  const { user: authUser, updateUser, logout } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 Form States (Identitas Catin & Faskes)
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [bloodType, setBloodType] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hbLevel, setHbLevel] = useState<string>('');

  // Step 2 Form States (Rencana Pranikah & Riwayat TT)
  const [partnerName, setPartnerName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [lastTTStatus, setLastTTStatus] = useState<string>('TT0');

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
      const res = await saveUserInitialSetupAction(authUser?.id || '', {
        schoolOrOrg: schoolOrOrg.trim(),
        dateOfBirth: dateOfBirth || undefined,
        bloodType: bloodType || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        hbLevel: hbLevel ? Number(hbLevel) : undefined,
        partnerName: partnerName.trim() || undefined,
        weddingDate: weddingDate || undefined,
        ttStatus: lastTTStatus || 'TT0',
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
                  TEMANI
                </span>
                <span className='text-[10px] uppercase font-bold tracking-widest text-[#8c0f39] bg-[#ffd9de] px-2 py-0.5 rounded-md border border-[#ffb3c0]'>
                  Catin Care
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-[#8c0f39] bg-[#ffd9de] px-3 py-1 rounded-full border border-[#ffb3c0]'>
                  Langkah {step} dari 2
                </span>
              </div>
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
                {step === 1 ? 'Lengkapi Data Kesehatan Catin' : 'Rencana Pranikah & Riwayat TT'}
              </span>
            </h1>
            <p className='text-xs sm:text-sm text-[#574144] mt-1 leading-relaxed'>
              {step === 1
                ? `Selamat datang, ${authUser?.name || 'Calon Pengantin'}! Lengkapi faskes rujukan dan parameter kesehatan awal untuk sertifikasi kesehatan pranikah.`
                : 'Atur rencana tanggal pernikahan dan riwayat status imunisasi TT Anda saat ini.'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className='mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
              <AlertCircle size={16} className='text-rose-600 shrink-0' />
              <span>
                {typeof errorMessage === 'string'
                  ? errorMessage
                  : (errorMessage as any)?.message || JSON.stringify(errorMessage)}
              </span>
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
              {/* Puskesmas / PMB / Faskes Field (Required) */}
              <div>
                <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
                  Puskesmas Rujukan / PMB / Domisili <span className='text-[#aa294d]'>*</span>
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
                      max={maxDate}
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
                  Pemeriksaan hemoglobin (Hb) dan status gizi sangat penting bagi calon ibu untuk
                  mencegah anemia pranikah dan risiko stunting pada keturunan kelak.
                </p>
              </div>
            </div>

            {/* Step 1 Bottom Action Row */}
            <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-stone-100 flex items-center justify-between gap-3'>
              <button
                type='button'
                onClick={() => logout()}
                className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 min-h-[48px] py-3.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer'
                title='Keluar dari sesi dan kembali ke halaman masuk'
              >
                <LogOut size={15} className='text-stone-500' />
                <span>Ganti Akun</span>
              </button>

              <Button
                type='submit'
                variant='primary'
                size='md'
                shape='pill'
                icon={<ArrowRight size={16} />}
                className='flex-1 sm:flex-initial px-6 sm:px-8 min-h-[48px] py-3.5 font-bold shadow-md shadow-rose-950/20 text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#aa294d] hover:bg-[#8c0f39] text-white cursor-pointer active:scale-[0.98]'
              >
                Lanjut
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
                      min={maxDate}
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

              {/* Riwayat TT disimpan sebagai data profil; jadwal imunisasi dikelola di halaman Jadwal TT */}
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
