'use client';

import React from 'react';
import { LogOut, Trash2, KeyRound, ChevronRight } from 'lucide-react';

export interface ProfileSecuritySectionProps {
  title?: string;
  onLogoutClick: () => void;
  onChangePasswordClick?: () => void;
  onDeleteAccountClick?: () => void;
  lastLoginText?: string;
  logoutSubtitle?: string;
  deleteAccountSubtitle?: string;
}

export function ProfileSecuritySection({
  title = 'Aksi Akun & Keamanan',
  onLogoutClick,
  onChangePasswordClick,
  onDeleteAccountClick,
  lastLoginText,
  logoutSubtitle = 'Keluar dari akun FEMORY pada perangkat ini',
  deleteAccountSubtitle = 'Hapus permanen semua catatan riwayat dan jadwal TTD',
}: ProfileSecuritySectionProps) {
  return (
    <div>
      {title && (
        <div className='px-2 mb-1.5'>
          <h2 className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>{title}</h2>
        </div>
      )}
      <div className='rounded-2xl sm:rounded-3xl bg-white border border-rose-100/90 shadow-2xs divide-y divide-slate-100 overflow-hidden'>
        {/* Opsional: Ubah Kata Sandi bila dipanggil dari Security Section */}
        {onChangePasswordClick && (
          <div className='p-3.5 sm:p-4 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3.5 min-w-0'>
              <div className='w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60'>
                <KeyRound size={17} />
              </div>
              <div className='min-w-0'>
                <p className='text-xs sm:text-sm font-bold text-slate-800 truncate'>
                  Kata Sandi Akun
                </p>
                <p className='text-[11px] text-slate-500 truncate mt-0.5'>
                  {lastLoginText ? `Sesi aktif: ${lastLoginText}` : 'Diperbarui secara berkala'}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={onChangePasswordClick}
              className='text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/60 px-3 py-1.5 rounded-lg border border-rose-200/60 transition-colors cursor-pointer shrink-0'
            >
              Ubah
            </button>
          </div>
        )}

        {/* Keluar dari Sesi */}
        <button
          type='button'
          onClick={onLogoutClick}
          className='w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer group'
        >
          <div className='flex items-center gap-3.5 min-w-0'>
            <div className='w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60 group-hover:bg-slate-200 transition-colors'>
              <LogOut size={17} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs sm:text-sm font-bold text-slate-800'>Keluar dari Sesi</p>
              <p className='text-[11px] text-slate-500 truncate mt-0.5'>{logoutSubtitle}</p>
            </div>
          </div>
          <div className='flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0'>
            <span className='text-xs font-semibold hidden sm:inline'>Keluar</span>
            <ChevronRight size={16} />
          </div>
        </button>

        {/* Hapus Akun (Zona Bahaya) */}
        {onDeleteAccountClick && (
          <button
            type='button'
            onClick={onDeleteAccountClick}
            className='w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-rose-50/50 transition-colors cursor-pointer group'
          >
            <div className='flex items-center gap-3.5 min-w-0'>
              <div className='w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-100 transition-colors'>
                <Trash2 size={17} />
              </div>
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <p className='text-xs sm:text-sm font-bold text-rose-700'>Hapus Akun Pengguna</p>
                  <span className='inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800'>
                    Zona Bahaya
                  </span>
                </div>
                <p className='text-[11px] text-rose-600/70 truncate mt-0.5'>
                  {deleteAccountSubtitle}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-1 text-rose-400 group-hover:text-rose-600 transition-colors shrink-0'>
              <ChevronRight size={16} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileSecuritySection;
