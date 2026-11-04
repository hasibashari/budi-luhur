import React from 'react';
import { HeartPulse, Info, Activity, AlertTriangle, Stethoscope, Clock } from 'lucide-react';
import { PillScreeningAnswers } from '../types';

export interface PillScreeningSectionProps {
  answers: PillScreeningAnswers;
  onChange: (updated: Partial<PillScreeningAnswers>) => void;
  pillType: string;
}

export function PillScreeningSection({ answers, onChange, pillType }: PillScreeningSectionProps) {
  const handleToggle = (key: keyof PillScreeningAnswers, value: boolean) => {
    onChange({ [key]: value });
  };

  const yesNoQuestions: {
    key: keyof PillScreeningAnswers;
    number: number;
    title: string;
    description?: string;
    noteForCombination?: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      number: 3,
      key: 'hasContraindications',
      title: 'Apakah Anda memiliki kondisi medis yang menjadi kontraindikasi pil KB?',
      description: 'Contoh: migrain dengan aura, perdarahan abnormal tanpa sebab yang jelas, dll.',
      icon: <AlertTriangle size={16} className='text-rose-600' />,
    },
    {
      number: 4,
      key: 'hasHypertension',
      title: 'Apakah Anda memiliki tekanan darah tinggi yang tidak terkontrol?',
      description: 'Tekanan darah sistolik >140 mmHg atau diastolik >90 mmHg tanpa pengobatan.',
      icon: <Activity size={16} className='text-red-500' />,
    },
    {
      number: 5,
      key: 'hasBloodClotOrStroke',
      title:
        'Apakah Anda memiliki riwayat penggumpalan darah atau stroke, terutama untuk pil KB kombinasi?',
      description:
        'Termasuk riwayat DVT (Deep Vein Thrombosis), emboli paru, atau serangan stroke.',
      noteForCombination: true,
      icon: <HeartPulse size={16} className='text-red-600' />,
    },
    {
      number: 6,
      key: 'hasBreastCancer',
      title: 'Apakah Anda sedang menderita kanker payudara aktif?',
      description: 'Riwayat atau diagnosis kanker yang sensitif terhadap pengaruh hormon.',
      icon: <Stethoscope size={16} className='text-purple-600' />,
    },
    {
      number: 7,
      key: 'hasSevereLiverDisease',
      title: 'Apakah Anda memiliki penyakit hati berat?',
      description: 'Seperti hepatitis aktif, sirosis hati dekompensata, atau tumor hati.',
      icon: <AlertTriangle size={16} className='text-amber-600' />,
    },
    {
      number: 8,
      key: 'willingToTakeDaily',
      title: 'Apakah Anda bersedia mengonsumsi pil KB secara teratur setiap hari?',
      description:
        'Efektivitas pil KB bergantung pada kepatuhan minum di waktu yang sama setiap hari.',
      icon: <Clock size={16} className='text-teal-600' />,
    },
  ];

  return (
    <div className='flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200'>
      {/* Section Header */}
      <div className='flex items-start gap-3'>
        <div className='w-9 h-9 rounded-xl bg-teal-100/80 flex items-center justify-center text-teal-700 shrink-0 mt-0.5 shadow-2xs'>
          <HeartPulse size={18} />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h2 className='text-sm sm:text-base font-extrabold text-slate-900 tracking-tight'>
              Persyaratan Penggunaan Pil KB
            </h2>
            <span className='text-[10px] sm:text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200'>
              Skrining Awal
            </span>
          </div>
          <p className='text-xs text-slate-600 mt-0.5 leading-relaxed'>
            Jawab 8 pertanyaan di bawah ini secara jujur untuk peninjauan kelayakan dan keamanan
            kontrasepsi oleh tim kesehatan admin.
          </p>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className='p-3 sm:p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-teal-900 text-[11px] sm:text-xs flex items-start gap-2.5 leading-relaxed'>
        <Info size={16} className='text-teal-700 shrink-0 mt-0.5' />
        <div>
          <span className='font-bold text-teal-950'>Catatan Peninjauan Medis:</span> Jawaban Anda
          tidak otomatis menolak pendaftaran secara sepihak. Admin dan tenaga kesehatan akan
          meninjau kondisi Anda secara menyeluruh serta menyesuaikan rekomendasi pil KB (
          <span className='font-semibold text-teal-800'>{pillType}</span>).
        </div>
      </div>

      {/* Pertanyaan 1 & 2: Input Angka */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
        {/* Q1: Usia */}
        <div className='p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <span className='w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0'>
                1
              </span>
              <label
                htmlFor='screening-age'
                className='text-xs font-bold text-slate-800 leading-snug'
              >
                Berapa usia Anda saat ini? <span className='text-teal-600'>*</span>
              </label>
            </div>
            <p className='text-[11px] text-slate-500 pl-7'>
              Rentang usia akseptor kontrasepsi (tahun).
            </p>
          </div>
          <div className='pl-7'>
            <div className='relative flex items-center max-w-[160px]'>
              <input
                id='screening-age'
                type='number'
                min={15}
                max={60}
                placeholder='24'
                value={answers.age}
                onChange={e => onChange({ age: e.target.value ? Number(e.target.value) : '' })}
                className='w-full bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-left'
              />
              <span className='absolute right-3 text-xs text-slate-400 pointer-events-none'>
                Tahun
              </span>
            </div>
          </div>
        </div>

        {/* Q2: Jumlah Anak */}
        <div className='p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <span className='w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0'>
                2
              </span>
              <label
                htmlFor='screening-children'
                className='text-xs font-bold text-slate-800 leading-snug'
              >
                Berapa jumlah anak yang Anda miliki? <span className='text-teal-600'>*</span>
              </label>
            </div>
            <p className='text-[11px] text-slate-500 pl-7'>Isi 0 jika Anda belum memiliki anak.</p>
          </div>
          <div className='pl-7'>
            <div className='relative flex items-center max-w-[160px]'>
              <input
                id='screening-children'
                type='number'
                min={0}
                max={20}
                placeholder='0'
                value={answers.childrenCount}
                onChange={e =>
                  onChange({ childrenCount: e.target.value !== '' ? Number(e.target.value) : '' })
                }
                className='w-full bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-left'
              />
              <span className='absolute right-3 text-xs text-slate-400 pointer-events-none'>
                Anak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pertanyaan 3-8: Ya / Tidak Interaktif */}
      <div className='flex flex-col gap-2.5 pt-1'>
        {yesNoQuestions.map(q => {
          const val = answers[q.key];
          return (
            <div
              key={String(q.key)}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                val === true
                  ? 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                  : val === false
                    ? 'bg-white border-slate-200 shadow-2xs'
                    : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                {/* Text & Description */}
                <div className='flex items-start gap-2.5 flex-1 min-w-0'>
                  <span className='w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5'>
                    {q.number}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <p className='text-xs sm:text-sm font-bold text-slate-900 leading-snug'>
                        {q.title} <span className='text-teal-600'>*</span>
                      </p>
                      {q.noteForCombination && pillType === 'Pil KB Kombinasi' && (
                        <span className='text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded'>
                          Perhatian Khusus Kombinasi
                        </span>
                      )}
                    </div>
                    {q.description && (
                      <p className='text-[11px] text-slate-500 mt-0.5 leading-relaxed'>
                        {q.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Ya / Tidak Buttons */}
                <div className='w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 pt-2 sm:pt-0 pl-7 sm:pl-0'>
                  {/* Option YA */}
                  <button
                    type='button'
                    onClick={() => handleToggle(q.key, true)}
                    className={`min-h-[40px] sm:min-h-[36px] px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      val === true
                        ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>Ya</span>
                  </button>

                  {/* Option TIDAK */}
                  <button
                    type='button'
                    onClick={() => handleToggle(q.key, false)}
                    className={`min-h-[40px] sm:min-h-[36px] px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      val === false
                        ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>Tidak</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PillScreeningSection;
