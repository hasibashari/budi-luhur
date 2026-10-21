import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { MarkdownEditor } from '@/src/shared/components/markdown';
import { generateAiArticleDraftAction } from '@/src/lib/gemini';
import { ArticleCategory } from '../types/admin.types';

export interface ArticleFormData {
  title: string;
  category: ArticleCategory;
  author?: string;
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
  onSubmit: () => Promise<void>;
  updateFormData: (data: Partial<ArticleFormData>) => void;
  showToast: (msg: string, severity: 'success' | 'error') => void;
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
}: ArticleFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 3MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = uploadEvent => {
        const base64Url = uploadEvent.target?.result as string;
        updateFormData({ imageUrl: base64Url });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateFormData({ imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateAiArticle = async () => {
    const topic = formData.title.trim() || formData.category;
    if (!topic) {
      showToast('Ketik judul atau kategori artikel terlebih dahulu', 'error');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await generateAiArticleDraftAction(topic, formData.category);
      if (res.success && res.data) {
        updateFormData({
          title: res.data.title || formData.title,
          summary: res.data.summary,
          content: res.data.content,
          readTime: res.data.readTime,
        });
        showToast('Draf artikel berhasil dibuat oleh Gemini AI!', 'success');
      } else {
        showToast(res.error || 'Gagal membuat artikel dengan AI', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat memanggil AI', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}
      onSubmit={onSubmit}
      submitText={editingId ? 'Update' : 'Publikasikan Artikel'}
      submitting={submitting}
      maxWidth='md'
    >
      {/* Cover Image Upload Section */}
      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1.5'>
          Gambar Cover Artikel
        </label>

        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          className='hidden'
          onChange={handleImageFileChange}
        />

        {formData.imageUrl ? (
          <div className='relative rounded-2xl overflow-hidden border border-pink-100 bg-slate-50'>
            <img
              src={formData.imageUrl}
              alt='Cover Preview'
              className='w-full h-36 sm:h-48 object-cover block'
            />
            <div className='absolute top-2 right-2 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm rounded-xl p-1 text-white'>
              <button
                type='button'
                className='text-xs px-2.5 py-1 rounded-lg hover:bg-white/20 font-medium transition-colors cursor-pointer'
                onClick={() => fileInputRef.current?.click()}
              >
                Ganti
              </button>
              <button
                type='button'
                onClick={handleRemoveImage}
                className='p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer'
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className='p-6 text-center border-2 border-dashed border-pink-200 rounded-2xl bg-rose-50/50 hover:bg-rose-50 hover:border-rose-400 transition-all cursor-pointer'
          >
            <div className='w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2'>
              <UploadCloud size={24} />
            </div>
            <p className='text-sm font-bold text-slate-800'>Klik untuk upload gambar cover</p>
            <p className='text-xs text-slate-400 mt-0.5'>
              Format didukung: PNG, JPG, WebP (Maksimal 3MB)
            </p>
          </div>
        )}

        <div className='relative mt-2.5'>
          <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400'>
            <ImageIcon size={16} />
          </span>
          <input
            type='text'
            placeholder='Atau tempelkan tautan URL gambar cover di sini...'
            value={formData.imageUrl}
            onChange={e => updateFormData({ imageUrl: e.target.value })}
            className='w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all'
          />
        </div>
      </div>

      <div className='p-4 rounded-2xl border border-rose-200 bg-rose-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0'>
            <Sparkles size={18} />
          </div>
          <div>
            <div className='font-bold text-slate-900 text-xs sm:text-sm'>
              Asisten Penulis Medis AI
            </div>
            <div className='text-[11px] text-slate-500'>
              Buat judul, ringkasan, dan materi edukasi otomatis dengan Gemini AI
            </div>
          </div>
        </div>

        <button
          type='button'
          disabled={isGeneratingAi}
          onClick={handleGenerateAiArticle}
          className='inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0'
        >
          <Sparkles size={14} />
          <span>{isGeneratingAi ? 'Menulis Artikel...' : 'Tulis dengan AI ✨'}</span>
        </button>
      </div>

      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Judul Artikel <span className='text-rose-500'>*</span>
        </label>
        <input
          type='text'
          value={formData.title}
          onChange={e => updateFormData({ title: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Kategori</label>
          <input
            value={formData.category}
            onChange={e => updateFormData({ category: e.target.value })}
            placeholder='Ketik nama kategori atau genre'
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Status Publikasi</label>
          <select
            value={formData.status}
            onChange={e =>
              updateFormData({
                status: e.target.value as ArticleFormData['status'],
              })
            }
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all'
          >
            <option value='Terbit'>Terbit Langsung</option>
            <option value='Draf'>Simpan Sebagai Draf</option>
          </select>
        </div>
      </div>

      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Ringkasan Singkat (Summary)
        </label>
        <textarea
          rows={2}
          placeholder='Ringkasan 1-2 kalimat untuk kartu artikel...'
          value={formData.summary}
          onChange={e => updateFormData({ summary: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none'
        />
      </div>

      <div className='pt-1'>
        <label className='block text-xs font-bold text-slate-700 mb-1.5'>
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
