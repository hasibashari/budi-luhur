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

  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Jadwal Imunisasi / Skrining' : 'Buat Jadwal Imunisasi TT & Skrining Baru'}
      onSubmit={onSave}
      submitText={editingId ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
      submitting={submitting}
    >
      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Calon Pengantin (Catin) <span className='text-emerald-600'>*</span>
        </label>
        <select
          value={formData.userId || formData.patientId || ''}
          onChange={e =>
            onUpdateFormData({
              userId: e.target.value,
              patientId: e.target.value,
            })
          }
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.schoolOrOrg || u.id})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Kategori Layanan Pranikah <span className='text-emerald-600'>*</span>
        </label>
        <select
          value={formData.category}
          onChange={e => handleCategoryChange(e.target.value as ScheduleCategory)}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
        >
          {SCHEDULE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Nama Vaksin / Kegiatan Layanan <span className='text-emerald-600'>*</span>
        </label>
        <input
          type='text'
          placeholder='Contoh: Vaksin Tetanus Toxoid (TT Catin) / Skrining Darah'
          value={formData.medicationName}
          onChange={e => onUpdateFormData({ medicationName: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Dosis / Sesi</label>
          <input
            type='text'
            placeholder='Contoh: 0.5 mL / 1 Sesi'
            value={formData.dosage}
            onChange={e => onUpdateFormData({ dosage: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          />
        </div>
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>Frekuensi Layanan</label>
          <select
            value={formData.frequency}
            onChange={e =>
              onUpdateFormData({
                frequency: e.target.value as ScheduleFrequency,
              })
            }
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
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
            <label className='block text-xs font-bold text-slate-700 mb-1'>
              Hari Pelaksanaan <span className='text-emerald-600'>*</span>
            </label>
            <select
              value={formData.dayOfWeek || 'Sabtu'}
              onChange={e => onUpdateFormData({ dayOfWeek: e.target.value })}
              className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>
                  {day === 'Sabtu' ? 'Sabtu (Pagi)' : day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1'>
              Jam Layanan / Pengingat (HH:MM) <span className='text-emerald-600'>*</span>
            </label>
            <input
              type='text'
              placeholder='09:00'
              value={formData.timeSlot}
              onChange={e => onUpdateFormData({ timeSlot: e.target.value })}
              className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
            />
          </div>
        </div>
      ) : (
        <div>
          <label className='block text-xs font-bold text-slate-700 mb-1'>
            Jam Pengingat Harian (HH:MM) <span className='text-emerald-600'>*</span>
          </label>
          <input
            type='text'
            placeholder='20:00'
            value={formData.timeSlot}
            onChange={e => onUpdateFormData({ timeSlot: e.target.value })}
            className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
          />
          <p className='text-[11px] text-slate-400 mt-1'>
            * Jadwal harian berlaku setiap hari pada jam pengingat di atas.
          </p>
        </div>
      )}

      <div>
        <label className='block text-xs font-bold text-slate-700 mb-1'>
          Petunjuk Khusus & Persyaratan Dokumen
        </label>
        <textarea
          rows={2}
          placeholder='Bawa KTP, buku KIA/sertifikat vaksinasi, dan kenakan pakaian longgar di area lengan.'
          value={formData.instructions}
          onChange={e => onUpdateFormData({ instructions: e.target.value })}
          className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none'
        />
      </div>
    </CrudModalDialog>
  );
}
