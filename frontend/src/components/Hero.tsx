import React from 'react';
import { ArrowRight, ShieldCheck, Database, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden hero-gradient pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-rose-100/60">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-300/30 via-pink-300/20 to-fuchsia-300/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Portal Pusat Budi Luhur — 3 Aplikasi Aktif</span>
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight lg:leading-[1.15]">
          Ekosistem Terintegrasi Pemantauan{' '}
          <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
            Tablet Tambah Darah
          </span>{' '}
          Remaja Putri
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Wujudkan generasi cerdas, aktif, dan bebas anemia. Pilih dan akses portal aplikasi mandiri Anda dengan autentikasi independen dan database terisolasi penuh.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#apps"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-base shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>Pilih & Buka Aplikasi</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#benefits"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-white border border-rose-200 text-rose-700 font-bold text-base hover:bg-rose-50/60 shadow-xs hover:border-rose-300 transition-all"
          >
            <span>Pelajari Manfaat TTD</span>
          </a>
        </div>

        {/* Trust & Spec Highlights */}
        <div className="mt-16 pt-10 border-t border-rose-200/50 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-start space-x-3 bg-white/70 backdrop-blur-xs p-4 rounded-2xl border border-rose-100 shadow-xs">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Isolasi Database Penuh</h2>
              <p className="text-xs text-slate-500 mt-0.5">3 database PostgreSQL terpisah tanpa interferensi data.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white/70 backdrop-blur-xs p-4 rounded-2xl border border-rose-100 shadow-xs">
            <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Sesi Independen</h2>
              <p className="text-xs text-slate-500 mt-0.5">Autentikasi terpisah per aplikasi dengan storage key unik.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white/70 backdrop-blur-xs p-4 rounded-2xl border border-rose-100 shadow-xs">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">PWA & Fitur Lengkap</h2>
              <p className="text-xs text-slate-500 mt-0.5">Konsultasi AI, Sahabat Sehat, Kalender, & Admin UKS.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
