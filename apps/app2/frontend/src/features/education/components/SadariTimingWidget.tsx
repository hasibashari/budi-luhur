import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Info, Clock, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { SADARI_TIMING_INFO } from '../constants/sadari.constants';

export const SadariTimingWidget: React.FC = () => {
  const [profileType, setProfileType] = useState<'menstruating' | 'menopause'>('menstruating');
  const [hphtDate, setHphtDate] = useState<string>('');
  const [fixedDay, setFixedDay] = useState<number>(1);
  const [savedTiming, setSavedTiming] = useState<string | null>(null);

  // Load saved preference from localStorage
  useEffect(() => {
    try {
      const storedType = localStorage.getItem('pilluna_sadari_profile_type');
      if (storedType === 'menopause' || storedType === 'menstruating') {
        setProfileType(storedType);
      }
      const storedHpht = localStorage.getItem('pilluna_sadari_hpht_date');
      if (storedHpht) {
        setHphtDate(storedHpht);
      }
      const storedFixedDay = localStorage.getItem('pilluna_sadari_fixed_day');
      if (storedFixedDay) {
        setFixedDay(parseInt(storedFixedDay, 10));
      }
    } catch {
      // fallback
    }
  }, []);

  const handleProfileTypeChange = (type: 'menstruating' | 'menopause') => {
    setProfileType(type);
    try {
      localStorage.setItem('pilluna_sadari_profile_type', type);
    } catch {
      // ignore
    }
  };

  const handleHphtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHphtDate(val);
    try {
      localStorage.setItem('pilluna_sadari_hpht_date', val);
    } catch {
      // ignore
    }
    setSavedTiming('Jadwal perkiraan berhasil diperbarui');
    setTimeout(() => setSavedTiming(null), 3000);
  };

  const handleFixedDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setFixedDay(val);
    try {
      localStorage.setItem('pilluna_sadari_fixed_day', val.toString());
    } catch {
      // ignore
    }
    setSavedTiming('Tanggal rutin bulanan berhasil disimpan');
    setTimeout(() => setSavedTiming(null), 3000);
  };

  // Calculate ideal window for menstruating profile
  const timingCalculation = React.useMemo(() => {
    if (!hphtDate) return null;
    const hpht = new Date(hphtDate);
    if (isNaN(hpht.getTime())) return null;

    const startWindow = new Date(hpht);
    startWindow.setDate(hpht.getDate() + 7);

    const endWindow = new Date(hpht);
    endWindow.setDate(hpht.getDate() + 10);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isCurrent = today >= startWindow && today <= endWindow;
    const isPast = today > endWindow;
    const isUpcoming = today < startWindow;

    const diffDays = Math.ceil((startWindow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const formatDate = (d: Date) =>
      d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      startWindowStr: formatDate(startWindow),
      endWindowStr: formatDate(endWindow),
      isCurrent,
      isPast,
      isUpcoming,
      diffDays,
    };
  }, [hphtDate]);

  return (
    <Card padding='md' className='border border-teal-200/80 bg-white shadow-xs p-4 sm:p-6'>
      {/* Header & Tabs */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-100'>
        <div>
          <span className='inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1'>
            <Calendar size={13} className='text-teal-600' />
            <span>Kalkulator Waktu Ideal SADARI</span>
          </span>
          <h4 className='text-base sm:text-lg font-bold text-slate-900'>
            Kapan Waktu Terbaik Melakukan Pemeriksaan?
          </h4>
          <p className='text-xs text-slate-500 mt-0.5'>
            Hitung perkiraan jadwal paling optimal berdasarkan siklus menstruasi atau tanggal rutin bulanan Anda.
          </p>
        </div>

        {/* Profile Switcher Tabs */}
        <div className='grid grid-cols-2 w-full sm:w-auto sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70'>
          <button
            type='button'
            onClick={() => handleProfileTypeChange('menstruating')}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              profileType === 'menstruating'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masih Menstruasi
          </button>
          <button
            type='button'
            onClick={() => handleProfileTypeChange('menopause')}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              profileType === 'menopause'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Menopause / Amenore
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className='pt-4'>
        {profileType === 'menstruating' ? (
          <div className='flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch'>
            {/* Input Side */}
            <div className='flex-1 flex flex-col gap-2.5'>
              <label
                htmlFor='hpht-input'
                className='text-xs font-bold text-slate-800 flex items-center gap-1.5'
              >
                <Clock size={14} className='text-teal-600' />
                <span>Hari Pertama Haid Terakhir (HPHT):</span>
              </label>
              <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                <input
                  id='hpht-input'
                  type='date'
                  value={hphtDate}
                  onChange={handleHphtChange}
                  className='w-full sm:max-w-xs bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-teal-600 focus:bg-white outline-none transition-colors'
                />
                {savedTiming && (
                  <span className='text-[11px] font-semibold text-teal-700 animate-fade-in'>
                    {savedTiming}
                  </span>
                )}
              </div>
              <p className='text-[11px] text-slate-500 leading-relaxed'>
                {SADARI_TIMING_INFO.menstruating.reason}
              </p>
            </div>

            {/* Result Box */}
            <div className='flex-1 bg-teal-50/60 border border-teal-200/80 rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-center'>
              {timingCalculation ? (
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    {timingCalculation.isCurrent ? (
                      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white shadow-2xs'>
                        <Sparkles size={12} />
                        Sedang Dalam Waktu Ideal
                      </span>
                    ) : timingCalculation.isUpcoming ? (
                      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300'>
                        <Clock size={12} />
                        {timingCalculation.diffDays} Hari Menuju Waktu Ideal
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700'>
                        Selesai Siklus Ini
                      </span>
                    )}
                  </div>
                  <div className='text-xs sm:text-sm font-extrabold text-slate-900'>
                    Rentang Hari ke-7 s.d. 10: <br />
                    <span className='text-teal-800 font-bold'>
                      {timingCalculation.startWindowStr} — {timingCalculation.endWindowStr}
                    </span>
                  </div>
                  <p className='text-[11px] text-slate-600 leading-normal'>
                    {timingCalculation.isCurrent
                      ? 'Saat ini kondisi jaringan payudara Anda paling rileks. Sangat disarankan melakukan SADARI hari ini!'
                      : timingCalculation.isUpcoming
                        ? 'Tandai kalender Anda untuk melakukan pemeriksaan pada rentang tanggal di atas.'
                        : 'Jika belum sempat periksa, Anda tetap dapat melakukan SADARI atau menunggu siklus haid bulan depan.'}
                  </p>
                </div>
              ) : (
                <div className='flex items-center gap-3 text-xs text-slate-600'>
                  <Info size={20} className='text-teal-600 shrink-0' />
                  <span>
                    Pilih tanggal HPHT (hari pertama haid Anda) di samping untuk melihat perkiraan
                    hari ke-7 s.d. ke-10 yang paling optimal.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch'>
            {/* Menopause Input */}
            <div className='flex-1 flex flex-col gap-2.5'>
              <label
                htmlFor='fixed-day-select'
                className='text-xs font-bold text-slate-800 flex items-center gap-1.5'
              >
                <Calendar size={14} className='text-teal-600' />
                <span>Pilih Tanggal Tetap Setiap Bulan:</span>
              </label>
              <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                <select
                  id='fixed-day-select'
                  value={fixedDay}
                  onChange={handleFixedDayChange}
                  className='w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:border-teal-600 focus:bg-white outline-none transition-colors'
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      Tanggal {day} setiap bulan
                    </option>
                  ))}
                </select>
                {savedTiming && (
                  <span className='text-[11px] font-semibold text-teal-700 animate-fade-in'>
                    {savedTiming}
                  </span>
                )}
              </div>
              <p className='text-[11px] text-slate-500 leading-relaxed'>
                {SADARI_TIMING_INFO.menopause.reason}
              </p>
            </div>

            {/* Menopause Result Box */}
            <div className='flex-1 bg-teal-50/60 border border-teal-200/80 rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-center'>
              <div className='flex items-center gap-2 mb-1'>
                <CheckCircle2 size={16} className='text-teal-600' />
                <span className='text-xs font-bold text-teal-900'>
                  Jadwal Rutin: Setiap Tanggal {fixedDay}
                </span>
              </div>
              <p className='text-[11px] text-slate-600 leading-relaxed'>
                Pemeriksaan pada tanggal yang sama setiap bulan membantu Anda membangun kebiasaan
                deteksi dini yang konsisten dan mudah diingat.
              </p>
            </div>
          </div>
        )}

        {/* Medical Disclaimer & Citation Footer */}
        <div className='mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-slate-500'>
          <div className='flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70'>
            <AlertCircle size={13} className='shrink-0 text-amber-600' />
            <span>{SADARI_TIMING_INFO.medicalDisclaimer}</span>
          </div>
          <div className='flex items-center gap-1 shrink-0'>
            <BookOpen size={12} className='text-slate-400' />
            <span>
              Sitasi: <strong className='text-slate-700'>{SADARI_TIMING_INFO.citation}</strong>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
