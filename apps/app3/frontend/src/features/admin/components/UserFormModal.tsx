import React from 'react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import {
  GENDER_OPTIONS,
  RISK_LEVEL_OPTIONS,
  UserFormData,
  UserGender,
  RiskLevel,
} from '../constants/user.constants';

interface UserFormModalProps {
  open: boolean;
  editingId: string | null;
  formData: UserFormData;
  submitting: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateFormData: (updates: Partial<UserFormData>) => void;
}

export default function UserFormModal({
  open,
  editingId,
  formData,
  submitting,
  onClose,
  onSave,
  onUpdateFormData,
}: UserFormModalProps) {
  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Data Calon Pengantin (Catin)' : 'Tambah Calon Pengantin Baru'}
      onSubmit={onSave}
      submitText={editingId ? 'Simpan Perubahan' : 'Tambah Catin'}
      submitting={submitting}
    >
      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Nama Lengkap Calon Pengantin <span className='text-emerald-600'>*</span>
        </label>
        <input
          type='text'
          placeholder='Contoh: Siti Aisyah / Ahmad Fauzi'
          value={formData.name}
          onChange={e => onUpdateFormData({ name: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Usia (Tahun)</label>
          <input
            type='number'
            placeholder='Contoh: 24'
            value={formData.age}
            onChange={e => onUpdateFormData({ age: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Jenis Kelamin</label>
          <select
            value={formData.gender}
            onChange={e => onUpdateFormData({ gender: e.target.value as UserGender })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          >
            {GENDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Nomor WhatsApp</label>
          <input
            type='text'
            placeholder='0812-xxxx-xxxx'
            value={formData.phone}
            onChange={e => onUpdateFormData({ phone: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Alamat Email</label>
          <input
            type='email'
            placeholder='catin@example.com'
            value={formData.email}
            onChange={e => onUpdateFormData({ email: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Kesiapan & Risiko Pranikah</label>
          <select
            value={formData.riskLevel}
            onChange={e => onUpdateFormData({ riskLevel: e.target.value as RiskLevel })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          >
            {RISK_LEVEL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>
            Faskes / KUA Rujukan
          </label>
          <input
            type='text'
            placeholder='Contoh: Puskesmas Gambir - KUA Gambir'
            value={formData.assignedDoctor}
            onChange={e => onUpdateFormData({ assignedDoctor: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          />
        </div>
      </div>

      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Catatan Skrining, Pasangan, & Rencana Akad
        </label>
        <textarea
          rows={3}
          placeholder='Nama pasangan, rencana tanggal akad, hasil lab Hb/Gol Darah, atau catatan alergi obat...'
          value={formData.medicalNotes}
          onChange={e => onUpdateFormData({ medicalNotes: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none'
        />
      </div>
    </CrudModalDialog>
  );
}
