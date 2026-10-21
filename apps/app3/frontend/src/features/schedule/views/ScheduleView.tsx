'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
  CalendarClock,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { TTIntervalGuideCard } from '../components/TTIntervalGuideCard';
import { getUserScheduleAction, UserScheduleData } from '@/src/features/user/api/userRepository';
import { TTMilestoneTracker } from '@/src/shared/components/domain/TTMilestoneTracker';

export default function ScheduleView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notesStr = (user as any)?.notes || '';
  const ttLevelMatch = notesStr.match(/Status TT Awal:\s*TT(\d)/);
  const currentTTLevel = ttLevelMatch ? parseInt(ttLevelMatch[1], 10) : 3;

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        const data = await getUserScheduleAction(user?.id);
        if (isMounted) {
          setSchedule(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load schedule:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading && !schedule) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto pb-12'>
      {/* Toast Feedback - Mobile Thumb-Zone Friendly */}
      {toastMessage && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm mx-auto sm:mx-0 bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-white/10'>
          <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Bar (Stitch Screen 7 & 8) */}
      <div className='flex items-center justify-between pb-1'>
        <button
          type='button'
          onClick={() => navigate('/user/dashboard')}
          aria-label='Kembali'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#121c2a] hover:bg-[#dee9fc] active:scale-90 transition-all cursor-pointer'
        >
          <ArrowLeft size={18} />
        </button>

        <div className='text-center'>
          <h1 className='text-base sm:text-lg md:text-xl font-bold text-[#121c2a] leading-tight'>
            Jadwal Suntik TT
          </h1>
          <p className='text-[11px] sm:text-xs text-[#574144]'>Rencana Kesehatan Calon Pengantin</p>
        </div>

        <button
          type='button'
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: 'Jadwal Suntik TT Pranikah - PRELUNA',
                  text: 'Jadwal suntik TT4 di Puskesmas Kebayoran Baru (15 Januari 2026).',
                  url: window.location.href,
                })
                .catch(() => {});
            } else {
              showToast('Tautan jadwal disalin ke papan klip');
            }
          }}
          aria-label='Bagikan'
          className='w-11 h-11 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-90 transition-all cursor-pointer'
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className='flex flex-col gap-5 sm:gap-6 animate-fade-in'>
        <div className='flex flex-col gap-5'>
          {/* Warm Introductory Greeting for Calon Pengantin (Stitch Screen 7) */}
          <div className='flex items-center justify-between'>
            <div className='flex flex-col'>
              <span className='text-[11px] uppercase tracking-wider text-[#aa294d] font-bold'>
                Rencana Kesehatan Catin
              </span>
              <h2 className='text-base sm:text-lg font-bold text-[#121c2a]'>
                Tetap Terlindungi Bersama
              </h2>
            </div>
            <div className='w-10 h-10 rounded-full bg-[#ffd9de] flex items-center justify-center text-[#aa294d] shadow-2xs'>
              <Heart size={20} className='fill-[#aa294d]' />
            </div>
          </div>

          {/* Highlight Card: Jadwal Utama TT4 (Stitch Screen 7) */}
          <div className='relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(170,41,77,0.08)] border border-[#eff4ff] overflow-hidden'>
            {/* Decorative Ambient Soft Glow */}
            <div className='absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#ffd9de]/40 blur-2xl pointer-events-none' />

            {/* Header Card Meta with Countdown Badge */}
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
                    TT4 (Dosis Keempat)
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
                <span className='p-1 rounded-lg bg-[#ffd9de] text-[#aa294d] shrink-0'>
                  <CalendarIcon size={18} />
                </span>
                <div className='flex flex-col'>
                  <span className='text-[11px] text-[#574144]'>Rekomendasi Waktu Kunjungan</span>
                  <span className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                    15 Januari 2026
                  </span>
                  <span className='text-[10px] text-[#8b7074]'>(± 1 tahun setelah dosis TT3)</span>
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
                  Menyuntikkan TT4 akan memperpanjang imunitas maternal dan calon bayi hingga{' '}
                  <strong className='text-[#2a6950] font-bold'>10 tahun ke depan</strong> (sampai
                  tahun 2036).
                </p>
              </div>
            </div>
          </div>

          {/* Rangkaian 5 Dosis Vaksin TT Milestone Tracker */}
          <TTMilestoneTracker currentTTLevel={currentTTLevel} />

          {/* Medical Guidance Callout (Clinical Reassurance) (Stitch Screen 7) */}
          <div className='bg-[#eff4ff] rounded-2xl p-4 flex gap-3.5 items-start border border-[#d9e3f6]/60 shadow-2xs'>
            <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#aa294d] shrink-0 shadow-2xs mt-0.5'>
              <Info size={18} />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-[#121c2a] mb-0.5'>
                Catatan Bidan & Faskes
              </span>
              <p className='text-[11px] text-[#574144] leading-relaxed'>
                Pastikan kamu menerima vaksin sesuai interval waktu minimal agar respon antibodi
                optimal. Konsultasikan kartu riwayat TT ini kepada bidan desa atau dokter saat
                skrining berkala.
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-5'>
          <TTIntervalGuideCard />
        </div>
      </div>
    </div>
  );
}
