import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { MarkdownEditor } from '@/src/shared/components/markdown';
import { ArticleCategory } from '../types/admin.types';
import { resolveImageUrl } from '@/src/shared/utils/imageUrl';
import {
  getArticlePresignedUrlAction,
  uploadFileDirectToStorage,
} from '../api/adminRepository';
import { getUserArticlePresignedUrlAction } from '@/src/features/education/api/educationRepository';

export interface ArticleFormData {
  title: string;
  category: ArticleCategory;
  author: string;
  summary: string;
  content: string;
  readTime: string;
  status: 'Terbit' | 'Draf';
  imageUrl: string;
}

interface ArticleFormModalProps {
  open: boolean;
  editingId: string | null;
  formData: ArticleFormData;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (overrideImageUrl?: string) => Promise<void>;
  updateFormData: (data: Partial<ArticleFormData>) => void;
  showToast: (msg: string, severity: 'success' | 'error') => void;
  isUserMode?: boolean;
}

export default function ArticleFormModal({
  open,
  editingId,
  formData,
  submitting,
  onClose,
  onSubmit,
  updateFormData,
  showToast,
  isUserMode = false,
}: ArticleFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Bersihkan preview dan selectedFile setiap kali modal ditutup
  useEffect(() => {
    if (!open) {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 3MB', 'error');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Format berkas harus berupa PNG, JPG, atau WebP', 'error');
      return;
    }

    // Buat URL preview instan tanpa memakan memori biner
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setLocalPreviewUrl(preview);
    setSelectedFile(file);
    // CATATAN: NOL network request saat ini! Berkas baru di-upload saat tombol Simpan/Publikasikan ditekan.
  };

  const handleRemoveImage = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setSelectedFile(null);
    updateFormData({ imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async () => {
    if (isUploadingImage) return;

    // Jika admin atau user memilih berkas baru: lakukan upload sekarang (Lazy Upload on Publish)
    if (selectedFile) {
      setIsUploadingImage(true);
      try {
        // 1. Minta Pre-Signed Upload URL ke Backend
        const presignFn = isUserMode ? getUserArticlePresignedUrlAction : getArticlePresignedUrlAction;
        const presigned = await presignFn({
          filename: selectedFile.name,
          mimeType: selectedFile.type,
          fileSize: selectedFile.size,
          articleId: editingId || undefined,
        });

        if (!presigned || presigned.success === false || !presigned.uploadUrl) {
          throw new Error(presigned?.error || 'Gagal menyiapkan sesi upload presigned.');
        }

        // 2. Upload file langsung ke Cloud Storage (S3 HTTP PUT)
        const uploadRes = await uploadFileDirectToStorage(selectedFile, presigned);
        if (!uploadRes.success || !uploadRes.fileUrl) {
          throw new Error(uploadRes.error || 'Gagal mengunggah foto ke storage.');
        }

        // 3. Simpan artikel dengan URL cloud storage yang baru
        updateFormData({ imageUrl: uploadRes.fileUrl });
        await onSubmit(uploadRes.fileUrl);

        // Bersihkan objek lokal
        if (localPreviewUrl) {
          URL.revokeObjectURL(localPreviewUrl);
          setLocalPreviewUrl(null);
        }
        setSelectedFile(null);
      } catch (err: any) {
        console.error('Presigned direct upload error:', err);
        showToast(err.message || 'Gagal mengunggah gambar cover', 'error');
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      // Tidak ada file baru yang dipilih (pakai gambar yang ada atau string URL yang diinput)
      await onSubmit();
    }
  };

  const currentDisplayImage = localPreviewUrl || resolveImageUrl(formData.imageUrl);

  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={
        isUserMode
          ? editingId
            ? 'Edit Draf Artikel Saya'
            : 'Tulis Draf Artikel Baru'
          : editingId
            ? 'Edit Artikel Edukasi Pranikah'
            : 'Tulis Artikel Edukasi Baru'
      }
      onSubmit={handleFormSubmit}
      submitText={
        isUploadingImage
          ? 'Mengunggah Foto Cover...'
          : editingId
            ? isUserMode
              ? 'Simpan Perubahan Draf'
              : 'Simpan Perubahan'
            : isUserMode
              ? 'Ajukan Draf Artikel'
              : 'Publikasikan Artikel'
      }
      submitting={submitting || isUploadingImage}
      maxWidth='md'
    >
      {/* Cover Image Upload Section */}
      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
          Gambar Cover Artikel
        </label>

        <input
          type='file'
          accept='image/png,image/jpeg,image/webp'
          ref={fileInputRef}
          className='hidden'
          onChange={handleImageFileChange}
        />

        {currentDisplayImage ? (
          <div className='relative rounded-2xl overflow-hidden border border-[#eff4ff] bg-[#f8f9ff]'>
            <img
              src={currentDisplayImage}
              alt='Cover Preview'
              className='w-full h-36 sm:h-48 object-cover block'
            />
            {isUploadingImage && (
              <div className='absolute inset-0 bg-[#121c2a]/40 backdrop-blur-[2px] flex items-center justify-center gap-2 text-white text-xs font-semibold'>
                <Loader2 size={18} className='animate-spin text-white' />
                <span>Mengunggah langsung ke Cloud Storage (Pre-signed)...</span>
              </div>
            )}
            <div className='absolute top-2 right-2 flex items-center gap-1.5 bg-[#121c2a]/80 backdrop-blur-sm rounded-xl p-1 text-white'>
              <button
                type='button'
                disabled={isUploadingImage}
                className='text-xs px-2.5 py-1 rounded-lg hover:bg-white/20 font-medium transition-colors cursor-pointer disabled:opacity-50'
                onClick={() => fileInputRef.current?.click()}
              >
                Ganti
              </button>
              <button
                type='button'
                disabled={isUploadingImage}
                onClick={handleRemoveImage}
                className='p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50'
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
            className='p-6 text-center border-2 border-dashed border-[#ffd9de] rounded-2xl bg-[#f8f9ff] hover:bg-[#ffd9de]/20 transition-all cursor-pointer'
          >
            <div className='w-11 h-11 rounded-full bg-[#ffd9de] text-[#aa294d] flex items-center justify-center mx-auto mb-2'>
              {isUploadingImage ? (
                <Loader2 size={24} className='animate-spin' />
              ) : (
                <UploadCloud size={24} />
              )}
            </div>
            <p className='text-sm font-bold text-[#121c2a]'>
              {isUploadingImage
                ? 'Mengunggah langsung ke Cloud Storage...'
                : 'Klik untuk upload cover artikel'}
            </p>
            <p className='text-xs text-[#8b7074] mt-0.5'>
              Format didukung: PNG, JPG, WebP (Maksimal 3MB)
            </p>
          </div>
        )}

        <div className='relative mt-2.5'>
          <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8b7074]'>
            <ImageIcon size={16} />
          </span>
          <input
            type='text'
            placeholder='Atau tempelkan tautan URL gambar cover di sini...'
            value={formData.imageUrl}
            onChange={e => updateFormData({ imageUrl: e.target.value })}
            className='w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#dee9fc] bg-white text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
      </div>

      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Judul Artikel <span className='text-[#aa294d]'>*</span>
        </label>
        <input
          type='text'
          placeholder='Contoh: Pentingnya Vaksin TT Bagi Calon Pengantin'
          value={formData.title}
          onChange={e => updateFormData({ title: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Kategori Edukasi</label>
          <input
            value={formData.category}
            onChange={e => updateFormData({ category: e.target.value })}
            placeholder='Ketik nama kategori atau genre'
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            {isUserMode ? 'Nama Penulis' : 'Penulis / Petugas Faskes'}
          </label>
          <input
            type='text'
            value={formData.author}
            onChange={e => updateFormData({ author: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Status Publikasi</label>
          {isUserMode ? (
            <div className='flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-[#f8f9ff] text-xs text-[#574144]'>
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#ffd9de] text-[#8c0f39] border border-[#fca5a5] shrink-0'>
                Draf
              </span>
              <span>Otomatis disimpan sebagai draf dan menunggu persetujuan admin.</span>
            </div>
          ) : (
            <select
              value={formData.status}
              onChange={e =>
                updateFormData({
                  status: e.target.value as ArticleFormData['status'],
                })
              }
              className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
            >
              <option value='Terbit'>Terbit Langsung</option>
              <option value='Draf'>Simpan Sebagai Draf</option>
            </select>
          )}
        </div>
      </div>

      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Ringkasan Singkat (Summary)
        </label>
        <textarea
          rows={2}
          placeholder='Ringkasan 1-2 kalimat untuk preview kartu edukasi...'
          value={formData.summary}
          onChange={e => updateFormData({ summary: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all resize-none'
        />
      </div>

      <div className='pt-1'>
        <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
          Isi Konten Artikel (Markdown Format)
        </label>
        <MarkdownEditor
          value={formData.content}
          onChange={(content: string) => updateFormData({ content })}
          placeholder='Tuliskan materi edukasi kesehatan secara lengkap di sini menggunakan format Markdown...'
          minHeight={320}
        />
      </div>
    </CrudModalDialog>
  );
}
