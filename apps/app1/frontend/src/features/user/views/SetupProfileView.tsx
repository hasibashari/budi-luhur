import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Calendar,
  Droplets,
  Check,
  AlertCircle,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { saveUserInitialSetupAction } from '../api/userRepository';
import { Button } from '@/src/shared/components/ui/Button';

export function SetupProfileView() {
  const navigate = useNavigate();
  const { user: authUser, updateUser, logout } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form States (Identitas Siswi & Sekolah)
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [bloodType, setBloodType] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hbLevel, setHbLevel] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolOrOrg.trim()) {
      setErrorMessage('Silakan masukkan nama asal sekolah atau kelas Anda.');
      return;
    }
    if (!authUser?.id) {
      setErrorMessage('Sesi pengguna tidak valid. Silakan login kembali.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, any> = {
        schoolOrOrg: schoolOrOrg.trim(),
        dateOfBirth: dateOfBirth || undefined,
        bloodType: bloodType || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        hbLevel: hbLevel ? Number(hbLevel) : undefined,
      };

      const res = await saveUserInitialSetupAction(authUser.id, payload);

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

      <div className='w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100/90 shadow-2xl shadow-rose-950/5 p-5 sm:p-8 relative z-10 flex flex-col justify-between my-auto'>
        {/* Top Header */}
        <div>
          <div className='mb-4 sm:mb-5'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-1.5'>
                <span className='font-black text-lg sm:text-xl tracking-tight text-slate-800'>
                  FEMORY
                </span>
                <span className='text-base'>🌸</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[11px] sm:text-xs font-bold text-rose-600 bg-rose-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-rose-200'>
                  Setup Profil
                </span>
              </div>
            </div>
          </div>

          {/* Title & Greeting */}
          <div className='mb-4 sm:mb-6 text-left'>
            <h1 className='text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
              <span>Lengkapi Data Dirimu ✨</span>
            </h1>
            <p className='text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed'>
              Halo, {authUser?.name || 'Siswi Sehat'}! Masukkan asal sekolah dan data kesehatanmu untuk personalisasi pemantauan. Pengaturan alarm pengingat dapat kamu atur kapan saja secara mandiri di menu Jadwal.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className='mb-4 p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
              <AlertCircle size={16} className='text-rose-600 shrink-0' />
              <span>
                {typeof errorMessage === 'string'
                  ? errorMessage
                  : (errorMessage as any)?.message || JSON.stringify(errorMessage)}
              </span>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className='flex-1 flex flex-col justify-between animate-fade-in'>
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
                    max={maxDate}
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

          {/* Bottom Action Row */}
          <div className='pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-rose-100/60 sm:border-transparent flex items-center justify-between gap-3'>
            <button
              type='button'
              onClick={() => logout()}
              className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer'
              title='Keluar dari sesi dan kembali ke halaman masuk'
            >
              <LogOut size={15} className='text-slate-500' />
              <span>Ganti Akun</span>
            </button>

            <Button
              type='submit'
              variant='primary'
              size='md'
              shape='pill'
              disabled={isSaving}
              icon={
                isSaving ? <Loader2 size={15} className='animate-spin' /> : <Check size={16} />
              }
              className='flex-1 sm:flex-initial px-6 sm:px-8 py-3 font-bold shadow-md shadow-rose-500/20 text-xs sm:text-sm flex items-center justify-center gap-2'
            >
              {isSaving ? 'Menyimpan...' : 'Simpan & Masuk 🌸'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetupProfileView;
