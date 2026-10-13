'use client';

import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, description?: string, initialFriendCodes?: string[]) => Promise<boolean>;
}

export default function CreateGroupModal({
  open,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialCodesInput, setInitialCodesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const friendCodes = initialCodesInput
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);

    try {
      const ok = await onCreateGroup(name.trim(), description.trim() || undefined, friendCodes);
      if (ok) {
        setName('');
        setDescription('');
        setInitialCodesInput('');
        onClose();
      } else {
        setErrorMsg('Gagal membuat grup. Silakan coba lagi.');
      }
    } catch {
      setErrorMsg('Terjadi kendala sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={onClose} />

      <div className='relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#fce7f3] overflow-hidden flex flex-col animate-scale-up'>
        {/* Header */}
        <div className='bg-white border-b border-[#fce7f3] px-5 py-3.5 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-[#e11d48] text-white flex items-center justify-center shadow-xs'>
              <PlusCircle size={16} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-[#1e293b]'>Buat Grup Baru</h3>
              <p className='text-[11px] text-[#64748b]'>Bentuk kelompok minum TTD</p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='w-7 h-7 rounded-full bg-slate-100 text-[#64748b] hover:text-[#e11d48] flex items-center justify-center cursor-pointer transition-colors'
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className='p-4 sm:p-5 flex flex-col gap-3'>
          <div>
            <label className='text-xs font-semibold text-[#1e293b] mb-1 block'>
              Nama Grup <span className='text-[#e11d48]'>*</span>
            </label>
            <input
              type='text'
              placeholder='Contoh: Sahabat Sehat UKS'
              value={name}
              onChange={e => setName(e.target.value)}
              className='w-full bg-slate-50 text-[#1e293b] text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#e11d48] px-3.5 py-2 outline-none'
              required
            />
          </div>

          <div>
            <label className='text-xs font-semibold text-[#1e293b] mb-1 block'>
              Deskripsi <span className='text-[10px] text-[#94a3b8]'>(opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder='Tulis deskripsi singkat grup...'
              value={description}
              onChange={e => setDescription(e.target.value)}
              className='w-full bg-slate-50 text-[#1e293b] text-xs rounded-xl border border-slate-200 focus:border-[#e11d48] px-3.5 py-2 outline-none resize-none'
            />
          </div>

          <div>
            <label className='text-xs font-semibold text-[#1e293b] mb-1 block'>
              Undang Teman Awal <span className='text-[10px] text-[#94a3b8]'>(opsional)</span>
            </label>
            <input
              type='text'
              placeholder='FE-ALYA-2026, FE-NADIA-7712'
              value={initialCodesInput}
              onChange={e => setInitialCodesInput(e.target.value)}
              className='w-full bg-slate-50 text-[#1e293b] text-xs font-mono uppercase rounded-xl border border-slate-200 focus:border-[#e11d48] px-3.5 py-2 outline-none'
            />
            <span className='text-[10px] text-[#94a3b8] mt-1 block'>
              Pisahkan beberapa Friend Code dengan koma.
            </span>
          </div>

          {errorMsg && (
            <p className='text-[11px] font-medium text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200'>
              {errorMsg}
            </p>
          )}

          <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              className='flex-1'
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              shape='pill'
              className='flex-1'
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Membuat...' : 'Buat Grup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
