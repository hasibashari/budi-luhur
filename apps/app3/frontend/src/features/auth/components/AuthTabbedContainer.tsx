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
    <div className='w-full max-w-[380px] sm:max-w-[400px] mx-auto'>
      {/* Compact Segmented Tab Switcher */}
      <div
        role='tablist'
        aria-label='Pilihan Autentikasi'
        className='p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-2 gap-1 mb-3.5'
      >
        <button
          role='tab'
          id='tab-login'
          aria-selected={activeTab === 'login'}
          aria-controls='panel-login'
          type='button'
          onClick={() => setActiveTab('login')}
          className={`min-h-[36px] sm:min-h-[38px] py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
            activeTab === 'login'
              ? 'bg-white text-[#8c0f39] shadow-2xs font-extrabold'
              : 'text-[#64748b] hover:text-[#121c2a] hover:bg-white/50'
          }`}
        >
          Masuk
        </button>

        <button
          role='tab'
          id='tab-register'
          aria-selected={activeTab === 'register'}
          aria-controls='panel-register'
          type='button'
          onClick={() => setActiveTab('register')}
          className={`min-h-[36px] sm:min-h-[38px] py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
            activeTab === 'register'
              ? 'bg-white text-[#8c0f39] shadow-2xs font-extrabold'
              : 'text-[#64748b] hover:text-[#121c2a] hover:bg-white/50'
          }`}
        >
          Daftar
        </button>
      </div>

      {/* Subtitle / Contextual Guidance */}
      <div className='mb-3 text-left'>
        <p className='text-xs text-[#574144] leading-relaxed'>
          {activeTab === 'login'
            ? 'Masuk untuk mengakses layanan dan akun Anda.'
            : 'Daftar untuk mulai menggunakan layanan kami.'}
        </p>
      </div>

      {/* Tab Panels */}
      <div
        id={activeTab === 'login' ? 'panel-login' : 'panel-register'}
        role='tabpanel'
        aria-labelledby={activeTab === 'login' ? 'tab-login' : 'tab-register'}
        className='animate-fade-in'
      >
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
