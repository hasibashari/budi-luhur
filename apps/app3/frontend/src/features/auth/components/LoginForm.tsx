import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface LoginFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

export function LoginForm({ onSwitchTab, hideHeader = false }: LoginFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const isJustRegistered = searchParams.get('registered') === 'true';

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRole, setSuccessRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login({
        email: email.trim(),
        password,
      });

      if (res.success && res.redirectTo) {
        const isProfileComplete = res.isProfileComplete ?? res.user?.isProfileComplete;
        const isUserIncomplete = res.user?.role === 'user' && !isProfileComplete;
        const target = isUserIncomplete ? '/user/setup' : redirectParam || res.redirectTo;
        const roleLabel = res.user?.role === 'admin' ? 'Petugas Faskes' : 'Calon Pengantin';
        setSuccessRole(roleLabel);
        setTimeout(() => {
          navigate(target);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Email atau kata sandi tidak cocok.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full'>
      {!hideHeader && (
        <div className='mb-4 sm:mb-5 text-left'>
          <div className='inline-flex items-center gap-1.5 mb-1.5'>
            <div className='w-6 h-6 rounded-md bg-[#fff0f2] border border-[#ffd9de] text-[#aa294d] flex items-center justify-center'>
              <Heart size={12} className='fill-[#aa294d]' />
            </div>
            <span className='text-[10px] font-bold text-[#8c0f39] uppercase tracking-wider'>
              Portal Masuk
            </span>
          </div>
          <h2 className='text-xl sm:text-2xl font-black text-[#121c2a] tracking-tight mb-1'>
            Masuk ke Akun
          </h2>
          <p className='text-xs text-[#574144] leading-relaxed'>
            Masuk untuk mengakses layanan dan akun Anda.
          </p>
        </div>
      )}

      {isJustRegistered && !errorMessage && !successRole && (
        <div
          role='status'
          className='mb-3 p-3 rounded-xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs font-medium flex items-center gap-2 animate-fade-in'
        >
          <CheckCircle2 size={16} className='text-[#2a6950] shrink-0' />
          <span>Akun berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.</span>
        </div>
      )}

      {errorMessage && (
        <div
          role='alert'
          className='mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in'
        >
          <AlertCircle size={16} className='text-rose-600 shrink-0' />
          <span>
            {typeof errorMessage === 'string'
              ? errorMessage
              : (errorMessage as any)?.message || JSON.stringify(errorMessage)}
          </span>
        </div>
      )}

      {successRole && (
        <div
          role='status'
          className='mb-3 p-3 rounded-xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs font-semibold flex items-center gap-2 animate-fade-in'
        >
          <CheckCircle2 size={16} className='text-[#2a6950] shrink-0' />
          <span>
            Berhasil masuk sebagai <strong>{successRole}</strong>. Mengalihkan...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-3 sm:gap-3.5'>
        <div>
          <label htmlFor='login-email' className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1 block'>
            Alamat email
          </label>
          <div className='relative flex items-center'>
            <div className='absolute left-2.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
              <Mail size={13} />
            </div>
            <input
              id='login-email'
              type='email'
              inputMode='email'
              placeholder='nama@gmail.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete='email'
              className='w-full min-h-[42px] sm:min-h-[44px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-10 pr-3.5 py-2 sm:py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
            />
          </div>
        </div>

        <div>
          <div className='flex items-center justify-between mb-1'>
            <label htmlFor='login-password' className='text-[11px] sm:text-xs font-bold text-[#121c2a]'>
              Kata sandi
            </label>
            <Link
              to='#'
              onClick={e => {
                e.preventDefault();
                alert('Silakan hubungi administrator fasilitas kesehatan untuk mereset kata sandi Anda.');
              }}
              className='text-[11px] text-[#aa294d] hover:text-[#8c0f39] font-medium transition-colors cursor-pointer'
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className='relative flex items-center'>
            <div className='absolute left-2.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
              <Lock size={13} />
            </div>
            <input
              id='login-password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Masukkan kata sandi'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete='current-password'
              className='w-full min-h-[42px] sm:min-h-[44px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-10 pr-10 py-2 sm:py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer p-1 active:scale-90 transition-transform'
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className='pt-1'>
          <button
            type='submit'
            disabled={loading}
            className='w-full min-h-[42px] sm:min-h-[44px] py-2.5 px-5 bg-[#aa294d] hover:bg-[#8c0f39] text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50'
          >
            {loading ? (
              <span>Memproses Masuk...</span>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        <div className='mt-2.5 pt-3 border-t border-slate-100 text-center'>
          <p className='text-xs text-[#574144]'>
            Belum punya akun?{' '}
            {onSwitchTab ? (
              <button
                type='button'
                onClick={onSwitchTab}
                className='font-bold text-[#aa294d] hover:text-[#8c0f39] transition-colors underline decoration-[#ffd9de] underline-offset-4 cursor-pointer'
              >
                Buat akun di sini
              </button>
            ) : (
              <Link
                to='/auth/register'
                className='font-bold text-[#aa294d] hover:text-[#8c0f39] transition-colors underline decoration-[#ffd9de] underline-offset-4'
              >
                Buat akun di sini
              </Link>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
