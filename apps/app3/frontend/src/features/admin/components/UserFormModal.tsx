import React from 'react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import {
  GENDER_OPTIONS,
  RISK_LEVEL_OPTIONS,
  TT_STATUS_OPTIONS,
  KUA_STATUS_OPTIONS,
  UserFormData,
  UserGender,
  RiskLevel,
  TTStatus,
  KUAStatus,
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
      {/* 1. Identitas Catin */}
      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Nama Lengkap Calon Pengantin <span className='text-[#aa294d]'>*</span>
        </label>
        <input
          type='text'
          placeholder='Contoh: Siti Aisyah / Ahmad Fauzi'
          value={formData.name}
          onChange={e => onUpdateFormData({ name: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Usia (Tahun)</label>
          <input
            type='number'
            inputMode='numeric'
            placeholder='Contoh: 24'
            value={formData.age}
            onChange={e => onUpdateFormData({ age: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Jenis Kelamin</label>
          <select
            value={formData.gender}
            onChange={e => onUpdateFormData({ gender: e.target.value as UserGender })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
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
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            Nomor WhatsApp <span className='text-[#aa294d]'>*</span>
          </label>
          <input
            type='text'
            inputMode='tel'
            placeholder='0812-xxxx-xxxx'
            value={formData.phone}
            onChange={e => onUpdateFormData({ phone: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Alamat Email</label>
          <input
            type='email'
            inputMode='email'
            placeholder='catin@example.com'
            value={formData.email}
            onChange={e => onUpdateFormData({ email: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-base sm:text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
      </div>

      {/* 2. Informasi Pasangan & Akad Nikah */}
      <div className='p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#ffd9de]/60 space-y-3.5'>
        <div className='text-xs font-extrabold text-[#8c0f39] uppercase tracking-wider'>
          Persiapan Akad Nikah & KUA
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
          <div>
            <label className='block text-xs font-bold text-[#121c2a] mb-1'>
              Nama Pasangan Calon Pengantin
            </label>
            <input
              type='text'
              placeholder='Contoh: Rian Pratama'
              value={formData.partnerName}
              onChange={e => onUpdateFormData({ partnerName: e.target.value })}
              className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
            />
          </div>
          <div>
            <label className='block text-xs font-bold text-[#121c2a] mb-1'>
              Tanggal Rencana Akad Nikah
            </label>
            <input
              type='date'
              value={formData.weddingDate}
              onChange={e => onUpdateFormData({ weddingDate: e.target.value })}
              className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
            />
          </div>
        </div>
      </div>

      {/* 3. Status Imunisasi TT & KUA */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            Status Dosis Imunisasi TT
          </label>
          <select
            value={formData.ttStatus}
            onChange={e => onUpdateFormData({ ttStatus: e.target.value as TTStatus })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          >
            {TT_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            Status Sertifikat Pranikah KUA
          </label>
          <select
            value={formData.kuaStatus}
            onChange={e => onUpdateFormData({ kuaStatus: e.target.value as KUAStatus })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          >
            {KUA_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            Tingkat Risiko & Kesiapan Fisik
          </label>
          <select
            value={formData.riskLevel}
            onChange={e => onUpdateFormData({ riskLevel: e.target.value as RiskLevel })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          >
            {RISK_LEVEL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            Faskes / KUA Rujukan
          </label>
          <input
            type='text'
            placeholder='Contoh: Puskesmas Gambir - KUA Gambir'
            value={formData.assignedDoctor}
            onChange={e => onUpdateFormData({ assignedDoctor: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
      </div>

      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Catatan Skrining, Hb & Riwayat Medis
        </label>
        <textarea
          rows={3}
          placeholder='Hasil skrining Hb, riwayat imunisasi masa sekolah, atau catatan alergi obat...'
          value={formData.medicalNotes}
          onChange={e => onUpdateFormData({ medicalNotes: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all resize-none'
        />
      </div>
    </CrudModalDialog>
  );
}
