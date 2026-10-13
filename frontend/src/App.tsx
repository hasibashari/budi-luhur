import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppSelectorSection } from './components/AppSelectorSection';
import { Benefits } from './components/Benefits';
import { Features } from './components/Features';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <AppSelectorSection />
        <Benefits />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default App;
