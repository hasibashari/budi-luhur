'use client';

import React, { useState, useEffect } from 'react';
import {
  Ribbon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';

interface SadariStep {
  step: number;
  title: string;
  desc: string;
  tip: string;
}

const SADARI_STEPS: SadariStep[] = [
  {
    step: 1,
    title: 'Amati di Depan Cermin (Lengan Rileks)',
    desc: 'Berdiri tegak menghadap cermin dengan kedua lengan di samping badan. Amati bentuk, ukuran, kesimetrisan, warna kulit, serta posisi kedua payudara dan puting.',
    tip: 'Perhatikan apakah ada kemerahan, kerutan kulit, atau cekungan yang tidak biasa.',
  },
  {
    step: 2,
    title: 'Angkat Kedua Lengan ke Atas',
    desc: 'Angkat kedua lengan lurus ke atas kepala. Perhatikan apakah gerakan payudara seimbang dan apakah ada tarikan kulit atau puting yang ikut tertarik ke dalam.',
    tip: 'Langkah ini membantu mendeteksi adanya tarikan jaringan di bagian bawah payudara.',
  },
  {
    step: 3,
    title: 'Berkacak Pinggang & Busungkan Dada',
    desc: 'Letakkan kedua tangan di pinggang, tekan pinggul dengan lembut sambil membusungkan dada ke depan untuk mengencangkan otot dada (pectoralis).',
    tip: 'Amati kembali apakah timbul benjolan atau perubahan kontur permukaan kulit.',
  },
  {
    step: 4,
    title: 'Raba Melingkar dengan Tiga Jari',
    desc: 'Gunakan bantalan 3 jari tengah tangan kiri untuk memeriksa payudara kanan (dan sebaliknya). Buat gerakan memutar melingkar kecil dari tepi luar payudara menuju ke arah puting.',
    tip: 'Gunakan 3 tingkatan tekanan: ringan (kulit), sedang (jaringan tengah), dan dalam (mendekati tulang rusuk).',
  },
  {
    step: 5,
    title: 'Pencet Lembut Puting Payudara',
    desc: 'Gunakan ibu jari dan telunjuk untuk memencet lembut area sekitar puting payudara kanan dan kiri secara bergantian.',
    tip: 'Waspadai jika keluar cairan abnormal seperti darah, nanah, atau cairan kekuningan encer.',
  },
  {
    step: 6,
    title: 'Periksa Ulang dalam Posisi Berbaring',
    desc: 'Berbaring telentang dengan meletakkan bantal kecil atau handuk di bawah pundak. Ulangi gerakan meraba seluruh payudara hingga ke area ketiak (aksila).',
    tip: 'Posisi berbaring meratakan jaringan payudara di atas dinding dada sehingga benjolan kecil lebih mudah teraba.',
  },
];

export function SadariGuideSection() {
  const [isCheckedThisMonth, setIsCheckedThisMonth] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedDate = localStorage.getItem('pilluna_sadari_last_checked');
      if (savedDate) {
        setLastCheckDate(savedDate);
        // Check if marked in the current month
        const checkYearMonth = new Date(savedDate).toISOString().slice(0, 7);
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        if (checkYearMonth === currentYearMonth) {
          setIsCheckedThisMonth(true);
        }
      }
    } catch {
      // localStorage may fail in sandbox
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

      {/* Hero Banner: Deteksi Dini SADARI */}
      <Card padding='lg' className='border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-slate-50/50 shadow-xs relative overflow-hidden'>
        <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5'>
          <div className='max-w-xl'>
            <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-teal-800 border border-teal-200 shadow-2xs mb-3'>
              <Ribbon size={14} className='text-teal-600' />
              <span>Panduan Deteksi Dini Kesehatan Payudara</span>
            </div>
            <h3 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug'>
              Kenali & Jaga Kesehatan Payudara dengan SADARI Bulanan
            </h3>
            <p className='text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed'>
              Pemeriksaan Payudara Sendiri (SADARI) adalah langkah skrining proaktif paling mandiri dan terbukti efektif untuk mendeteksi dini kelainan struktur payudara sedini mungkin.
            </p>

            <div className='flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-slate-800'>
              <span className='inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs'>
                <Calendar size={14} className='text-teal-600' />
                <span>Waktu Ideal: Hari ke 7–10 dari Hari Pertama Haid</span>
              </span>
              <span className='inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-3 py-1.5 rounded-xl border border-teal-200'>
                <Sparkles size={14} className='text-teal-600' />
                <span>Hanya 10–15 Menit / Bulan</span>
              </span>
            </div>
          </div>

          {/* Interactive Quick Action Card */}
          <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-xs shrink-0 w-full md:w-72 flex flex-col gap-3 text-center'>
            <div className='w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100 shadow-xs'>
              {isCheckedThisMonth ? <CheckCircle2 size={24} className='text-teal-600' /> : <Eye size={24} />}
            </div>
            <div>
              <h4 className='text-sm font-bold text-slate-800'>
                {isCheckedThisMonth ? 'SADARI Bulan Ini Selesai' : 'Belum Melakukan SADARI?'}
              </h4>
              <p className='text-[11px] text-slate-500 mt-1'>
                {isCheckedThisMonth
                  ? `Tercatat pada: ${lastCheckDate || 'Bulan ini'}`
                  : 'Lakukan pemeriksaan 6 langkah di bawah ini secara teratur.'}
              </p>
            </div>
            <Button
              variant={isCheckedThisMonth ? 'outline' : 'primary'}
              size='sm'
              shape='pill'
              onClick={handleToggleCheck}
              className='w-full'
            >
              {isCheckedThisMonth ? 'Tandai Belum' : 'Saya Sudah SADARI'}
            </Button>
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
              Ikuti panduan visual dan raba secara teliti setiap langkah
            </p>
          </div>
          <span className='text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full'>
            Sesuai Panduan Kemenkes RI
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

              <div className='bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 mt-2'>
                <span className='text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5'>
                  Tips Pemeriksaan:
                </span>
                <p className='text-[11px] text-slate-600 leading-tight'>
                  {item.tip}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tanda Bahaya & Kapan Harus ke Bidan / Faskes */}
      <Card padding='md' className='border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-xs'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100'>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className='text-sm sm:text-base font-bold text-slate-900'>
              Kapan Harus Segera Memeriksakan Diri ke Bidan / Dokter?
            </h4>
            <p className='text-xs text-slate-500'>
              Waspadai gejala-gejala berikut jika teraba atau terlihat saat melakukan SADARI:
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-slate-600'>
          <div className='bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col gap-1'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500' />
              Benjolan Teraba Padat
            </span>
            <span>Benjolan baru yang tidak hilang setelah selesai siklus menstruasi.</span>
          </div>

          <div className='bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col gap-1'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500' />
              Perubahan Kulit
            </span>
            <span>Kulit mengkerut menyerupai kulit jeruk (peau d&apos;orange) atau menebal.</span>
          </div>

          <div className='bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col gap-1'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500' />
              Kelainan Puting
            </span>
            <span>Puting tertarik ke dalam (retraksi) atau timbul luka koreng yang sukar sembuh.</span>
          </div>

          <div className='bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col gap-1'>
            <span className='font-bold text-slate-900 flex items-center gap-1.5 text-xs'>
              <AlertCircle size={14} className='text-red-500' />
              Cairan Abnormal
            </span>
            <span>Keluarnya cairan berdarah atau cairan jernih encer secara spontan dari puting.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
