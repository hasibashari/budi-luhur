import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/src/features/auth/components/AuthGuard';
import { GuestGuard } from '@/src/features/auth/components/GuestGuard';
import { LoginView, RegisterView, ForgotPasswordView, useAuth } from '@/src/features/auth';
import { OnboardingView, OnboardingScreenView } from '@/src/features/onboarding';

// User Portal Core
import { UserLayout } from '@/src/features/user';
import { DashboardView } from '@/src/features/dashboard';

// Dynamic User Portal Views (Code-Split)
const SetupProfileView = lazy(() => import('@/src/features/user/views/SetupProfileView'));
const ProfileView = lazy(() => import('@/src/features/user/views/ProfileView'));
const ScheduleView = lazy(() => import('@/src/features/schedule/views/ScheduleView'));
const HistoryView = lazy(() => import('@/src/features/history/views/HistoryView'));
const EducationView = lazy(() => import('@/src/features/education/views/EducationView'));
const ArticleDetailView = lazy(() => import('@/src/features/education/views/ArticleDetailView'));

// Dynamic Admin Portal Views (Code-Split)
const AdminLayout = lazy(() => import('@/src/features/admin/components/AdminLayout'));
const AdminDashboardView = lazy(() => import('@/src/features/admin/views/AdminDashboardView'));
const UserManagementView = lazy(() => import('@/src/features/admin/views/UserManagementView'));
const CertificateVerificationView = lazy(
  () => import('@/src/features/admin/views/CertificateVerificationView'),
);
const ArticleManagementView = lazy(() => import('@/src/features/admin/views/ArticleManagementView'));
const ReportAnalyticsView = lazy(() => import('@/src/features/admin/views/ReportAnalyticsView'));
const AdminProfileView = lazy(() => import('@/src/features/admin/views/AdminProfileView'));

function PageLoader() {
  return <OnboardingScreenView statusText='Memuat halaman...' />;
}

function RootEntry() {
  const { isInitializing, isAuthenticated, user, hasCompletedOnboarding } = useAuth();

  if (isInitializing) {
    return <OnboardingScreenView statusText='Memuat aplikasi TEMANI...' />;
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
    <Suspense fallback={<PageLoader />}>
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
        <Route
          path='/auth/forgot-password'
          element={
            <GuestGuard>
              <ForgotPasswordView />
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
          <Route path='history' element={<Navigate to='/user/imunisasi?tab=riwayat' replace />} />
          <Route path='imunisasi' element={<HistoryView />} />
          <Route path='buddy' element={<Navigate to='/user/dashboard' replace />} />
          <Route path='education' element={<EducationView />} />
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
          <Route path='users' element={<UserManagementView />} />
          <Route path='schedules' element={<Navigate to='/admin/users' replace />} />
          <Route path='certificates' element={<CertificateVerificationView />} />
          <Route path='articles' element={<ArticleManagementView />} />
          <Route path='articles/:id' element={<ArticleDetailView backHref='/admin/articles' />} />
          <Route path='reports' element={<ReportAnalyticsView />} />
          <Route path='profile' element={<AdminProfileView />} />
        </Route>

        {/* Catch-all: redirect to / */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
