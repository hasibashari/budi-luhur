import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ribbon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Clock,
  Layers,
  HeartHandshake,
  BookOpen,
  Play,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import {
  SADARI_DEFINITION,
  SADARI_STEPS,
  SADARI_PRESSURE_LEVELS,
  SADARI_WARNING_SIGNS,
  SADARI_REFERENCES,
} from '../constants/sadari.constants';
import { SadariGuidedModal } from '../components/SadariGuidedModal';
import { SadariTimingWidget } from '../components/SadariTimingWidget';

export default function SadariView() {
  const [isCheckedThisMonth, setIsCheckedThisMonth] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGuidedModalOpen, setIsGuidedModalOpen] = useState(false);
  const [selectedInitialStep, setSelectedInitialStep] = useState(1);

  useEffect(() => {
    try {
      const savedDate = localStorage.getItem('pilluna_sadari_last_checked');
      if (savedDate) {
        setLastCheckDate(savedDate);
        const checkYearMonth = new Date(savedDate).toISOString().slice(0, 7);
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        if (checkYearMonth === currentYearMonth) {
          setIsCheckedThisMonth(true);
        }
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const handleToggleCheck = () => {
    const nextStatus = !isCheckedThisMonth;
    setIsCheckedThisMonth(nextStatus);

    if (nextStatus) {
      const nowStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setLastCheckDate(nowStr);
      try {
        localStorage.setItem('pilluna_sadari_last_checked', new Date().toISOString());
      } catch {
        // ignore
      }
      setToastMessage('Pemeriksaan mandiri SADARI bulan ini telah dicatat');
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setLastCheckDate(null);
      try {
        localStorage.removeItem('pilluna_sadari_last_checked');
      } catch {
        // ignore
      }
    }
  };

  const handleOpenGuidedAtStep = (stepNumber: number) => {
    setSelectedInitialStep(stepNumber);
    setIsGuidedModalOpen(true);
  };

  const handleCompleteGuided = () => {
    if (!isCheckedThisMonth) {
      handleToggleCheck();
    }
    setToastMessage('Selamat! Anda telah menyelesaikan 6 langkah SADARI bulan ini.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* Interactive Guided Modal */}
      <SadariGuidedModal
        isOpen={isGuidedModalOpen}
        onClose={() => setIsGuidedModalOpen(false)}
        onComplete={handleCompleteGuided}
        initialStep={selectedInitialStep}
      />

      {/* Floating Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-teal-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title & Top Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold border border-teal-200 mb-2'>
            <Ribbon size={14} className='text-teal-600' />
            <span>Skrining Mandiri Bulanan</span>
          </div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight'>
            Panduan Mandiri SADARI
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl'>
            Pemeriksaan Payudara Sendiri secara berkala untuk mengenali kondisi normal dan
            mendeteksi perubahan sejak dini.
          </p>
        </div>

        {/* Quick Link to Education Library */}
        <div className='shrink-0 w-full sm:w-auto'>
          <Link
            to='/user/education'
            className='inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-teal-700 hover:border-teal-300 transition-colors shadow-2xs w-full sm:w-auto text-center'
          >
            <span>Pustaka Artikel Edukasi</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Hero Banner: Definisi SADARI, Status, & Quick Start Guided Mode */}
      <Card
        padding='md'
        className='border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-slate-50/50 shadow-xs relative overflow-hidden p-4 sm:p-6 lg:p-7'
      >
        <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6'>
          <div className='max-w-xl'>
            <span className='inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2'>
              <Sparkles size={13} />
              <span>Deteksi Dini Menyelamatkan Jiwa</span>
            </span>
            <h3 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug'>
              Kenali Kondisi Payudara Anda Sejak Dini
            </h3>
            <p className='text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed'>
              {SADARI_DEFINITION.fullText}
            </p>

            <div className='flex flex-wrap items-center gap-2 sm:gap-2.5 mt-3.5 sm:mt-4 text-[11px] sm:text-xs font-semibold text-slate-800'>
              <span className='inline-flex items-center gap-1.5 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200 shadow-2xs'>
                <Calendar size={13} className='text-teal-600' />
                <span>Rutin 1 Kali / Bulan</span>
              </span>
              <span className='inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-teal-200'>
                <Clock size={13} className='text-teal-600' />
                <span>10–15 Menit Praktik</span>
              </span>
              <span className='inline-flex items-center gap-1.5 bg-white text-slate-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200'>
                <BookOpen size={13} className='text-teal-600' />
                <span>Sumber: {SADARI_DEFINITION.citation}</span>
              </span>
            </div>

            {/* Guided Practice CTA Button */}
            <div className='mt-4 sm:mt-5 pt-1'>
              <Button
                variant='primary'
                size='md'
                shape='pill'
                onClick={() => handleOpenGuidedAtStep(1)}
                icon={<Play size={16} className='fill-white shrink-0' />}
                className='w-full sm:w-auto inline-flex items-center justify-center gap-2.5 shadow-md shadow-teal-700/25 hover:shadow-lg hover:shadow-teal-700/30 text-xs sm:text-sm py-2.5 sm:py-3 px-5 sm:px-6 whitespace-normal leading-snug font-bold active:scale-[0.98] transition-all text-center'
              >
                Mulai Praktik Terpandu (Langkah demi Langkah)
              </Button>
            </div>
          </div>

          {/* Interactive Monthly Check Status Card */}
          <div className='bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs shrink-0 w-full md:w-80 flex flex-col gap-3 text-center'>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border transition-colors ${
                isCheckedThisMonth
                  ? 'bg-teal-50 text-teal-600 border-teal-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {isCheckedThisMonth ? (
                <CheckCircle2 size={26} className='text-teal-600' />
              ) : (
                <Eye size={24} />
              )}
            </div>
            <div>
              <h4 className='text-sm font-bold text-slate-800'>
                {isCheckedThisMonth
                  ? 'SADARI Bulan Ini Selesai'
                  : 'Belum Periksa SADARI Bulan Ini?'}
              </h4>
              <p className='text-[11px] text-slate-500 mt-1 leading-relaxed'>
                {isCheckedThisMonth
                  ? `Pemeriksaan tercatat pada: ${lastCheckDate || 'Bulan ini'}. Pertahankan konsistensi pemeriksaan di siklus bulan depan!`
                  : 'Luangkan waktu 10 menit untuk melakukan 6 langkah pemeriksaan mandiri di bawah ini.'}
              </p>
            </div>
            <Button
              variant={isCheckedThisMonth ? 'outline' : 'primary'}
              size='sm'
              shape='pill'
              onClick={handleToggleCheck}
              className='w-full py-2 font-bold'
            >
              {isCheckedThisMonth ? 'Batalkan Tanda Periksa' : 'Saya Sudah SADARI Bulan Ini'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Interactive Timing Calculator Widget */}
      <SadariTimingWidget />

      {/* Panduan 3 Tingkatan Tekanan Raba (Palpasi) */}
      <Card padding='md' className='border border-slate-200/80 bg-white shadow-2xs p-4 sm:p-5'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100'>
            <Layers size={18} />
          </div>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-slate-900'>
              Teknik Perabaan: 3 Tingkat Tekanan Jari
            </h4>
            <p className='text-xs text-slate-500'>
              Gunakan bantalan 3 jari tengah (telunjuk, tengah, manis) dengan gerakan memutar
              melingkar bertahap:
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
          {SADARI_PRESSURE_LEVELS.map(level => (
            <div
              key={level.level}
              className='bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 flex flex-col justify-between'
            >
              <div>
                <div className='flex items-center gap-2 mb-1.5'>
                  <span className='w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center'>
                    {level.level}
                  </span>
                  <span className='text-xs font-bold text-slate-800'>{level.name}</span>
                </div>
                <span className='text-[10px] font-semibold text-teal-700 block mb-1'>
                  Target: {level.target}
                </span>
                <p className='text-[11px] text-slate-600 leading-relaxed'>{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 6 Langkah Standar SADARI */}
      <div>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
          <div>
            <h4 className='text-base sm:text-lg font-bold text-slate-900'>
              6 Langkah Standar SADARI
            </h4>
            <p className='text-xs text-slate-500'>
              Lakukan secara berurutan di tempat yang tenang dengan pencahayaan yang cukup
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full'>
              Standar Medis Klinis
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
          {SADARI_STEPS.map(item => (
            <Card
              key={item.step}
              padding='md'
              className='border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-400/80 hover:shadow-sm transition-all bg-white'
            >
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <span className='w-7 h-7 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shadow-teal-600/30'>
                    {item.step}
                  </span>
                  <span className='text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100'>
                    {item.badge}
                  </span>
                </div>

                <h5 className='text-sm font-bold text-slate-800 mb-1.5 leading-snug'>
                  {item.title}
                </h5>

                <p className='text-xs text-slate-600 leading-relaxed mb-3'>{item.instruction}</p>
              </div>

              <div className='flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100'>
                <div className='bg-slate-50 rounded-xl p-2.5 border border-slate-200/80'>
                  <span className='text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5'>
                    Tips Penting:
                  </span>
                  <p className='text-[11px] text-slate-600 leading-tight'>{item.tactileTip}</p>
                </div>
                <div className='text-[10px] text-slate-400 italic px-1'>
                  Catatan visual: {item.visualNote}
                </div>
                <div className='flex items-center justify-between pt-1 px-1 text-[10px] text-slate-500'>
                  <span>
                    Sumber: <strong>{item.citation}</strong>
                  </span>
                  <button
                    type='button'
                    onClick={() => handleOpenGuidedAtStep(item.step)}
                    className='text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200/60 transition-colors cursor-pointer shrink-0 text-[11px]'
                  >
                    <span>Buka Panduan</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tanda Bahaya & Kapan Harus ke Dokter / Faskes */}
      <Card
        padding='md'
        className='border border-orange-200/80 bg-gradient-to-br from-white to-orange-50/30 shadow-xs p-4 sm:p-5'
      >
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200'>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-slate-900'>
              Tanda Bahaya: Kapan Harus Segera Memeriksakan Diri?
            </h4>
            <p className='text-xs text-slate-500'>
              Segera konsultasikan dengan Dokter atau Fasilitas Kesehatan bila Anda menemukan
              tanda-tanda berikut saat SADARI:
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-2 text-xs text-slate-600'>
          {SADARI_WARNING_SIGNS.map(sign => (
            <div
              key={sign.id}
              className='bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1 shadow-2xs'
            >
              <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
                <AlertCircle size={14} className='text-red-500 shrink-0' />
                {sign.title}
              </span>
              <span className='text-[11px] leading-relaxed'>{sign.description}</span>
            </div>
          ))}
        </div>

        {/* CTA Bantuan Klinis */}
        <div className='mt-4 pt-3 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-2 text-xs text-slate-600'>
            <HeartHandshake size={16} className='text-teal-600 shrink-0' />
            <span>Memiliki keraguan atau keluhan setelah melakukan periksa mandiri?</span>
          </div>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <Link
              to='/user/education'
              className='inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-2xs w-full sm:w-auto text-center'
            >
              <span>Baca Panduan Edukasi</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </Card>

      {/* Referensi Ilmiah Resmi (Daftar Pustaka) */}
      <Card
        padding='md'
        className='border border-slate-200/80 bg-slate-50/60 shadow-2xs p-4 sm:p-5'
      >
        <div className='flex items-center gap-2 mb-2'>
          <BookOpen size={16} className='text-teal-700 shrink-0' />
          <h4 className='text-xs sm:text-sm font-bold text-slate-800'>
            Referensi & Sumber Pustaka Medis
          </h4>
        </div>
        <p className='text-[11px] text-slate-500 mb-3'>
          Materi pada panduan SADARI ini disusun berdasarkan rujukan ilmiah terpercaya dan pedoman
          Kementerian Kesehatan Republik Indonesia:
        </p>
        <ul className='flex flex-col gap-2'>
          {SADARI_REFERENCES.map(ref => (
            <li
              key={ref.citation}
              className='text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/70 leading-relaxed'
            >
              <strong className='text-slate-800'>
                {ref.authors} ({ref.year}).
              </strong>{' '}
              {ref.title}. <em className='text-slate-600'>{ref.source}</em>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
