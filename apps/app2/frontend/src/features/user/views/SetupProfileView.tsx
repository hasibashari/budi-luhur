import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  Loader2,
  LogOut,
  Pill,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { saveUserInitialSetupAction } from '../api/userRepository';
import { Button } from '@/src/shared/components/ui/Button';
import { PillScreeningSection } from '../components/PillScreeningSection';
import { ProofDocumentUploader } from '../components/ProofDocumentUploader';
import { PillTypeCardSelector, PillOption } from '../components/PillTypeCardSelector';
import { BasicProfileFormFields } from '../components/BasicProfileFormFields';
import { PillScreeningAnswers, VerificationDocumentPayload } from '../types';

export type { PillOption };

export function SetupProfileView() {
  const navigate = useNavigate();
  const { user: authUser, updateUser, logout } = useAuth();

  // Wizard Step State (Step 1: Profil & Pil KB, Step 2: Persyaratan & Dokumen)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form States – Step 1: Data Profil Dasar & Pilihan Pil KB
  const [pillType, setPillType] = useState<PillOption>('Pil KB Kombinasi');
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Form States – Step 2: 8 Pertanyaan Skrining Persyaratan
  const [screeningAnswers, setScreeningAnswers] = useState<PillScreeningAnswers>({
    age: '',
    childrenCount: '',
    hasContraindications: null,
    hasHypertension: null,
    hasBloodClotOrStroke: null,
    hasBreastCancer: null,
    hasSevereLiverDisease: null,
    willingToTakeDaily: null,
  });

  // Form States – Step 2: Unggah Dokumen Bukti
  const [uploadedDocument, setUploadedDocument] = useState<VerificationDocumentPayload | null>(
    null,
  );
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Navigasi ke Step 2 setelah validasi Step 1
  const handleNextStep = () => {
    if (!schoolOrOrg.trim()) {
      setErrorMessage('Silakan masukkan nama faskes/puskesmas atau domisili Anda.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  // Navigasi kembali ke Step 1
  const handlePrevStep = () => {
    setErrorMessage(null);
    setDocumentError(null);
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Step 1
    if (!schoolOrOrg.trim()) {
      setErrorMessage('Silakan masukkan nama faskes/puskesmas atau domisili Anda.');
      setCurrentStep(1);
      return;
    }
    if (!authUser?.id) {
      setErrorMessage('Sesi pengguna tidak valid. Silakan login kembali.');
      return;
    }

    // Validasi Step 2: 8 Pertanyaan Skrining
    if (
      screeningAnswers.age === '' ||
      Number(screeningAnswers.age) < 15 ||
      Number(screeningAnswers.age) > 65
    ) {
      setErrorMessage('Silakan masukkan usia akseptor yang valid (15 - 65 tahun).');
      setCurrentStep(2);
      return;
    }

    if (screeningAnswers.childrenCount === '' || Number(screeningAnswers.childrenCount) < 0) {
      setErrorMessage('Silakan masukkan jumlah anak yang valid (minimal 0).');
      setCurrentStep(2);
      return;
    }

    const unansweredYesNo =
      screeningAnswers.hasContraindications === null ||
      screeningAnswers.hasHypertension === null ||
      screeningAnswers.hasBloodClotOrStroke === null ||
      screeningAnswers.hasBreastCancer === null ||
      screeningAnswers.hasSevereLiverDisease === null ||
      screeningAnswers.willingToTakeDaily === null;

    if (unansweredYesNo) {
      setErrorMessage(
        'Mohon lengkapi seluruh 8 pertanyaan pada bagian Persyaratan Penggunaan Pil KB.',
      );
      setCurrentStep(2);
      return;
    }

    // Validasi Step 2: Dokumen Bukti
    if (!uploadedDocument || !uploadedDocument.fileData) {
      setDocumentError(
        'Silakan unggah salah satu dokumen bukti status pernikahan (KK, KTP, atau Buku Nikah).',
      );
      setErrorMessage('Dokumen bukti status pernikahan wajib diunggah.');
      setCurrentStep(2);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setDocumentError(null);

    try {
      const res = await saveUserInitialSetupAction(authUser.id, {
        schoolOrOrg: schoolOrOrg.trim(),
        pillType,
        dateOfBirth: dateOfBirth || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        screening: screeningAnswers,
        document: uploadedDocument,
      });

      if (res.success) {
        updateUser({
          schoolOrOrg: schoolOrOrg.trim(),
          pillType,
          isProfileComplete: true,
          verificationStatus: 'Pending',
        });
        navigate('/user/verification-status');
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan data setup profil.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem saat menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex-1 min-h-[100dvh] w-full bg-gradient-to-b from-[#F8FAFC] via-[#F0FDFA]/40 to-[#F8FAFC] flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 md:p-8 pb-6 sm:pb-8 box-border relative overflow-x-hidden'>
      {/* Ambient decorative bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-64 h-64 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none' />

      <div className='w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-xl shadow-[#0D9488]/5 p-4 sm:p-8 relative z-10 flex flex-col gap-5 my-auto'>
        {/* Header Pilluna Brand & Step Status */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <span className='font-black text-lg sm:text-xl tracking-tight text-[#0F172A]'>
              Pilluna
            </span>
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] sm:text-xs font-bold text-[#0D9488] bg-[#F0FDFA] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#CCFBF1]'>
                Langkah {currentStep} dari 2
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar & Tabs */}
          <div className='mt-2 mb-4'>
            <div className='grid grid-cols-2 gap-2 text-xs font-bold mb-2'>
              {/* Tab Step 1 */}
              <button
                type='button'
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl transition-all text-left cursor-pointer min-w-0 ${
                  currentStep === 1
                    ? 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] ring-2 ring-[#0D9488]/15'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    currentStep === 1
                      ? 'bg-[#0D9488] text-white shadow-2xs'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {currentStep === 2 ? <Check size={13} strokeWidth={3} /> : '1'}
                </div>
                <div className='min-w-0 flex-1'>
                  <span className='block text-[11px] sm:text-xs leading-tight font-extrabold truncate'>
                    1. Profil & Pil KB
                  </span>
                  <span className='text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block'>
                    Jenis Pil & Domisili
                  </span>
                </div>
              </button>

              {/* Tab Step 2 */}
              <button
                type='button'
                onClick={() => {
                  if (schoolOrOrg.trim()) {
                    setErrorMessage(null);
                    setCurrentStep(2);
                  } else {
                    setErrorMessage('Silakan isi domisili/faskes sebelum ke langkah persyaratan.');
                  }
                }}
                className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl transition-all text-left cursor-pointer min-w-0 ${
                  currentStep === 2
                    ? 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] ring-2 ring-[#0D9488]/15'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    currentStep === 2
                      ? 'bg-[#0D9488] text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <div className='min-w-0 flex-1'>
                  <span className='block text-[11px] sm:text-xs leading-tight font-extrabold truncate'>
                    2. Skrining & Dokumen
                  </span>
                  <span className='text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block'>
                    8 Pertanyaan & Bukti
                  </span>
                </div>
              </button>
            </div>

            {/* Stepper Progress Line */}
            <div className='w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex'>
              <div
                className='h-full bg-[#0D9488] transition-all duration-300'
                style={{ width: currentStep === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          <div>
            <h1 className='text-base sm:text-xl md:text-2xl font-black text-[#0F172A] tracking-tight'>
              {currentStep === 1 ? 'Lengkapi Data Profil' : 'Persyaratan & Verifikasi Akseptor'}
            </h1>
            <p className='text-xs sm:text-sm text-[#334155] mt-1 leading-relaxed'>
              {currentStep === 1
                ? `Halo, ${authUser?.name || 'Akseptor Setia'}! Pilih jenis pil KB yang akan Anda konsumsi dan faskes rujukan Anda.`
                : 'Jawab 8 pertanyaan skrining kontraindikasi medis dan unggah salah satu bukti dokumen status pernikahan.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className='p-3 sm:p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
            <AlertCircle size={16} className='text-[#DC2626] shrink-0' />
            <span className='break-words flex-1 min-w-0'>
              {typeof errorMessage === 'string'
                ? errorMessage
                : (errorMessage as any)?.message || JSON.stringify(errorMessage)}
            </span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-4'>
          {/* ============================================================ */}
          {/* LANGKAH 1: DATA PROFIL & PIL KB                              */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className='flex flex-col gap-4 animate-fade-in'>
              {/* Pilihan Jenis Pil KB (Bisa di-klik) */}
              <PillTypeCardSelector value={pillType} onChange={setPillType} />

              {/* Data Profil Dasar (Faskes, Tanggal Lahir, BB/TB) */}
              <BasicProfileFormFields
                schoolOrOrg={schoolOrOrg}
                onSchoolOrOrgChange={setSchoolOrOrg}
                dateOfBirth={dateOfBirth}
                onDateOfBirthChange={setDateOfBirth}
                maxDate={maxDate}
                height={height}
                onHeightChange={setHeight}
                weight={weight}
                onWeightChange={setWeight}
              />

              {/* Action Row - Step 1 */}
              <div className='pt-4 mt-2 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3'>
                <button
                  type='button'
                  onClick={() => logout()}
                  className='w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer min-h-[44px]'
                  title='Keluar dari sesi dan kembali ke halaman masuk'
                >
                  <LogOut size={15} className='text-slate-500' />
                  <span>Ganti Akun</span>
                </button>

                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  onClick={handleNextStep}
                  icon={<ArrowRight size={16} />}
                  className='w-full sm:w-auto px-5 sm:px-8 py-3 font-bold shadow-xs shadow-[#0D9488]/20 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[44px]'
                >
                  Lanjut ke Persyaratan Skrining
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* LANGKAH 2: PERSYARATAN SKRINING MEDIS & UNGGAH DOKUMEN       */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className='flex flex-col gap-4 animate-fade-in'>
              {/* Ringkasan Singkat Pilihan Langkah 1 */}
              <div className='p-3 sm:p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between gap-2.5 text-xs text-[#0D9488]'>
                <div className='flex items-center gap-2 min-w-0 flex-1'>
                  <Pill size={16} className='shrink-0 text-[#0D9488]' />
                  <div className='truncate flex items-center min-w-0 flex-1'>
                    <span className='font-extrabold text-[#0F172A] shrink-0'>{pillType}</span>
                    <span className='mx-1.5 text-slate-300 shrink-0'>•</span>
                    <span className='text-slate-600 truncate block min-w-0 flex-1'>{schoolOrOrg}</span>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => setCurrentStep(1)}
                  className='shrink-0 text-[11px] font-bold text-[#0D9488] underline hover:text-teal-800 cursor-pointer ml-1'
                >
                  Ubah Profil
                </button>
              </div>

              {/* Bagian 1: Persyaratan Penggunaan Pil KB (8 Pertanyaan) */}
              <PillScreeningSection
                answers={screeningAnswers}
                onChange={updated => setScreeningAnswers(prev => ({ ...prev, ...updated }))}
                pillType={pillType}
              />

              {/* Bagian 2: Unggah Dokumen Bukti Status Pernikahan */}
              <ProofDocumentUploader
                document={uploadedDocument}
                onChange={setUploadedDocument}
                error={documentError}
              />

              {/* Action Row - Step 2 */}
              <div className='pt-4 mt-2 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3'>
                <button
                  type='button'
                  onClick={handlePrevStep}
                  className='w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer min-h-[44px]'
                >
                  <ArrowLeft size={15} className='text-slate-500' />
                  <span>Kembali ke Profil</span>
                </button>

                <Button
                  type='submit'
                  variant='primary'
                  size='md'
                  shape='pill'
                  disabled={isSaving}
                  icon={
                    isSaving ? (
                      <Loader2 size={15} className='animate-spin' />
                    ) : (
                      <ShieldCheck size={16} />
                    )
                  }
                  className='w-full sm:w-auto px-5 sm:px-8 py-3 font-bold shadow-xs shadow-[#0D9488]/20 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[44px]'
                >
                  {isSaving ? 'Mengirim Persyaratan...' : 'Simpan & Kirim Persyaratan'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default SetupProfileView;
