import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { MarkdownEditor } from '@/src/shared/components/markdown';
import { generateAiArticleDraftAction } from '@/src/lib/gemini';
import { ArticleCategory } from '../types/admin.types';

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
        showToast('Draf materi edukasi pranikah berhasil dibuat oleh Gemini AI!', 'success');
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
      title={editingId ? 'Edit Artikel Edukasi Pranikah' : 'Tulis Artikel Edukasi Baru'}
      onSubmit={onSubmit}
      submitText={editingId ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
      submitting={submitting}
      maxWidth='md'
    >
      {/* Cover Image Upload Section */}
      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1.5'>
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
          <div className='relative rounded-2xl overflow-hidden border border-[#eff4ff] bg-[#f8f9ff]'>
            <img
              src={formData.imageUrl}
              alt='Cover Preview'
              className='w-full h-36 sm:h-48 object-cover block'
            />
            <div className='absolute top-2 right-2 flex items-center gap-1.5 bg-[#121c2a]/80 backdrop-blur-sm rounded-xl p-1 text-white'>
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
            className='p-6 text-center border-2 border-dashed border-[#ffd9de] rounded-2xl bg-[#f8f9ff] hover:bg-[#ffd9de]/20 transition-all cursor-pointer'
          >
            <div className='w-11 h-11 rounded-full bg-[#ffd9de] text-[#aa294d] flex items-center justify-center mx-auto mb-2'>
              <UploadCloud size={24} />
            </div>
            <p className='text-sm font-bold text-[#121c2a]'>Klik untuk upload cover artikel</p>
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

      {/* AI Assistant Generator Banner */}
      <div className='p-4 rounded-2xl border border-[#ffd9de]/80 bg-linear-to-r from-white via-[#eff4ff] to-[#ffd9de]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-[#ffd9de]/60 text-[#aa294d] flex items-center justify-center shrink-0 border border-[#ffd9de]'>
            <Sparkles size={18} />
          </div>
          <div>
            <div className='font-bold text-[#121c2a] text-xs sm:text-sm'>
              Asisten Penulis Medis Pranikah TEMANI AI
            </div>
            <div className='text-[11px] text-[#574144]'>
              Susun materi edukasi, ringkasan, dan rujukan klinis TT secara instan
            </div>
          </div>
        </div>

        <button
          type='button'
          disabled={isGeneratingAi}
          onClick={handleGenerateAiArticle}
          className='inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#aa294d] text-white font-bold text-xs hover:bg-[#cb4364] shadow-md shadow-[#aa294d]/20 transition-all cursor-pointer disabled:opacity-50 shrink-0'
        >
          <Sparkles size={14} />
          <span>{isGeneratingAi ? 'Menulis Artikel...' : 'Tulis dengan AI ✨'}</span>
        </button>
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
            Penulis / Petugas Faskes & KUA
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
