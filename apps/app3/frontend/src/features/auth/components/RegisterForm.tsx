import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface RegisterFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

export function RegisterForm({ onSwitchTab, hideHeader = false }: RegisterFormProps) {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<'Perempuan' | 'Laki-laki'>('Perempuan');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        gender,
      });

      if (res.success) {
        setSuccessMessage(
          res.message ||
            'Pendaftaran berhasil! Akun Calon Pengantin siap digunakan. Mengalihkan ke halaman Masuk...',
        );
        setTimeout(() => {
          if (onSwitchTab) {
            onSwitchTab();
          } else {
            navigate('/auth/login?registered=true');
          }
        }, 1600);
      } else {
        setErrorMessage(res.error || 'Gagal mendaftarkan akun. Silakan coba lagi.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem saat pendaftaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full'>
      {!hideHeader && (
        <div className='mb-6 text-left'>
          <h2 className='text-2xl font-extrabold text-[#121c2a] tracking-tight mb-1'>
            Daftar Akun PRELUNA
          </h2>
          <p className='text-xs sm:text-sm text-[#574144]'>
            Daftarkan akun Calon Pengantin untuk memulai pemantauan imunisasi TT dan kesehatan pranikah.
          </p>
        </div>
      )}

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

      {successMessage && (
        <div className='mb-4 p-4 rounded-2xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs sm:text-sm font-medium flex flex-col gap-2 animate-scale-up'>
          <div className='flex items-center gap-2 font-bold text-[#2a6950] text-sm'>
            <CheckCircle2 size={18} className='text-[#2a6950] shrink-0' />
            <span>Pendaftaran Berhasil!</span>
          </div>
          <p className='text-[#166534] leading-relaxed'>{successMessage}</p>
          <div className='pt-1 flex items-center justify-end'>
            <button
              type='button'
              onClick={() => {
                if (onSwitchTab) onSwitchTab();
                else navigate('/auth/login?registered=true');
              }}
              className='text-xs font-bold text-[#2a6950] hover:text-[#166534] underline cursor-pointer inline-flex items-center gap-1'
            >
              Masuk Sekarang <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
          <div>
            <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
              Nama Lengkap Calon Pengantin
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                <User size={15} />
              </div>
              <input
                type='text'
                placeholder='Contoh: Siti Rahmawati / Muhammad Rizky'
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete='name'
                className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-13 pr-4 py-2.5 outline-none focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] transition-colors shadow-2xs'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
              Jenis Kelamin
            </label>
            <div className='grid grid-cols-2 gap-2'>
              <button
                type='button'
                onClick={() => setGender('Perempuan')}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 flex items-center justify-center text-center ${
                  gender === 'Perempuan'
                    ? 'bg-[#ffd9de]/60 border-[#aa294d] text-[#8c0f39] shadow-xs'
                    : 'bg-white border-slate-200 text-[#574144] hover:bg-slate-50'
                }`}
              >
                Calon Pengantin Perempuan
              </button>
              <button
                type='button'
                onClick={() => setGender('Laki-laki')}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 flex items-center justify-center text-center ${
                  gender === 'Laki-laki'
                    ? 'bg-[#ffd9de]/60 border-[#aa294d] text-[#8c0f39] shadow-xs'
                    : 'bg-white border-slate-200 text-[#574144] hover:bg-slate-50'
                }`}
              >
                Calon Pengantin Laki-laki
              </button>
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
              Alamat Email Aktif
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                <Mail size={15} />
              </div>
              <input
                type='email'
                inputMode='email'
                placeholder='calonpengantin@gmail.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete='email'
                className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-13 pr-4 py-2.5 outline-none focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] transition-colors shadow-2xs'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
              Kata Sandi (Minimal 6 karakter)
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-13 pr-11 py-2.5 outline-none focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] transition-colors shadow-2xs'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer p-1 active:scale-90'
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between gap-3 mt-4 pt-1'>
            <button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto px-8 min-h-[48px] py-3 bg-[#aa294d] hover:bg-[#8c0f39] text-white rounded-full text-sm sm:text-base font-bold shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50'
            >
              {loading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {onSwitchTab ? (
              <button
                type='button'
                onClick={onSwitchTab}
                className='text-xs text-[#574144] hover:text-[#aa294d] font-medium transition-colors cursor-pointer bg-transparent border-none py-2 text-center sm:text-left inline-flex items-center justify-center sm:justify-start gap-1 min-h-[40px]'
              >
                Sudah punya akun? <span className='font-bold text-[#aa294d] underline underline-offset-4 decoration-[#ffd9de]'>Masuk</span>
              </button>
            ) : (
              <Link
                to='/auth?tab=login'
                className='text-xs text-[#574144] hover:text-[#aa294d] font-medium transition-colors py-2 text-center sm:text-left inline-flex items-center justify-center sm:justify-start gap-1 min-h-[40px]'
              >
                Sudah punya akun? <span className='font-bold text-[#aa294d] underline underline-offset-4 decoration-[#ffd9de]'>Masuk</span>
              </Link>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterForm;
