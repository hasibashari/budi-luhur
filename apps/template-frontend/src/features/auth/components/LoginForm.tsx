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
        const roleLabel = res.user?.role === 'admin' ? 'Administrator' : 'Siswi / Pengguna';
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
          <h2 className='text-2xl font-extrabold text-[#1e293b] tracking-tight mb-1'>
            Masuk ke FEMORY
          </h2>
          <p className='text-xs sm:text-sm text-[#64748b]'>
            Masukkan kredensial akun Siswi atau Administrator Anda.
          </p>
        </div>
      )}

      {isJustRegistered && !errorMessage && !successRole && (
        <div className='mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <CheckCircle2 size={16} className='text-emerald-600 shrink-0' />
          <span>
            Akun Anda telah berhasil dibuat! Silakan masuk menggunakan email dan kata sandi Anda.
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
        <div className='mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <CheckCircle2 size={16} className='text-emerald-600 shrink-0' />
          <span>
            Berhasil masuk sebagai <strong>{successRole}</strong>. Mengalihkan...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
            Email atau Nomor Telepon
          </label>
          <div className='relative flex items-center'>
            <div className='absolute left-3.5 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
              <Mail size={15} />
            </div>
            <input
              type='email'
              placeholder='nama@sekolah.sch.id'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete='email'
              className='w-full bg-white text-sm text-[#1e293b] rounded-full border border-slate-200 pl-13 pr-4 py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
            />
          </div>
        </div>

        <div>
          <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>Kata Sandi</label>
          <div className='relative flex items-center'>
            <div className='absolute left-3.5 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
              <Lock size={15} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete='current-password'
              className='w-full bg-white text-sm text-[#1e293b] rounded-full border border-slate-200 pl-13 pr-11 py-3 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1'
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-between flex-wrap gap-2 mt-2 pt-1'>
          <Link
            to='#'
            onClick={e => {
              e.preventDefault();
              alert(
                'Silakan hubungi pembina UKS atau administrator untuk mereset kata sandi Anda.',
              );
            }}
            className='text-xs text-[#64748b] hover:text-[#e11d48] font-medium transition-colors'
          >
            Lupa kata sandi?
          </Link>

          <button
            type='submit'
            disabled={loading}
            className='px-6 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-full text-sm font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50'
          >
            {loading ? (
              <span>Masuk...</span>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
