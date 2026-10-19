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
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';

interface SadariStep {
  step: number;
  title: string;
  desc: string;
  tip: string;
  visualNote: string;
}

const SADARI_STEPS: SadariStep[] = [
  {
    step: 1,
    title: 'Amati di Depan Cermin (Lengan Rileks)',
    desc: 'Berdiri tegak menghadap cermin dengan kedua lengan di samping badan secara rileks. Amati bentuk, ukuran, kesimetrisan, warna kulit, serta posisi kedua payudara dan puting.',
    tip: 'Perhatikan apakah ada kemerahan, kerutan kulit, atau cekungan yang tidak biasa terlihat.',
    visualNote: 'Kedua lengan lurus ke bawah di samping tubuh.',
  },
  {
    step: 2,
    title: 'Angkat Kedua Lengan ke Atas',
    desc: 'Angkat kedua lengan lurus ke atas kepala. Perhatikan apakah gerakan kedua payudara seimbang dan apakah ada tarikan kulit atau puting yang ikut tertarik ke arah dalam.',
    tip: 'Langkah ini membantu mendeteksi adanya tarikan jaringan mencurigakan di bagian bawah payudara.',
    visualNote: 'Kedua tangan lurus terangkat ke atas cermin.',
  },
  {
    step: 3,
    title: 'Berkacak Pinggang & Busungkan Dada',
    desc: 'Letakkan kedua tangan di pinggang, tekan pinggul dengan lembut sambil membusungkan dada ke depan untuk mengencangkan otot dada (pectoralis major).',
    tip: 'Amati kembali apakah timbul benjolan, cekungan seperti lesung pipi, atau perubahan kontur permukaan kulit.',
    visualNote: 'Bahu ditarik ke belakang, otot dada ditegangkan.',
  },
  {
    step: 4,
    title: 'Raba Melingkar dengan Tiga Jari',
    desc: 'Gunakan bantalan 3 jari tengah tangan kiri untuk memeriksa payudara kanan (dan sebaliknya). Buat gerakan memutar melingkar kecil dari tepi luar payudara menuju ke arah puting.',
    tip: 'Gunakan 3 tingkatan tekanan: ringan (kulit), sedang (jaringan tengah), dan dalam (mendekati dinding tulang rusuk).',
    visualNote: 'Gunakan bantalan ujung jari, bukan kuku.',
  },
  {
    step: 5,
    title: 'Pencet Lembut Puting Payudara',
    desc: 'Gunakan ibu jari dan telunjuk untuk memencet lembut area sekitar puting payudara kanan dan kiri secara bergantian.',
    tip: 'Waspadai jika keluar cairan abnormal seperti darah, nanah, atau cairan kekuningan encer tanpa sengaja.',
    visualNote: 'Lakukan pemencetan perlahan dan hati-hati.',
  },
  {
    step: 6,
    title: 'Periksa Ulang dalam Posisi Berbaring',
    desc: 'Berbaring telentang dengan meletakkan bantal kecil atau handuk terlipat di bawah pundak. Ulangi gerakan meraba seluruh payudara hingga ke area ketiak (aksila).',
    tip: 'Posisi berbaring meratakan jaringan payudara di atas dinding dada sehingga benjolan kecil jauh lebih mudah teraba.',
    visualNote: 'Raba hingga batas tulang selangka dan ketiak.',
  },
];

