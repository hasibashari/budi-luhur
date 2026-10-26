'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CalendarClock,
  Share2,
  Printer,
  ArrowLeft,
  PlusCircle,
  Activity,
  AlertTriangle,
  ChevronRight,
  FileWarning,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useMonitoringData } from '../hooks/useMonitoringData';
import { InputRiwayatTTModal, NewTTRiwayatData } from '../components/InputRiwayatTTModal';
import { RiwayatTTDetailModal } from '../components/RiwayatTTDetailModal';
import { VerificationBadge } from '../components/VerificationBadge';
import { VaccineCardModal } from '@/src/features/dashboard/components/VaccineCardModal';
import { MonthlyEvaluationView } from '../components/MonthlyEvaluationView';
import {
  deleteImmunizationAttachmentAction,
  deleteImmunizationRecordAction,
  getImmunizationAttachmentAction,
  getImmunizationRecordsAction,
  saveImmunizationRecordAction,
  updateImmunizationRecordAction,
  uploadImmunizationAttachmentAction,
  validateImmunizationRecordAction,
} from '@/src/features/user/api/userRepository';
import { ImmunizationRecord } from '@/src/features/user/types';
import { useTTSchedules } from '@/src/features/schedule/hooks/useTTSchedules';
import { TT_DOSAGE_LEVELS } from '@/src/shared/constants/domain.constants';
import { INFO_SOURCE_LABEL, daysUntil, doseNumber, formatTTDate } from '../utils/formatTT';

type ToastState = {
  tone: 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
} | null;

