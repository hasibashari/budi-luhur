import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppSelectorSection } from './components/AppSelectorSection';
import { InstitutionalProfileSection } from './components/InstitutionalProfileSection';
import { Benefits } from './components/Benefits';
import { Features } from './components/Features';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { BottomNavBar } from './components/BottomNavBar';

export const App: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-white text-[#444444]'>
      <Navbar />
      <main className='flex-grow pb-24 lg:pb-0'>
        <Hero />
        <AppSelectorSection />
        <InstitutionalProfileSection />
        <Benefits />
        <Features />
        <FAQ />
      </main>
      <Footer />
      <PWAInstallPrompt />
      <BottomNavBar />
    </div>
  );
};

export default App;
