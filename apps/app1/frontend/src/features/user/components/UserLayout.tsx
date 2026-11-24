import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import MobileTopBar from '@/src/shared/components/MobileTopBar';
import MobileBottomBar from '@/src/shared/components/MobileBottomBar';
import UserSidebar from './UserSidebar';
import { AuthGuard, useAuth } from '@/src/features/auth';
import { useScheduleReminder, ActiveAlarmModal } from '@/src/features/schedule';
import {
  getUserDashboardDataAction,
  recordUserConsumptionAction,
  UserScheduleData,
} from '@/src/features/user/api/userRepository';
import { subscribeToPush } from '@/src/shared/utils/notifications';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';

export interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const userId = user?.id || '';
  const fullName = user?.name || 'Siswi FEMORY';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Siswi';
  const avatarUrl = user?.avatarUrl || null;

  // Global schedule & today status for real-time reminder across all user pages
  const [schedule, setSchedule] = useState<UserScheduleData | null>(null);
  const [todayStatus, setTodayStatus] = useState<'recorded' | 'missed' | 'pending'>('pending');

  const loadUserData = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getUserDashboardDataAction(userId);
      if (data) {
        setSchedule(data.activeSchedule);
        setTodayStatus(data.todayStatus);
      }
    } catch (e) {
      // Ignore initial layout load error
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
    // Attempt PWA push subscription when notification permission is available
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToPush().catch(() => {});
    }

    const unsubscribe = subscribeRealtimeEvent(event => {
      if (event.type === 'MEDICATION_TAKEN' && (!event.patientId || event.patientId === userId)) {
        loadUserData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadUserData, userId]);

  const handleAutoMissed = useCallback(async () => {
    if (todayStatus === 'pending') {
      setTodayStatus('missed');
      const todayDateStr = new Date().toLocaleDateString('en-CA');
      await recordUserConsumptionAction(userId, 'missed', undefined, todayDateStr);
    }
  }, [todayStatus, userId]);

  const handleConfirmTaken = useCallback(async () => {
    const todayDateStr = new Date().toLocaleDateString('en-CA');
    setTodayStatus('recorded');
    await recordUserConsumptionAction(userId, 'recorded', undefined, todayDateStr);
    publishRealtimeEvent('MEDICATION_TAKEN', { patientId: userId });
  }, [userId]);

  const { isAlarmRinging, dismissAlarm, confirmTaken } = useScheduleReminder({
    schedule,
    todayStatus,
    userId,
    onAutoMissed: handleAutoMissed,
    onConfirmTaken: handleConfirmTaken,
  });

  if (pathname === '/user/setup') {
    return (
      <AuthGuard requiredRole='user'>
        {children || <Outlet />}
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole='user'>
      <div className='min-h-screen bg-[#FAF6F8] flex flex-col md:flex-row selection:bg-[#FCE7F0] selection:text-[#B8285F]'>
        {/* Mobile Top Header (< md) */}
        <div className='block md:hidden'>
          <MobileTopBar
            userName={fullName}
            brandTitle={`Hai, ${firstName}! 🌸`}
            avatarUrl={avatarUrl}
          />
        </div>

        {/* Desktop / Tablet Left Sidebar (>= md) */}
        <div className='hidden md:block shrink-0'>
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className='flex-1 min-w-0 w-full max-w-full md:max-w-7xl mx-auto px-4 py-4 pb-28 md:p-8 md:pb-12 min-h-screen box-border'>
          {children || <Outlet />}
        </main>

        {/* Fixed Mobile Bottom Navigation (< md) */}
        <MobileBottomBar />

        {/* Persistent Continuous Audio Alarm Modal */}
        <ActiveAlarmModal
          isOpen={isAlarmRinging}
          tabletName={schedule?.tabletName}
          time={schedule?.time}
          onConfirmTaken={confirmTaken}
          onDismiss={dismissAlarm}
        />
      </div>
    </AuthGuard>
  );
}
