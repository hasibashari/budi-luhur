import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Activity,
  Award,
  BellRing,
  X,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { StatusCard } from '@/src/shared/components/domain/StatusCard';
import { QuickAction } from '@/src/shared/components/domain/QuickAction';
import { BuddyCard } from '@/src/shared/components/domain/BuddyCard';
import { StreakProgressCard } from '@/src/shared/components/domain/StreakProgressCard';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import { playNotificationTone, showSystemNotification } from '@/src/shared/utils/notifications';
import { useScheduleReminder } from '@/src/features/schedule/hooks/useScheduleReminder';
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

  const handleAutoMissed = React.useCallback(async () => {
    if (dashboardData && dashboardData.todayStatus === 'pending') {
      setDashboardData(prev => (prev ? { ...prev, todayStatus: 'missed' } : null));
      await recordUserConsumptionAction(userId, 'missed');
    }
  }, [dashboardData, userId]);

  const { isReminderActive } = useScheduleReminder({
    schedule: dashboardData?.activeSchedule,
    todayStatus: dashboardData?.todayStatus || 'pending',
    userId,
    onAutoMissed: handleAutoMissed,
  });

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
              showSystemNotification('Pengingat Minum TTD 🌸', {
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

    const res = await recordUserConsumptionAction(currentUid, newStatus);
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
    name: authUser?.name || 'Siswi FEMORY',
    streakCount: 0,
    streakUnit: 'Minggu' as const,
    consecutiveDates: [],
    hbLevel: authUser?.hbLevel || null,
    schoolOrOrg: authUser?.schoolOrOrg || null,
    avatarUrl: authUser?.avatarUrl || null,
  };

  const featuredArticle = dashboardData?.featuredArticle;
  const streakUnit = currentUser.streakUnit || 'Minggu';

  // Dynamic milestone level calculation based on real streak count
  const getMilestoneInfo = (streak: number) => {
    if (streak >= 12) {
      return {
        level: 4,
        title: 'Champion (Level 4)',
        desc: `Konsisten ${streak} ${streakUnit.toLowerCase()} berturut-turut. Hb dan kebugaran optimal!`,
      };
    }
    if (streak >= 6) {
      return {
        level: 3,
        title: 'Bebas Anemia (Level 3)',
        desc: `${streak} tablet berturut-turut. Pertahankan konsistensi mingguanmu!`,
      };
    }
    if (streak >= 3) {
      return {
        level: 2,
        title: 'Konsisten (Level 2)',
        desc: `${streak} ${streakUnit.toLowerCase()} berturut-turut. Terus jaga kebiasaan baik ini!`,
      };
    }
    if (streak >= 1) {
      return {
        level: 1,
        title: 'Pemula Sehat (Level 1)',
        desc: `${streak} ${streakUnit.toLowerCase()} tercatat. Lanjutkan secara teratur!`,
      };
    }
    return {
      level: 0,
      title: 'Mulai Program Sehat',
      desc: 'Minum tablet tambah darah teratur untuk mencegah anemia.',
    };
  };

  const milestone = getMilestoneInfo(currentUser.streakCount);

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e11d48]' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 sm:gap-5 w-full'>
      {/* Mobile Health Stats Bar (< md) */}
      <div className='flex md:hidden items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-[#fce7f3] shadow-2xs'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500'>
            <Flame size={18} className='fill-amber-500' />
          </div>
          <div>
            <span className='text-[10px] text-[#64748b] block leading-tight'>Streak Minum</span>
            <span className='text-xs font-extrabold text-[#1e293b]'>
              {currentUser.streakCount} {streakUnit}
            </span>
          </div>
        </div>

        <div className='h-7 w-[1px] bg-[#fce7f3]' />

        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500'>
            <Activity size={18} />
          </div>
          <div>
            <span className='text-[10px] text-[#64748b] block leading-tight'>Kadar Hb</span>
            <span
              className={`text-xs font-extrabold ${currentUser.hbLevel ? 'text-[#10b981]' : 'text-slate-500'}`}
            >
              {currentUser.hbLevel ? `${currentUser.hbLevel} g/dL` : 'Belum Ada'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Quick Action Menu (Visible on < md at top) */}
      <section aria-label='Menu Cepat Navigasi Mobile' className='block md:hidden'>
        <Card padding='md'>
          <QuickAction />
        </Card>
      </section>

      {/* Desktop Welcome Banner (Visible on md+) */}
      <div className='hidden md:flex items-center justify-between pb-2 border-b border-[#fce7f3]'>
        <div>
          <h1 className='text-2xl font-extrabold text-[#1e293b] tracking-tight'>
            Dashboard Siswi FEMORY 🌸
          </h1>
          <p className='text-sm text-[#64748b] mt-0.5'>
            Selamat datang kembali, <strong>{currentUser.name}</strong>! Pertahankan konsistensi minum TTD pekan ini.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#fce7f3] shadow-2xs'>
            <Flame size={18} className='text-amber-500 fill-amber-500' />
            <span className='text-xs font-bold text-[#1e293b]'>
              {currentUser.streakCount} {streakUnit} Streak
            </span>
          </div>
          <div className='flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#fce7f3] shadow-2xs'>
            <Activity
              size={18}
              className={currentUser.hbLevel ? 'text-emerald-500' : 'text-slate-400'}
            />
            <span
              className={`text-xs font-bold ${currentUser.hbLevel ? 'text-[#10b981]' : 'text-slate-500'}`}
            >
              {currentUser.hbLevel ? `Hb ${currentUser.hbLevel} g/dL` : 'Belum Ada Data Hb'}
            </span>
          </div>
        </div>
      </div>

      {/* Realtime Admin / UKS Reminder Nudge Banner (If Admin sent a reminder) */}
      {activeNudge && (
        <section aria-label='Pengingat Langsung dari UKS'>
          <div className='p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-white shadow-xl shadow-rose-500/20 border border-rose-300/30 animate-fade-in'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3.5'>
                <div className='w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white mt-0.5 shadow-inner'>
                  <BellRing size={22} className='animate-pulse' />
                </div>
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full'>
                      Pesan Pengingat UKS • {activeNudge.senderName}
                    </span>
                    <span className='text-[11px] text-rose-200'>{activeNudge.sentAt}</span>
                  </div>
                  <h3 className='text-sm sm:text-base font-bold mt-1 text-white leading-snug'>
                    {activeNudge.message}
                  </h3>
                </div>
              </div>

              <button
                type='button'
                onClick={handleDismissNudge}
                className='text-rose-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0'
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
                className='bg-white text-rose-600 hover:bg-rose-50 font-extrabold shadow-sm text-xs'
                onClick={handleTakeFromNudge}
              >
                Catat Minum
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

      {/* Main Responsive Layout: Mobile Stack -> Desktop Bento Grid */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start'>
        {/* LEFT COLUMN: Main Health Actions & Hero (md:col-span-7 lg:col-span-8) */}
        <div className='md:col-span-7 lg:col-span-8 flex flex-col gap-5'>
          {/* Missing Schedule Setup Prompt Banner */}
          {dashboardData && !dashboardData.activeSchedule && (
            <section aria-label='Pengingat Atur Jadwal Konsumsi'>
              <div className='p-4 sm:p-4.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs'>
                <div className='flex items-start gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5'>
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h4 className='text-xs sm:text-sm font-bold text-amber-900'>
                      Jadwal Minum TTD Belum Dikonfigurasi
                    </h4>
                    <p className='text-[11px] sm:text-xs text-amber-800/80 mt-0.5 leading-relaxed'>
                      Tentukan hari dan jam rutin minum Tablet Tambah Darah agar FEMORY dapat
                      mengingatkanmu tepat waktu.
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

          {/* Active Scheduled Reminder Banner (Fires when schedule time arrives) */}
          {isReminderActive && dashboardData?.todayStatus === 'pending' && (
            <section aria-label='Pengingat Minum TTD Sekarang' className='animate-fade-in'>
              <div className='p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25 border border-rose-300/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 mt-0.5 shadow-inner'>
                    <BellRing size={20} className='animate-bounce text-white' />
                  </div>
                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full'>
                        Waktunya Minum TTD 🌸
                      </span>
                      <span className='text-xs text-rose-100 font-semibold'>
                        Jadwal {dashboardData.activeSchedule?.time} WIB
                      </span>
                    </div>
                    <h4 className='text-xs sm:text-sm font-bold text-white mt-1'>
                      Waktu minum {dashboardData.activeSchedule?.tabletName || 'Tablet Tambah Darah'} telah tiba!
                    </h4>
                    <p className='text-[11px] text-rose-100 mt-0.5'>
                      Minum 1 tablet sekarang dengan air putih untuk mencegah anemia dan menjaga kebugaran tubuhmu.
                    </p>
                  </div>
                </div>

                <Button
                  variant='primary'
                  size='sm'
                  shape='pill'
                  className='bg-white text-rose-600 hover:bg-rose-50 font-extrabold shadow-sm text-xs self-start sm:self-auto shrink-0'
                  icon={<CheckCircle2 size={15} />}
                  onClick={() => handleStatusChange('recorded')}
                >
                  Sudah Minum Sekarang
                </Button>
              </div>
            </section>
          )}

          {/* 1. Status Hari Ini Card */}
          <section aria-label='Status Konsumsi Hari Ini'>
            <StatusCard
              initialStatus={dashboardData?.todayStatus || 'pending'}
              initialRecordedTime={dashboardData?.todayRecordedTime}
              onStatusChange={handleStatusChange}
            />
          </section>

          {/* 2. Visual Streak Progression Card (100% Dynamic & Elongating) */}
          <section aria-label='Progres Streak Kepatuhan Konsumsi'>
            <StreakProgressCard
              streakCount={currentUser.streakCount}
              streakUnit={currentUser.streakUnit || 'Minggu'}
            />
          </section>

          {/* 3. Edukasi Pilihan (Featured Article Banner) */}
          {featuredArticle && (
            <section aria-label='Materi Edukasi Pilihan'>
              <Card padding='none' className='overflow-hidden'>
                <div className='relative h-36 sm:h-44 w-full'>
                  <img
                    src={
                      featuredArticle.imageUrl ||
                      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={featuredArticle.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5'>
                    <span className='text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1'>
                      <Sparkles size={11} />
                      <span>Edukasi Pilihan • {featuredArticle.readTime}</span>
                    </span>
                    <h3 className='text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mt-0.5'>
                      {featuredArticle.title}
                    </h3>
                  </div>
                </div>

                <div className='p-4 bg-white flex items-center justify-between'>
                  <p className='text-xs text-[#64748b] line-clamp-1 flex-1 pr-3'>
                    {featuredArticle.summary}
                  </p>
                  <Link
                    to={`/user/education/${featuredArticle.id}`}
                    className='inline-flex items-center gap-1 text-xs font-bold text-[#e11d48] hover:text-[#be123c] shrink-0'
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Widgets, Buddy & Stats (md:col-span-5 lg:col-span-4) */}
        <div className='md:col-span-5 lg:col-span-4 flex flex-col gap-5'>
          {/* Desktop Quick Menu */}
          <section aria-label='Menu Cepat Navigasi' className='hidden md:block'>
            <Card padding='md'>
              <QuickAction />
            </Card>
          </section>

          {/* Group Buddy Card (100% Dynamic from PostgreSQL) */}
          <section aria-label='Group Buddy & Komunitas'>
            <BuddyCard
              groupData={dashboardData?.primaryGroup}
              userName={currentUser.name.split(' ')[0]}
            />
          </section>

          {/* Motivation & Level Milestone Widget */}
          <Card padding='md' className='bg-gradient-to-br from-[#fff5f7] to-[#ffe4e6]/50'>
            <div className='flex items-center gap-2.5 mb-2'>
              <div className='w-8 h-8 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center'>
                <Award size={18} />
              </div>
              <div>
                <h4 className='text-xs font-bold text-[#1e293b]'>Tingkat Kepatuhan</h4>
                <span className='text-[11px] font-semibold text-[#e11d48]'>{milestone.title}</span>
              </div>
            </div>
            <p className='text-xs text-[#475569] leading-relaxed'>{milestone.desc}</p>
          </Card>
        </div>
      </div>

      {/* Footer Trust Badge */}
      <footer className='pt-2 pb-4 text-center'>
        <div className='inline-flex items-center gap-1.5 text-[11px] text-[#94a3b8]'>
          <ShieldCheck size={14} className='text-emerald-500' />
          <span>Program Pencegahan Anemia • FEMORY v2.0</span>
        </div>
      </footer>
    </div>
  );
}
