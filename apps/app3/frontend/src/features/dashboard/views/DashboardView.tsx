import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Activity,
  Award,
  BellRing,
  X,
  CheckCircle2,
  CalendarClock,
  Heart,
  Droplets,
  BookOpen,
} from 'lucide-react';
import { StatusCard } from '@/src/shared/components/domain/StatusCard';
import { QuickAction } from '@/src/shared/components/domain/QuickAction';
import { StreakProgressCard } from '@/src/shared/components/domain/StreakProgressCard';
import { ImmunityStatusBanner } from '../components/ImmunityStatusBanner';
import { WeddingCountdownWidget } from '../components/WeddingCountdownWidget';
import { VaccineCardModal } from '../components/VaccineCardModal';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import { playNotificationTone, showSystemNotification } from '@/src/shared/utils/notifications';
import {
  getUserDashboardDataAction,
  recordUserConsumptionAction,
  UserDashboardData,
} from '@/src/features/user/api/userRepository';
import {
  getActiveNudgeAction,
  dismissNudgeAction,
} from '@/src/features/schedule/api/scheduleRepository';
import { AdminNudge } from '@/src/features/schedule/types';

type DashboardConsumptionStatus = 'recorded' | 'missed' | 'pending';

export default function DashboardView() {
  const { user: authUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [activeNudge, setActiveNudge] = useState<AdminNudge | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVaccineCardOpen, setIsVaccineCardOpen] = useState(false);

  const userId = authUser?.id || '';

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        const [data, nudge] = await Promise.all([
          getUserDashboardDataAction(userId),
          getActiveNudgeAction(userId),
        ]);
        if (isMounted) {
          setDashboardData(data);
          setActiveNudge(nudge);
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

  const handleStatusChange = async (newStatus: DashboardConsumptionStatus) => {
    if (!dashboardData) return;
    const currentUid = authUser?.id || dashboardData.user.id;
    const prevStatus = dashboardData.todayStatus;

    setDashboardData(prev => (prev ? { ...prev, todayStatus: newStatus } : null));

    const res = await recordUserConsumptionAction(currentUid, newStatus);
    if (!res.success) {
      setDashboardData(prev => (prev ? { ...prev, todayStatus: prevStatus } : null));
    } else {
      const freshData = await getUserDashboardDataAction(currentUid);
      if (freshData) {
        setDashboardData(freshData);
      }
      publishRealtimeEvent('MEDICATION_TAKEN', { patientId: currentUid });
    }
  };

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
    await handleStatusChange('recorded');
    await handleDismissNudge();
  };

  const currentUser = dashboardData?.user || {
    id: authUser?.id || '',
    name: authUser?.name || 'Calon Pengantin',
    streakCount: 0,
    streakUnit: 'Minggu' as const,
    consecutiveDates: [],
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || '',
    avatarUrl: authUser?.avatarUrl || null,
  };

  const featuredArticle = dashboardData?.featuredArticle;
  const streakUnit = currentUser.streakUnit || 'Minggu';

  // Extract meta from notes if available
  const partnerName = dashboardData?.user.partnerName;
  const weddingDate = dashboardData?.user.weddingDate;
  const ttLevel = Math.max(
    0,
    ...(dashboardData?.immunizationRecords || []).map(record => Number(record.doseLevel.slice(2))),
    Number(dashboardData?.user.ttStatus?.slice(2) || 0),
  );

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa294d]' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 sm:gap-6 w-full'>
      {/* Vaccine Card Modal */}
      <VaccineCardModal
        isOpen={isVaccineCardOpen}
        onClose={() => setIsVaccineCardOpen(false)}
        userName={currentUser.name}
        faskesName={currentUser.schoolOrOrg || 'Puskesmas Domisili Catin'}
        partnerName={partnerName}
        currentTTLevel={ttLevel}
        records={dashboardData?.immunizationRecords}
      />

      {/* Mobile Top Stats Bar (< md) */}
      <div className='flex md:hidden items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-[#aff1d0]/50 flex items-center justify-center text-[#2a6950]'>
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className='text-[10px] text-slate-500 block leading-tight'>Status Imunisasi</span>
            <span className='text-xs font-bold text-slate-900'>TT{ttLevel} Terlindungi</span>
          </div>
        </div>

        <div className='h-7 w-px bg-stone-200' />

        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-[#ffd9de]/60 flex items-center justify-center text-[#aa294d]'>
            <Activity size={18} />
          </div>
          <div>
            <span className='text-[10px] text-slate-500 block leading-tight'>Kadar Hb Lab</span>
            <span
              className={`text-xs font-bold ${currentUser.hbLevel ? 'text-[#2a6950]' : 'text-slate-500'}`}
            >
              {currentUser.hbLevel ? `${currentUser.hbLevel} g/dL` : 'Belum Cek'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Quick Action Menu (< md) */}
      <section aria-label='Menu Cepat Pranikah Mobile' className='block md:hidden'>
        <Card padding='md' className='border-stone-200'>
          <QuickAction />
        </Card>
      </section>

      {/* Desktop Welcome Banner (md+) */}
      <div className='hidden md:flex items-center justify-between pb-3 border-b border-stone-200'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-xs font-bold text-[#8c0f39] bg-[#ffd9de] px-2.5 py-0.5 rounded-full border border-[#aa294d]/20'>
              Calon Pengantin Terdaftar
            </span>
            <span className='text-xs text-slate-500'>
              Faskes: <strong>{currentUser.schoolOrOrg || 'Puskesmas Domisili Catin'}</strong>
            </span>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>
            Selamat Datang, {currentUser.name}!
          </h1>
          <p className='text-xs sm:text-sm text-slate-600 mt-0.5'>
            Persiapkan kesehatan reproduksi prima dan lengkapi imunisasi Tetanus Toxoid menjelang
            hari bahagia.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs'>
            <Building2 size={16} className='text-[#2a6950]' />
            <span className='text-xs font-semibold text-slate-800 truncate max-w-[180px]'>
              {currentUser.schoolOrOrg || 'Puskesmas / KUA'}
            </span>
          </div>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs'>
            <Activity
              size={16}
              className={currentUser.hbLevel ? 'text-[#2a6950]' : 'text-slate-400'}
            />
            <span
              className={`text-xs font-bold ${currentUser.hbLevel ? 'text-[#2a6950]' : 'text-slate-500'}`}
            >
              {currentUser.hbLevel ? `Hb ${currentUser.hbLevel} g/dL` : 'Belum Ada Data Hb'}
            </span>
          </div>
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

      {/* Hero 5-Dose TT Immunity Status Banner */}
      <section aria-label='Status Imunisasi TT 5 Dosis'>
        <ImmunityStatusBanner
          currentDoseLevel={ttLevel}
          nextAppointmentDate={
            dashboardData?.activeSchedule
              ? `${dashboardData.activeSchedule.dayOfWeek}, ${dashboardData.activeSchedule.time}`
              : undefined
          }
          partnerName={partnerName}
          onDownloadCard={() => setIsVaccineCardOpen(true)}
        />
      </section>

      {/* Main Responsive Grid: Left Column (Hero & Actions) | Right Column (Countdown & Widgets) */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
        {/* LEFT COLUMN: Main Health Actions (md:col-span-7 lg:col-span-8) */}
        <div className='md:col-span-7 lg:col-span-8 flex flex-col gap-5'>
          {/* Missing Schedule Setup Prompt Banner */}
          {dashboardData && !dashboardData.activeSchedule && (
            <section aria-label='Pengingat Atur Jadwal Faskes'>
              <div className='p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs'>
                <div className='flex items-start gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5'>
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h4 className='text-xs sm:text-sm font-bold text-amber-900'>
                      Jadwal Kunjungan Faskes Belum Dikonfigurasi
                    </h4>
                    <p className='text-[11px] sm:text-xs text-amber-800 mt-0.5 leading-relaxed'>
                      Tentukan hari dan jam kunjungan ke Puskesmas agar PRELUNA dapat mengingatkan
                      jadwal imunisasi TT tepat waktu.
                    </p>
                  </div>
                </div>
                <Link
                  to='/user/schedule'
                  className='inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs shrink-0 self-start sm:self-auto'
                >
                  <span>Atur Jadwal</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </section>
          )}

          {/* 1. Status Kunjungan Hari Ini Card */}
          <section aria-label='Status Aktivitas Hari Ini'>
            <StatusCard
              initialStatus={dashboardData?.todayStatus || 'pending'}
              initialRecordedTime={dashboardData?.todayRecordedTime}
              onStatusChange={handleStatusChange}
            />
          </section>

          {/* 2. Streak Progress Card */}
          <section aria-label='Progres Kepatuhan Suplementasi'>
            <StreakProgressCard
              streakCount={currentUser.streakCount}
              streakUnit={streakUnit}
            />
          </section>

          {/* 3. Featured Article Banner */}
          {featuredArticle && (
            <section aria-label='Materi Edukasi Pranikah Pilihan'>
              <Card padding='none' className='overflow-hidden border-stone-200'>
                <div className='relative h-36 sm:h-44 w-full'>
                  <img
                    src={
                      featuredArticle.imageUrl ||
                      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={featuredArticle.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5'>
                    <span className='text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1'>
                      <Sparkles size={11} />
                      <span>Edukasi Pranikah • {featuredArticle.readTime}</span>
                    </span>
                    <h3 className='text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mt-0.5'>
                      {featuredArticle.title}
                    </h3>
                  </div>
                </div>

                <div className='p-4 bg-white flex items-center justify-between'>
                  <p className='text-xs text-slate-600 line-clamp-1 flex-1 pr-3'>
                    {featuredArticle.summary}
                  </p>
                  <Link
                    to={`/user/education/${featuredArticle.id}`}
                    className='inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 shrink-0'
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Wedding Countdown, Quick Menu & Clinical Guidance (md:col-span-5 lg:col-span-4) */}
        <div className='md:col-span-5 lg:col-span-4 flex flex-col gap-5'>
          {/* 1. Wedding Countdown & Clinical Readiness Widget */}
          <section aria-label='Hitung Mundur Pernikahan'>
            <WeddingCountdownWidget
              weddingDateStr={weddingDate}
              partnerName={partnerName}
              currentTTLevel={ttLevel}
            />
          </section>

          {/* 2. Desktop Quick Menu */}
          <section aria-label='Menu Cepat Navigasi' className='hidden md:block'>
            <Card padding='md' className='border-stone-200'>
              <QuickAction />
            </Card>
          </section>

          {/* 3. Clinical Guidelines / Education Highlight */}
          <Card
            padding='md'
            className='bg-linear-to-br from-[#aff1d0]/25 to-[#eff4ff] border-[#aff1d0]/40'
          >
            <div className='flex items-center gap-2.5 mb-2'>
              <div className='w-8 h-8 rounded-xl bg-[#2a6950] text-white flex items-center justify-center shrink-0 shadow-xs'>
                <Award size={18} />
              </div>
              <div>
                <h4 className='text-xs font-bold text-slate-900'>Standar Skrining Catin</h4>
                <span className='text-[11px] font-semibold text-[#2a6950]'>
                  Pedoman Kemenkes RI
                </span>
              </div>
            </div>
            <p className='text-xs text-slate-700 leading-relaxed'>
              Pemeriksaan pranikah meliputi skrining TT (5 dosis), cek Hb (mencegah anemia ibu
              hamil), status gizi (LILA min. 23.5 cm), dan skrining calon ayah untuk generasi bebas
              stunting.
            </p>
            <div className='mt-3 pt-2.5 border-t border-[#aff1d0]/50 flex items-center justify-between'>
              <Link
                to='/user/education'
                className='text-[11px] font-bold text-[#2a6950] hover:underline inline-flex items-center gap-1'
              >
                <BookOpen size={12} />
                <span>Pelajari Buku Saku Catin</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Trust Badge */}
      <footer className='pt-2 pb-4 text-center'>
        <div className='inline-flex items-center gap-1.5 text-[11px] text-slate-400'>
          <ShieldCheck size={14} className='text-[#2a6950]' />
          <span>Program Imunisasi Tetanus Toxoid Pranikah • PRELUNA Kemenkes RI</span>
        </div>
      </footer>
    </div>
  );
}
