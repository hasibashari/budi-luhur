import React, { useState, useEffect } from 'react';
import { Home, GraduationCap, Grid, Award, HelpCircle } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const faqEl = document.getElementById('faq');
      const keunggulanEl = document.getElementById('keunggulan');
      const profilEl = document.getElementById('profil');
      const appsEl = document.getElementById('apps');

      if (faqEl && scrollPosition >= faqEl.offsetTop) {
        setActiveTab('faq');
      } else if (keunggulanEl && scrollPosition >= keunggulanEl.offsetTop) {
        setActiveTab('keunggulan');
      } else if (profilEl && scrollPosition >= profilEl.offsetTop) {
        setActiveTab('akademik');
      } else if (appsEl && scrollPosition >= appsEl.offsetTop) {
        setActiveTab('apps');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className='lg:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/98 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,32,96,0.1)] select-none'
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-label='Navigasi Utama Mobile'
    >
      <div className='max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative'>
        {/* Tab 1: Beranda */}
        <button
          onClick={() => scrollToSection('hero', 'home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-h-[48px] min-w-[54px] active:scale-95 ${
            activeTab === 'home'
              ? 'text-[#005EB8] font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label='Menuju Beranda'
        >
          <Home
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'home' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
            }`}
          />
          <span className='text-[10px] mt-1 tracking-tight'>Beranda</span>
        </button>

        {/* Tab 2: Akademik */}
        <button
          onClick={() => scrollToSection('profil', 'akademik')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-h-[48px] min-w-[54px] active:scale-95 ${
            activeTab === 'akademik'
              ? 'text-[#005EB8] font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label='Menuju Profil & Program Studi'
        >
          <GraduationCap
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'akademik' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
            }`}
          />
          <span className='text-[10px] mt-1 tracking-tight'>Akademik</span>
        </button>

        {/* Tab 3: Central Elevated FAB (Direct to Apps Section) */}
        <div className='relative -top-4 flex flex-col items-center'>
          <button
            onClick={() => scrollToSection('apps', 'apps')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 transform active:scale-95 focus:outline-hidden border-2 border-white ${
              activeTab === 'apps'
                ? 'bg-gradient-to-tr from-[#005EB8] to-[#00A3E0] shadow-blue-500/50 ring-4 ring-blue-100 scale-105'
                : 'bg-gradient-to-tr from-[#004B87] to-[#0072CE] shadow-blue-500/30 hover:shadow-blue-500/50'
            }`}
            aria-label='Menuju Portal Aplikasi'
          >
            <Grid className='w-6 h-6 stroke-[2.2]' />
          </button>
          <span
            className={`text-[10px] font-bold mt-1 tracking-tight ${
              activeTab === 'apps' ? 'text-[#005EB8]' : 'text-[#004B87]'
            }`}
          >
            Aplikasi
          </span>
        </div>

        {/* Tab 4: Keunggulan */}
        <button
          onClick={() => scrollToSection('keunggulan', 'keunggulan')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-h-[48px] min-w-[54px] active:scale-95 ${
            activeTab === 'keunggulan'
              ? 'text-[#005EB8] font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label='Menuju Keunggulan Kampus'
        >
          <Award
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'keunggulan' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
            }`}
          />
          <span className='text-[10px] mt-1 tracking-tight'>Keunggulan</span>
        </button>

        {/* Tab 5: Bantuan / FAQ */}
        <button
          onClick={() => scrollToSection('faq', 'faq')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-h-[48px] min-w-[54px] active:scale-95 ${
            activeTab === 'faq' ? 'text-[#005EB8] font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label='Menuju Tanya Jawab FAQ'
        >
          <HelpCircle
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'faq' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'
            }`}
          />
          <span className='text-[10px] mt-1 tracking-tight'>Bantuan</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
