'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, Loader2, ShieldCheck, X, XCircle } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import {
  AdminCertificateRequest,
  AdminUserImmunization,
  getCertificateRequestsAction,
  getUserImmunizationsAction,
  reviewCertificateAction,
} from '../api/adminRepository';

const STATUS_STYLE: Record<AdminCertificateRequest['status'], string> = {
  DRAFT: 'bg-stone-100 text-stone-600 border-stone-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_LABEL: Record<AdminCertificateRequest['status'], string> = {
  DRAFT: 'Belum Diajukan',
  PENDING: 'Menunggu Verifikasi',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABEL: Record<Filter, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  ALL: 'Semua',
};

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CertificateVerificationView() {
  const [requests, setRequests] = useState<AdminCertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [selected, setSelected] = useState<AdminCertificateRequest | null>(null);
  const [records, setRecords] = useState<AdminUserImmunization[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerSip, setSignerSip] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setRequests(await getCertificateRequestsAction());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const openReview = async (request: AdminCertificateRequest) => {
    setSelected(request);
    setSignerName(request.signerName || '');
    setSignerSip(request.signerSip || '');
    setNote('');
    setRecords([]);
    setRecordsLoading(true);
    setRecords(await getUserImmunizationsAction(request.userId));
    setRecordsLoading(false);
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selected) return;
    setBusy(true);
    const result = await reviewCertificateAction(selected.userId, {
      status,
      note: note.trim() || undefined,
      signerName: status === 'APPROVED' ? signerName.trim() || undefined : undefined,
      signerSip: status === 'APPROVED' ? signerSip.trim() || undefined : undefined,
    });
    setBusy(false);

    if (!result.success) {
      setToast(result.error || 'Gagal memproses verifikasi.');
      return;
    }
    setToast(
      status === 'APPROVED'
        ? `Sertifikat ${selected.name} disetujui.`
        : `Pengajuan ${selected.name} ditolak.`,
    );
    setSelected(null);
    await loadRequests();
  };

  const filtered = useMemo(
    () => (filter === 'ALL' ? requests : requests.filter(item => item.status === filter)),
    [requests, filter],
  );

  return (
    <div className='flex flex-col gap-5 w-full'>
      {toast && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 left-4 md:left-auto z-60 md:max-w-sm bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold'>
          <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toast}</span>
          <button type='button' onClick={() => setToast(null)} aria-label='Tutup notifikasi'>
            <X size={14} />
          </button>
        </div>
      )}

      <div className='flex flex-col gap-1'>
        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#aff1d0] text-[#0a5139] text-xs font-semibold w-fit'>
          <ShieldCheck size={13} />
          Kewenangan Admin
        </span>
        <h1 className='text-xl sm:text-2xl font-bold text-[#121c2a] mt-1 tracking-tight'>
          Verifikasi Sertifikat Imunisasi
        </h1>
        <p className='text-xs sm:text-sm text-[#574144]'>
          Hanya petugas faskes yang dapat menyetujui tanda tangan sertifikat. Pengguna hanya bisa
          mengajukan.
        </p>
      </div>

      <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1'>
        {FILTERS.map(key => (
          <button
            key={key}
            type='button'
            onClick={() => setFilter(key)}
            className={`shrink-0 min-h-10 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === key
                ? 'bg-[#aa294d] text-white shadow-xs'
                : 'bg-white border border-[#eff4ff] text-[#574144] hover:bg-[#eff4ff]'
            }`}
          >
            {FILTER_LABEL[key]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='animate-spin text-[#aa294d]' size={26} />
        </div>
      ) : filtered.length === 0 ? (
        <Card padding='lg' className='text-center border-[#eff4ff]'>
          <div className='w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#aa294d] flex items-center justify-center mx-auto mb-3'>
            <Award size={26} />
          </div>
          <h3 className='text-sm font-bold text-[#121c2a]'>Tidak ada pengajuan</h3>
          <p className='text-xs text-[#574144] mt-1'>
            Belum ada pengajuan verifikasi sertifikat pada filter ini.
          </p>
        </Card>
      ) : (
        <div className='flex flex-col gap-3'>
          {filtered.map(item => (
            <Card key={item.userId} padding='md' className='border-[#eff4ff]'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h3 className='text-sm font-bold text-[#121c2a] truncate'>{item.name}</h3>
                  <p className='text-[11px] text-[#574144] truncate'>
                    {item.faskesName || 'Faskes belum diisi'} • {item.verifiedDoses}/
                    {item.totalRecords} dosis terverifikasi
                  </p>
                  <p className='text-[11px] text-[#8b7074] mt-0.5'>
                    Diajukan {formatDate(item.requestedAt)}
                    {item.reviewedAt ? ` • ditinjau ${formatDate(item.reviewedAt)}` : ''}
                  </p>
                </div>
                <div className='flex flex-col items-end gap-2 shrink-0'>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLE[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                  <button
                    type='button'
                    onClick={() => openReview(item)}
                    className='px-3 py-1.5 rounded-full bg-[#aa294d] text-white text-[11px] font-bold hover:bg-[#cb4364] transition-colors cursor-pointer'
                  >
                    Tinjau
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div className='fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs'>
          <div className='w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92dvh]'>
            <div className='px-5 py-4 bg-gradient-to-r from-[#aa294d] to-[#cb4364] text-white flex items-start justify-between'>
              <div>
                <p className='text-[11px] text-rose-100'>Tinjau Pengajuan</p>
                <h3 className='text-base font-bold'>{selected.name}</h3>
              </div>
              <button
                type='button'
                onClick={() => setSelected(null)}
                className='w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer'
                aria-label='Tutup'
              >
                <X size={18} />
              </button>
            </div>

            <div className='p-5 overflow-y-auto flex flex-col gap-4'>
              <div>
                <h4 className='text-xs font-bold text-[#121c2a] mb-2'>
                  Riwayat imunisasi pengguna
                </h4>
                {recordsLoading ? (
                  <p className='text-[11px] text-[#574144]'>Memuat…</p>
                ) : records.length === 0 ? (
                  <p className='text-[11px] text-[#a4163a] font-semibold'>
                    Belum ada riwayat imunisasi. Pertimbangkan menolak pengajuan.
                  </p>
                ) : (
                  <div className='flex flex-col gap-1.5'>
                    {records.map(record => (
                      <div
                        key={record.id}
                        className='flex items-center justify-between gap-2 rounded-xl bg-[#eff4ff] px-3 py-2'
                      >
                        <div className='min-w-0'>
                          <p className='text-xs font-semibold text-[#121c2a]'>
                            {record.doseLevel} • Vaksin {record.vaccineType || 'TT'}
                          </p>
                          <p className='text-[10px] text-[#574144] truncate'>
                            {formatDate(record.vaccineDate)} • {record.faskesName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.verificationStatus === 'VERIFIED'
                              ? 'bg-[#aff1d0] text-[#0a5139]'
                              : record.verificationStatus === 'REJECTED'
                                ? 'bg-[#ffe1e6] text-[#a4163a]'
                                : 'bg-[#fff3cd] text-[#8a5a00]'
                          }`}
                        >
                          {record.verificationStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-3'>
                <div>
                  <label htmlFor='signerName' className='text-xs font-bold text-[#121c2a]'>
                    Nama Penanggung Jawab Medis
                  </label>
                  <input
                    id='signerName'
                    value={signerName}
                    onChange={event => setSignerName(event.target.value)}
                    placeholder='Contoh: Bdn. Kartika, S.Tr.Keb'
                    className='mt-1 w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs'
                  />
                </div>
                <div>
                  <label htmlFor='signerSip' className='text-xs font-bold text-[#121c2a]'>
                    Nomor SIP
                  </label>
                  <input
                    id='signerSip'
                    value={signerSip}
                    onChange={event => setSignerSip(event.target.value)}
                    placeholder='Contoh: 19840212 201001 2 004'
                    className='mt-1 w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs'
                  />
                </div>
                <div>
                  <label htmlFor='reviewNote' className='text-xs font-bold text-[#121c2a]'>
                    Catatan (opsional)
                  </label>
                  <textarea
                    id='reviewNote'
                    rows={2}
                    value={note}
                    onChange={event => setNote(event.target.value)}
                    placeholder='Alasan penolakan atau catatan tambahan untuk pengguna.'
                    className='mt-1 w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs resize-none'
                  />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  disabled={busy}
                  onClick={() => handleReview('APPROVED')}
                  className='flex-1 h-11 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer'
                >
                  <CheckCircle2 size={15} /> Setujui
                </button>
                <button
                  type='button'
                  disabled={busy}
                  onClick={() => handleReview('REJECTED')}
                  className='h-11 px-4 rounded-full bg-white border border-[#ffd9de] text-[#aa294d] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#ffe1e6] disabled:opacity-50 cursor-pointer'
                >
                  <XCircle size={15} /> Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