export default function SadariView() {
  const [isCheckedThisMonth, setIsCheckedThisMonth] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-teal-400' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title & Subtitle */}
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
            Pemeriksaan Payudara Sendiri (SADARI) untuk deteksi dini kelainan struktur payudara secara mandiri dan teratur setiap bulan sesuai rekomendasi Kementerian Kesehatan RI.
          </p>
        </div>

        {/* Quick Link to Education Articles */}
        <div className='shrink-0'>
          <Link
            to='/user/education'
            className='inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-teal-700 hover:border-teal-300 transition-colors shadow-2xs'
          >
            <span>Pustaka Artikel Edukasi</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Hero Banner: Status SADARI & Waktu Ideal */}
      <Card
        padding='lg'
        className='border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-slate-50/50 shadow-xs relative overflow-hidden'
      >
        <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='max-w-xl'>
            <span className='inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2'>
              <Sparkles size={13} />
              <span>Deteksi Dini Menyelamatkan Jiwa</span>
            </span>
            <h3 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug'>
              Kenali Perubahan Payudara Anda Sejak Dini
            </h3>
            <p className='text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed'>
              Lebih dari 80% benjolan payudara pertama kali ditemukan oleh wanita itu sendiri. SADARI dilakukan hanya 10–15 menit setiap bulan setelah masa menstruasi berakhir.
            </p>

            <div className='flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-slate-800'>
              <span className='inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs'>
                <Calendar size={14} className='text-teal-600' />
                <span>Waktu Ideal: Hari ke 7–10 dari Hari Pertama Haid</span>
              </span>
              <span className='inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-3 py-1.5 rounded-xl border border-teal-200'>
                <Clock size={14} className='text-teal-600' />
                <span>10–15 Menit / Bulan</span>
              </span>
            </div>
          </div>

          {/* Interactive Check Status Card */}
          <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-xs shrink-0 w-full md:w-80 flex flex-col gap-3 text-center'>
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
                {isCheckedThisMonth ? 'SADARI Bulan Ini Selesai' : 'Belum Periksa SADARI Bulan Ini?'}
              </h4>
              <p className='text-[11px] text-slate-500 mt-1 leading-relaxed'>
                {isCheckedThisMonth
                  ? `Pemeriksaan tercatat: ${lastCheckDate || 'Bulan ini'}. Jaga konsistensi pemeriksaan di siklus bulan depan!`
                  : 'Luangkan waktu 10 menit untuk melakukan 6 langkah pemeriksaan mandiri di bawah ini.'}
              </p>
            </div>
            <Button
              variant={isCheckedThisMonth ? 'outline' : 'primary'}
              size='sm'
              shape='pill'
              onClick={handleToggleCheck}
              className='w-full'
            >
              {isCheckedThisMonth ? 'Batalkan Tanda Periksa' : 'Saya Sudah SADARI Bulan Ini'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Panduan 3 Tingkatan Tekanan Raba (Palpasi) */}
      <Card padding='md' className='border border-slate-200/80 bg-white shadow-2xs'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100'>
            <Layers size={18} />
          </div>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-slate-900'>
              Teknik Perabaan: 3 Tingkat Tekanan Jari
            </h4>
            <p className='text-xs text-slate-500'>
              Gunakan bantalan 3 jari tengah dengan gerakan memutar melingkar pada setiap titik:
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
          <div className='bg-slate-50 p-3 rounded-xl border border-slate-200/70'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center'>
                1
              </span>
              <span className='text-xs font-bold text-slate-800'>Tekanan Ringan</span>
            </div>
            <p className='text-[11px] text-slate-600 leading-relaxed'>
              Mendeteksi jaringan tepat di bawah permukaan kulit.
            </p>
          </div>

          <div className='bg-slate-50 p-3 rounded-xl border border-slate-200/70'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center'>
                2
              </span>
              <span className='text-xs font-bold text-slate-800'>Tekanan Sedang</span>
            </div>
            <p className='text-[11px] text-slate-600 leading-relaxed'>
              Mendeteksi jaringan kelenjar payudara di lapisan tengah.
            </p>
          </div>

          <div className='bg-slate-50 p-3 rounded-xl border border-slate-200/70'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center'>
                3
              </span>
              <span className='text-xs font-bold text-slate-800'>Tekanan Dalam</span>
            </div>
            <p className='text-[11px] text-slate-600 leading-relaxed'>
              Mendeteksi jaringan dalam yang menempel pada dinding tulang rusuk.
            </p>
          </div>
        </div>
      </Card>

      {/* 6 Langkah SADARI Grid */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h4 className='text-base sm:text-lg font-bold text-slate-900'>
              6 Langkah Standar SADARI
            </h4>
            <p className='text-xs text-slate-500'>
              Lakukan secara berurutan di tempat yang terang dan tenang
            </p>
          </div>
          <span className='text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full'>
            Standar Kemenkes RI
          </span>
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
                    Langkah {item.step} dari 6
                  </span>
                </div>

                <h5 className='text-sm font-bold text-slate-800 mb-1.5 leading-snug'>
                  {item.title}
                </h5>

                <p className='text-xs text-slate-600 leading-relaxed mb-3'>
                  {item.desc}
                </p>
              </div>

              <div className='flex flex-col gap-2 mt-2'>
                <div className='bg-slate-50 rounded-xl p-2.5 border border-slate-200/80'>
                  <span className='text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5'>
                    Tips Penting:
                  </span>
                  <p className='text-[11px] text-slate-600 leading-tight'>
                    {item.tip}
                  </p>
                </div>
                <div className='text-[10px] text-slate-400 italic px-1'>
                  Catatan visual: {item.visualNote}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tanda Bahaya & Kapan Harus ke Bidan / Faskes */}
      <Card padding='md' className='border border-orange-200/80 bg-gradient-to-br from-white to-orange-50/30 shadow-xs'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200'>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-slate-900'>
              Tanda Bahaya: Kapan Harus Segera Memeriksakan Diri?
            </h4>
            <p className='text-xs text-slate-500'>
              Segera konsultasikan dengan Bidan atau Dokter bila Anda menemukan tanda-tanda berikut saat SADARI:
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-slate-600'>
          <div className='bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1 shadow-2xs'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500 shrink-0' />
              Benjolan Padat
            </span>
            <span className='text-[11px] leading-relaxed'>
              Benjolan baru yang teraba kenyal atau keras dan tidak hilang setelah selesai siklus menstruasi.
            </span>
          </div>

          <div className='bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1 shadow-2xs'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500 shrink-0' />
              Perubahan Kulit
            </span>
            <span className='text-[11px] leading-relaxed'>
              Kulit tampak berkerut seperti kulit jeruk (peau d&apos;orange), menebal, atau ada cekungan seperti lesung pipi.
            </span>
          </div>

          <div className='bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1 shadow-2xs'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500 shrink-0' />
              Kelainan Puting
            </span>
            <span className='text-[11px] leading-relaxed'>
              Puting tertarik ke arah dalam (retraksi) secara mendadak atau timbul luka/koreng yang sukar sembuh.
            </span>
          </div>

          <div className='bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1 shadow-2xs'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500 shrink-0' />
              Cairan Abnormal
            </span>
            <span className='text-[11px] leading-relaxed'>
              Keluarnya cairan berdarah, cairan jernih encer, atau nanah dari puting tanpa ditekan.
            </span>
          </div>
        </div>

        {/* CTA Bantuan Klinis */}
        <div className='mt-4 pt-3 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-2 text-xs text-slate-600'>
            <HeartHandshake size={16} className='text-teal-600 shrink-0' />
            <span>Memiliki keraguan atau keluhan setelah melakukan periksa mandiri?</span>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              to='/user/education'
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-2xs'
            >
              <span>Baca Panduan Edukasi</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
