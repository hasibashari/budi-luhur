import { Pill, Check } from 'lucide-react';

export type PillOption = 'Pil KB Kombinasi' | 'Mini Pil';

export interface PillTypeCardSelectorProps {
  value: PillOption;
  onChange: (value: PillOption) => void;
}

export function PillTypeCardSelector({ value, onChange }: PillTypeCardSelectorProps) {
  return (
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
          onClick={() => onChange('Pil KB Kombinasi')}
          className={`relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            value === 'Pil KB Kombinasi'
              ? 'border-[#0D9488] bg-[#F0FDFA] ring-2 ring-[#0D9488]/20 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              value === 'Pil KB Kombinasi'
                ? 'bg-[#0D9488] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Pill size={18} />
          </div>
          <div className='flex-1 min-w-0 pr-6'>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-xs sm:text-sm text-[#0F172A] leading-tight'>
                KB Pil Kombinasi
              </span>
            </div>
            <p className='text-[11px] text-slate-500 mt-0.5 font-medium leading-snug'>
              Estrogen & Progestin (28 Tablet)
            </p>
          </div>
          <div
            className={`absolute top-3.5 right-3.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
              value === 'Pil KB Kombinasi'
                ? 'bg-[#0D9488] text-white'
                : 'border-2 border-slate-300 bg-white'
            }`}
          >
            {value === 'Pil KB Kombinasi' && <Check size={11} strokeWidth={3} />}
          </div>
        </button>

        {/* Option 2: Mini Pil (Progestin Only) */}
        <button
          type='button'
          onClick={() => onChange('Mini Pil')}
          className={`relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            value === 'Mini Pil'
              ? 'border-[#0D9488] bg-[#F0FDFA] ring-2 ring-[#0D9488]/20 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              value === 'Mini Pil'
                ? 'bg-[#0D9488] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Pill size={18} />
          </div>
          <div className='flex-1 min-w-0 pr-6'>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-xs sm:text-sm text-[#0F172A] leading-tight'>
                Mini Pil (Progestin)
              </span>
            </div>
            <p className='text-[11px] text-slate-500 mt-0.5 font-medium leading-snug'>
              Progestin Saja / POP (28 Tablet)
            </p>
          </div>
          <div
            className={`absolute top-3.5 right-3.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
              value === 'Mini Pil'
                ? 'bg-[#0D9488] text-white'
                : 'border-2 border-slate-300 bg-white'
            }`}
          >
            {value === 'Mini Pil' && <Check size={11} strokeWidth={3} />}
          </div>
        </button>
      </div>
    </div>
  );
}

