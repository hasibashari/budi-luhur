'use client';

import React, { ReactNode } from 'react';
import { Edit2, CheckCircle2, Award } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
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
  verifiedText = 'Terverifikasi Kemenkes',
  canEdit = true,
  onEditClick,
  onSaveAvatar,
  extraBadges,
}: ProfileHeaderCardProps) {
  const isRoleAdmin = roleBadgeColor === 'admin';

  return (
    <div className='relative overflow-hidden rounded-3xl bg-white border border-[#ffd9de] shadow-sm p-5 sm:p-7'>
      {/* Background Decorative Banner */}
      <div className='absolute top-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-r from-[#aa294d] via-[#8c0f39] to-[#574144] opacity-95' />

      <div className='relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-8 sm:pt-10'>
        {/* Avatar & Identitas */}
        <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left'>
          <div className='shrink-0 -mt-6 sm:mt-0'>
            <ProfilePhotoUploader
              currentAvatarUrl={avatarUrl}
              name={name}
              size='3xl'
              onSaveAvatar={onSaveAvatar}
              canEdit={canEdit}
            />
          </div>

          <div className='space-y-1.5'>
            <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2'>
              <h1 className='text-xl sm:text-2xl font-bold text-slate-900 tracking-tight'>
                {name || 'Calon Pengantin'}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                  isRoleAdmin
                    ? 'bg-[#8c0f39] text-white shadow-xs'
                    : 'bg-[#ffd9de] text-[#8c0f39] border border-[#ffd9de]'
                }`}
              >
                {roleBadgeText}
              </span>
              {verified && (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200'>
                  <CheckCircle2 size={12} className='text-emerald-700' />
                  {verifiedText}
                </span>
              )}
              {extraBadges}
            </div>

            {subtitle && (
              <p className='text-xs sm:text-sm font-medium text-slate-500 max-w-lg'>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {canEdit && onEditClick && (
          <div className='w-full sm:w-auto mt-2 sm:mt-0'>
            <Button
              variant='outline'
              size='sm'
              shape='rounded'
              icon={<Edit2 size={13} />}
              onClick={onEditClick}
              className='w-full sm:w-auto text-xs font-bold py-2 px-3.5 border-stone-200 text-slate-700 hover:bg-stone-50 cursor-pointer'
            >
              Ubah Data Catin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHeaderCard;
