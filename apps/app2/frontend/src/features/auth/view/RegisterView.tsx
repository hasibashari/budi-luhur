'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthCardLayout } from '../components/AuthCardLayout';
import { RegisterForm } from '../components/RegisterForm';
import { GuestGuard } from '../components/GuestGuard';

export function RegisterView() {
  return (
    <GuestGuard>
      <AuthCardLayout>
        <Suspense
          fallback={
            <div className='flex items-center justify-center py-12 text-[#0D9488]'>
              <Loader2 className='w-8 h-8 animate-spin' />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </AuthCardLayout>
    </GuestGuard>
  );
}

export default RegisterView;
