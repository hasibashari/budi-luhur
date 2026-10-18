import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/src/features/auth/components/AuthGuard';
import { GuestGuard } from '@/src/features/auth/components/GuestGuard';
import { LoginView, RegisterView, useAuth } from '@/src/features/auth';
import { OnboardingView, OnboardingScreenView } from '@/src/features/onboarding';

// User Portal Views
import {
  UserLayout,
  DashboardView,
  SetupProfileView,
  ProfileView,
} from '@/src/features/user';
import { ScheduleView } from '@/src/features/schedule';
import { HistoryView } from '@/src/features/consumption';
import { EducationView, ArticleDetailView } from '@/src/features/education';
import { ConsultationView } from '@/src/features/consultation';

// Admin Portal Views
import {
  AdminLayout,
  AdminDashboardView,
  UserManagementView,
  ScheduleManagementView,
  ArticleManagementView,
  ReportAnalyticsView,
  AdminProfileView,
} from '@/src/features/admin';

function RootEntry() {
  const { isInitializing, isAuthenticated, user, hasCompletedOnboarding } = useAuth();

  if (isInitializing) {
    return <OnboardingScreenView statusText='Memuat aplikasi PRELUNA...' />;
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to='/admin/dashboard' replace />;
    }
    return <Navigate to='/user/dashboard' replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to='/onboarding' replace />;
  }

  return <Navigate to='/auth/login' replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root Entry: Menuju Onboarding (tamu baru), Login (tamu lama), atau Dashboard (login) */}
      <Route path='/' element={<RootEntry />} />

      {/* Onboarding 3 Slide */}
      <Route
        path='/onboarding'
        element={
          <GuestGuard>
            <OnboardingView />
          </GuestGuard>
        }
      />

      {/* Redirect untuk rute lama agar tidak 404 */}
      <Route path='/splash' element={<Navigate to='/' replace />} />
      <Route path='/welcome' element={<Navigate to='/auth/login' replace />} />
      <Route path='/auth' element={<Navigate to='/auth/login' replace />} />

      {/* Guest Only Auth Routes */}
      <Route
        path='/auth/login'
        element={
          <GuestGuard>
            <LoginView />
          </GuestGuard>
        }
      />
      <Route
        path='/auth/register'
        element={
          <GuestGuard>
            <RegisterView />
          </GuestGuard>
        }
      />

      {/* Dedicated Setup Profile Route */}
      <Route
        path='/user/setup'
        element={
          <AuthGuard allowedRoles={['user', 'admin']}>
            <SetupProfileView />
          </AuthGuard>
        }
      />

      {/* Protected User Portal Routes */}
      <Route
        path='/user'
        element={
          <AuthGuard allowedRoles={['user', 'admin']}>
            <UserLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to='/user/dashboard' replace />} />
        <Route path='dashboard' element={<DashboardView />} />
        <Route path='schedule' element={<Navigate to='/user/imunisasi?tab=jadwal' replace />} />
        <Route path='history' element={<Navigate to='/user/imunisasi?tab=riwayat' replace />} />
        <Route path='imunisasi' element={<HistoryView />} />
        <Route path='buddy' element={<Navigate to='/user/dashboard' replace />} />
        <Route path='education' element={<EducationView />} />
        <Route path='education/:id' element={<ArticleDetailView />} />
        <Route path='consultation' element={<ConsultationView />} />
        <Route path='profile' element={<ProfileView />} />
      </Route>

      {/* Protected Admin Portal Routes */}
      <Route
        path='/admin'
        element={
          <AuthGuard allowedRoles={['admin']}>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to='/admin/dashboard' replace />} />
        <Route path='dashboard' element={<AdminDashboardView />} />
        <Route path='users' element={<UserManagementView />} />
        <Route path='schedules' element={<ScheduleManagementView />} />
        <Route path='articles' element={<ArticleManagementView />} />
        <Route path='articles/:id' element={<ArticleDetailView backHref='/admin/articles' />} />
        <Route path='reports' element={<ReportAnalyticsView />} />
        <Route path='profile' element={<AdminProfileView />} />
      </Route>

      {/* Catch-all: redirect to / */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default AppRoutes;
