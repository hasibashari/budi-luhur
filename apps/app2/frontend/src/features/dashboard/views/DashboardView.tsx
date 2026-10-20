import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  Award,
  BellRing,
  X,
  CheckCircle2,
  CalendarClock,
  Shield,
} from 'lucide-react';
import { DailyPrescriptionHeroCard } from '@/src/shared/components/domain/DailyPrescriptionHeroCard';
import { ActiveBlisterStripWidget } from '@/src/shared/components/domain/ActiveBlisterStripWidget';
import { QuickAction } from '@/src/shared/components/domain/QuickAction';
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

  const userId = authUser?.id || 'usr_1';

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

    // Subscribe to realtime push & admin nudge events
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
              showSystemNotification('Pengingat Pil KB Pilluna', {
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

    // Optimistic UI update
    setDashboardData(prev => (prev ? { ...prev, todayStatus: newStatus } : null));

    const todayStr = new Date().toISOString().split('T')[0];
    const res = await recordUserConsumptionAction(currentUid, newStatus, undefined, todayStr);
    if (!res.success) {
      // Revert if error
      setDashboardData(prev => (prev ? { ...prev, todayStatus: prevStatus } : null));
    } else {
      // Fetch fresh synchronized data
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
    name: authUser?.name || 'Akseptor Pilluna',
    streakCount: 0,
    streakUnit: 'Hari' as const,
    consecutiveDates: [],
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    avatarUrl: authUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pilluna',
  };

  const featuredArticle = dashboardData?.featuredArticle;
  const streakUnit = currentUser.streakUnit || 'Hari';

  // Dynamic milestone level calculation based on real streak count
  const getMilestoneInfo = (streak: number) => {
    if (streak >= 21) {
      return {
        level: 4,
        title: 'Perlindungan Maksimal (Level 4)',
        desc: `Konsisten ${streak} hari berturut-turut. Efektivitas perlindungan kontrasepsi terjaga 99% optimal!`,
      };
    }
    if (streak >= 14) {
      return {
        level: 3,
        title: 'Disiplin Tinggi (Level 3)',
        desc: `${streak} pil diminum berturut-turut. Hormon stabil dalam tubuh!`,
      };
    }
    if (streak >= 7) {
      return {
        level: 2,
        title: 'Kebiasaan Terbentuk (Level 2)',
        desc: `${streak} hari berturut-turut. Pertahankan jadwal jam yang sama!`,
      };
    }
    if (streak >= 1) {
      return {
        level: 1,
        title: 'Langkah Awal Baik (Level 1)',
        desc: `${streak} pil tercatat. Lanjutkan konsumsi teratur setiap hari di jam yang sama!`,
      };
    }
    return {
      level: 0,
      title: 'Mulai Siklus Pil KB',
      desc: 'Minum pil KB teratur setiap hari di jam yang sama untuk perlindungan kontrasepsi optimal.',
    };
  };

  const milestone = getMilestoneInfo(currentUser.streakCount);

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 sm:gap-5 w-full'>
      {/* Mobile Health Stats Bar (< md) */}
      <div className='flex md:hidden items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100'>
            <Flame size={16} className='fill-orange-500 text-orange-500' />
          </div>
          <div>
            <span className='text-[10px] text-slate-500 block leading-tight'>
              Disiplin Konsumsi
            </span>
            <span className='text-xs font-extrabold text-slate-900'>
              {currentUser.streakCount} {streakUnit}
            </span>
          </div>
        </div>

        <div className='h-7 w-[1px] bg-slate-200' />

        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100'>
            <Shield size={16} />
          </div>
          <div>
            <span className='text-[10px] text-slate-500 block leading-tight'>
              Proteksi Kontrasepsi
            </span>
            <span className='text-xs font-extrabold text-teal-700'>
              {currentUser.streakCount >= 7 ? '99% Optimal' : 'Tahap Adaptasi'}
            </span>
          </div>
        </div>

        <div className='h-7 w-[1px] bg-slate-200' />

        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600'>
            <Clock size={16} />
          </div>
          <div>
            <span className='text-[10px] text-slate-500 block leading-tight'>Jadwal</span>
            <span className='text-xs font-extrabold text-slate-800'>20:00 WIB</span>
          </div>
        </div>
      </div>

      {/* Mobile Quick Action Menu (Visible on < md at top) */}
      <section aria-label='Menu Cepat Navigasi Mobile' className='block md:hidden'>
        <QuickAction />
      </section>

      {/* Desktop Welcome Banner (Visible on md+) */}
      <div className='hidden md:flex items-center justify-between pb-2 border-b border-slate-200'>
        <div>
          <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
            Dashboard Akseptor Pilluna
          </h1>
          <p className='text-sm text-slate-600 mt-0.5'>
            Selamat datang kembali, <strong>{currentUser.name}</strong>. Pantau jadwal dan kepatuhan
            konsumsi pil KB harianmu.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs'>
            <Flame size={18} className='text-orange-500 fill-orange-500' />
            <span className='text-xs font-bold text-slate-800'>
              {currentUser.streakCount} {streakUnit} Disiplin
            </span>
          </div>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs'>
            <ShieldCheck size={18} className='text-teal-600' />
            <span className='text-xs font-bold text-teal-800'>
              {currentUser.streakCount >= 7 ? 'Proteksi 99% Terjaga' : 'Adaptasi Awal'}
            </span>
          </div>
        </div>
      </div>

      {/* Realtime Bidan / Faskes Reminder Nudge Banner (If Admin sent a reminder) */}
      {activeNudge && (
        <section aria-label='Pengingat Langsung dari Bidan'>
          <div className='p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 text-white shadow-lg shadow-teal-900/10 border border-teal-600/40 animate-fade-in'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3.5'>
                <div className='w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 text-white mt-0.5 shadow-inner'>
                  <BellRing size={22} className='animate-pulse' />
                </div>
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full'>
                      Pesan Bidan • {activeNudge.senderName}
                    </span>
                    <span className='text-[11px] text-teal-200'>{activeNudge.sentAt}</span>
                  </div>
                  <h3 className='text-sm sm:text-base font-bold mt-1 text-white leading-snug'>
                    {activeNudge.message}
                  </h3>
                </div>
              </div>

              <button
                type='button'
                onClick={handleDismissNudge}
                className='text-teal-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0'
                title='Tutup Pengingat'
              >
                <X size={18} />
              </button>
            </div>

            <div className='mt-3.5 pt-3 border-t border-white/20 flex items-center gap-2.5 flex-wrap'>
              <Button
                variant='secondary'
                size='sm'
                shape='pill'
                icon={<CheckCircle2 size={14} />}
                className='font-bold shadow-sm text-xs'
                onClick={handleTakeFromNudge}
              >
                Catat Minum Sekarang
              </Button>
              <button
                type='button'
                onClick={handleDismissNudge}
                className='text-xs font-semibold text-teal-100 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer'
              >
                Sudah Mengerti
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Responsive Layout: Mobile Stack -> Desktop Bento Grid */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
        {/* LEFT COLUMN: Main Health Actions & Hero (md:col-span-7 lg:col-span-8) */}
        <div className='md:col-span-7 lg:col-span-8 flex flex-col gap-5'>
          {/* Missing Schedule Setup Prompt Banner */}
          {dashboardData && !dashboardData.activeSchedule && (
            <section aria-label='Pengingat Atur Jadwal Konsumsi'>
              <div className='p-4 sm:p-4.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs'>
                <div className='flex items-start gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5'>
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h4 className='text-xs sm:text-sm font-bold text-orange-900'>
                      Jadwal Rutin Pil KB Belum Dikonfigurasi
                    </h4>
                    <p className='text-[11px] sm:text-xs text-orange-800/80 mt-0.5 leading-relaxed'>
                      Tentukan jam minum setiap hari (misal pukul 20:00 WIB) agar efektivitas
                      kontrasepsi terjaga maksimal.
                    </p>
                  </div>
                </div>
                <Link
                  to='/user/schedule'
                  className='inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs shrink-0 self-start sm:self-auto'
                >
                  <span>Atur Jam Minum</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </section>
          )}

          {/* 1. Hero Preskripsi Klinis Harian */}
          <section aria-label='Preskripsi Pil KB Hari Ini'>
            <DailyPrescriptionHeroCard
              initialStatus={dashboardData?.todayStatus || 'pending'}
              initialRecordedTime={dashboardData?.todayRecordedTime}
              onStatusChange={handleStatusChange}
              pillDayNumber={
                currentUser.streakCount % 28 === 0 && currentUser.streakCount > 0
                  ? 28
                  : currentUser.streakCount % 28 || 1
              }
              totalPills={28}
              targetTime='20:00 WIB'
            />
          </section>

          {/* 2. Visual Kemasan Strip Blister Aktif 7 Butir */}
          <section aria-label='Kemasan Blister Aktif'>
            <ActiveBlisterStripWidget
              streakCount={currentUser.streakCount}
              todayStatus={dashboardData?.todayStatus || 'pending'}
            />
          </section>

          {/* 3. Edukasi Pilihan (Featured Article Banner) */}
          {featuredArticle && (
            <section aria-label='Materi Edukasi Pilihan'>
              <Card padding='none' className='overflow-hidden border border-slate-200/80 shadow-xs'>
                <div className='relative h-36 sm:h-44 w-full'>
                  <img
                    src={
                      featuredArticle.imageUrl ||
                      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={featuredArticle.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5'>
                    <span className='text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1'>
                      <Sparkles size={11} />
                      <span>Edukasi Bidan • {featuredArticle.readTime}</span>
                    </span>
                    <h3 className='text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mt-0.5'>
                      {featuredArticle.title}
                    </h3>
                  </div>
                </div>

                <div className='p-4 bg-white flex items-center justify-between'>
                  <p className='text-xs text-slate-500 line-clamp-1 flex-1 pr-3'>
                    {featuredArticle.summary}
                  </p>
                  <Link
                    to={`/user/education/${featuredArticle.id}`}
                    className='inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 shrink-0'
                  >
                    <span>Baca Panduan</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Actions, Symptom Tracker & Motivation (md:col-span-5 lg:col-span-4) */}
        <div className='md:col-span-5 lg:col-span-4 flex flex-col gap-5'>
          {/* Desktop Quick Menu */}
          <section aria-label='Menu Cepat Navigasi' className='hidden md:block'>
            <QuickAction />
          </section>

          {/* Motivation & Level Milestone Widget */}
          <Card
            padding='md'
            className='bg-gradient-to-br from-teal-50/60 to-slate-50 border border-teal-100/80 shadow-xs'
          >
            <div className='flex items-center gap-2.5 mb-2'>
              <div className='w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200'>
                <Award size={18} />
              </div>
              <div>
                <h4 className='text-xs font-bold text-slate-800'>Tingkat Kepatuhan Minum</h4>
                <span className='text-[11px] font-semibold text-teal-700'>{milestone.title}</span>
              </div>
            </div>
            <p className='text-xs text-slate-600 leading-relaxed'>{milestone.desc}</p>
          </Card>
        </div>
      </div>

      {/* Footer Trust Badge */}
      <footer className='pt-2 pb-4 text-center'>
        <div className='inline-flex items-center gap-1.5 text-[11px] text-slate-400'>
          <ShieldCheck size={14} className='text-teal-600' />
          <span>Program Kontrasepsi Terencana & SADARI • Pilluna Medis</span>
        </div>
      </footer>
    </div>
  );
}
