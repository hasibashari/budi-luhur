import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface ForgotPasswordFormProps {
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

export function ForgotPasswordForm({ hideHeader = false }: ForgotPasswordFormProps) {
  const navigate = useNavigate();
  const { verifyResetEmail, resetPassword } = useAuth();

  // Multi-step flow: 1 = Email check, 2 = Set new password
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(newPassword);
  const isConfirmTouched = confirmPassword.length > 0;
  const isPasswordMismatch = isConfirmTouched && newPassword !== confirmPassword;

  // Step 1: Verifikasi apakah email terdaftar di database
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage('Silakan masukkan alamat email yang terdaftar.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Format alamat email tidak valid (contoh: nama@gmail.com).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyResetEmail(cleanEmail);
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep(2);
      } else {
        setErrorMessage(res.error || 'Alamat email tidak terdaftar dalam sistem.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat memeriksa email. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validasi dan simpan kata sandi baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setErrorMessage('Silakan masukkan kata sandi baru Anda.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Silakan konfirmasi kata sandi baru Anda.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await resetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSuccessMessage('Kata sandi berhasil diubah! Mengalihkan ke halaman masuk...');
        setTimeout(() => {
          navigate('/auth/login?reset=true');
        }, 1200);
      } else {
        setErrorMessage(
          res.error || 'Gagal mengubah kata sandi. Sesi pemulihan mungkin telah kedaluwarsa.',
        );
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem. Silakan ulangi langkah pemulihan.');
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
              <KeyRound size={12} className='text-[#aa294d]' />
            </div>
            <span className='text-[10px] font-bold text-[#8c0f39] uppercase tracking-wider'>
              {step === 1 ? 'Pemulihan Akun' : 'Atur Ulang Sandi'}
            </span>
          </div>
          <h2 className='text-xl sm:text-2xl font-black text-[#121c2a] tracking-tight mb-1'>
            {step === 1 ? 'Lupa Kata Sandi?' : 'Buat Kata Sandi Baru'}
          </h2>
          <p className='text-xs text-[#574144] leading-relaxed'>
            {step === 1
              ? 'Masukkan alamat email yang terdaftar untuk melanjutkan pemulihan kata sandi akun Anda.'
              : 'Silakan tentukan kata sandi baru yang aman untuk akun Anda.'}
          </p>
        </div>
      )}

      {/* Pesan Kesalahan */}
      {errorMessage && (
        <div
          role='alert'
          className='mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in'
        >
          <AlertCircle size={16} className='text-rose-600 shrink-0' />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pesan Sukses */}
      {successMessage && (
        <div
          role='status'
          className='mb-3 p-3 rounded-xl bg-[#ecfdf5] border border-[#aff1d0] text-[#166534] text-xs font-semibold flex items-center gap-2 animate-fade-in'
        >
          <CheckCircle2 size={16} className='text-[#2a6950] shrink-0' />
          <span>{successMessage}</span>
        </div>
      )}

      {/* LANGKAH 1: Pengecekan Alamat Email */}
      {step === 1 && (
        <form onSubmit={handleVerifyEmail} noValidate className='flex flex-col gap-3 sm:gap-3.5'>
          <div>
            <label
              htmlFor='forgot-email'
              className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1 block'
            >
              Alamat email terdaftar
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <Mail size={13} />
              </div>
              <input
                id='forgot-email'
                type='email'
                inputMode='email'
                autoComplete='email'
                autoFocus
                placeholder='nama@gmail.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className='w-full min-h-[42px] sm:min-h-[44px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-10 pr-3.5 py-2 sm:py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
              />
            </div>
            <p className='text-[10px] sm:text-[11px] text-[#64748b] mt-1 pl-1'>
              Pastikan alamat email sesuai dengan yang digunakan saat mendaftar.
            </p>
          </div>

          <div className='pt-1'>
            <button
              type='submit'
              disabled={loading}
              className='w-full min-h-[42px] sm:min-h-[44px] py-2.5 px-5 bg-[#aa294d] hover:bg-[#8c0f39] text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50'
            >
              {loading ? (
                <span>Memeriksa Email...</span>
              ) : (
                <>
                  <span>Periksa &amp; Lanjutkan</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          <div className='mt-2.5 pt-3 border-t border-slate-100 text-center'>
            <Link
              to='/auth/login'
              className='inline-flex items-center gap-1 text-xs font-bold text-[#aa294d] hover:text-[#8c0f39] transition-colors cursor-pointer'
            >
              <ArrowLeft size={13} />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </form>
      )}

      {/* LANGKAH 2: Form Ganti Kata Sandi */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} noValidate className='flex flex-col gap-3 sm:gap-3.5'>
          {/* Badge Konfirmasi Email Terverifikasi */}
          <div className='p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-[#121c2a]'>
            <div className='flex items-center gap-2 overflow-hidden'>
              <ShieldCheck size={15} className='text-[#2a6950] shrink-0' />
              <span className='truncate font-medium text-[#64748b]'>
                Email:{' '}
                <strong className='text-[#121c2a] font-semibold'>{email.trim().toLowerCase()}</strong>
              </span>
            </div>
            <button
              type='button'
              onClick={() => {
                setStep(1);
                setResetToken('');
                setErrorMessage(null);
              }}
              className='text-[11px] text-[#aa294d] hover:underline font-bold shrink-0 ml-2 cursor-pointer'
            >
              Ganti Email
            </button>
          </div>

          {/* Kata Sandi Baru */}
          <div>
            <label
              htmlFor='reset-new-password'
              className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1 block'
            >
              Kata sandi baru
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <Lock size={13} />
              </div>
              <input
                id='reset-new-password'
                type={showNewPassword ? 'text' : 'password'}
                placeholder='Minimal 6 karakter'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full min-h-[42px] sm:min-h-[44px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border border-slate-200 pl-10 pr-10 py-2 sm:py-2.5 outline-none focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de] transition-all shadow-2xs'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer p-1 active:scale-90 transition-transform'
                aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Indikator Kekuatan Sandi */}
            {newPassword.length > 0 && (
              <div className='mt-1.5 pl-1'>
                <div className='flex items-center justify-between text-[10px] mb-1'>
                  <span className='text-[#64748b]'>Kekuatan kata sandi</span>
                  <span className={`font-bold ${passwordStrength.textColorClass}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className='h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5'>
                  <div
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.colorClass : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 2 ? passwordStrength.colorClass : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 3 ? passwordStrength.colorClass : 'bg-slate-200'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Konfirmasi Kata Sandi Baru */}
          <div>
            <label
              htmlFor='reset-confirm-password'
              className='text-[11px] sm:text-xs font-bold text-[#121c2a] mb-1 block'
            >
              Konfirmasi kata sandi baru
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-2.5 w-7 h-7 rounded-full bg-[#ffd9de]/50 flex items-center justify-center text-[#aa294d] pointer-events-none'>
                <Lock size={13} />
              </div>
              <input
                id='reset-confirm-password'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Ulangi kata sandi baru'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete='new-password'
                className={`w-full min-h-[42px] sm:min-h-[44px] bg-white text-base sm:text-sm text-[#121c2a] rounded-full border pl-10 pr-10 py-2 sm:py-2.5 outline-none transition-all shadow-2xs ${
                  isPasswordMismatch
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-[#aa294d] focus:ring-2 focus:ring-[#ffd9de]'
                }`}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer p-1 active:scale-90 transition-transform'
                aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {isPasswordMismatch && (
              <p className='text-[10px] sm:text-[11px] text-rose-600 mt-1 pl-1 font-medium'>
                Konfirmasi kata sandi tidak cocok.
              </p>
            )}
          </div>

          {/* Tombol Simpan Perubahan */}
          <div className='pt-1'>
            <button
              type='submit'
              disabled={loading || Boolean(successMessage)}
              className='w-full min-h-[42px] sm:min-h-[44px] py-2.5 px-5 bg-[#aa294d] hover:bg-[#8c0f39] text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50'
            >
              {loading ? (
                <span>Menyimpan Perubahan...</span>
              ) : (
                <>
                  <span>Simpan Perubahan</span>
                  <CheckCircle2 size={15} />
                </>
              )}
            </button>
          </div>

          {/* Link Batal */}
          <div className='mt-2 text-center'>
            <button
              type='button'
              onClick={() => {
                setStep(1);
                setResetToken('');
                setErrorMessage(null);
              }}
              className='text-xs text-[#64748b] hover:text-[#121c2a] font-medium transition-colors cursor-pointer'
            >
              Batal dan ganti email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPasswordForm;

