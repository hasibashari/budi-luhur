import { Info } from 'lucide-react';
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
    </div>
  );
}
