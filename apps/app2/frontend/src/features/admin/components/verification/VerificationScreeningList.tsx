import { HeartPulse } from 'lucide-react';
import { PillScreeningAnswers } from '@/src/features/user/types';

export interface VerificationScreeningListProps {
  screening: Partial<PillScreeningAnswers>;
}

export function VerificationScreeningList({ screening }: VerificationScreeningListProps) {
  const screeningList = [
    { no: 1, label: 'Usia Akseptor', val: `${screening.age || '-'} Tahun` },
    { no: 2, label: 'Jumlah Anak', val: `${screening.childrenCount ?? '-'} Anak` },
    {
      no: 3,
      label: 'Sedang Hamil',
      val: screening.isPregnant ? 'Ya' : 'Tidak',
      isWarning: screening.isPregnant === true,
      hint: 'Kontraindikasi mutlak kehamilan',
    },
    {
      no: 4,
      label: 'Kondisi Medis Kontraindikasi',
      val: screening.hasContraindications ? 'Ya' : 'Tidak',
      isWarning: screening.hasContraindications === true,
      hint: 'Memerlukan evaluasi dokter',
    },
    {
      no: 5,
      label: 'Tekanan Darah Tinggi Tidak Terkontrol',
      val: screening.hasHypertension ? 'Ya' : 'Tidak',
      isWarning: screening.hasHypertension === true,
      hint: 'Risiko kardiovaskular',
    },
    {
      no: 6,
      label: 'Riwayat Gumpalan Darah / Stroke',
      val: screening.hasBloodClotOrStroke ? 'Ya' : 'Tidak',
      isWarning: screening.hasBloodClotOrStroke === true,
      hint: 'Risiko tromboemboli (khusus pil kombinasi)',
    },
    {
      no: 7,
      label: 'Kanker Payudara Aktif',
      val: screening.hasBreastCancer ? 'Ya' : 'Tidak',
      isWarning: screening.hasBreastCancer === true,
      hint: 'Sensitif terhadap pengaruh hormon',
    },
    {
      no: 8,
      label: 'Penyakit Hati Berat',
      val: screening.hasSevereLiverDisease ? 'Ya' : 'Tidak',
      isWarning: screening.hasSevereLiverDisease === true,
      hint: 'Gangguan metabolisme steroid',
    },
    {
      no: 9,
      label: 'Bersedia Minum Teratur Setiap Hari',
      val: screening.willingToTakeDaily ? 'Ya' : 'Tidak',
      isWarning: screening.willingToTakeDaily === false,
      hint: 'Kepatuhan harian krusial',
    },
  ];

  return (
    <div className='p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold text-slate-900 flex items-center gap-1.5'>
          <HeartPulse size={14} className='text-teal-600' />
          <span>Hasil Skrining Persyaratan Pil KB (9 Pertanyaan)</span>
        </span>
        <span className='text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded'>
          Kriteria Klinis
        </span>
      </div>

      <div className='flex flex-col divide-y divide-slate-100 text-xs'>
        {screeningList.map(item => (
          <div
            key={item.no}
            className={`py-2 px-1.5 flex items-center justify-between gap-3 rounded-lg ${
              item.isWarning ? 'bg-amber-50/70 font-semibold text-amber-950' : ''
            }`}
          >
            <div className='flex items-start gap-2 min-w-0 flex-1'>
              <span className='w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5'>
                {item.no}
              </span>
              <div>
                <span className='text-slate-800 font-medium block leading-snug'>
                  {item.label}
                </span>
                {item.hint && (
                  <span className='text-[10px] text-slate-400 block leading-tight'>
                    {item.hint}
                  </span>
                )}
              </div>
            </div>

            <div className='shrink-0 text-right'>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                  item.isWarning
                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                    : item.val === 'Tidak'
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'bg-slate-100 text-slate-800'
                }`}
              >
                {item.val}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

