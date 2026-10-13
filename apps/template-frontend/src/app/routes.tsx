import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/src/features/auth/components/AuthGuard';
import { GuestGuard } from '@/src/features/auth/components/GuestGuard';
import { LoginView, RegisterView } from '@/src/features/auth';
import { SplashScreenView } from '@/src/features/splash';
import { OnboardingView } from '@/src/features/onboarding';
import { HomeView } from '@/src/features/home';

// Lazy or placeholder modules for Task 7 (User Portal) & Task 8 (Admin Portal)
const UserDashboardPlaceholder = () => (
  <div className='min-h-screen flex items-center justify-center p-4 bg-[#fff5f7]'>
    <div className='bg-white p-6 rounded-2xl shadow-md border border-rose-100 text-center max-w-md'>
      <h2 className='text-lg font-bold text-slate-800 mb-2'>Portal Siswi</h2>
      <p className='text-sm text-slate-600 mb-4'>Halaman sedang disiapkan di Task 7.</p>
    </div>
  </div>
);

const AdminDashboardPlaceholder = () => (
  <div className='min-h-screen flex items-center justify-center p-4 bg-[#fff5f7]'>
    <div className='bg-white p-6 rounded-2xl shadow-md border border-rose-100 text-center max-w-md'>
      <h2 className='text-lg font-bold text-slate-800 mb-2'>Portal Admin UKS</h2>
      <p className='text-sm text-slate-600 mb-4'>Halaman sedang disiapkan di Task 8.</p>
    </div>
  </div>
);

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

      {/* Protected User Routes */}
      <Route
        path='/user/*'
        element={
          <AuthGuard allowedRoles={['user', 'admin']}>
            <UserDashboardPlaceholder />
          </AuthGuard>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path='/admin/*'
        element={
          <AuthGuard allowedRoles={['admin']}>
            <AdminDashboardPlaceholder />
          </AuthGuard>
        }
      />

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
