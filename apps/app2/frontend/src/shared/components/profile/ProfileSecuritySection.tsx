import React from 'react';
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
    <div className='rounded-3xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6'>
      <div className='mb-4 pb-3 border-b border-slate-100'>
        <h2 className='text-sm sm:text-base font-bold text-slate-800'>Keamanan & Sesi Akun</h2>
        <p className='text-xs text-slate-400 mt-0.5'>
          Kelola autentikasi, status sesi, dan kontrol privasi data Anda
        </p>
      </div>

      <div className='space-y-3.5'>
        {/* Password Management Card */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100'>
              <KeyRound size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-slate-800'>Kata Sandi Akun</p>
              <p className='text-[11px] text-slate-500'>
                Diperbarui secara berkala untuk proteksi privasi medis
              </p>
            </div>
          </div>
          {onChangePasswordClick && (
            <Button
              variant='outline'
              size='sm'
              shape='rounded'
              onClick={onChangePasswordClick}
              className='text-xs font-bold py-2 px-3.5 self-end sm:self-auto border-slate-300 hover:bg-slate-100 cursor-pointer'
            >
              Ubah Password
            </Button>
          )}
        </div>

        {/* Session & Logout Card */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0'>
              <LogOut size={18} />
            </div>
            <div>
              <p className='text-xs font-bold text-slate-800'>Keluar dari Sesi</p>
              <p className='text-[11px] text-slate-500'>Sesi aktif: {lastLoginText}</p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            shape='rounded'
            icon={<LogOut size={14} />}
            onClick={onLogoutClick}
            className='text-xs font-bold py-2 px-4 self-end sm:self-auto border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
          >
            Keluar Akun
          </Button>
        </div>

        {/* Danger Zone: Account Deletion */}
        {onDeleteAccountClick && (
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-50/50 border border-red-200/70 mt-2'>
            <div className='flex items-start sm:items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0'>
                <Trash2 size={18} />
              </div>
              <div>
                <div className='flex items-center gap-1.5'>
                  <p className='text-xs font-bold text-red-950'>Hapus Akun Pengguna</p>
                  <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-200/60 text-red-800'>
                    Zona Bahaya
                  </span>
                </div>
                <p className='text-[11px] text-red-700/80 mt-0.5 max-w-md'>
                  Hapus akun dan semua data kepatuhan pil KB, jadwal, dan preferensi secara permanen.
                </p>
              </div>
            </div>
            <Button
              variant='danger'
              size='sm'
              shape='rounded'
              onClick={onDeleteAccountClick}
              className='text-xs font-bold py-2 px-4 self-end sm:self-auto cursor-pointer shrink-0'
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
