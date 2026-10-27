import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellRing,
  X,
  Check,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';
import { ImmunityStatusBanner } from '@/src/features/dashboard/components/ImmunityStatusBanner';
import { QuickAction } from '@/src/shared/components/domain/QuickAction';
import { WeddingCountdownWidget } from '@/src/features/dashboard/components/WeddingCountdownWidget';
import { VaccineCardModal } from '@/src/features/dashboard/components/VaccineCardModal';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import { playNotificationTone, showSystemNotification } from '@/src/shared/utils/notifications';
import {
  getUserDashboardDataAction,
  UserDashboardData,
} from '@/src/features/user/api/userRepository';
import {
  getActiveNudgeAction,
  dismissNudgeAction,
} from '@/src/features/schedule/api/scheduleRepository';
import { AdminNudge } from '@/src/features/schedule/types';
import { useTTSchedules } from '@/src/features/schedule/hooks/useTTSchedules';
import { getArticlesAction } from '@/src/features/education/api/educationRepository';
import { Article } from '@/src/features/education/types';
import { useReadArticles } from '@/src/features/education/utils/readArticles';

export default function DashboardView() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { schedules } = useTTSchedules();
  const { isRead, markAsRead } = useReadArticles();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [activeNudge, setActiveNudge] = useState<AdminNudge | null>(null);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVaccineCardOpen, setIsVaccineCardOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userId = authUser?.id || '';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        const [data, nudge, articles] = await Promise.all([
          getUserDashboardDataAction(userId),
          getActiveNudgeAction(userId),
          getArticlesAction().catch(() => []),
        ]);
        if (isMounted) {
          setDashboardData(data);
          setActiveNudge(nudge);
          if (articles && articles.length > 0) {
            const topArt = articles.find((a: Article) => a.id === 'art_tt_1') || articles[0];
            setFeaturedArticle(topArt);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboard();

    const unsubscribe = subscribeRealtimeEvent(async event => {
      if (event.type === 'NUDGE_SENT' && (!event.patientId || event.patientId === userId)) {
        try {
          const freshNudge = await getActiveNudgeAction(userId);
          if (freshNudge && isMounted) {
            setActiveNudge(freshNudge);
            playNotificationTone();
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              showSystemNotification('Pengingat Imunisasi TT Pranikah', {
                body: freshNudge.message,
                url: '/user/dashboard',
              });
            }
          }
        } catch (e) {
          console.error('Error handling realtime nudge:', e);
        }
      } else if (event.type === 'NUDGE_DISMISSED') {
        if (isMounted) setActiveNudge(null);
      } else if (event.type === 'MEDICATION_TAKEN' && event.patientId === userId) {
        const freshData = await getUserDashboardDataAction(userId);
        if (freshData && isMounted) setDashboardData(freshData);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId]);

  const handleDismissNudge = async () => {
    if (!activeNudge) return;
    const nudgeId = activeNudge.id;
    setActiveNudge(null);
    try {
      await dismissNudgeAction(nudgeId);
      publishRealtimeEvent('NUDGE_DISMISSED', { nudgeId, patientId: userId });
    } catch (err) {
      console.error('Failed to dismiss nudge:', err);
    }
  };

  const handleTakeFromNudge = async () => {
    await handleDismissNudge();
    if (nextTtSchedule) handleRecordScheduledVisit();
  };

  const currentUser = dashboardData?.user || {
    id: authUser?.id || '',
    name: authUser?.name || '',
    streakCount: 0,
    streakUnit: 'Minggu' as const,
    consecutiveDates: [],
    schoolOrOrg: authUser?.schoolOrOrg || '',
    avatarUrl: authUser?.avatarUrl || null,
  };

  // Extract meta from notes if available
  const partnerName = dashboardData?.user.partnerName;
  const weddingDate = dashboardData?.user.weddingDate;
  // Hanya dosis terverifikasi yang boleh menaikkan status TT.
  const ttLevel = Math.max(
    0,
    ...(dashboardData?.immunizationRecords || [])
      .filter(record => record.verificationStatus === 'VERIFIED')
      .map(record => Number(record.doseLevel.slice(2))),
    Number(dashboardData?.user.ttStatus?.slice(2) || 0),
  );

  // Jadwal TT terdekat: sumber tunggal untuk aksi pencatatan hasil.
  const nextTtSchedule = React.useMemo(() => {
    return (
      [...schedules]
        .filter(schedule => schedule.status !== 'completed' && Boolean(schedule.scheduledDate))
        .sort(
          (a, b) =>
            String(a.scheduledDate).localeCompare(String(b.scheduledDate)) ||
            (a.time || '').localeCompare(b.time || ''),
        )[0] ?? null
    );
  }, [schedules]);

  const nextAppointmentDate = nextTtSchedule
    ? `${nextTtSchedule.scheduledDate} • ${nextTtSchedule.time} WIB`
    : undefined;

  function handleRecordScheduledVisit() {
    if (!nextTtSchedule) return;
    navigate('/user/imunisasi', {
      state: {
        openDose: nextTtSchedule.stage,
        scheduleId: nextTtSchedule.id,
        scheduledDate: nextTtSchedule.scheduledDate,
        time: nextTtSchedule.time,
      },
    });
  }

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full max-w-5xl mx-auto pb-10'>
      {/* Toast Feedback - Mobile Thumb-Zone Friendly */}
      {toastMessage && (
        <div className='fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm mx-auto sm:mx-0 bg-[#121c2a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-white/10'>
          <CheckCircle2 size={16} className='text-[#aff1d0] shrink-0' />
          <span className='flex-1'>{toastMessage}</span>
        </div>
      )}

      {/* Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isVaccineCardOpen}
        onClose={() => setIsVaccineCardOpen(false)}
        userName={currentUser.name}
        faskesName={currentUser.schoolOrOrg || ''}
        partnerName={partnerName}
        currentTTLevel={ttLevel}
        records={dashboardData?.immunizationRecords}
      />

      {/* Top Personal Greeting & Notification Bar (Screen 2 Stitch) */}
      <div className='flex items-center justify-between pb-1'>
        <div className='flex flex-col'>
          <div className='flex items-center gap-1.5'>
            <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-[#121c2a] tracking-tight'>
              Halo, {currentUser.name}
            </h1>
            <span className='text-lg animate-bounce select-none'>👋</span>
          </div>
          <div className='flex items-center gap-2 mt-1 flex-wrap'>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ffd9de] text-[#8c0f39] text-xs font-semibold'>
              Calon Pengantin (Catin)
            </span>
            <span className='text-[#debfc2] text-[8px]'>•</span>
            <span className='text-xs text-[#574144] flex items-center gap-1'>
              <CheckCircle2 size={14} className='text-[#2a6950]' />
              Faskes Terdaftar:{' '}
              <strong className='text-[#121c2a] font-semibold'>
                {currentUser.schoolOrOrg || 'Belum dipilih'}
              </strong>
            </span>
          </div>
        </div>

        {/* Quick Micro-Logo / Heart Accent from TEMANI Brand Inspiration */}
        <div className='relative flex items-center justify-center w-11 h-11 rounded-full bg-[#ffd9de]/50 shadow-xs shrink-0 transition-transform active:scale-95'>
          <svg
            className='w-7 h-7 text-[#aa294d]'
            fill='none'
            viewBox='0 0 48 48'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M24 41.5C24 41.5 6 29.5 6 17.5C6 11.5 10.5 7 16.5 7C20 7 22.8 8.8 24 10.8C25.2 8.8 28 7 31.5 7C37.5 7 42 11.5 42 17.5C42 29.5 24 41.5 24 41.5Z'
              fill='#ffd9de'
              stroke='#aa294d'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='3'
            />
            <path d='M24 16V28M18 22H30' stroke='#aa294d' strokeLinecap='round' strokeWidth='3.2' />
            <path
              d='M34 11C37 9 40 10.5 39 14.5'
              stroke='#2a6950'
              strokeLinecap='round'
              strokeWidth='2.5'
            />
          </svg>
          <span className='absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#aa294d] ring-2 ring-white' />
        </div>
      </div>

      {/* Realtime Admin / Nakes Reminder Nudge Banner */}
      {activeNudge && (
        <section aria-label='Pengingat Langsung dari Petugas Faskes'>
          <div className='p-4 sm:p-5 rounded-3xl bg-linear-to-r from-[#aa294d] via-[#cb4364] to-[#2a6950] text-white shadow-xl shadow-rose-950/15 border border-rose-300/30 animate-fade-in'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3.5'>
                <div className='w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white mt-0.5 shadow-inner'>
                  <BellRing size={22} className='animate-pulse' />
                </div>
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full'>
                      Pesan Nakes Faskes • {activeNudge.senderName}
                    </span>
                    <span className='text-[11px] text-rose-100'>{activeNudge.sentAt}</span>
                  </div>
                  <h3 className='text-sm sm:text-base font-bold mt-1 text-white leading-snug'>
                    {activeNudge.message}
                  </h3>
                </div>
              </div>

              <button
                type='button'
                onClick={handleDismissNudge}
                className='text-rose-100 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0'
                title='Tutup Pengingat'
              >
                <X size={18} />
              </button>
            </div>

            <div className='mt-3.5 pt-3 border-t border-white/20 flex items-center gap-2.5 flex-wrap'>
              <Button
                variant='primary'
                size='sm'
                shape='pill'
                icon={<CheckCircle2 size={14} />}
                className='bg-white text-[#aa294d] hover:bg-rose-50 font-bold shadow-xs text-xs'
                onClick={handleTakeFromNudge}
              >
                Konfirmasi Kunjungan
              </Button>
              <button
                type='button'
                onClick={handleDismissNudge}
                className='text-xs font-semibold text-rose-100 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer'
              >
                Sudah Mengerti
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Jadwal TT Terdekat — satu-satunya aksi pencatatan hasil kunjungan */}
      {nextTtSchedule && (
        <section aria-label='Jadwal Imunisasi TT Terdekat'>
          <div className='rounded-2xl bg-white border border-[#ffd9de] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div className='flex items-start gap-3'>
              <div className='w-9 h-9 rounded-xl bg-[#ffd9de] text-[#aa294d] flex items-center justify-center shrink-0 mt-0.5'>
                <CalendarClock size={18} />
              </div>
              <div>
                <h4 className='text-xs sm:text-sm font-bold text-[#121c2a]'>
                  Kunjungan {nextTtSchedule.stage} — {nextTtSchedule.title}
                </h4>
                <p className='text-[11px] sm:text-xs text-[#574144] mt-0.5'>
                  {nextTtSchedule.scheduledDate} • {nextTtSchedule.time} WIB
                </p>
                <p className='text-[11px] text-[#8b7074] mt-0.5'>
                  Sudah dilaksanakan? Catat hasil kunjungan dan unggah bukti imunisasi.
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleRecordScheduledVisit}
              className='inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#aa294d] hover:bg-[#cb4364] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer'
            >
              <span>Catat Hasil</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </section>
      )}

      {/* Main Responsive Grid: Stitch Core Experience on Left / Countdown & Clinical Context on Right */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start'>
        {/* LEFT COLUMN: Stitch Screen 2 Core Mobile Flow (md:col-span-7 lg:col-span-8) */}
        <div className='md:col-span-7 lg:col-span-8 flex flex-col gap-5'>
          {/* 1. Hero Status Card: Status Imunisasi TT Utama (Stitch Screen 2) */}
          <section aria-label='Status Imunisasi TT'>
            <ImmunityStatusBanner
              currentDoseLevel={ttLevel}
              nextAppointmentDate={nextAppointmentDate}
              partnerName={partnerName}
              onDownloadCard={() => setIsVaccineCardOpen(true)}
            />
          </section>

          {/* 2. Akses Cepat Layanan (2x2 Grid from Stitch Screen 2) */}
          <section aria-label='Akses Cepat Layanan'>
            <QuickAction
              currentTTLevel={ttLevel}
              nextScheduleDate={nextAppointmentDate}
              onToggleReminder={active => {
                showToast(
                  active
                    ? 'Pengingat imunisasi via WhatsApp & App diaktifkan!'
                    : 'Pengingat imunisasi dinonaktifkan.',
                );
              }}
            />
          </section>

          {/* 3. Banner Informasi Catin Terpadu (Educational Article Highlight from Stitch Screen 2) */}
          {(() => {
            const activeArticleId = featuredArticle?.id || 'art_tt_1';
            const articleTitle =
              featuredArticle?.title ||
              'Mengapa Skrining TT itu Sangat Penting Sebelum Ijab Kabul?';
            const articleSummary =
              featuredArticle?.summary ||
              'Imunisasi Tetanus Toxoid (TT) bukan sekadar syarat administratif pernikahan, melainkan benteng proteksi seumur hidup bagi calon ibu dan buah hati dari risiko tetanus neonatorum saat persalinan.';
            const articleImage =
              featuredArticle?.imageUrl ||
              'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';
            const articleReadTime = featuredArticle?.readTime || '4 Menit Baca';
            const articleAuthor =
              featuredArticle?.author?.name || 'dr. Sarah Jenkins, Sp.GK & Tim Medis Kemenkes';

            const read = isRead(activeArticleId);

            return (
              <section aria-label='Banner Edukasi Pranikah Pilihan'>
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white border border-[#eff4ff] shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col group transition-all ${
                    read ? 'bg-stone-50/80 border-stone-200/80 opacity-90' : ''
                  }`}
                >
                  {/* Image Card Header with Editorial Scrim */}
                  <Link
                    to={`/user/education/${activeArticleId}`}
                    onClick={() => markAsRead(activeArticleId)}
                    className='relative w-full h-44 sm:h-48 bg-stone-100 overflow-hidden block cursor-pointer'
                  >
                    <img
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                        read ? 'grayscale-[35%] group-hover:grayscale-0' : ''
                      }`}
                      src={articleImage}
                      alt={articleTitle}
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-[#121c2a]/85 via-[#121c2a]/20 to-transparent' />
                    <div className='absolute top-3 left-3 flex items-center gap-1.5 flex-wrap'>
                      <span className='px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#aa294d] text-[11px] font-bold shadow-xs'>
                        Wajib bagi Catin
                      </span>
                      {read && (
                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-200 text-[11px] font-semibold shadow-xs'>
                          <Check size={12} className='text-emerald-400' /> Sudah dibaca
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Article Content */}
                  <div className='p-4 sm:p-5 flex flex-col gap-2.5'>
                    <div className='flex items-center gap-2 text-[#574144] text-[11px]'>
                      <span className='flex items-center gap-1'>
                        <Clock size={13} /> {articleReadTime}
                      </span>
                      <span>•</span>
                      <span className='truncate'>{articleAuthor}</span>
                    </div>

                    <Link
                      to={`/user/education/${activeArticleId}`}
                      onClick={() => markAsRead(activeArticleId)}
                    >
                      <h3
                        className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                          read
                            ? 'text-stone-500 font-semibold group-hover:text-stone-700'
                            : 'text-[#121c2a] group-hover:text-[#aa294d]'
                        }`}
                      >
                        {articleTitle}
                      </h3>
                    </Link>

                    <p className={`text-xs leading-relaxed line-clamp-2 ${read ? 'text-stone-400' : 'text-[#574144]'}`}>
                      {articleSummary}
                    </p>

                    <div className='pt-2 flex items-center justify-between gap-3'>
                      <Link
                        to={`/user/education/${activeArticleId}`}
                        onClick={() => markAsRead(activeArticleId)}
                        className={`inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold transition-all active:scale-95 ${
                          read
                            ? 'bg-stone-200 text-stone-700 hover:bg-stone-300 shadow-none'
                            : 'bg-[#aa294d] text-white shadow-[0_4px_12px_rgba(170,41,77,0.25)] hover:bg-[#cb4364]'
                        }`}
                      >
                        {read ? 'Baca Lagi' : 'Baca Selengkapnya'}
                      </Link>
                      <button
                        type='button'
                        onClick={() => {
                          setIsBookmarked(!isBookmarked);
                          showToast(
                            !isBookmarked
                              ? 'Artikel disimpan ke daftar bacaan!'
                              : 'Artikel dihapus dari simpanan.',
                          );
                        }}
                        className='w-11 h-11 rounded-full flex items-center justify-center text-[#574144] hover:text-[#aa294d] hover:bg-[#ffd9de]/30 transition-colors cursor-pointer active:scale-90 shrink-0'
                        title='Simpan Artikel'
                        aria-label='Simpan Artikel'
                      >
                        {isBookmarked ? (
                          <BookmarkCheck size={20} className='text-[#aa294d]' />
                        ) : (
                          <Bookmark size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Bottom Reassurance Micro-Banner (Stitch Screen 2) */}
          <div className='py-2 flex items-center justify-center gap-2 text-[#574144]/80 text-xs'>
            <ShieldCheck size={16} className='text-[#2a6950]' />
            <span className='font-semibold'>
              Standar Pelayanan Kesehatan Kementerian Kesehatan RI
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Wedding Countdown, Clinical Guidance & Daily Status (md:col-span-5 lg:col-span-4) */}
        <div className='md:col-span-5 lg:col-span-4 flex flex-col gap-5'>
          {/* 1. Hitung Mundur Hari Bahagia & Kesiapan Klinis */}
          <section aria-label='Hitung Mundur Hari Bahagia'>
            <WeddingCountdownWidget
              weddingDateStr={weddingDate}
              partnerName={partnerName}
              currentTTLevel={ttLevel}
            />
          </section>

          {/* 2. Standar Skrining Catin Kemenkes Box */}
          <Card
            padding='md'
            className='bg-linear-to-br from-[#aff1d0]/25 to-[#eff4ff] border-[#aff1d0]/40'
          >
            <div className='flex items-center gap-2.5 mb-2'>
              <div className='w-8 h-8 rounded-xl bg-[#2a6950] text-white flex items-center justify-center shrink-0 shadow-xs'>
                <Award size={18} />
              </div>
              <div>
                <h4 className='text-xs font-bold text-[#121c2a]'>Standar Skrining Catin</h4>
                <span className='text-[11px] font-semibold text-[#2a6950]'>
                  Pedoman Kemenkes RI
                </span>
              </div>
            </div>
            <p className='text-xs text-[#574144] leading-relaxed'>
              Pemeriksaan pranikah meliputi skrining imunisasi TT (5 dosis), status gizi (LILA min.
              23.5 cm), serta edukasi kesiapan kesehatan pranikah untuk generasi bebas stunting.
            </p>
            <div className='mt-3 pt-2.5 border-t border-[#aff1d0]/50 flex items-center justify-between'>
              <Link
                to={`/user/education/${featuredArticle?.id || 'art_tt_1'}`}
                className='text-[11px] font-bold text-[#2a6950] hover:underline inline-flex items-center gap-1'
              >
                <BookOpen size={12} />
                <span>Pelajari Buku Saku Catin</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
