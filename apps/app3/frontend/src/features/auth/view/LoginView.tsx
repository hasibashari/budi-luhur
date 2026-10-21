'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthCardLayout } from '../components/AuthCardLayout';
import { LoginForm } from '../components/LoginForm';
import { GuestGuard } from '../components/GuestGuard';

export function LoginView() {
  return (
    <GuestGuard>
      <AuthCardLayout>
        <Suspense
          fallback={
            <div className='flex items-center justify-center py-12 text-[#aa294d]'>
              <Loader2 className='w-8 h-8 animate-spin' />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </AuthCardLayout>
    </GuestGuard>
  );
}

export default LoginView;
