import {
  CalendarDays,
  FileText,
  Info,
  Paperclip,
  Pencil,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import type { ImmunizationRecord } from '@/src/features/user/types';
import { VerificationBadge, verificationDescription } from './VerificationBadge';
import {
  DATE_PRECISION_LABEL,
  INFO_SOURCE_LABEL,
  formatDateTime,
  formatTTDate,
} from '../utils/formatTT';

interface RiwayatTTDetailModalProps {
  record: ImmunizationRecord | null;
  onClose: () => void;
  onEdit: (record: ImmunizationRecord) => void;
  onDelete: (record: ImmunizationRecord) => void;
  onOpenAttachment: (record: ImmunizationRecord) => void;
  onDeleteAttachment: (record: ImmunizationRecord) => void;
}

function DetailRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className='flex items-start gap-3 py-2.5 border-b border-[#eff4ff] last:border-b-0'>
      <div className='w-8 h-8 rounded-lg bg-[#eff4ff] text-[#574144] flex items-center justify-center shrink-0'>
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] text-[#574144]'>{label}</p>
        <p className='text-xs sm:text-sm font-semibold text-[#121c2a] break-words'>{value}</p>
        {hint && <p className='text-[10px] text-[#8b7074] mt-0.5'>{hint}</p>}
      </div>
    </div>
  );
}

export function RiwayatTTDetailModal({
  record,
  onClose,
  onEdit,
  onDelete,
  onOpenAttachment,
  onDeleteAttachment,
}: RiwayatTTDetailModalProps) {
  if (!record) return null;

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
      <div className='relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]'>
        <div className='px-5 py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-start justify-between gap-3'>
          <div>
            <p className='text-[11px] text-rose-100'>Detail Riwayat Imunisasi</p>
            <h3 className='text-base font-bold leading-tight'>Dosis {record.doseLevel}</h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup Detail Riwayat'
            className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90'
          >
            <X size={18} />
          </button>
        </div>

        <div className='p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-[#121c2a]'>
          <div className='flex items-start gap-2.5 rounded-2xl bg-[#eff4ff] border border-[#d9e3f6] p-3.5'>
            <Info size={18} className='text-[#aa294d] shrink-0 mt-0.5' />
            <div className='flex flex-col gap-1.5'>
              <VerificationBadge status={record.verificationStatus} />
              <p className='text-[11px] text-[#574144] leading-relaxed'>
                {verificationDescription(record.verificationStatus)}
              </p>
            </div>
          </div>

          <div className='rounded-2xl border border-[#eff4ff] px-3'>
            <DetailRow
              icon={<CalendarDays size={16} />}
              label='Tanggal pemberian'
              value={formatTTDate(record.vaccineDate, record.datePrecision)}
              hint={DATE_PRECISION_LABEL[record.datePrecision]}
            />
            <DetailRow
              icon={<ShieldCheck size={16} />}
              label='Jenis vaksin'
              value={record.vaccineType || 'TT'}
            />
            <DetailRow
              icon={<Stethoscope size={16} />}
              label='Fasilitas kesehatan'
              value={record.faskesName || '-'}
            />
            <DetailRow
              icon={<ShieldCheck size={16} />}
              label='Nomor batch / lot'
              value={record.batchNumber || 'Tidak dicatat'}
            />
            <DetailRow
              icon={<Info size={16} />}
              label='Sumber data'
              value={INFO_SOURCE_LABEL[record.infoSource] || 'Diisi mandiri oleh pengguna'}
            />
            <DetailRow
              icon={<FileText size={16} />}
              label='Catatan'
              value={record.notes || 'Tidak ada catatan'}
            />
            <DetailRow
              icon={<FileText size={16} />}
              label='Bukti pendukung'
              value={
                record.attachmentUrl ? (
                  <span className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => onOpenAttachment(record)}
                      className='inline-flex items-center gap-1 text-[#aa294d] underline underline-offset-2 cursor-pointer'
                    >
                      <Paperclip size={13} />
                      Lihat lampiran
                    </button>
                    <button
                      type='button'
                      onClick={() => onDeleteAttachment(record)}
                      className='inline-flex items-center gap-1 text-[#a4163a] text-[11px] font-semibold cursor-pointer'
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </span>
                ) : (
                  'Belum ada lampiran'
                )
              }
            />
          </div>

          {record.verificationStatus !== 'PENDING' && (
            <div className='rounded-2xl bg-stone-50 border border-stone-200 p-3.5'>
              <p className='text-[11px] font-bold text-[#121c2a] mb-1'>
                Jejak verifikasi tenaga kesehatan
              </p>
              <p className='text-[11px] text-[#574144]'>
                {record.verifiedBy || 'Tenaga kesehatan'}
                {record.verifiedAt ? ` • ${formatDateTime(record.verifiedAt)}` : ''}
              </p>
              {record.verificationNote && (
                <p className='text-[11px] text-[#574144] mt-1 italic'>
                  “{record.verificationNote}”
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className='p-4 sm:p-5 bg-stone-50 border-t border-stone-100 shrink-0 flex items-center gap-2.5'>
          <button
            type='button'
            onClick={() => onEdit(record)}
            className='flex-1 h-11 rounded-full bg-[#eff4ff] text-[#121c2a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#dee9fc] active:scale-[0.98] transition-all cursor-pointer'
          >
            <Pencil size={16} />
            Perbaiki Data
          </button>
          <button
            type='button'
            onClick={() => onDelete(record)}
            className='h-11 px-5 rounded-full bg-white border border-[#ffd9de] text-[#aa294d] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#ffd9de]/40 active:scale-[0.98] transition-all cursor-pointer'
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
