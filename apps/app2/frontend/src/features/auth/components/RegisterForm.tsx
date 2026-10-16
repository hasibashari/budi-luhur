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
        gender: 'Perempuan',
      });

      if (res.success) {
        setSuccessMessage(
          res.message ||
            'Pendaftaran berhasil! Akun Anda siap digunakan. Mengalihkan ke halaman Masuk...',
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
          <h2 className='text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1'>
            Daftar Akun Pilluna
          </h2>
          <p className='text-xs sm:text-sm text-[#334155]'>
            Daftarkan akun untuk mulai memantau jadwal minum pil KB & kesehatan reproduksi.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className='mb-4 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <AlertCircle size={16} className='text-[#DC2626] shrink-0' />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className='mb-4 p-4 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-xs sm:text-sm font-medium flex flex-col gap-2 animate-scale-up'>
          <div className='flex items-center gap-2 font-bold text-[#0D9488] text-sm'>
            <CheckCircle2 size={18} className='text-[#0D9488] shrink-0' />
            <span>Pendaftaran Berhasil!</span>
          </div>
          <p className='text-[#0F172A] leading-relaxed'>{successMessage}</p>
          <div className='pt-1 flex items-center justify-end'>
            <button
              type='button'
              onClick={() => {
                if (onSwitchTab) onSwitchTab();
                else navigate('/auth/login?registered=true');
              }}
              className='text-xs font-bold text-[#0D9488] hover:underline cursor-pointer inline-flex items-center gap-1'
            >
              Masuk Sekarang <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
          <div>
            <label className='text-xs font-bold text-[#0F172A] mb-1.5 block'>Nama Lengkap</label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
                <User size={15} />
              </div>
              <input
                type='text'
                placeholder='Contoh: Ny. Anisa Rahmawati'
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete='name'
                className='w-full bg-white text-sm text-[#0F172A] rounded-full border border-slate-200 pl-13 pr-4 py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-[#0F172A] mb-1.5 block'>
              Alamat Email Aktif
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
                <Mail size={15} />
              </div>
              <input
                type='email'
                placeholder='nama@email.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete='email'
                className='w-full bg-white text-sm text-[#0F172A] rounded-full border border-slate-200 pl-13 pr-4 py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-[#0F172A] mb-1.5 block'>
              Kata Sandi (Minimal 6 karakter)
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full bg-white text-sm text-[#0F172A] rounded-full border border-slate-200 pl-13 pr-11 py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
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
            {onSwitchTab ? (
              <button
                type='button'
                onClick={onSwitchTab}
                className='text-xs text-[#64748B] hover:text-[#0D9488] font-medium transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1'
              >
                Sudah punya akun? <span className='font-bold text-[#0D9488]'>Masuk</span>
              </button>
            ) : (
              <Link
                to='/auth?tab=login'
                className='text-xs text-[#64748B] hover:text-[#0D9488] font-medium transition-colors inline-flex items-center gap-1'
              >
                Sudah punya akun? <span className='font-bold text-[#0D9488]'>Masuk</span>
              </Link>
            )}

            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-full text-sm font-bold shadow-xs shadow-[#0D9488]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50'
            >
              {loading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterForm;
