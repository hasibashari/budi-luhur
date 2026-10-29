import { Heart, Calendar, AlertTriangle, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface WeddingCountdownWidgetProps {
  weddingDateStr?: string;
  partnerName?: string;
  currentTTLevel?: number;
}

export function WeddingCountdownWidget({
  weddingDateStr,
  partnerName,
  currentTTLevel = 2,
}: WeddingCountdownWidgetProps) {
  const hasWeddingDate = Boolean(weddingDateStr && !isNaN(Date.parse(weddingDateStr)));

  if (!hasWeddingDate) {
    return (
      <div className='w-full rounded-3xl bg-white border border-stone-200 p-5 shadow-sm shadow-stone-900/5 relative overflow-hidden'>
        {/* Top Accent Bar */}
        <div className='flex items-center justify-between pb-3.5 border-b border-stone-100'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center'>
              <Heart size={16} className='text-stone-500' />
            </div>
            <div>
              <h4 className='text-xs font-bold text-slate-900'>Hitung Mundur Hari Bahagia</h4>
              <span className='text-[10px] text-slate-500'>
                {partnerName ? `Bersama ${partnerName}` : 'Rencana Pernikahan'}
              </span>
            </div>
          </div>

          <span className='text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-stone-100 border-stone-200 text-slate-600'>
            Belum Diatur
          </span>
        </div>

        {/* Empty State Prompt */}
        <div className='py-4 px-1 text-center flex flex-col items-center justify-center'>
          <div className='w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5'>
            <Calendar size={20} />
          </div>
          <h5 className='text-xs font-bold text-slate-900 mb-1'>
            Tanggal Pernikahan Belum Diatur
          </h5>
          <p className='text-[11px] text-slate-500 max-w-xs leading-relaxed mb-3.5'>
            Atur tanggal rencana pernikahan Anda di profil untuk mengaktifkan hitung mundur dan memantau batas aman vaksinasi TT pranikah.
          </p>
          <Link
            to='/user/profile'
            className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2a6950] text-white text-xs font-semibold hover:bg-[#0a5139] active:scale-95 transition-all shadow-xs'
          >
            <Calendar size={13} />
            <span>Atur Tanggal Pernikahan</span>
          </Link>
        </div>

        {/* Clinical Guidance Box */}
        <div className='p-3 rounded-2xl border text-xs flex items-start gap-2.5 bg-amber-50/70 border-amber-200/80 text-amber-900'>
          <Clock size={16} className='text-amber-600 shrink-0 mt-0.5' />
          <div className='flex-1 text-[11px] leading-relaxed'>
            <p>
              <strong>Informasi Klinis:</strong> Vaksin TT2 disyaratkan minimal 30 hari sebelum akad nikah agar pembentukan antibodi tetanus optimal sebelum hari-H.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className='mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs'>
          <div className='flex items-center gap-1.5 text-slate-500 text-[11px]'>
            <Clock size={12} />
            <span>Faskes buka Senin–Sabtu</span>
          </div>
          <Link
            to='/user/schedule'
            className='inline-flex items-center gap-1 font-bold text-[#2a6950] hover:text-[#0a5139] active:scale-95 transition-transform'
          >
            <span>Atur Janji Suntik</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  const targetDate = new Date(weddingDateStr!);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const diffWeeks = Math.floor(diffDays / 7);

  // TT2 should be administered at least 30 days before wedding
  const isUrgent = diffDays <= 30 && currentTTLevel < 2;
  const isSafe = currentTTLevel >= 2;

  const formattedDate = targetDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='w-full rounded-3xl bg-white border border-stone-200 p-5 shadow-sm shadow-stone-900/5 relative overflow-hidden'>
      {/* Top Accent Bar */}
      <div className='flex items-center justify-between pb-3.5 border-b border-stone-100'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center'>
            <Heart size={16} className='fill-amber-500' />
          </div>
          <div>
            <h4 className='text-xs font-bold text-slate-900'>Hitung Mundur Hari Bahagia</h4>
            <span className='text-[10px] text-slate-500'>
              {partnerName ? `Bersama ${partnerName}` : 'Menuju Akad Nikah'}
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isUrgent
              ? 'bg-[#ffd9de] border-[#aa294d]/30 text-[#8c0f39]'
              : isSafe
                ? 'bg-[#aff1d0] border-[#2a6950]/30 text-[#0a5139]'
                : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {isUrgent ? 'Perlu Perhatian' : isSafe ? 'Status TT Aman' : 'Persiapan'}
        </span>
      </div>

      {/* Countdown Digits Grid */}
      <div className='py-3.5 flex items-center justify-between gap-2 sm:gap-3'>
        <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
          <div className='flex flex-col items-center justify-center bg-stone-50 border border-stone-200/80 rounded-2xl w-16 sm:w-20 py-2 sm:py-2.5 shadow-2xs'>
            <span className='text-xl sm:text-2xl font-black text-slate-900 leading-none'>{diffDays}</span>
            <span className='text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider'>
              Hari Lagi
            </span>
          </div>

          <span className='text-slate-300 font-bold text-base sm:text-xl'>:</span>

          <div className='flex flex-col items-center justify-center bg-stone-50 border border-stone-200/80 rounded-2xl w-16 sm:w-20 py-2 sm:py-2.5 shadow-2xs'>
            <span className='text-xl sm:text-2xl font-black text-slate-900 leading-none'>{diffWeeks}</span>
            <span className='text-[9px] sm:text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider'>
              Minggu
            </span>
          </div>
        </div>

        <div className='min-w-0 flex-1 pl-1 sm:pl-2'>
          <div className='flex items-center gap-1.5 text-xs text-slate-800 font-semibold'>
            <Calendar size={13} className='text-[#2a6950] shrink-0' />
            <span className='truncate'>{formattedDate}</span>
          </div>
          <span className='text-[10px] text-slate-500 block mt-0.5 leading-tight'>
            Tanggal Akad Terdaftar
          </span>
        </div>
      </div>

      {/* Clinical Guidance Box */}
      <div
        className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
          isUrgent
            ? 'bg-[#ffd9de]/60 border-[#aa294d]/30 text-[#8c0f39]'
            : 'bg-[#aff1d0]/35 border-[#2a6950]/30 text-[#0a5139]'
        }`}
      >
        {isUrgent ? (
          <AlertTriangle size={16} className='text-[#aa294d] shrink-0 mt-0.5' />
        ) : (
          <ShieldCheck size={16} className='text-[#2a6950] shrink-0 mt-0.5' />
        )}
        <div className='flex-1 text-[11px] leading-relaxed'>
          {isUrgent ? (
            <p>
              <strong>Batas Waktu TT2 Kritis!</strong> Vaksin TT2 disyaratkan minimal 30
              hari sebelum hari pernikahan agar antibodi tetanus protektif optimal.
            </p>
          ) : (
            <p>
              <strong>Kesiapan Pranikah Prima.</strong> Status TT Anda mencukupi syarat administrasi
              Faskes. Pastikan kondisi kesehatan dan jadwal dosis berikutnya tetap terjaga.
            </p>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className='mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs'>
        <div className='flex items-center gap-1.5 text-slate-500 text-[11px]'>
          <Clock size={12} />
          <span>Faskes buka Senin–Sabtu</span>
        </div>
        <Link
          to='/user/schedule'
          className='inline-flex items-center gap-1 font-bold text-[#2a6950] hover:text-[#0a5139] active:scale-95 transition-transform'
        >
          <span>Atur Janji Suntik</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default WeddingCountdownWidget;
