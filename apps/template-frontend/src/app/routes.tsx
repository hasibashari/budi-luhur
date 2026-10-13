import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/src/features/auth/components/AuthGuard';
import { GuestGuard } from '@/src/features/auth/components/GuestGuard';
import { LoginView, RegisterView } from '@/src/features/auth';
import { SplashScreenView } from '@/src/features/splash';
import { OnboardingView } from '@/src/features/onboarding';
import { HomeView } from '@/src/features/home';

// User Portal Views
import {
  UserLayout,
  DashboardView,
  SetupProfileView,
  ProfileView,
} from '@/src/features/user';
import { ScheduleView } from '@/src/features/schedule';
import { HistoryView } from '@/src/features/consumption';
import { BuddyView } from '@/src/features/buddy';
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

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path='/' element={<HomeView />} />
      <Route path='/splash' element={<SplashScreenView />} />
      <Route path='/onboarding' element={<OnboardingView />} />

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
        <Route path='schedule' element={<ScheduleView />} />
        <Route path='history' element={<HistoryView />} />
        <Route path='buddy' element={<BuddyView />} />
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

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default AppRoutes;
