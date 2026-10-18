'use client';

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export interface AuthTabbedContainerProps {
  initialTab?: 'login' | 'register';
}

export function AuthTabbedContainer({ initialTab = 'login' }: AuthTabbedContainerProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  return (
    <div className='w-full max-w-md mx-auto'>
      {/* Tab Switcher Header */}
      <div className='flex items-center gap-6 mb-6 border-b border-[#ffd9de]'>
        <button
          type='button'
          onClick={() => setActiveTab('login')}
          className={`pb-3 text-xl font-extrabold transition-all cursor-pointer relative ${
            activeTab === 'login' ? 'text-[#8c0f39]' : 'text-[#64748b] hover:text-[#aa294d]'
          }`}
        >
          Masuk
          {activeTab === 'login' && (
            <span className='absolute bottom-0 left-0 right-0 h-1 bg-[#aa294d] rounded-full' />
          )}
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('register')}
          className={`pb-3 text-xl font-extrabold transition-all cursor-pointer relative ${
            activeTab === 'register' ? 'text-[#8c0f39]' : 'text-[#64748b] hover:text-[#aa294d]'
          }`}
        >
          Daftar
          {activeTab === 'register' && (
            <span className='absolute bottom-0 left-0 right-0 h-1 bg-[#aa294d] rounded-full' />
          )}
        </button>
      </div>

      {/* Subtitle / Context Hint */}
      <p className='text-xs sm:text-sm text-[#574144] -mt-3 mb-6 leading-relaxed'>
        {activeTab === 'login'
          ? 'Selamat datang kembali! Masuk untuk memantau status imunisasi TT & jadwal pranikah Anda.'
          : 'Daftar akun calon pengantin untuk memulai pemantauan imunisasi TT dan persiapan pernikahan sehat.'}
      </p>

      {/* Form Content */}
      <div className='animate-fade-in'>
        {activeTab === 'login' ? (
          <LoginForm onSwitchTab={() => setActiveTab('register')} hideHeader />
        ) : (
          <RegisterForm onSwitchTab={() => setActiveTab('login')} hideHeader />
        )}
      </div>
    </div>
  );
}

export default AuthTabbedContainer;