export default function HistoryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id || '';

  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [prefillDose, setPrefillDose] = useState<string | null>(null);
  const [completionSchedule, setCompletionSchedule] = useState<{
    id: string;
    stage: string;
    scheduledDate?: string | null;
    time?: string | null;
  } | null>(null);
  const [editingRecord, setEditingRecord] = useState<ImmunizationRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<ImmunizationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ImmunizationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVaccineCardOpen, setIsVaccineCardOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Data pendukung dashboard (statistik kepatuhan, profil, dsb).
  const { dashboardData, stats, allLogs } = useMonitoringData(userId);

  // Jadwal TT adalah satu-satunya sumber untuk "dosis berikutnya".
  const { schedules, refetch: refetchSchedules } = useTTSchedules();

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const data = await getImmunizationRecordsAction();
      setRecords(data);
    } catch (error) {
      console.error('Gagal memuat riwayat imunisasi:', error);
      setRecordsError('Riwayat imunisasi gagal dimuat. Coba muat ulang halaman.');
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Datang dari halaman Jadwal ("Catat Hasil Kunjungan") → buka form dengan dosis terisi.
  useEffect(() => {
    const state = location.state as {
      openDose?: string;
      scheduleId?: string;
      scheduledDate?: string;
      time?: string;
    } | null;
    if (!state?.openDose) return;
    setPrefillDose(state.openDose);
    setCompletionSchedule(
      state.scheduleId
        ? {
            id: state.scheduleId,
            stage: state.openDose,
            scheduledDate: state.scheduledDate ?? null,
            time: state.time ?? null,
          }
        : null,
    );
    setEditingRecord(null);
    setIsInputModalOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  // Klik notifikasi jadwal → buka form pencatatan hasil (query param).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dose = params.get('catat');
    if (!dose) return;
    const scheduleId = params.get('scheduleId');
    setPrefillDose(dose);
    setCompletionSchedule(
      scheduleId
        ? {
            id: scheduleId,
            stage: dose,
            scheduledDate: params.get('date'),
            time: params.get('time'),
          }
        : null,
    );
    setEditingRecord(null);
    setIsInputModalOpen(true);
    navigate(location.pathname, { replace: true });
  }, [location.search, location.pathname, navigate]);

  // Hanya dosis terverifikasi yang boleh menaikkan status TT.
  const verifiedLevel = useMemo(
    () =>
      records
        .filter(record => record.verificationStatus === 'VERIFIED')
        .reduce((max, record) => Math.max(max, doseNumber(record.doseLevel)), 0),
    [records],
  );

  // Dosis berikutnya datang dari jadwal (bukan dari tebakan UI).
  const nextSchedule = useMemo(() => {
    return (
      [...schedules]
        .filter(schedule => schedule.status !== 'completed' && Boolean(schedule.scheduledDate))
        .sort(
          (a, b) =>
            String(a.scheduledDate).localeCompare(String(b.scheduledDate)) ||
            (a.time || '').localeCompare(b.time || ''),
        )[0] ?? null
    );
  }, [schedules]);

  const nextDoseNumber = nextSchedule
    ? doseNumber(nextSchedule.stage)
    : Math.min(5, verifiedLevel + 1);
  const nextDoseLabel = `TT${nextDoseNumber}`;

  const partnerName = dashboardData?.user.partnerName;
  const faskesName = dashboardData?.user.schoolOrOrg || 'Belum dipilih';

  const showToast = useCallback((next: NonNullable<ToastState>) => {
    setToast(next);
    if (!next.details?.length) {
      setTimeout(() => setToast(null), 3500);
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Status Imunisasi TT Pranikah - TEMANI',
          text: `Halo, saya sudah mencatat ${records.length} riwayat imunisasi TT di TEMANI. Status terverifikasi saat ini: TT${verifiedLevel}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      showToast({ tone: 'success', message: 'Tautan ringkasan imunisasi disalin ke papan klip' });
    }
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setPrefillDose(null);
    setCompletionSchedule(null);
    setIsInputModalOpen(true);
  };

  const handleOpenEdit = (record: ImmunizationRecord) => {
    setDetailRecord(null);
    setEditingRecord(record);
    setIsInputModalOpen(true);
  };

  const handleValidateRecord = async (newData: NewTTRiwayatData) => {
    try {
      return await validateImmunizationRecordAction({
        doseLevel: newData.doseLevel as ImmunizationRecord['doseLevel'],
        vaccineDate: newData.vaccineDate,
        excludeRecordId: editingRecord?.id,
      });
    } catch {
      // Jika pratinjau gagal (mis. offline), jangan blokir simpan; server tetap memvalidasi.
      return { errors: [], warnings: [] };
    }
  };

  const handleSaveRecord = async (newData: NewTTRiwayatData, file: File | null) => {
    try {
      const result = editingRecord
        ? await updateImmunizationRecordAction(editingRecord.id, {
            doseLevel: newData.doseLevel as ImmunizationRecord['doseLevel'],
            vaccineType: newData.vaccineType,
            vaccineDate: newData.vaccineDate,
            faskesName: newData.faskesName,
            batchNumber: newData.batchNumber,
            notes: newData.notes,
            infoSource: newData.infoSource,
            datePrecision: newData.datePrecision,
          })
        : await saveImmunizationRecordAction({
            doseLevel: newData.doseLevel as ImmunizationRecord['doseLevel'],
            vaccineType: newData.vaccineType,
            vaccineDate: newData.vaccineDate,
            faskesName: newData.faskesName,
            batchNumber: newData.batchNumber,
            notes: newData.notes,
            infoSource: newData.infoSource,
            datePrecision: newData.datePrecision,
            scheduleId: completionSchedule?.id,
          });

      // Bukti opsional diunggah setelah record tersimpan (butuh id record).
      let attachmentError: string | null = null;
      if (file) {
        try {
          await uploadImmunizationAttachmentAction(result.record.id, file);
        } catch (uploadError: any) {
          attachmentError =
            uploadError?.response?.data?.error ||
            uploadError?.message ||
            'Bukti gagal diunggah, data imunisasi tetap tersimpan.';
        }
      }

      await Promise.all([loadRecords(), refetchSchedules()]);

      const warnings = result.warnings || [];
      showToast({
        tone: attachmentError || warnings.length > 0 ? 'warning' : 'success',
        message: attachmentError
          ? attachmentError
          : editingRecord
            ? `Perbaikan dosis ${newData.doseLevel} tersimpan dan menunggu validasi ulang.`
            : completionSchedule
              ? `Jadwal ${completionSchedule.stage} ditandai selesai. Data menunggu validasi petugas faskes.`
              : `Dosis ${newData.doseLevel} tersimpan dengan status Menunggu Validasi.`,
        details: warnings.length > 0 ? warnings : undefined,
      });
      setEditingRecord(null);
      setCompletionSchedule(null);
      return { success: true, warnings };
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Gagal menyimpan riwayat imunisasi. Periksa kembali data yang diisi.';
      return { success: false, error: message };
    }
  };

  const handleOpenAttachment = async (record: ImmunizationRecord) => {
    try {
      const blob = await getImmunizationAttachmentAction(record.id);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      showToast({ tone: 'error', message: 'Lampiran bukti tidak dapat dibuka.' });
    }
  };

  const handleDeleteAttachment = async (record: ImmunizationRecord) => {
    if (!window.confirm('Hapus lampiran bukti imunisasi ini?')) return;
    try {
      await deleteImmunizationAttachmentAction(record.id);
      setDetailRecord(null);
      await loadRecords();
      showToast({ tone: 'success', message: 'Lampiran bukti dihapus.' });
    } catch (error: any) {
      showToast({
        tone: 'error',
        message:
          error?.response?.data?.error || error?.message || 'Gagal menghapus lampiran bukti.',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteImmunizationRecordAction(deleteTarget.id);
      setDeleteTarget(null);
      setDetailRecord(null);
      await loadRecords();
      showToast({
        tone: 'success',
        message: `Riwayat ${deleteTarget.doseLevel} dihapus dari daftar.`,
      });
    } catch (error: any) {
      showToast({
        tone: 'error',
        message:
          error?.response?.data?.error || error?.message || 'Gagal menghapus riwayat imunisasi.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-16'>
      {/* Toast Feedback - Mobile Thumb-Zone Friendly */}
      {toast && (
        <div
          role='status'
          className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm mx-auto sm:mx-0 px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-2.5 text-xs font-semibold animate-fade-in border ${
            toast.tone === 'warning'
              ? 'bg-[#fff8e6] text-[#7a4d00] border-[#f2d79b]'
              : toast.tone === 'error'
                ? 'bg-[#fff1f2] text-[#a4163a] border-[#ffc9d4]'
                : 'bg-[#121c2a] text-white border-white/10'
          }`}
        >
          {toast.tone === 'warning' ? (
            <AlertTriangle size={16} className='shrink-0 mt-0.5' />
          ) : toast.tone === 'error' ? (
            <FileWarning size={16} className='shrink-0 mt-0.5' />
          ) : (
            <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0 mt-0.5' />
          )}
          <div className='flex-1 min-w-0'>
            <p>{toast.message}</p>
            {toast.details && toast.details.length > 0 && (
              <ul className='mt-1.5 flex flex-col gap-1 font-normal list-disc pl-4'>
                {toast.details.map(detail => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            type='button'
            onClick={() => setToast(null)}
            aria-label='Tutup notifikasi'
            className='shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer'
          >
            ✕
          </button>
        </div>
      )}

      {/* Screen 5 Modal: Input / Perbaikan Riwayat TT */}
      <InputRiwayatTTModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setEditingRecord(null);
          setPrefillDose(null);
          setCompletionSchedule(null);
        }}
        onSubmit={handleSaveRecord}
        onValidate={handleValidateRecord}
        defaultDose={prefillDose || ''}
        initialData={editingRecord}
        completionSchedule={completionSchedule}
      />

      {/* Detail Riwayat */}
      <RiwayatTTDetailModal
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={handleOpenEdit}
        onDelete={record => setDeleteTarget(record)}
        onOpenAttachment={handleOpenAttachment}
        onDeleteAttachment={handleDeleteAttachment}
      />

      {/* Konfirmasi Hapus */}
      {deleteTarget && (
        <div className='fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in'>
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='hapus-riwayat-title'
            className='w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 flex flex-col gap-3'
          >
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-10 rounded-full bg-[#ffe1e6] text-[#a4163a] flex items-center justify-center shrink-0'>
                <AlertTriangle size={20} />
              </div>
              <h3 id='hapus-riwayat-title' className='text-sm font-bold text-[#121c2a]'>
                Hapus riwayat {deleteTarget.doseLevel}?
              </h3>
            </div>
            <p className='text-[11px] text-[#574144] leading-relaxed'>
              Catatan tanggal {formatTTDate(deleteTarget.vaccineDate, deleteTarget.datePrecision)}{' '}
              di {deleteTarget.faskesName} akan dihapus dari daftar aktif. Status TT akan dihitung
              ulang dari dosis yang masih terverifikasi.
            </p>
            <div className='flex items-center gap-2 pt-1'>
              <button
                type='button'
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className='flex-1 h-11 rounded-full bg-[#eff4ff] text-[#121c2a] font-bold text-xs hover:bg-[#dee9fc] transition-all cursor-pointer disabled:opacity-50'
              >
                Batal
              </button>
              <button
                type='button'
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className='flex-1 h-11 rounded-full bg-[#aa294d] text-white font-bold text-xs hover:bg-[#cb4364] transition-all cursor-pointer disabled:opacity-50'
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isVaccineCardOpen}
        onClose={() => setIsVaccineCardOpen(false)}
        userName={dashboardData?.user.name || 'Calon Pengantin'}
        faskesName={faskesName}
        partnerName={partnerName}
        currentTTLevel={verifiedLevel}
        records={records.filter(record => record.verificationStatus === 'VERIFIED')}
        catinId={dashboardData?.user.id}
      />

      {/* 1. Top Navigation & Action Bar */}
      <div className='flex items-center justify-between pb-1'>
        <button
          type='button'
          onClick={() => navigate('/user/dashboard')}
          aria-label='Kembali ke Beranda'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] active:scale-90 transition-all cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center min-w-0 flex-1 px-2'>
          <h1 className='text-base sm:text-lg md:text-xl font-bold text-[#121c2a] leading-snug truncate'>
            Riwayat & Evaluasi
          </h1>
          <p className='text-[11px] sm:text-xs text-[#574144] truncate'>
            Kesehatan & Kelayakan Nikah Calon Pengantin
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setIsVaccineCardOpen(true)}
            aria-label='Cetak Kartu Imunisasi'
            className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
            title='Cetak Kartu Vaksin'
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* -------------------- RIWAYAT & EVALUASI -------------------- */}
      <div className='flex flex-col gap-6 animate-fade-in'>
        {/* Intro Greeting */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-[11px] uppercase tracking-wider text-[#aa294d] font-bold'>
              Rencana Suntik TT
            </span>
            <h2 className='text-base sm:text-lg font-bold text-[#121c2a]'>Evaluasi Vaksinasi TT</h2>
          </div>
          <button
            type='button'
            onClick={handleOpenCreate}
            className='inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-full bg-[#aa294d] text-white hover:bg-[#cb4364] active:scale-95 transition-all text-xs font-bold shadow-sm shadow-rose-950/15 cursor-pointer shrink-0'
          >
            <PlusCircle size={15} />
            <span>Tambah Dosis</span>
          </button>
        </div>

        {/* Highlight Card: dosis berikutnya — hanya dari jadwal yang benar-benar dibuat */}
        {nextSchedule ? (
          <div className='relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(170,41,77,0.08)] border border-[#eff4ff] overflow-hidden'>
            <div className='absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#ffd9de]/40 blur-2xl pointer-events-none' />

            <div className='relative flex items-start justify-between gap-3 mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-2xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-inner shrink-0'>
                  <CalendarClock size={26} />
                </div>
                <div>
                  <span className='text-[11px] text-[#574144] block'>
                    Dosis Terjadwal Berikutnya
                  </span>
                  <h3 className='text-base sm:text-lg font-bold text-[#aa294d] tracking-tight'>
                    {nextSchedule.stage} — {nextSchedule.title}
                  </h3>
                </div>
              </div>
              {(() => {
                const remaining = daysUntil(nextSchedule.scheduledDate);
                const overdue = remaining !== null && remaining < 0;
                const label =
                  remaining === null
                    ? 'Belum dijadwalkan'
                    : remaining < 0
                      ? `Terlewat ${Math.abs(remaining)} hari`
                      : remaining === 0
                        ? 'Hari ini'
                        : `${remaining} hari lagi`;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs ${
                      overdue ? 'bg-[#ffe1e6] text-[#a4163a]' : 'bg-[#aff1d0] text-[#0a5139]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${overdue ? 'bg-[#a4163a]' : 'bg-[#2a6950] animate-pulse'}`}
                    />
                    {label}
                  </span>
                );
              })()}
            </div>

            {/* Schedule Detail Section */}
            <div className='bg-[#eff4ff] rounded-xl p-3.5 flex flex-col gap-2 mb-4 border border-[#d9e3f6]/60'>
              <div className='flex items-center gap-2.5'>
                <span className='p-1.5 rounded-lg bg-[#ffd9de] text-[#aa294d] shrink-0'>
                  <Calendar size={18} />
                </span>
                <div className='flex flex-col'>
                  <span className='text-[11px] text-[#574144]'>Jadwal yang kamu buat</span>
                  <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                    {formatTTDate(nextSchedule.scheduledDate, 'exact')} ({nextSchedule.time} WIB)
                  </span>
                  <span className='text-[10px] text-[#8b7074]'>
                    {nextSchedule.dosage
                      ? `Dosis: ${nextSchedule.dosage}`
                      : 'Kelola atau ubah di halaman Jadwal TT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Protection Lifespan Metric */}
            <div className='flex items-start gap-3 pt-1'>
              <div className='w-8 h-8 rounded-full bg-[#aff1d0] shrink-0 flex items-center justify-center text-[#0a5139] mt-0.5 shadow-2xs'>
                <ShieldCheck size={18} />
              </div>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-[#121c2a]'>Manfaat Perlindungan Imun</span>
                <p className='text-[11px] text-[#574144] leading-relaxed mt-0.5'>
                  {TT_DOSAGE_LEVELS[nextSchedule.stage]?.protectionDuration ||
                    'Perlindungan tambahan terhadap tetanus maternal.'}
                  {TT_DOSAGE_LEVELS[nextSchedule.stage]?.description
                    ? ` ${TT_DOSAGE_LEVELS[nextSchedule.stage].description}`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(170,41,77,0.08)] border border-dashed border-[#d9e3f6] flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#574144] shrink-0'>
                <CalendarClock size={24} />
              </div>
              <div>
                <span className='text-[11px] text-[#574144] block'>Dosis Terjadwal Berikutnya</span>
                <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
                  Belum ada jadwal aktif
                </h3>
              </div>
            </div>
            <p className='text-[11px] text-[#574144] leading-relaxed'>
              Jadwal imunisasi belum dibuat. Buat jadwal TT{nextDoseNumber} di halaman Jadwal TT
              agar pengingat dan hitungan hari muncul di sini.
            </p>
            <Link
              to='/user/schedule'
              className='self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#aa294d] text-white text-xs font-bold hover:bg-[#cb4364] transition-all active:scale-95'
            >
              Buat Jadwal {nextDoseLabel}
              <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* Chronological Immunization History List */}
        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between px-1'>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
                Daftar Riwayat Suntik TT
              </h3>
              <p className='text-[11px] text-[#574144]'>
                {recordsLoading
                  ? 'Memuat riwayat...'
                  : records.length === 0
                    ? 'Belum ada catatan tersimpan'
                    : `${records.length} catatan tersimpan`}
              </p>
            </div>
            <span className='text-xs text-[#574144]'>TT1 – TT5</span>
          </div>

          {recordsLoading ? (
            <div className='flex flex-col gap-3'>
              {[0, 1].map(index => (
                <div
                  key={index}
                  className='h-24 rounded-2xl bg-white border border-[#eff4ff] animate-pulse'
                />
              ))}
            </div>
          ) : recordsError ? (
            <div className='rounded-2xl border border-[#ffc9d4] bg-[#fff1f2] p-4 flex flex-col gap-2'>
              <p className='text-xs font-semibold text-[#a4163a]'>{recordsError}</p>
              <button
                type='button'
                onClick={loadRecords}
                className='self-start text-[11px] font-bold text-[#aa294d] underline underline-offset-2 cursor-pointer'
              >
                Coba lagi
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-[#d9e3f6] bg-white p-6 flex flex-col items-center text-center gap-2'>
              <div className='w-12 h-12 rounded-full bg-[#eff4ff] text-[#574144] flex items-center justify-center'>
                <Inbox size={22} />
              </div>
              <p className='text-sm font-bold text-[#121c2a]'>Belum ada riwayat imunisasi</p>
              <p className='text-[11px] text-[#574144] leading-relaxed max-w-xs'>
                Riwayat hanya akan muncul setelah kamu menambahkan data dosis yang benar-benar sudah
                diterima. Tidak ada data contoh yang ditampilkan.
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              {records.map(record => {
                const info = TT_DOSAGE_LEVELS[record.doseLevel];
                return (
                  <button
                    key={record.id}
                    type='button'
                    onClick={() => setDetailRecord(record)}
                    className='w-full text-left p-4 rounded-2xl bg-white shadow-xs border border-[#eff4ff] flex flex-col gap-2.5 transition-all hover:shadow-md active:scale-[0.995] cursor-pointer'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-3 min-w-0'>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            record.verificationStatus === 'VERIFIED'
                              ? 'bg-[#aff1d0] text-[#0a5139]'
                              : record.verificationStatus === 'REJECTED'
                                ? 'bg-[#ffe1e6] text-[#a4163a]'
                                : 'bg-[#fff3cd] text-[#8a5a00]'
                          }`}
                        >
                          {doseNumber(record.doseLevel)}
                        </div>
                        <div className='min-w-0'>
                          <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] leading-tight truncate'>
                            Dosis {record.doseLevel}
                            {info ? ` — ${info.name}` : ''}
                          </h4>
                          <span className='text-[11px] text-[#574144] truncate block'>
                            Vaksin {record.vaccineType || 'TT'} • {record.faskesName}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        <VerificationBadge status={record.verificationStatus} size='xs' />
                        <ChevronRight size={16} className='text-[#8b7074]' />
                      </div>
                    </div>

                    <div className='flex items-center justify-between gap-2 pt-1 mt-1 bg-[#eff4ff]/60 px-3 py-2 rounded-xl'>
                      <div className='flex items-center gap-1.5 text-[#574144] min-w-0'>
                        <Calendar size={14} className='shrink-0' />
                        <span className='text-[11px] sm:text-xs truncate'>
                          {formatTTDate(record.vaccineDate, record.datePrecision)}
                        </span>
                      </div>
                      <span className='text-[10px] text-[#574144] text-right shrink-0'>
                        {INFO_SOURCE_LABEL[record.infoSource] || 'Diisi mandiri'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* INTEGRATED MONTHLY EVALUATION & CHARTS SECTION */}
        <div className='pt-4 border-t border-[#eff4ff] flex flex-col gap-3'>
          <div className='flex items-center justify-between px-1'>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>Grafik Capaian Imunisasi TT</h3>
              <p className='text-[11px] text-[#574144]'>Diagram batang tahapan dosis TT1–TT5 & kepatuhan</p>
            </div>
            <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#aff1d0] text-[#0a5139] text-xs font-bold'>
              <Activity size={12} /> Optimal
            </span>
          </div>

          <MonthlyEvaluationView
            stats={stats}
            streakCount={dashboardData?.user.streakCount || 0}
            streakUnit={dashboardData?.user.streakUnit || 'Minggu'}
            logs={allLogs}
            records={records}
            schedules={schedules}
          />
        </div>
      </div>
    </div>
  );
}
