import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/src/features/auth/components/AuthGuard';
import { GuestGuard } from '@/src/features/auth/components/GuestGuard';
import { LoginView, RegisterView, useAuth } from '@/src/features/auth';
import { OnboardingView } from '@/src/features/onboarding';
import { SplashScreenView } from '@/src/shared/components/feedback/SplashScreenView';

// User Portal Views
import {
  UserLayout,
  DashboardView,
  SetupProfileView,
  VerificationStatusView,
  ProfileView,
} from '@/src/features/user';
import { ScheduleView } from '@/src/features/schedule';
import { HistoryView } from '@/src/features/consumption';
import { EducationView, ArticleDetailView, SadariView } from '@/src/features/education';
import { NotesView } from '@/src/features/notes';

// Admin Portal Views
import {
  AdminLayout,
  AdminDashboardView,
  UserManagementView,
  AdminVerificationView,
  ScheduleManagementView,
  ArticleManagementView,
  ReportAnalyticsView,
  AdminProfileView,
} from '@/src/features/admin';

function RootRedirect() {
  const { isAuthenticated, isInitializing, user, hasCompletedOnboarding } = useAuth();

  if (isInitializing) {
    return <SplashScreenView statusText='Memeriksa sesi...' />;
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to='/admin/dashboard' replace />;
    }
    if (!user?.isProfileComplete) {
      return <Navigate to='/user/setup' replace />;
    }
    if (user?.verificationStatus === 'Pending' || user?.verificationStatus === 'Rejected') {
      return <Navigate to='/user/verification-status' replace />;
    }
    return <Navigate to='/user/dashboard' replace />;
  }

  if (hasCompletedOnboarding) {
    return <Navigate to='/auth/login' replace />;
  }

  return <Navigate to='/onboarding' replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public / Entry Routes */}
      <Route path='/' element={<RootRedirect />} />
      {/* Backwards compatibility: redirect /splash directly to root */}
      <Route path='/splash' element={<Navigate to='/' replace />} />
      <Route
        path='/onboarding'
        element={
          <GuestGuard>
            <OnboardingView />
          </GuestGuard>
        }
      />

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

      {/* Verification Status Route */}
      <Route
        path='/user/verification-status'
        element={
          <AuthGuard allowedRoles={['user', 'admin']}>
            <VerificationStatusView />
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
        <Route path='notes' element={<NotesView />} />
        <Route path='buddy' element={<Navigate to='/user/dashboard' replace />} />
        <Route path='education' element={<EducationView />} />
        <Route path='sadari' element={<SadariView />} />
        <Route path='education/:id' element={<ArticleDetailView />} />
        <Route path='consultation' element={<Navigate to='/user/dashboard' replace />} />
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
        <Route path='verifications' element={<AdminVerificationView />} />
        <Route path='users' element={<UserManagementView />} />
        <Route path='schedules' element={<ScheduleManagementView />} />
        <Route path='articles' element={<ArticleManagementView />} />
        <Route path='articles/:id' element={<ArticleDetailView backHref='/admin/articles' />} />
        <Route path='reports' element={<ReportAnalyticsView />} />
        <Route path='profile' element={<AdminProfileView />} />
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/auth/login' replace />} />
    </Routes>
  );
}

export default AppRoutes;
