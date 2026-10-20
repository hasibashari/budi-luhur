'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CalendarClock,
  Share2,
  Printer,
  ArrowLeft,
  Clock,
  Hourglass,
  PlusCircle,
  Activity,
  Heart,
  Building2,
  MapPin,
  Pin,
  ExternalLink,
  BellRing,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useMonitoringData } from '../hooks/useMonitoringData';
import { InputRiwayatTTModal, NewTTRiwayatData } from '../components/InputRiwayatTTModal';
import { VaccineCardModal } from '@/src/features/dashboard/components/VaccineCardModal';
import { MonthlyEvaluationView } from '../components/MonthlyEvaluationView';
import { TTIntervalGuideCard } from '@/src/features/schedule/components/TTIntervalGuideCard';

export default function HistoryView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'usr_1';

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isVaccineCardOpen, setIsVaccineCardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hook for existing backend sync
  const { dashboardData, loading, stats } = useMonitoringData(userId);

  // Extract TT Level from notes or default 3
  const notesStr = (dashboardData?.user as any)?.notes || '';
  const ttLevelMatch = notesStr.match(/Status TT Awal:\s*TT(\d)/);
  const currentTTLevel = ttLevelMatch ? parseInt(ttLevelMatch[1], 10) : 3;

  const partnerMatch = notesStr.match(/Pasangan:\s*([^|]+)/);
  const partnerName = partnerMatch ? partnerMatch[1].trim() : 'Farhan Ramadhan';
  const faskesName = dashboardData?.user.schoolOrOrg || 'Puskesmas Kebayoran Baru';

  // Dynamic Doses list state
  const [dosesHistory, setDosesHistory] = useState([
    {
      dose: 'TT1',
      title: 'Dosis TT1',
      faskes: 'Puskesmas Kebayoran',
      date: '10 Januari 2020',
      batch: 'Batch: TT-A902',
      status: 'completed',
      statusLabel: 'Lengkap / Terverifikasi',
      description: 'Langkah awal pembentukan antibodi',
    },
    {
      dose: 'TT2',
      title: 'Dosis TT2',
      faskes: 'Puskesmas Kebayoran',
      date: '12 Februari 2020',
      batch: 'Batch: TT-B114',
      status: 'completed',
      statusLabel: 'Lengkap / Terverifikasi',
      description: 'Proteksi 3 tahun terhadap tetanus maternal',
    },
    {
      dose: 'TT3',
      title: 'Dosis TT3 (Pranikah)',
      faskes: 'RSUD Pasar Minggu',
      date: '15 Juli 2023',
      batch: 'Batch: BIO-883C',
      status: 'completed',
      statusLabel: 'Lengkap / Terverifikasi',
      description: 'Proteksi 5 tahun masa awal pernikahan',
    },
    {
      dose: 'TT4',
      title: 'Dosis TT4',
      faskes: 'Puskesmas Kebayoran Baru',
      date: 'Estimasi: 15 Januari 2026',
      batch: 'Minimal 1 Th setelah TT3',
      status: 'upcoming',
      statusLabel: 'Jadwal Berikutnya',
      description: 'Perlindungan 10 tahun untuk kehamilan berikutnya',
    },
    {
      dose: 'TT5',
      title: 'Dosis TT5',
      faskes: 'Faskes Rujukan Terdaftar',
      date: 'Belum ada data pencatatan',
      batch: 'TT4 ± 1 tahun',
      status: 'pending',
      statusLabel: 'Belum Terjadwal',
      description: 'Perlindungan seumur hidup (≥ 25 tahun)',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Status Imunisasi TT Pranikah - PRELUNA',
          text: `Halo, status imunisasi TT saya saat ini adalah TT${currentTTLevel} (Terverifikasi di ${faskesName}).`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      showToast('Tautan ringkasan imunisasi disalin ke papan klip');
    }
  };

  const handleAddNewDose = (newData: NewTTRiwayatData) => {
    setDosesHistory(prev => {
      const idx = prev.findIndex(item => item.dose === newData.doseLevel);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          faskes: newData.faskesName,
          date: newData.vaccineDate,
          batch: newData.batchNumber || 'Batch: Bio-Catin',
          status: 'completed',
          statusLabel: 'Lengkap / Menunggu Validasi',
          description: newData.notes || copy[idx].description,
        };
        return copy;
      }
      return [
        {
          dose: newData.doseLevel,
          title: `Dosis ${newData.doseLevel}`,
          faskes: newData.faskesName,
          date: newData.vaccineDate,
          batch: newData.batchNumber || 'Batch: Bio-Catin',
          status: 'completed',
          statusLabel: 'Lengkap / Terverifikasi',
          description: 'Dicatat mandiri melalui PRELUNA',
        },
        ...prev,
      ];
    });
    showToast(`Dosis ${newData.doseLevel} berhasil disimpan & menunggu verifikasi!`);
  };

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-16'>
      {/* Toast Feedback - Mobile Thumb-Zone Friendly */}
      {toastMessage && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm mx-auto sm:mx-0 bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-white/10'>
          <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toastMessage}</span>
        </div>
      )}

      {/* Screen 5 Modal: Input Riwayat TT */}
      <InputRiwayatTTModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSubmit={handleAddNewDose}
        defaultDose={`TT${Math.min(5, currentTTLevel + 1)}`}
      />

      {/* Printable Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isVaccineCardOpen}
        onClose={() => setIsVaccineCardOpen(false)}
        userName={dashboardData?.user.name || 'Shofa Zulfia Zahra'}
        faskesName={faskesName}
        partnerName={partnerName}
        currentTTLevel={currentTTLevel}
      />

      {/* 1. Top Navigation & Action Bar */}
      <div className='flex items-center justify-between pb-1'>
        <button
          type='button'
          onClick={() => navigate('/user/dashboard')}
          aria-label='Kembali ke Beranda'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] active:scale-90 transition-all cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center'>
          <h1 className='text-base sm:text-lg md:text-xl font-bold text-[#121c2a] leading-snug'>
            Pusat Imunisasi TT
          </h1>
          <p className='text-[11px] sm:text-xs text-[#574144]'>
            Kesehatan & Kelayakan Nikah Calon Pengantin
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleShare}
            aria-label='Bagikan Ringkasan'
            className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
            title='Bagikan Ringkasan'
          >
            <Share2 size={18} />
          </button>
          <button
            type='button'
            onClick={() => setIsVaccineCardOpen(true)}
            aria-label='Cetak Kartu Imunisasi'
            className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
            title='Cetak Kartu Vaksin'
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* 2. Page Header Badges + Quick Link ke Jadwal */}
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d]'>
            <ShieldCheck size={18} />
          </div>
          <span className='text-sm font-bold text-[#121c2a]'>Riwayat & Evaluasi</span>
        </div>
        <Link
          to='/user/schedule'
          className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] text-[#aa294d] hover:bg-[#ffd9de]/50 text-xs font-bold transition-all active:scale-95 shadow-2xs'
        >
          <CalendarClock size={14} />
          <span>Lihat Jadwal</span>
        </Link>
      </div>

      {/* -------------------- RIWAYAT & EVALUASI -------------------- */}
      <div className='flex flex-col gap-6 animate-fade-in'>
        {/* Intro Greeting */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-[11px] uppercase tracking-wider text-[#aa294d] font-bold'>
              Rencana Suntik Pranikah
            </span>
            <h2 className='text-base sm:text-lg font-bold text-[#121c2a]'>
              Tetap Terlindungi Bersama Pasangan
            </h2>
          </div>
          <div className='w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-2xs'>
            <Heart size={20} className='fill-[#aa294d]' />
          </div>
        </div>

        {/* Highlight Card: Jadwal Utama TT4 */}
        <div className='relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(170,41,77,0.08)] border border-[#eff4ff] overflow-hidden'>
          <div className='absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#ffd9de]/40 blur-2xl pointer-events-none' />

          <div className='relative flex items-start justify-between gap-3 mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-2xl bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-inner shrink-0'>
                <CalendarClock size={26} />
              </div>
              <div>
                <span className='text-[11px] text-[#574144] block'>
                  Dosis Dianjurkan Berikutnya
                </span>
                <h3 className='text-base sm:text-lg font-bold text-[#aa294d] tracking-tight'>
                  TT4 (Dosis Keempat Catin)
                </h3>
              </div>
            </div>
            <span className='inline-flex items-center gap-1.5 bg-[#aff1d0] text-[#0a5139] text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs'>
              <span className='w-1.5 h-1.5 rounded-full bg-[#2a6950] animate-pulse' />
              Tersedia 12 hari lagi
            </span>
          </div>

          {/* Schedule Detail Section */}
          <div className='bg-[#eff4ff] rounded-xl p-3.5 flex flex-col gap-2 mb-4 border border-[#d9e3f6]/60'>
            <div className='flex items-center gap-2.5'>
              <span className='p-1.5 rounded-lg bg-[#ffd9de] text-[#aa294d] shrink-0'>
                <Calendar size={18} />
              </span>
              <div className='flex flex-col'>
                <span className='text-[11px] text-[#574144]'>Rekomendasi Waktu Kunjungan</span>
                <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                  15 Januari 2026 (08:00 – 14:00 WIB)
                </span>
                <span className='text-[10px] text-[#8b7074]'>
                  (± 1 tahun setelah penyelesaian dosis TT3)
                </span>
              </div>
            </div>
          </div>

          {/* Protection Lifespan Metric */}
          <div className='flex items-start gap-3 pt-1'>
            <div className='w-8 h-8 rounded-full bg-[#aff1d0] shrink-0 flex items-center justify-center text-[#0a5139] mt-0.5 shadow-2xs'>
              <ShieldCheck size={18} />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-[#121c2a]'>Manfaat Perlindungan Imun</span>
              <p className='text-[11px] text-[#574144] leading-relaxed mt-0.5'>
                Menyuntikkan TT4 akan memperpanjang kekebalan maternal dan calon bayi hingga{' '}
                <strong className='text-[#2a6950] font-bold'>10 tahun ke depan</strong> (sampai
                tahun 2036).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Status Pengingat */}

        {/* Stepper Progress Bar */}
        <div className='bg-white rounded-2xl p-4 shadow-xs border border-[#eff4ff]'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xs font-bold text-[#121c2a]'>
              Progres Menuju Kekebalan Seumur Hidup
            </span>
            <span className='text-xs font-bold text-[#aa294d]'>Dosis 4 dari 5</span>
          </div>
          <div className='grid grid-cols-5 gap-1.5 mb-2'>
            <div className='h-2 rounded-full bg-[#2a6950]' />
            <div className='h-2 rounded-full bg-[#2a6950]' />
            <div className='h-2 rounded-full bg-[#2a6950]' />
            <div className='h-2 rounded-full bg-[#cb4364] animate-pulse' />
            <div className='h-2 rounded-full bg-[#dee9fc]' />
          </div>
          <div className='flex justify-between items-center text-[10px] text-[#574144] font-semibold'>
            <span className='text-[#2a6950]'>TT1-TT3 Selesai</span>
            <span className='text-[#aa294d]'>Langkah Saat Ini: TT4</span>
            <span className='text-[#8b7074]'>TT5 Terakhir</span>
          </div>
        </div>

        {/* Faskes Rujukan Terpilih */}
        <div>
          <div className='flex items-center justify-between mb-2.5 px-0.5'>
            <span className='text-sm sm:text-base font-bold text-[#121c2a]'>
              Faskes Rujukan Terpilih
            </span>
            <span className='text-[11px] text-[#aa294d] font-bold'>Tersinkron BPJS & KUA</span>
          </div>
          <div className='bg-white rounded-2xl p-4 shadow-xs border border-[#eff4ff] flex flex-col gap-3'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex gap-3'>
                <div className='w-11 h-11 rounded-xl bg-[#aff1d0]/50 flex items-center justify-center text-[#2a6950] shrink-0'>
                  <Building2 size={24} />
                </div>
                <div className='flex flex-col min-w-0'>
                  <h3 className='text-xs sm:text-sm font-bold text-[#121c2a] truncate'>
                    {faskesName}
                  </h3>
                  <span className='text-[11px] text-[#574144] flex items-center gap-1 mt-0.5'>
                    <CheckCircle2 size={13} className='text-[#2a6950]' />
                    Faskes Utama Calon Pengantin
                  </span>
                </div>
              </div>
              <div className='bg-[#eff4ff] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0'>
                <MapPin size={12} className='text-[#aa294d]' />
                <span className='text-[11px] text-[#121c2a] font-semibold'>1.2 km</span>
              </div>
            </div>

            <div className='flex items-center gap-2 bg-[#eff4ff]/60 px-3 py-2 rounded-xl text-xs text-[#574144]'>
              <Clock size={15} className='text-[#8b7074]' />
              <span className='font-medium text-[11px]'>Senin – Jumat, 08:00 – 14:00 WIB</span>
            </div>

            {/* Map Preview Banner */}
            <div
              className='w-full h-24 rounded-xl bg-cover bg-center relative overflow-hidden flex items-end p-2.5 shadow-inner'
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFV1kdSb2CiSwu7AGmIxW7cM2CvGaurtZEvxgwN5LglsjZEr4PHwHV2jIcAXZVHFNmvNTnmzp2cUTOElM0uVm3OcHxhGcl8426-bJN3C4R1XI5ZUCqvJYFHkR5UInfbiDmNHzydg83gH8NoBSqcjsLA7C4C4EvYrclwRBXjslcShlrtcQR8KTXL0rLHV2VPrvZkzmsE2Z2B2oJO1wWv5F45CdFGSp8jSuo60Y-c4lPw9uPGPU5j6aA')`,
              }}
            >
              <div className='absolute inset-0 bg-gradient-to-t from-[#121c2a]/80 via-transparent to-transparent' />
              <span className='relative text-[10px] text-white flex items-center gap-1 font-semibold truncate'>
                <Pin size={12} className='text-rose-300' />
                Jl. Gandaria Tengah II No. 14, Jakarta Selatan
              </span>
            </div>

            <a
              href='https://maps.google.com/?q=Puskesmas+Kebayoran+Baru'
              target='_blank'
              rel='noopener noreferrer'
              className='w-full h-11 bg-white text-[#aa294d] border border-[#dee9fc] rounded-xl font-bold text-xs shadow-2xs hover:bg-[#eff4ff] active:scale-95 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer'
            >
              <ExternalLink size={16} />
              <span>Buka Petunjuk Arah di Google Maps</span>
            </a>
          </div>
        </div>

        {/* 5-Step Horizontal Milestone Tracker */}
        <section className='bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff]'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-[#ffd9de] text-[#aa294d] flex items-center justify-center'>
                <span className='material-symbols-outlined text-[18px]'>linear_scale</span>
              </div>
              <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
                Rangkaian 5 Dosis Vaksin TT
              </h3>
            </div>
            <span className='px-2.5 py-0.5 rounded-full bg-[#ffd9de] text-[#8c0f39] text-xs font-bold'>
              {currentTTLevel} / 5 Selesai
            </span>
          </div>

          <div className='relative w-full pt-2 pb-2'>
            <div className='absolute top-6 left-6 right-6 h-1 bg-[#d9e3f6] rounded-full -translate-y-1/2' />
            <div
              className='absolute top-6 left-6 h-1 bg-[#2a6950] rounded-full -translate-y-1/2 transition-all duration-700'
              style={{ width: `${Math.min(100, (currentTTLevel / 5) * 100)}%` }}
            />

            <div className='relative flex items-start justify-between z-10 px-1'>
              {[1, 2, 3, 4, 5].map(step => {
                const isCompleted = step <= currentTTLevel;
                const isUpcoming = step === currentTTLevel + 1;

                return (
                  <div key={step} className='flex flex-col items-center'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ring-4 ring-white transition-all ${
                        isCompleted
                          ? 'bg-[#2a6950] text-white'
                          : isUpcoming
                            ? 'bg-[#ffd9dd] text-[#ac254b]'
                            : 'bg-[#e6eeff] text-[#8b7074]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} />
                      ) : isUpcoming ? (
                        <Hourglass size={14} />
                      ) : (
                        <span className='w-2 h-2 rounded-full bg-[#8b7074]/40' />
                      )}
                    </div>
                    <span className='text-xs font-bold text-[#121c2a] mt-1.5'>TT{step}</span>
                    <span
                      className={`text-[10px] font-semibold ${
                        isCompleted
                          ? 'text-[#2a6950]'
                          : isUpcoming
                            ? 'text-[#ac254b]'
                            : 'text-[#8b7074]'
                      }`}
                    >
                      {isCompleted ? 'Selesai' : isUpcoming ? 'Jadwal' : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Chronological Immunization History List */}
        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between px-1'>
            <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
              Daftar Riwayat Suntik TT
            </h3>
            <span className='text-xs text-[#574144]'>5 Tahapan Dosis</span>
          </div>

          <div className='flex flex-col gap-3'>
            {dosesHistory.map((item, idx) => (
              <div
                key={item.dose}
                className='p-4 rounded-2xl bg-white shadow-xs border border-[#eff4ff] flex flex-col gap-2.5 transition-all hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        item.status === 'completed'
                          ? 'bg-[#aff1d0] text-[#0a5139]'
                          : item.status === 'upcoming'
                            ? 'bg-[#ffd9dd] text-[#ac254b]'
                            : 'bg-stone-100 text-[#8b7074]'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className='text-xs sm:text-sm font-bold text-[#121c2a] leading-tight'>
                        {item.title}
                      </h4>
                      <span className='text-[11px] text-[#574144]'>{item.faskes}</span>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold shrink-0 ${
                      item.status === 'completed'
                        ? 'bg-[#aff1d0] text-[#0a5139]'
                        : item.status === 'upcoming'
                          ? 'bg-[#ffd9dd] text-[#ac254b]'
                          : 'bg-stone-100 text-[#8b7074]'
                    }`}
                  >
                    {item.status === 'completed' && <CheckCircle2 size={12} />}
                    {item.status === 'upcoming' && <Clock size={12} />}
                    <span>{item.statusLabel}</span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-1 mt-1 bg-[#eff4ff]/60 px-3 py-2 rounded-xl text-xs'>
                  <div className='flex items-center gap-1.5 text-[#574144]'>
                    <Calendar size={14} />
                    <span className='text-[11px] sm:text-xs'>{item.date}</span>
                  </div>
                  {item.status === 'upcoming' ? (
                    <Link
                      to='/user/schedule'
                      className='text-[#aa294d] font-bold text-xs hover:underline inline-flex items-center gap-1'
                    >
                      Lihat Jadwal
                    </Link>
                  ) : (
                    <span className='text-[11px] font-semibold text-[#2a6950]'>{item.batch}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action: Tambah Dosis Lainnya */}
        <div className='flex flex-col gap-2 pt-1'>
          <button
            type='button'
            onClick={() => setIsInputModalOpen(true)}
            className='w-full h-12 min-h-[48px] rounded-full bg-white border-2 border-[#aa294d] text-[#aa294d] hover:bg-[#ffd9de]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer font-bold text-xs sm:text-sm'
          >
            <PlusCircle size={18} />
            <span>Tambah Dosis Lainnya (Mandiri)</span>
          </button>
          <p className='text-center text-[11px] text-[#574144]'>
            Punya catatan fisik KMS/Buku KIA terdahulu? Unggah foto cap puskesmas untuk
            rekonsiliasi.
          </p>
        </div>

        {/* INTEGRATED MONTHLY EVALUATION & CHARTS SECTION */}
        <div className='pt-4 border-t border-[#eff4ff] flex flex-col gap-3'>
          <div className='flex items-center justify-between px-1'>
            <div>
              <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>
                Grafik Evaluasi & Kesiapan Pranikah
              </h3>
              <p className='text-[11px] text-[#574144]'>
                Rekapitulasi kepatuhan kontrol kesehatan & skrining catin
              </p>
            </div>
            <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#aff1d0] text-[#0a5139] text-xs font-bold'>
              <Activity size={12} /> Optimal
            </span>
          </div>

          <MonthlyEvaluationView
            stats={stats}
            streakCount={dashboardData?.user.streakCount || 0}
            streakUnit={dashboardData?.user.streakUnit || 'Minggu'}
            hbLevel={dashboardData?.user.hbLevel}
            riskLevel={dashboardData?.user.riskLevel}
          />
        </div>
      </div>
    </div>
  );
}
