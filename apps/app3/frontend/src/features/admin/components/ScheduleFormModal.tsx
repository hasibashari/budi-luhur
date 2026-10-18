import React from 'react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { DAYS_OF_WEEK } from '@/src/shared/constants/domain.constants';
import {
  SCHEDULE_CATEGORIES,
  FREQUENCY_OPTIONS,
  CATEGORY_PRESETS,
  ScheduleFormData,
  ScheduleCategory,
  ScheduleFrequency,
} from '../constants/schedule.constants';
import { ManagedUser } from '../types/admin.types';

interface ScheduleFormModalProps {
  open: boolean;
  editingId: string | null;
  formData: ScheduleFormData;
  users: ManagedUser[];
  submitting: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateFormData: (updates: Partial<ScheduleFormData>) => void;
}

const TT_DOSE_PRESETS = [
  { label: 'TT1 (Dosis 1)', name: 'Vaksin TT1 (Langkah Awal Pranikah)', dosage: '0.5 mL' },
  { label: 'TT2 (Dosis 2 - Siap Nikah)', name: 'Vaksin TT2 (Syarat Minimal KUA)', dosage: '0.5 mL' },
  { label: 'TT3 (Booster 1)', name: 'Vaksin TT3 (Proteksi 5 Th)', dosage: '0.5 mL' },
  { label: 'TT4 (Booster 2)', name: 'Vaksin TT4 (Proteksi 10 Th)', dosage: '0.5 mL' },
  { label: 'TT5 (Proteksi Penuh)', name: 'Vaksin TT5 (Proteksi Penuh 25+ Th)', dosage: '0.5 mL' },
];

export default function ScheduleFormModal({
  open,
  editingId,
  formData,
  users,
  submitting,
  onClose,
  onSave,
  onUpdateFormData,
}: ScheduleFormModalProps) {
  const handleCategoryChange = (cat: ScheduleCategory) => {
    const preset = CATEGORY_PRESETS[cat] || CATEGORY_PRESETS['Imunisasi TT'];
    onUpdateFormData({
      category: cat,
      frequency: preset.frequency,
      medicationName: preset.medicationName,
      instructions: preset.instructions,
    });
  };

  const handleSelectTtPreset = (name: string, dosage: string) => {
    onUpdateFormData({
      medicationName: name,
      dosage,
      category: 'Imunisasi TT',
    });
  };

  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Jadwal Imunisasi / Skrining' : 'Buat Jadwal Imunisasi TT & Skrining Baru'}
      onSubmit={onSave}
      submitText={editingId ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
      submitting={submitting}
    >
      {/* 1. Pilih Calon Pengantin */}
      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Calon Pengantin (Catin) <span className='text-[#aa294d]'>*</span>
        </label>
        <select
          value={formData.userId || formData.patientId || ''}
          onChange={e =>
            onUpdateFormData({
              userId: e.target.value,
              patientId: e.target.value,
            })
          }
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} {u.partnerName ? `& ${u.partnerName}` : ''} ({u.schoolOrOrg || 'Puskesmas Gambir'})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Kategori Layanan */}
      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Kategori Layanan Pranikah <span className='text-[#aa294d]'>*</span>
        </label>
        <select
          value={formData.category}
          onChange={e => handleCategoryChange(e.target.value as ScheduleCategory)}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
        >
          {SCHEDULE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Prefill Chips for TT Doses */}
      {formData.category === 'Imunisasi TT' && (
        <div className='p-3 rounded-2xl bg-[#f8f9ff] border border-[#ffd9de]/80'>
          <p className='text-[11px] font-bold text-[#8c0f39] mb-1.5'>
            Pilih Cepat Dosis Vaksin Tetanus Toxoid:
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {TT_DOSE_PRESETS.map(dose => {
              const isSelected = formData.medicationName === dose.name;
              return (
                <button
                  key={dose.label}
                  type='button'
                  onClick={() => handleSelectTtPreset(dose.name, dose.dosage)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#aa294d] text-white shadow-2xs'
                      : 'bg-white border border-[#dee9fc] text-[#574144] hover:bg-[#eff4ff] hover:text-[#aa294d]'
                  }`}
                >
                  {dose.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Nama Vaksin / Layanan */}
      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Nama Vaksin / Layanan Kesehatan <span className='text-[#aa294d]'>*</span>
        </label>
        <input
          type='text'
          placeholder='Contoh: Vaksin Tetanus Toxoid (TT Catin) / Skrining Darah'
          value={formData.medicationName}
          onChange={e => onUpdateFormData({ medicationName: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Dosis / Sesi</label>
          <input
            type='text'
            placeholder='Contoh: 0.5 mL (Intramuskular)'
            value={formData.dosage}
            onChange={e => onUpdateFormData({ dosage: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>Frekuensi Layanan</label>
          <select
            value={formData.frequency}
            onChange={e =>
              onUpdateFormData({
                frequency: e.target.value as ScheduleFrequency,
              })
            }
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
          >
            {FREQUENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formData.frequency !== 'Harian' ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='block text-xs font-bold text-[#121c2a] mb-1'>
              Hari Pelaksanaan <span className='text-[#aa294d]'>*</span>
            </label>
            <select
              value={formData.dayOfWeek || 'Sabtu'}
              onChange={e => onUpdateFormData({ dayOfWeek: e.target.value })}
              className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all cursor-pointer'
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>
                  {day === 'Sabtu' ? 'Sabtu (Pagi)' : day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-xs font-bold text-[#121c2a] mb-1'>
              Jam Layanan / Pengingat (HH:MM) <span className='text-[#aa294d]'>*</span>
            </label>
            <input
              type='text'
              placeholder='09:00'
              value={formData.timeSlot}
              onChange={e => onUpdateFormData({ timeSlot: e.target.value })}
              className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
            />
          </div>
        </div>
      ) : (
        <div>
          <label className='block text-xs font-bold text-[#121c2a] mb-1'>
            Jam Pengingat Harian (HH:MM) <span className='text-[#aa294d]'>*</span>
          </label>
          <input
            type='text'
            placeholder='20:00'
            value={formData.timeSlot}
            onChange={e => onUpdateFormData({ timeSlot: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all'
          />
          <p className='text-[11px] text-[#8b7074] mt-1'>
            * Jadwal harian berlaku setiap hari pada jam pengingat di atas.
          </p>
        </div>
      )}

      <div>
        <label className='block text-xs font-bold text-[#121c2a] mb-1'>
          Petunjuk Khusus & Persyaratan Dokumen Faskes
        </label>
        <textarea
          rows={2}
          placeholder='Bawa KTP, buku KIA/sertifikat vaksinasi, dan kenakan pakaian longgar di area lengan.'
          value={formData.instructions}
          onChange={e => onUpdateFormData({ instructions: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-[#dee9fc] bg-white text-sm text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#ffd9de] focus:border-[#aa294d] transition-all resize-none'
        />
      </div>
    </CrudModalDialog>
  );
}
