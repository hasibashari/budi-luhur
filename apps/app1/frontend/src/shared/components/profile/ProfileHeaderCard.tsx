'use client';

import React, { ReactNode } from 'react';
import { Edit2, CheckCircle2 } from 'lucide-react';
import { ProfilePhotoUploader } from '@/src/shared/components/domain/ProfilePhotoUploader';

export interface ProfileHeaderCardProps {
  name: string;
  avatarUrl?: string | null;
  roleBadgeText: string;
  roleBadgeColor?: 'admin' | 'user';
  subtitle?: string;
  verified?: boolean;
  verifiedText?: string;
  canEdit?: boolean;
  onEditClick?: () => void;
  onSaveAvatar: (newAvatarUrl: string | null) => Promise<boolean | void>;
  extraBadges?: ReactNode;
}

export function ProfileHeaderCard({
  name,
  avatarUrl,
  roleBadgeText,
  roleBadgeColor = 'user',
  subtitle,
  verified = true,
  verifiedText = 'Terverifikasi',
  canEdit = true,
  onEditClick,
  onSaveAvatar,
  extraBadges,
}: ProfileHeaderCardProps) {
  const isRoleAdmin = roleBadgeColor === 'admin';

  return (
    <div className='relative overflow-hidden rounded-3xl bg-white border border-rose-100/90 shadow-sm transition-all'>
      {/* Decorative Ambient Banner */}
      <div className='h-24 sm:h-32 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 relative'>
        <div className='absolute inset-0 bg-white/10 backdrop-blur-[1px]' />
      </div>

      {/* Profile Identity Content (Mobile: Centered Column | Desktop: Horizontal Row) */}
      <div className='px-5 sm:px-7 pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left'>
        <div className='flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-5'>
          {/* Avatar (hanya avatar yang ditarik ke atas banner) */}
          <div className='relative shrink-0 -mt-12 sm:-mt-16 ring-4 ring-white rounded-full bg-white shadow-2xs'>
            <ProfilePhotoUploader
              currentAvatarUrl={avatarUrl}
              name={name}
              size='3xl'
              onSaveAvatar={onSaveAvatar}
              canEdit={canEdit}
            />
          </div>

          {/* Info Details (berada sepenuhnya di area latar putih, nama tidak tertimpa banner) */}
          <div className='flex flex-col items-center sm:items-start min-w-0 pt-1 sm:pt-0 sm:pb-1'>
            <div className='flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 flex-wrap'>
              <h1 className='text-lg sm:text-2xl font-black text-slate-800 tracking-tight'>
                {name || 'Pengguna'}
              </h1>
              {verified && (
                <span className='inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                  <CheckCircle2 size={11} className='text-emerald-600 sm:w-3 sm:h-3' />
                  {verifiedText}
                </span>
              )}
              {extraBadges}
            </div>

            {subtitle && (
              <p className='text-xs sm:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1 max-w-xs sm:max-w-md truncate'>
                {subtitle}
              </p>
            )}

            <div className='flex items-center gap-2 mt-2.5 sm:mt-3'>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wide ${
                  isRoleAdmin
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-pink-50 text-rose-700 border border-pink-200/80'
                }`}
              >
                {roleBadgeText}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {canEdit && onEditClick && (
          <div className='shrink-0 self-center sm:self-end sm:pb-1 mt-1 sm:mt-0'>
            <button
              type='button'
              onClick={onEditClick}
              aria-label='Ubah Profil'
              className='inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-rose-700 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/90 transition-all cursor-pointer shadow-2xs active:scale-95'
            >
              <Edit2 size={13} />
              <span>Ubah Profil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHeaderCard;
