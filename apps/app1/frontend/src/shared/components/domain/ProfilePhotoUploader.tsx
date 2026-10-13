'use client';

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarSize } from '../ui/Avatar';
import { Button } from '../ui/Button';

export interface ProfilePhotoUploaderProps {
  currentAvatarUrl?: string | null;
  name?: string;
  size?: AvatarSize;
  onSaveAvatar: (newAvatarUrl: string | null) => Promise<boolean | void>;
  canEdit?: boolean;
  className?: string;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export function ProfilePhotoUploader({
  currentAvatarUrl,
  name,
  size = '3xl',
  onSaveAvatar,
  canEdit = true,
  className = '',
}: ProfilePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasChanged, setHasChanged] = useState(false);

  const handleOpenModal = () => {
    if (!canEdit) return;
    setPreviewUrl(currentAvatarUrl || null);
    setErrorMessage(null);
    setHasChanged(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  // Resize and compress image using HTML5 Canvas to keep base64 payload optimized (< 150KB)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Export as optimized webp/jpeg
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memproses gambar.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Format validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage('Format file tidak didukung. Gunakan format JPG, PNG, atau WebP.');
      return;
    }

    // 2. Size validation (Max 2MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Ukuran file terlalu besar. Maksimal 2 MB.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const compressedUrl = await compressImage(file);
      setPreviewUrl(compressedUrl);
      setHasChanged(true);
    } catch {
      setErrorMessage('Terjadi kendala saat membaca foto. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setHasChanged(true);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await onSaveAvatar(previewUrl);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving avatar:', err);
      setErrorMessage('Gagal menyimpan foto profil. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Avatar Trigger with Camera Badge */}
      <div className={`relative inline-block group ${className}`}>
        <Avatar
          src={currentAvatarUrl}
          name={name}
          size={size}
          ringClassName='ring-4 ring-rose-200 group-hover:ring-rose-400 transition-all shadow-md'
        />

        {canEdit && (
          <button
            type='button'
            onClick={handleOpenModal}
            aria-label='Ubah Foto Profil'
            title='Ubah Foto Profil'
            className='absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all cursor-pointer hover:scale-105 active:scale-95 z-10'
          >
            <Camera size={15} />
          </button>
        )}
      </div>

      {/* Interactive Photo Upload Modal Dialog (Centered) */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div
            className='bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full p-5 sm:p-6 relative overflow-hidden animate-scale-up max-h-[88dvh] sm:max-h-[90vh] flex flex-col'
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between pb-3 border-b border-slate-100 mb-5'>
              <div>
                <h3 className='text-base sm:text-lg font-bold text-[#1e293b]'>Foto Profil</h3>
                <p className='text-xs text-[#64748b] mt-0.5'>
                  Pilih foto profil personal atau gunakan inisial nama Anda
                </p>
              </div>
              <button
                type='button'
                onClick={handleCloseModal}
                disabled={isProcessing}
                className='text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer'
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className='mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2'>
                <AlertCircle size={15} className='text-rose-600 shrink-0' />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Live Avatar Preview */}
            <div className='flex flex-col items-center justify-center py-4 bg-gradient-to-b from-rose-50/50 to-white rounded-2xl border border-rose-100/60 mb-5'>
              <Avatar
                src={previewUrl}
                name={name}
                size='3xl'
                ringClassName='ring-4 ring-rose-300 shadow-xl'
              />
              <span className='text-xs font-semibold text-slate-600 mt-3'>
                {previewUrl ? 'Pratinjau Foto Profil' : 'Menggunakan Inisial Huruf Nama'}
              </span>
              <span className='text-[11px] text-slate-400 mt-0.5'>
                Format JPG, PNG, atau WebP (Maks. 2 MB)
              </span>
            </div>

            {/* Action Buttons inside Modal */}
            <div className='flex flex-col gap-2.5'>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp,image/jpg'
                className='hidden'
                onChange={handleFileChange}
              />

              <div className='grid grid-cols-2 gap-2.5'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className='flex items-center justify-center gap-2 py-2.5 px-3 bg-[#fff1f2] hover:bg-rose-100 text-[#e11d48] rounded-xl text-xs font-bold transition-all border border-rose-200 cursor-pointer disabled:opacity-50'
                >
                  <Upload size={14} />
                  <span>Pilih Foto</span>
                </button>

                <button
                  type='button'
                  onClick={handleRemovePhoto}
                  disabled={isProcessing || !previewUrl}
                  className='flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  <Trash2 size={14} className='text-rose-500' />
                  <span>Hapus Foto</span>
                </button>
              </div>

              {/* Save / Cancel Footer */}
              <div className='flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  className='px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer'
                >
                  Batal
                </button>

                <Button
                  variant='primary'
                  size='sm'
                  shape='rounded'
                  disabled={isProcessing || !hasChanged}
                  onClick={handleSave}
                  icon={isProcessing ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
                  className='text-xs py-2 px-4 shadow-md'
                >
                  {isProcessing ? 'Mengupdate...' : 'Update Foto'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePhotoUploader;
