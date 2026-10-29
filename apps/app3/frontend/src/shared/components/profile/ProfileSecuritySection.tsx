import { LogOut, KeyRound, Trash2 } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

export interface ProfileSecuritySectionProps {
  onLogoutClick: () => void;
  onChangePasswordClick?: () => void;
  onDeleteAccountClick?: () => void;
  lastLoginText?: string;
  twoFactorEnabled?: boolean;
}

export function ProfileSecuritySection({
  onLogoutClick,
  onChangePasswordClick,
  onDeleteAccountClick,
  lastLoginText = 'Hari ini via Web Browser',
}: ProfileSecuritySectionProps) {
  return (
    <div className='rounded-3xl bg-white border border-stone-200 shadow-sm p-5 sm:p-6'>
      <div className='mb-4 pb-3 border-b border-stone-100'>
        <h2 className='text-sm sm:text-base font-bold text-slate-900'>
          Keamanan & Sesi Akun Catin
        </h2>
        <p className='text-xs text-slate-500 mt-0.5'>
          Kelola autentikasi, status sesi, dan kontrol privasi data Anda
        </p>
      </div>

      <div className='space-y-3.5'>
        {/* Password Management Card */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-[#ffd9de]/60 text-[#aa294d] flex items-center justify-center shrink-0 border border-[#ffd9de]'>
              <KeyRound size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-slate-900'>Kata Sandi Akun</p>
              <p className='text-[11px] text-slate-500'>
                Diperbarui secara berkala untuk proteksi optimal
              </p>
            </div>
          </div>
          {onChangePasswordClick && (
            <Button
              variant='outline'
              size='sm'
              shape='rounded'
              onClick={onChangePasswordClick}
              className='text-xs font-bold py-2 px-3.5 self-end sm:self-auto border-stone-200 hover:bg-white text-slate-700 cursor-pointer'
            >
              Ubah Password
            </Button>
          )}
        </div>

        {/* Session & Logout Card */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-stone-200/80 text-slate-700 flex items-center justify-center shrink-0'>
              <LogOut size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-slate-900'>Keluar dari Sesi</p>
              <p className='text-[11px] text-slate-500'>Sesi aktif: {lastLoginText}</p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            shape='rounded'
            icon={<LogOut size={14} />}
            onClick={onLogoutClick}
            className='text-xs font-bold py-2 px-4 self-end sm:self-auto border-stone-300 text-slate-700 hover:bg-white cursor-pointer'
          >
            Keluar Akun
          </Button>
        </div>

        {/* Danger Zone: Account Deletion */}
        {onDeleteAccountClick && (
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 mt-2'>
            <div className='flex items-start sm:items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0'>
                <Trash2 size={18} />
              </div>
              <div>
                <div className='flex items-center gap-1.5'>
                  <p className='text-xs font-bold text-rose-900'>Hapus Akun Catin</p>
                  <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200/60 text-rose-800'>
                    Zona Bahaya
                  </span>
                </div>
                <p className='text-[11px] text-rose-700 mt-0.5 max-w-md'>
                  Hapus akun dan semua riwayat vaksinasi TT, catatan jadwal, dan profil catin secara
                  permanen.
                </p>
              </div>
            </div>
            <Button
              variant='danger'
              size='sm'
              shape='rounded'
              icon={<Trash2 size={13} />}
              onClick={onDeleteAccountClick}
              className='text-xs font-bold py-2 px-3.5 self-end sm:self-auto'
            >
              Hapus Akun
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSecuritySection;
