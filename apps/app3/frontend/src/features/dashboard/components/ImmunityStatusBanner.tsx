import { ShieldCheck, CheckCircle2, Calendar, FileBadge } from 'lucide-react';

export interface ImmunityStatusBannerProps {
  currentDoseLevel?: number; // 0 to 5
  lastVaccinationDate?: string;
  nextAppointmentDate?: string;
  partnerName?: string;
  onDownloadCard?: () => void;
}

export function ImmunityStatusBanner({
  currentDoseLevel = 0,
  nextAppointmentDate,
  onDownloadCard,
}: ImmunityStatusBannerProps) {
  const safeDose = Math.max(0, Math.min(currentDoseLevel, 5));
  const isProtected = safeDose >= 2;
  const progressPercent = Math.round((safeDose / 5) * 100);

  // Compute protection expiration text
  const currentYear = new Date().getFullYear();
  let protectionText = 'Perlindungan aktif';
  let protectionDetail = 'Durasi proteksi tetanus maternal & neonatal.';

  if (safeDose >= 5) {
    protectionText = 'Perlindungan Seumur Hidup (>25 Tahun)';
    protectionDetail = 'Status T5 Lengkap terhadap perlindungan infeksi Tetanus.';
  } else if (safeDose === 4) {
    protectionText = `Perlindungan aktif hingga ${currentYear + 10}`;
    protectionDetail = 'Durasi proteksi 10 tahun terhadap infeksi Tetanus maternal & neonatal.';
  } else if (safeDose === 3) {
    protectionText = `Perlindungan aktif hingga ${currentYear + 5}`;
    protectionDetail = 'Durasi proteksi 5 tahun terhadap infeksi Tetanus maternal & neonatal.';
  } else if (safeDose === 2) {
    protectionText = `Perlindungan aktif hingga ${currentYear + 3}`;
    protectionDetail = 'Durasi proteksi 3 tahun terhadap infeksi Tetanus maternal & neonatal.';
  } else if (safeDose === 1) {
    protectionText = 'Tahap awal pembentukan antibodi';
    protectionDetail = 'Segera lengkapi dosis TT2 minimal 30 hari sebelum akad nikah.';
  } else {
    protectionText = 'Belum memiliki perlindungan aktif';
    protectionDetail = 'Segera jadwalkan suntik dosis TT1 di Puskesmas atau faskes terdekat.';
  }

  const nextDoseNumber = Math.min(5, safeDose + 1);

  return (
    <div className='relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(170,41,77,0.08),0_2px_8px_rgba(0,0,0,0.04)] border border-[#e6eeff]'>
      {/* Subtle Ambient Pastel Glow in Top Right */}
      <div className='absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#ffd9de]/60 via-[#aff1d0]/30 to-transparent blur-2xl pointer-events-none' />

      <div className='relative flex flex-col gap-4'>
        {/* Shield Header & Badge Status */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-[#aff1d0] flex items-center justify-center text-[#2a6950] shadow-xs'>
              <ShieldCheck size={24} className='fill-[#2a6950]/15' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[11px] text-[#2a6950] font-bold uppercase tracking-wider'>
                Status Imunisasi TT
              </span>
              <h2 className='text-lg sm:text-xl font-bold text-[#121c2a] leading-tight'>
                {safeDose > 0 ? `TT${safeDose} Tercapai` : 'Belum Ada Dosis TT'}
              </h2>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isProtected ? 'bg-[#aff1d0] text-[#0a5139]' : 'bg-[#ffd9de] text-[#8c0f39]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isProtected ? 'bg-[#2a6950] animate-pulse' : 'bg-[#aa294d]'
              }`}
            />
            {isProtected ? 'Terlindungi' : safeDose === 1 ? 'Perlu Dosis TT2' : 'Perlu Dosis TT1'}
          </span>
        </div>

        {/* Protection Duration Lifespan Info Callout */}
        <div className='rounded-xl bg-[#eff4ff] p-3 sm:p-3.5 flex items-start gap-3 border border-[#d9e3f6]/60'>
          <div className='p-1.5 rounded-lg bg-[#ffd9de] text-[#aa294d] flex items-center justify-center shrink-0 mt-0.5'>
            <Calendar size={18} />
          </div>
          <div className='flex flex-col'>
            <span className='text-xs sm:text-sm text-[#121c2a] font-bold'>{protectionText}</span>
            <span className='text-[11px] sm:text-xs text-[#574144] mt-0.5'>{protectionDetail}</span>
          </div>
        </div>

        {/* 5-Step Immunization Milestone Tracker */}
        <div className='flex flex-col gap-2 pt-1'>
          <div className='flex items-center justify-between text-[#574144]'>
            <span className='text-xs font-medium'>Progres Tahapan Vaksinasi</span>
            <span className='text-xs font-bold text-[#aa294d]'>
              {safeDose} dari 5 Selesai ({progressPercent}%)
            </span>
          </div>

          {/* Stepper Visual Indicator */}
          <div className='grid grid-cols-5 gap-2 items-center'>
            {[1, 2, 3, 4, 5].map(step => {
              const isCompleted = step <= safeDose;
              return (
                <div key={step} className='flex flex-col items-center gap-1'>
                  <div
                    className={`w-full h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-[#2a6950]' : 'bg-[#dee9fc]'
                    }`}
                  />
                  {isCompleted ? (
                    <span className='text-[11px] font-bold text-[#2a6950] flex items-center gap-0.5'>
                      <CheckCircle2 size={13} className='shrink-0' /> TT{step}
                    </span>
                  ) : (
                    <span className='text-[11px] text-[#8b7074] font-medium'>TT{step}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Micro Action / Quick Certificate Tap */}
        <div className='pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#eff4ff]'>
          <button
            type='button'
            onClick={onDownloadCard}
            className='inline-flex items-center gap-1.5 text-[#aa294d] hover:text-[#cb4364] text-xs font-bold transition-all active:scale-95 cursor-pointer self-start sm:self-auto py-1'
          >
            <FileBadge size={16} />
            <span>Unduh Kartu Vaksin Catin</span>
          </button>
          <span className='text-[11px] text-[#574144] flex items-center gap-1'>
            {safeDose < 5 ? (
              <>
                Dosis ke-{nextDoseNumber}:{' '}
                <strong className='text-[#121c2a] font-bold'>
                  {nextAppointmentDate || 'Belum dijadwalkan'}
                </strong>
              </>
            ) : (
              <span className='text-[#2a6950] font-bold'>Status T Lengkap (T5)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ImmunityStatusBanner;
