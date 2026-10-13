import React from 'react';
import {
  Hero,
  Benefits,
  ProductInfo,
  Ingredients,
  Features,
  Testimonials,
  FAQ,
  CTA,
} from '../index';
import Footer from '@/src/shared/components/Footer';
import Navbar from '@/src/shared/components/Navbar';
import PWARedirector from '@/src/shared/components/PWARedirector';
import { PWAInstallBanner } from '@/src/features/user/components/PWAInstallBanner';

export default function HomeView() {
  return (
    <main className='min-h-screen bg-white selection:bg-rose-500/20 selection:text-[#e11d48] relative'>
      <PWARedirector />
      <Navbar />
      <Hero />
      <Benefits />
      <ProductInfo />
      <Ingredients />
      <Features />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />

      {/* Floating PWA install prompt for mobile visitors */}
      <PWAInstallBanner variant='floating' />
    </main>
  );
}
