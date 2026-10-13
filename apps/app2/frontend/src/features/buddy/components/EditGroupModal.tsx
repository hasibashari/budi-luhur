'use client';

import React, { useState } from 'react';
import { Edit3, X } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { BuddyGroupItem } from '../types';

interface EditGroupModalProps {
  open: boolean;
  group: BuddyGroupItem;
  onClose: () => void;
  onUpdateGroup: (name: string, description?: string) => Promise<boolean>;
}

export default function EditGroupModal({
  open,
  group,
  onClose,
  onUpdateGroup,
}: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const ok = await onUpdateGroup(name.trim(), description.trim() || undefined);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Gagal memperbarui informasi grup.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in'>
      <div className='absolute inset-0' onClick={onClose} />

      <div className='relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#fce7f3] overflow-hidden flex flex-col animate-scale-up'>
        {/* Header */}
        <div className='bg-white border-b border-[#fce7f3] px-5 py-3.5 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-[#e11d48] text-white flex items-center justify-center shadow-xs'>
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-[#1e293b]'>Edit Info Grup</h3>
              <p className='text-[11px] text-[#64748b]'>Perbarui detail grup</p>
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
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Tulis deskripsi tujuan grup...'
              className='w-full bg-slate-50 text-[#1e293b] text-xs rounded-xl border border-slate-200 focus:border-[#e11d48] px-3.5 py-2 outline-none resize-none'
            />
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
