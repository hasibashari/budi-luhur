import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface RegisterFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: string;
  colorClass: string;
  textColorClass: string;
}

function getPasswordStrength(pwd: string): PasswordStrength {
  if (!pwd) {
    return { score: 0, label: '', colorClass: '', textColorClass: '' };
  }

  let points = 0;
  if (pwd.length >= 6) points += 1;
  if (pwd.length >= 8) points += 1;
  if (/[0-9]/.test(pwd) && /[a-zA-Z]/.test(pwd)) points += 1;
  if (/[^a-zA-Z0-9]/.test(pwd) || (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd))) {
    points += 1;
  }

  if (points <= 1) {
    return {
      score: 1,
      label: 'Lemah',
      colorClass: 'bg-rose-500',
      textColorClass: 'text-rose-600',
    };
  }
  if (points === 2 || points === 3) {
    return {
      score: 2,
      label: 'Sedang',
      colorClass: 'bg-amber-500',
      textColorClass: 'text-amber-600',
    };
  }
  return {
    score: 3,
    label: 'Kuat',
    colorClass: 'bg-emerald-500',
    textColorClass: 'text-emerald-600',
  };
}

export function RegisterForm({ onSwitchTab, hideHeader = false }: RegisterFormProps) {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);
  const isConfirmTouched = confirmPassword.length > 0;
  const isPasswordMatch = isConfirmTouched && password.length > 0 && password === confirmPassword;
  const isPasswordMismatch = isConfirmTouched && password !== confirmPassword;

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Format alamat email tidak valid (contoh: nama@gmail.com).');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Silakan masukkan nomor WhatsApp Anda.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    const phoneRegex = /^(\+?62|0)8[0-9]{8,12}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Format nomor telepon tidak valid (contoh: 081234567890).');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Silakan masukkan konfirmasi kata sandi.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone,
        password,
        gender: 'Perempuan',
      });

      if (res.success) {
        setSuccessMessage(
          res.message ||
            'Pendaftaran berhasil! Akun siap digunakan. Mengalihkan ke halaman Masuk...',
        );
        setTimeout(() => {
          if (onSwitchTab) {
            onSwitchTab();
          } else {
            navigate('/auth/login?registered=true');
          }
        }, 1600);
      } else {
        setErrorMessage(res.error || 'Gagal membuat akun. Silakan coba lagi.');
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
        <div className='mb-3.5 sm:mb-4 text-left'>
          <div className='inline-flex items-center gap-1.5 mb-1'>
            <div className='w-6 h-6 rounded-md bg-[#fff0f2] border border-[#ffd9de] text-[#aa294d] flex items-center justify-center'>
              <Heart size={12} className='fill-[#aa294d]' />
            </div>
            <span className='text-[10px] font-bold text-[#8c0f39] uppercase tracking-wider'>
              Calon Pengantin
            </span>
          </div>
          <h2 className='text-xl sm:text-2xl font-black text-[#121c2a] tracking-tight mb-1'>
            Buat Akun
          </h2>
          <p className='text-xs text-[#574144] leading-relaxed'>
            Daftar untuk mulai menggunakan layanan kami.
          </p>
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

      {successMessage && (
        <div
          role='status'
          className='mb-3 p-3.5 rounded-xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs font-medium flex flex-col gap-2 animate-scale-up'
        >
          <div className='flex items-center gap-1.5 font-bold text-[#2a6950] text-xs sm:text-sm'>
            <CheckCircle2 size={16} className='text-[#2a6950] shrink-0' />
            <span>Pendaftaran Berhasil!</span>
          </div>
          <p className='text-[#166534] leading-relaxed text-xs'>{successMessage}</p>
          <div className='pt-0.5 flex items-center justify-end'>
            <button
              type='button'
              onClick={() => {
                if (onSwitchTab) onSwitchTab();
                else navigate('/auth/login?registered=true');
              }}
              className='text-xs font-bold text-[#2a6950] hover:text-[#166534] underline cursor-pointer inline-flex items-center gap-1 min-h-[32px]'
            >
              Masuk Sekarang <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-2 sm:gap-2.5'>
          {/* 1. Nama lengkap */}
          <div>
            <label htmlFor='reg-name' className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-0.5 block'>
              Nama lengkap
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-6.5 h-6.5 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <User size={13} />
              </div>
              <input
                id='reg-name'
                type='text'
                placeholder='Masukkan nama lengkap'
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete='name'
                className='w-full min-h-[40px] sm:min-h-[42px] bg-white text-base sm:text-xs text-[#121c2a] rounded-full border border-slate-200 pl-9.5 pr-3.5 py-1.5 sm:py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
              />
            </div>
          </div>

          {/* 2. Alamat email */}
          <div>
            <label htmlFor='reg-email' className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-0.5 block'>
              Alamat email
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-6.5 h-6.5 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <Mail size={13} />
              </div>
              <input
                id='reg-email'
                type='email'
                inputMode='email'
                placeholder='nama@gmail.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete='email'
                className='w-full min-h-[40px] sm:min-h-[42px] bg-white text-base sm:text-xs text-[#121c2a] rounded-full border border-slate-200 pl-9.5 pr-3.5 py-1.5 sm:py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
              />
            </div>
          </div>

          {/* 3. Nomor WhatsApp */}
          <div>
            <label htmlFor='reg-phone' className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-0.5 block'>
              Nomor WhatsApp
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-6.5 h-6.5 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <Phone size={13} />
              </div>
              <input
                id='reg-phone'
                type='tel'
                inputMode='tel'
                placeholder='081234567890'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                autoComplete='tel'
                className='w-full min-h-[40px] sm:min-h-[42px] bg-white text-base sm:text-xs text-[#121c2a] rounded-full border border-slate-200 pl-9.5 pr-3.5 py-1.5 sm:py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
              />
            </div>
          </div>

          {/* 4. Kata sandi */}
          <div>
            <label htmlFor='reg-password' className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-0.5 block'>
              Kata sandi
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-6.5 h-6.5 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <Lock size={13} />
              </div>
              <input
                id='reg-password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Minimal 8 karakter disarankan'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full min-h-[40px] sm:min-h-[42px] bg-white text-base sm:text-xs text-[#121c2a] rounded-full border border-slate-200 pl-9.5 pr-10 py-1.5 sm:py-2 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
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

            {/* Indikator Kekuatan Sandi */}
            {password.length > 0 && (
              <div className='mt-1 px-1 flex flex-col gap-1 animate-fade-in'>
                <div className='flex items-center justify-between text-[10px]'>
                  <span className='text-slate-500 font-medium'>Kekuatan sandi:</span>
                  <span className={`font-bold ${passwordStrength.textColorClass}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className='flex items-center gap-1 w-full'>
                  <div
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.colorClass : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 2 ? passwordStrength.colorClass : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 3 ? passwordStrength.colorClass : 'bg-slate-200'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Konfirmasi kata sandi */}
          <div>
            <label htmlFor='reg-confirm-password' className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-0.5 block'>
              Konfirmasi kata sandi
            </label>
            <div className='relative flex items-center'>
              <div
                className={`absolute left-2.5 w-6.5 h-6.5 rounded-full flex items-center justify-center transition-colors pointer-events-none ${
                  isPasswordMatch
                    ? 'bg-emerald-50 text-emerald-600'
                    : isPasswordMismatch
                      ? 'bg-rose-50 text-rose-500'
                      : 'bg-[#ffd9de]/50 text-[#aa294d]'
                }`}
              >
                <Lock size={13} />
              </div>
              <input
                id='reg-confirm-password'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Masukkan ulang kata sandi'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete='new-password'
                className={`w-full min-h-[40px] sm:min-h-[42px] bg-white text-base sm:text-xs text-[#121c2a] rounded-full border pl-9.5 pr-10 py-1.5 sm:py-2 outline-none transition-all shadow-2xs ${
                  isPasswordMatch
                    ? 'border-emerald-400 focus:border-emerald-500 ring-2 ring-emerald-500/15'
                    : isPasswordMismatch
                      ? 'border-rose-300 focus:border-[#aa294d] ring-2 ring-rose-500/15'
                      : 'border-slate-200 focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de]'
                }`}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer p-1 active:scale-90 transition-transform'
                aria-label={
                  showConfirmPassword
                    ? 'Sembunyikan konfirmasi kata sandi'
                    : 'Tampilkan konfirmasi kata sandi'
                }
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {isPasswordMatch && (
              <div className='flex items-center gap-1 mt-1 px-1 text-[10px] font-semibold text-emerald-600 animate-fade-in'>
                <CheckCircle2 size={12} className='text-emerald-500 shrink-0' />
                <span>Kata sandi cocok</span>
              </div>
            )}

            {isPasswordMismatch && (
              <div className='flex items-center gap-1 mt-1 px-1 text-[10px] font-medium text-rose-500 animate-fade-in'>
                <AlertCircle size={12} className='text-rose-500 shrink-0' />
                <span>Kata sandi belum cocok</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className='pt-1.5'>
            <button
              type='submit'
              disabled={loading}
              className='w-full min-h-[42px] sm:min-h-[44px] py-2.5 px-5 bg-[#aa294d] hover:bg-[#8c0f39] text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50'
            >
              {loading ? (
                <span>Membuat Akun...</span>
              ) : (
                <>
                  <span>Buat Akun</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          {/* Footer Switch */}
          <div className='mt-1.5 pt-2 border-t border-slate-100 text-center'>
            <p className='text-xs text-[#574144]'>
              Sudah punya akun?{' '}
              {onSwitchTab ? (
                <button
                  type='button'
                  onClick={onSwitchTab}
                  className='font-bold text-[#aa294d] hover:text-[#8c0f39] transition-colors underline decoration-[#ffd9de] underline-offset-4 cursor-pointer'
                >
                  Masuk di sini
                </button>
              ) : (
                <Link
                  to='/auth/login'
                  className='font-bold text-[#aa294d] hover:text-[#8c0f39] transition-colors underline decoration-[#ffd9de] underline-offset-4'
                >
                  Masuk di sini
                </Link>
              )}
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterForm;
