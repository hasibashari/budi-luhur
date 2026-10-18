import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

export interface LoginFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

export function LoginForm({ hideHeader = false }: LoginFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const isJustRegistered = searchParams.get('registered') === 'true';

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleHint] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRole, setSuccessRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan email Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login({
        email,
        password,
        roleHint: selectedRoleHint,
      });

      if (res.success && res.redirectTo) {
        const isUserIncomplete = res.user?.role === 'user' && !res.isProfileComplete;
        const target = isUserIncomplete ? '/user/setup' : redirectParam || res.redirectTo;
        const roleLabel = res.user?.role === 'admin' ? 'Petugas Faskes / KUA' : 'Calon Pengantin';
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
        <div className='mb-6 text-left'>
          <h2 className='text-2xl font-extrabold text-[#121c2a] tracking-tight mb-1'>
            Masuk ke PRELUNA
          </h2>
          <p className='text-xs sm:text-sm text-[#574144]'>
            Masukkan kredensial akun Calon Pengantin atau Petugas Faskes/KUA Anda.
          </p>
        </div>
      )}

      {isJustRegistered && !errorMessage && !successRole && (
        <div className='mb-4 p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <CheckCircle2 size={16} className='text-[#2a6950] shrink-0' />
          <span>
            Akun Calon Pengantin berhasil dibuat! Silakan masuk menggunakan email dan kata sandi Anda.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className='mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <AlertCircle size={16} className='text-rose-600 shrink-0' />
          <span>{errorMessage}</span>
        </div>
      )}

      {successRole && (
        <div className='mb-4 p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <CheckCircle2 size={16} className='text-[#2a6950] shrink-0' />
          <span>
            Berhasil masuk sebagai <strong>{successRole}</strong>. Mengalihkan...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>
            Email Terdaftar
          </label>
          <div className='relative flex items-center'>
            <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d]'>
              <Mail size={15} />
            </div>
            <input
              type='email'
              inputMode='email'
              placeholder='calonpengantin@email.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete='email'
              className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-13 pr-4 py-3 outline-none focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] transition-colors shadow-2xs'
            />
          </div>
        </div>

        <div>
          <label className='text-xs font-bold text-[#121c2a] mb-1.5 block'>Kata Sandi</label>
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
              autoComplete='current-password'
              className='w-full min-h-[48px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-13 pr-11 py-3 outline-none focus:border-[#aa294d] focus:ring-1 focus:ring-[#aa294d] transition-colors shadow-2xs'
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

        <div className='flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between gap-3 mt-3 pt-1'>
          <button
            type='submit'
            disabled={loading}
            className='w-full sm:w-auto px-8 min-h-[48px] py-3 bg-[#aa294d] hover:bg-[#8c0f39] text-white rounded-full text-sm sm:text-base font-bold shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50'
          >
            {loading ? (
              <span>Masuk...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <Link
            to='#'
            onClick={e => {
              e.preventDefault();
              alert(
                'Silakan hubungi administrator fasilitas kesehatan atau KUA untuk mereset kata sandi Anda.',
              );
            }}
            className='text-xs text-[#574144] hover:text-[#aa294d] font-medium transition-colors text-center sm:text-left py-2'
          >
            Lupa kata sandi?
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
