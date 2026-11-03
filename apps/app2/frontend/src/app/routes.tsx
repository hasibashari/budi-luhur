import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/src/features/auth/components/AuthGuard';
import { GuestGuard } from '@/src/features/auth/components/GuestGuard';
import { useAuth } from '@/src/features/auth';
import { SplashScreenView } from '@/src/shared/components/feedback/SplashScreenView';
import UserLayout from '@/src/features/user/components/UserLayout';
import AdminLayout from '@/src/features/admin/components/AdminLayout';

// Public & Auth Views (Lazy Loaded)
const OnboardingView = lazy(() => import('@/src/features/onboarding/views/OnboardingView'));
const LoginView = lazy(() => import('@/src/features/auth/view/LoginView'));
const RegisterView = lazy(() => import('@/src/features/auth/view/RegisterView'));

// User Portal Views (Lazy Loaded)
const DashboardView = lazy(() => import('@/src/features/dashboard/views/DashboardView'));
const SetupProfileView = lazy(() => import('@/src/features/user/views/SetupProfileView'));
const VerificationStatusView = lazy(() => import('@/src/features/user/views/VerificationStatusView'));
const ProfileView = lazy(() => import('@/src/features/user/views/ProfileView'));
const ScheduleView = lazy(() => import('@/src/features/schedule/views/ScheduleView'));
const HistoryView = lazy(() => import('@/src/features/consumption/views/HistoryView'));
const EducationView = lazy(() => import('@/src/features/education/views/EducationView'));
const SadariView = lazy(() => import('@/src/features/education/views/SadariView'));
const ArticleDetailView = lazy(() => import('@/src/features/education/views/ArticleDetailView'));
const NotesView = lazy(() => import('@/src/features/notes/views/NotesView'));

// Admin Portal Views (Lazy Loaded)
const AdminDashboardView = lazy(() => import('@/src/features/admin/views/AdminDashboardView'));
const UserManagementView = lazy(() => import('@/src/features/admin/views/UserManagementView'));
const AdminVerificationView = lazy(() => import('@/src/features/admin/views/AdminVerificationView'));
const ArticleManagementView = lazy(() => import('@/src/features/admin/views/ArticleManagementView'));
const ReportAnalyticsView = lazy(() => import('@/src/features/admin/views/ReportAnalyticsView'));
const AdminProfileView = lazy(() => import('@/src/features/admin/views/AdminProfileView'));

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
    <Suspense fallback={<SplashScreenView statusText='Memuat halaman...' />}>
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
          <Route path='schedules' element={<Navigate to='/admin/users' replace />} />
          <Route path='articles' element={<ArticleManagementView />} />
          <Route path='articles/:id' element={<ArticleDetailView backHref='/admin/articles' />} />
          <Route path='reports' element={<ReportAnalyticsView />} />
          <Route path='profile' element={<AdminProfileView />} />
        </Route>

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/auth/login' replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
