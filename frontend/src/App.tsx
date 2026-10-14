import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppSelectorSection } from './components/AppSelectorSection';
import { InstitutionalProfileSection } from './components/InstitutionalProfileSection';
import { Benefits } from './components/Benefits';
import { Features } from './components/Features';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-white text-[#444444]'>
      <Navbar />
      <main className='flex-grow'>
        <Hero />
        <InstitutionalProfileSection />
        <Benefits />
        <Features />
        <AppSelectorSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default App;
