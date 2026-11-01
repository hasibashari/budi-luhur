import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  XCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Building2,
  FileText,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { getVerificationStatusAction } from '../api/userRepository';
import { UserVerificationStatusData } from '../types';
import { Button } from '@/src/shared/components/ui/Button';

export function VerificationStatusView() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusData, setStatusData] = useState<UserVerificationStatusData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScreeningDetails, setShowScreeningDetails] = useState(false);

  const fetchStatus = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      setErrorMessage(null);

      try {
        const res = await getVerificationStatusAction();
        if (res.success && res.data) {
          setStatusData(res.data);
          // If admin approved in background, update auth context and redirect!
          if (res.data.verificationStatus === 'Approved') {
            updateUser({ verificationStatus: 'Approved' });
            navigate('/user/dashboard', { replace: true });
            return;
          }
        } else {
          setErrorMessage(res.error || 'Gagal memuat status verifikasi.');
        }
      } catch {
        setErrorMessage('Terjadi kendala jaringan saat memuat status.');
      } finally {
        setIsLoading(false);
        if (isManualRefresh) setIsRefreshing(false);
      }
    },
    [navigate, updateUser],
  );

  useEffect(() => {
    fetchStatus();

    // Auto-poll status every 15 seconds if in Pending state
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchStatus();
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [fetchStatus]);

  const currentStatus = statusData?.verificationStatus || user?.verificationStatus || 'Pending';
  const rejectionReason = statusData?.rejectionReason || user?.rejectionReason;
  const verification = statusData?.verification;
  const screening = verification?.screeningAnswers;

  const formatDate = (isoStr?: string | null): string => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className='flex-1 min-h-[100dvh] w-full bg-gradient-to-b from-[#F8FAFC] via-[#F0FDFA]/40 to-[#F8FAFC] flex flex-col justify-center items-center p-3.5 sm:p-6 md:p-8 pb-8 box-border relative overflow-x-hidden'>
      {/* Decorative desktop ambient bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none' />

      <div className='w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl shadow-teal-900/5 p-5 sm:p-8 relative z-10 flex flex-col gap-5 my-auto'>
        {/* Top Header */}
        <div className='flex items-center justify-between border-b border-slate-100 pb-4'>
          <div className='flex items-center gap-2'>
            <span className='font-black text-lg sm:text-xl tracking-tight text-slate-900'>
              Pilluna
            </span>
            <span className='text-[10px] sm:text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200'>
              Status Pendaftaran
            </span>
          </div>

          <button
            type='button'
            onClick={() => logout()}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer'
            title='Keluar dari akun'
          >
            <LogOut size={14} />
            <span className='hidden sm:inline'>Ganti Akun</span>
          </button>
        </div>

        {/* Status Hero Card */}
        {currentStatus === 'Pending' ? (
          <div className='p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-white border border-amber-200 shadow-xs flex flex-col items-center text-center'>
            <div className='w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs mb-3.5 relative'>
              <Clock size={32} className='animate-pulse' />
              <div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs'>
                <ShieldCheck size={12} />
              </div>
            </div>

            <span className='inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wide mb-2'>
              Menunggu Verifikasi Admin
            </span>

            <h1 className='text-lg sm:text-xl font-black text-slate-900 tracking-tight'>
              Data Sedang Ditinjau oleh Tim Medis
            </h1>

            <p className='text-xs sm:text-sm text-slate-600 mt-2 max-w-md leading-relaxed'>
              Halo, <span className='font-bold text-slate-800'>{user?.name || 'Akseptor'}</span>! Berkas
              dan 9 jawaban skrining persyaratan pil KB Anda telah tersimpan. Admin fasilitas
              kesehatan sedang melakukan pemeriksaan kelayakan.
            </p>

            <div className='mt-4 p-3 rounded-xl bg-white/90 border border-amber-200/80 text-[11px] sm:text-xs text-slate-600 text-left w-full flex items-start gap-2.5'>
              <Clock size={16} className='text-amber-600 shrink-0 mt-0.5' />
              <div>
                <span className='font-bold text-slate-800'>Estimasi Verifikasi:</span> Maksimal 1x24 jam
                kerja. Seluruh fitur pencatatan jadwal dan pemantauan pil KB akan terbuka otomatis
                setelah disetujui.
              </div>
            </div>
          </div>
        ) : currentStatus === 'Rejected' ? (
          <div className='p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-50/80 via-rose-50/30 to-white border border-rose-200 shadow-xs flex flex-col items-center text-center'>
            <div className='w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs mb-3.5'>
              <XCircle size={32} />
            </div>

            <span className='inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold uppercase tracking-wide mb-2'>
              Pendaftaran Belum Disetujui
            </span>

            <h1 className='text-lg sm:text-xl font-black text-slate-900 tracking-tight'>
              Pendaftaran Anda Ditolak oleh Admin
            </h1>

            <p className='text-xs sm:text-sm text-slate-600 mt-2 max-w-md leading-relaxed'>
              Mohon maaf, berdasarkan peninjauan persyaratan dan skrining awal, akun Anda belum
              memenuhi kriteria kelayakan saat ini.
            </p>

            {/* Rejection Reason Note */}
            <div className='mt-4 p-3.5 rounded-xl bg-white border border-rose-200 text-left w-full shadow-2xs'>
              <div className='flex items-center gap-2 text-xs font-bold text-rose-800 mb-1'>
                <AlertTriangle size={15} className='text-rose-600' />
                <span>Alasan Penolakan dari Admin:</span>
              </div>
              <p className='text-xs text-slate-700 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 leading-relaxed font-medium'>
                &ldquo;{rejectionReason || 'Dokumen persyaratan atau data skrining belum memenuhi kriteria keamanan penggunaan pil KB.'}&rdquo;
              </p>
            </div>

            {/* Next Steps Guidance */}
            <div className='mt-3 p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 text-[11px] sm:text-xs text-slate-700 text-left w-full flex items-start gap-2.5'>
              <HelpCircle size={16} className='text-teal-700 shrink-0 mt-0.5' />
              <div>
                <span className='font-bold text-teal-950'>Langkah Selanjutnya:</span> Silakan kunjungi
                atau hubungi fasilitas kesehatan (faskes) rujukan Anda untuk konsultasi langsung dengan
                bidan atau dokter mengenai alternatif kontrasepsi yang tepat.
              </div>
            </div>
          </div>
        ) : (
          <div className='p-5 sm:p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center flex flex-col items-center'>
            <CheckCircle2 size={36} className='text-teal-600 mb-2' />
            <h1 className='text-base font-bold text-teal-900'>Akun Anda Telah Disetujui!</h1>
            <p className='text-xs text-teal-700 mt-1'>
              Mengalihkan Anda ke halaman dashboard aplikasi...
            </p>
          </div>
        )}

        {/* Refresh Action Button */}
        <div className='flex items-center justify-center gap-3'>
          <Button
            type='button'
            variant='primary'
            size='md'
            shape='pill'
            disabled={isRefreshing || isLoading}
            onClick={() => fetchStatus(true)}
            icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
            className='px-6 py-2.5 text-xs font-bold'
          >
            {isRefreshing ? 'Memperbarui...' : 'Periksa Status Terbaru'}
          </Button>
        </div>

        {/* Summary of Submitted Data */}
        <div className='rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-900 flex items-center gap-1.5'>
              <FileText size={15} className='text-teal-600' />
              <span>Ringkasan Berkas yang Dikirim</span>
            </span>
            <span className='text-[10px] text-slate-500 font-medium'>
              Diajukan: {formatDate(verification?.submittedAt)}
            </span>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs'>
            <div className='p-2.5 rounded-xl bg-white border border-slate-200/80'>
              <span className='text-[10px] text-slate-400 block font-semibold uppercase'>
                Jenis Pil KB
              </span>
              <span className='font-bold text-slate-800'>
                {user?.pillType || 'Pil KB Kombinasi'}
              </span>
            </div>

            <div className='p-2.5 rounded-xl bg-white border border-slate-200/80'>
              <span className='text-[10px] text-slate-400 block font-semibold uppercase'>
                Dokumen Bukti
              </span>
              <span className='font-bold text-slate-800 truncate block'>
                {verification?.documentType || 'KTP'} ({verification?.documentFileName || 'Tersimpan'})
              </span>
            </div>

            <div className='p-2.5 rounded-xl bg-white border border-slate-200/80 sm:col-span-2'>
              <span className='text-[10px] text-slate-400 block font-semibold uppercase'>
                Faskes Rujukan / Domisili
              </span>
              <span className='font-bold text-slate-800 flex items-center gap-1.5'>
                <Building2 size={13} className='text-teal-600' />
                {user?.schoolOrOrg || 'Puskesmas Terdaftar'}
              </span>
            </div>
          </div>

          {/* Collapsible 9 Screening Answers */}
          {screening && (
            <div className='border-t border-slate-200 pt-2'>
              <button
                type='button'
                onClick={() => setShowScreeningDetails(prev => !prev)}
                className='w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-teal-700 transition-colors py-1'
              >
                <span>Lihat Jawaban Skrining (9 Pertanyaan)</span>
                {showScreeningDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showScreeningDetails && (
                <div className='mt-2.5 flex flex-col gap-1.5 text-[11px] bg-white p-3 rounded-xl border border-slate-200 animate-fade-in'>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>1. Usia:</span>
                    <span className='font-bold text-slate-800'>{screening.age || '-'} Tahun</span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>2. Jumlah Anak:</span>
                    <span className='font-bold text-slate-800'>
                      {screening.childrenCount ?? '-'} Anak
                    </span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>3. Sedang Hamil:</span>
                    <span
                      className={`font-bold ${
                        screening.isPregnant ? 'text-amber-600' : 'text-teal-600'
                      }`}
                    >
                      {screening.isPregnant ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>4. Kondisi Kontraindikasi:</span>
                    <span
                      className={`font-bold ${
                        screening.hasContraindications ? 'text-amber-600' : 'text-teal-600'
                      }`}
                    >
                      {screening.hasContraindications ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>5. Hipertensi Tidak Terkontrol:</span>
                    <span
                      className={`font-bold ${
                        screening.hasHypertension ? 'text-amber-600' : 'text-teal-600'
                      }`}
                    >
                      {screening.hasHypertension ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>6. Riwayat Gumpalan Darah/Stroke:</span>
                    <span
                      className={`font-bold ${
                        screening.hasBloodClotOrStroke ? 'text-amber-600' : 'text-teal-600'
                      }`}
                    >
                      {screening.hasBloodClotOrStroke ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>7. Kanker Payudara Aktif:</span>
                    <span
                      className={`font-bold ${
                        screening.hasBreastCancer ? 'text-amber-600' : 'text-teal-600'
                      }`}
                    >
                      {screening.hasBreastCancer ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className='flex justify-between py-1 border-b border-slate-100'>
                    <span className='text-slate-600'>8. Penyakit Hati Berat:</span>
                    <span
                      className={`font-bold ${
                        screening.hasSevereLiverDisease ? 'text-amber-600' : 'text-teal-600'
                      }`}
                    >
                      {screening.hasSevereLiverDisease ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className='flex justify-between py-1'>
                    <span className='text-slate-600'>9. Bersedia Minum Teratur:</span>
                    <span
                      className={`font-bold ${
                        screening.willingToTakeDaily ? 'text-teal-600' : 'text-amber-600'
                      }`}
                    >
                      {screening.willingToTakeDaily ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerificationStatusView;

