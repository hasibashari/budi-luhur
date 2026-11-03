import { Info, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/src/shared/components/ui/Card';

export function ScheduleGuideCard() {
  return (
    <div className='flex flex-col gap-4'>
      {/* Medical Guidelines / Petunjuk Minum Pil KB */}
      <Card padding='md'>
        <div className='flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 mb-3'>
          <div className='w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0'>
            <Info size={15} />
          </div>
          <h4>Petunjuk Minum Pil KB</h4>
        </div>

        <ul className='space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed'>
          <li className='flex items-start gap-2.5'>
            <span className='w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-teal-100'>
              1
            </span>
            <span>
              <strong>Jam Sama Setiap Hari:</strong> Sangat penting meminum pil pada jam yang persis
              sama setiap hari agar kadar hormon dalam sirkulasi darah tetap stabil.
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-teal-100'>
              2
            </span>
            <span>
              <strong>Setelah Makan / Sebelum Tidur:</strong> Dianjurkan diminum setelah makan malam
              atau menjelang tidur untuk meminimalkan potensi rasa mual awal adaptasi tubuh.
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-teal-100'>
              3
            </span>
            <span>
              <strong>Jika Terlupa &lt; 12 Jam:</strong> Segera minum 1 pil yang terlupa saat
              teringat, lalu lanjutkan pil berikutnya pada jam biasanya seperti biasa.
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-teal-100'>
              4
            </span>
            <span>
              <strong>Konsistensi 28 Tablet:</strong> Lanjutkan blister baru tanpa jeda hari setelah
              seluruh 28 tablet habis untuk menjaga perlindungan kontrasepsi berkesinambungan.
            </span>
          </li>
        </ul>
      </Card>

      {/* Why Consistent Time Card */}
      <Card padding='md' className='bg-teal-50/60 border border-teal-100'>
        <h4 className='text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5'>
          <span>Kenapa Harus Jam yang Sama?</span>
          <span>⏰</span>
        </h4>
        <p className='text-xs text-teal-800/80 leading-relaxed'>
          Pil KB bekerja menjaga kestabilan kadar hormon pencegah ovulasi dalam tubuh selama 24 jam.
          Keterlambatan minum pil lebih dari beberapa jam dapat memicu penurunan hormon dan
          menurunkan efektivitas proteksi kontrasepsi.
        </p>
      </Card>

      {/* Educational Link Card */}
      <Card
        padding='md'
        className='bg-gradient-to-br from-teal-50/90 to-emerald-50/50 border border-teal-100 shadow-2xs'
      >
        <div className='flex items-start gap-3'>
          <div className='w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5'>
            <BookOpen size={16} />
          </div>
          <div className='flex-1 min-w-0'>
            <h4 className='text-xs sm:text-sm font-bold text-slate-800'>
              Pelajari Lebih Lanjut di Modul Edukasi
            </h4>
            <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
              Pelajari tata cara memulai minum pil KB saat menstruasi, penanganan lupa minum pil, dan
              panduan periksa payudara sendiri (SADARI).
            </p>
            <Link
              to='/user/education'
              className='mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2'
            >
              <span>Buka Menu Edukasi</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

