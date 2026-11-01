import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Droplets,
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
import { PillScreeningAnswers, VerificationDocumentPayload } from '../types';

export type PillOption = 'Pil KB Kombinasi' | 'Mini Pil';

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
  const [bloodType, setBloodType] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Form States – Step 2: 9 Pertanyaan Skrining Persyaratan
  const [screeningAnswers, setScreeningAnswers] = useState<PillScreeningAnswers>({
    age: '',
    childrenCount: '',
    isPregnant: null,
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

    // Validasi Step 2: 9 Pertanyaan Skrining
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
      screeningAnswers.isPregnant === null ||
      screeningAnswers.hasContraindications === null ||
      screeningAnswers.hasHypertension === null ||
      screeningAnswers.hasBloodClotOrStroke === null ||
      screeningAnswers.hasBreastCancer === null ||
      screeningAnswers.hasSevereLiverDisease === null ||
      screeningAnswers.willingToTakeDaily === null;

    if (unansweredYesNo) {
      setErrorMessage(
        'Mohon lengkapi seluruh 9 pertanyaan pada bagian Persyaratan Penggunaan Pil KB.',
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
        bloodType: bloodType || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        schedule: {
          tabletName:
            pillType === 'Mini Pil'
              ? 'Mini Pil / Progestin (28 Tablet)'
              : 'Pil KB Kombinasi (28 Tablet)',
          category: pillType === 'Mini Pil' ? 'Pil KB Progestin' : 'Pil KB Kombinasi',
          frequency: 'daily',
          dayOfWeek: 'Setiap Hari',
          timeSlot: '20:00',
        },
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
    <div className='flex-1 min-h-[100dvh] w-full bg-gradient-to-b from-[#F8FAFC] via-[#F0FDFA]/40 to-[#F8FAFC] flex flex-col justify-center items-center p-3.5 sm:p-6 md:p-8 pb-6 sm:pb-8 box-border relative overflow-x-hidden'>
      {/* Ambient decorative bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-64 h-64 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none' />

      <div className='w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl border border-[#E2E8F0] shadow-xl shadow-[#0D9488]/5 p-5 sm:p-8 relative z-10 flex flex-col gap-5 my-auto'>
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
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
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
                <div className='min-w-0'>
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
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
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
                <div className='min-w-0'>
                  <span className='block text-[11px] sm:text-xs leading-tight font-extrabold truncate'>
                    2. Skrining & Dokumen
                  </span>
                  <span className='text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block'>
                    9 Pertanyaan & Bukti
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
            <h1 className='text-lg sm:text-2xl font-black text-[#0F172A] tracking-tight'>
              {currentStep === 1 ? 'Lengkapi Data Profil' : 'Persyaratan & Verifikasi Akseptor'}
            </h1>
            <p className='text-xs sm:text-sm text-[#334155] mt-1 leading-relaxed'>
              {currentStep === 1
                ? `Halo, ${authUser?.name || 'Akseptor Setia'}! Pilih jenis pil KB yang akan Anda konsumsi dan faskes rujukan Anda.`
                : 'Jawab 9 pertanyaan skrining kontraindikasi medis dan unggah salah satu bukti dokumen status pernikahan.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className='p-3 sm:p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
            <AlertCircle size={16} className='text-[#DC2626] shrink-0' />
            <span>
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
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='block text-xs font-bold text-[#0F172A]'>
                    Jenis Pil KB Akseptor <span className='text-[#0D9488]'>*</span>
                  </label>
                  <span className='text-[10px] sm:text-[11px] text-[#0D9488] font-semibold bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#CCFBF1]'>
                    Dapat diubah di profil
                  </span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
                  {/* Option 1: KB Pil Kombinasi */}
                  <button
                    type='button'
                    onClick={() => setPillType('Pil KB Kombinasi')}
                    className={`relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      pillType === 'Pil KB Kombinasi'
                        ? 'border-[#0D9488] bg-[#F0FDFA] ring-2 ring-[#0D9488]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        pillType === 'Pil KB Kombinasi'
                          ? 'bg-[#0D9488] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Pill size={18} />
                    </div>
                    <div className='flex-1 min-w-0 pr-4'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-bold text-xs sm:text-sm text-[#0F172A] leading-tight'>
                          KB Pil Kombinasi
                        </span>
                      </div>
                      <p className='text-[11px] text-slate-500 mt-0.5 font-medium leading-snug'>
                        Estrogen & Progestin (28 Tablet)
                      </p>
                      <span className='inline-block text-[10px] text-[#0D9488] font-bold mt-1.5 bg-white/80 px-1.5 py-0.5 rounded border border-[#CCFBF1]'>
                        Umum / Non-Menyusui
                      </span>
                    </div>
                    <div
                      className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        pillType === 'Pil KB Kombinasi'
                          ? 'bg-[#0D9488] text-white'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {pillType === 'Pil KB Kombinasi' && <Check size={11} strokeWidth={3} />}
                    </div>
                  </button>

                  {/* Option 2: Mini Pil (Progestin Only) */}
                  <button
                    type='button'
                    onClick={() => setPillType('Mini Pil')}
                    className={`relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      pillType === 'Mini Pil'
                        ? 'border-[#0D9488] bg-[#F0FDFA] ring-2 ring-[#0D9488]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        pillType === 'Mini Pil'
                          ? 'bg-[#0D9488] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Pill size={18} />
                    </div>
                    <div className='flex-1 min-w-0 pr-4'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-bold text-xs sm:text-sm text-[#0F172A] leading-tight'>
                          Mini Pil (Progestin)
                        </span>
                      </div>
                      <p className='text-[11px] text-slate-500 mt-0.5 font-medium leading-snug'>
                        Progestin Saja / POP (28 Tablet)
                      </p>
                      <span className='inline-block text-[10px] text-[#ea580c] font-bold mt-1.5 bg-[#fff7ed] px-1.5 py-0.5 rounded border border-[#ffedd5]'>
                        Aman Ibu Menyusui
                      </span>
                    </div>
                    <div
                      className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        pillType === 'Mini Pil'
                          ? 'bg-[#0D9488] text-white'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {pillType === 'Mini Pil' && <Check size={11} strokeWidth={3} />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Domisili / Faskes (Required) */}
              <div>
                <label className='block text-xs font-bold text-[#0F172A] mb-1.5'>
                  Domisili / Faskes Rujukan <span className='text-[#0D9488]'>*</span>
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-3.5 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
                    <Building2 size={15} />
                  </div>
                  <input
                    type='text'
                    placeholder='Contoh: Puskesmas Kebayoran Baru / Jakarta Selatan'
                    value={schoolOrOrg}
                    onChange={e => setSchoolOrOrg(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 pl-12 sm:pl-13 pr-4 py-2.5 sm:py-3 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
                  />
                </div>
              </div>

              {/* Date of Birth & Blood Type */}
              <div className='grid grid-cols-2 gap-2.5 sm:gap-3.5'>
                <div className='min-w-0'>
                  <label className='block text-xs font-bold text-[#0F172A] mb-1.5 truncate'>
                    Tanggal Lahir{' '}
                    <span className='text-[#64748B] font-normal text-[10px] sm:text-[11px]'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
                      <Calendar size={13} />
                    </div>
                    <input
                      type='date'
                      value={dateOfBirth}
                      max={maxDate}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className='w-full min-w-0 bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 pl-10 sm:pl-11 pr-2.5 sm:pr-3 py-2.5 sm:py-3 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs'
                    />
                  </div>
                </div>

                <div className='min-w-0'>
                  <label className='block text-xs font-bold text-[#0F172A] mb-1.5 truncate'>
                    Gol. Darah{' '}
                    <span className='text-[#64748B] font-normal text-[10px] sm:text-[11px]'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative flex items-center'>
                    <div className='absolute left-3 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488]'>
                      <Droplets size={13} />
                    </div>
                    <select
                      value={bloodType}
                      onChange={e => setBloodType(e.target.value)}
                      className='w-full min-w-0 bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs cursor-pointer'
                    >
                      <option value=''>Pilih Golongan</option>
                      <option value='A'>A</option>
                      <option value='B'>B</option>
                      <option value='AB'>AB</option>
                      <option value='O'>O</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Height & Weight */}
              <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-[#0F172A] mb-1.5 truncate text-center sm:text-left'>
                    Tinggi <span className='text-[#64748B] font-normal text-[10px]'>(cm)</span>
                  </label>
                  <input
                    type='number'
                    placeholder='158'
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs text-center'
                  />
                </div>

                <div className='min-w-0'>
                  <label className='block text-[11px] sm:text-xs font-bold text-[#0F172A] mb-1.5 truncate text-center sm:text-left'>
                    Berat <span className='text-[#64748B] font-normal text-[10px]'>(kg)</span>
                  </label>
                  <input
                    type='number'
                    placeholder='48'
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className='w-full bg-white text-xs sm:text-sm text-[#0F172A] rounded-full border border-slate-200 px-2 sm:px-3 py-2 sm:py-2.5 outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 transition-all shadow-2xs text-center'
                  />
                </div>
              </div>

              {/* Action Row - Step 1 */}
              <div className='pt-4 mt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-3'>
                <button
                  type='button'
                  onClick={() => logout()}
                  className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer'
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
                  className='flex-1 sm:flex-initial px-6 sm:px-8 py-3 font-bold shadow-xs shadow-[#0D9488]/20 text-xs sm:text-sm flex items-center justify-center gap-2'
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
                  <div className='truncate'>
                    <span className='font-extrabold text-[#0F172A]'>{pillType}</span>
                    <span className='mx-1.5 text-slate-300'>•</span>
                    <span className='text-slate-600 truncate'>{schoolOrOrg}</span>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => setCurrentStep(1)}
                  className='shrink-0 text-[11px] font-bold text-[#0D9488] underline hover:text-teal-800 cursor-pointer'
                >
                  Ubah Profil
                </button>
              </div>

              {/* Bagian 1: Persyaratan Penggunaan Pil KB (9 Pertanyaan) */}
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
              <div className='pt-4 mt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-3'>
                <button
                  type='button'
                  onClick={handlePrevStep}
                  className='flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer'
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
                  className='flex-1 sm:flex-initial px-6 sm:px-8 py-3 font-bold shadow-xs shadow-[#0D9488]/20 text-xs sm:text-sm flex items-center justify-center gap-2'
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
