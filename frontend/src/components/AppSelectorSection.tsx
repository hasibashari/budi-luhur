import React from 'react';
import { CheckCircle2, Globe, ArrowUpRight, Activity, LogIn, UserPlus, Smartphone } from 'lucide-react';
import { APPS } from '../config/apps';

export const AppSelectorSection: React.FC = () => {
  return (
    <section id="apps" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Gerbang PWA Aplikasi FEMORY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Pilih Portal Aplikasi Tujuan Anda
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Setiap aplikasi beroperasi sebagai Progressive Web App (PWA) mandiri dengan isolasi penuh. Pilih Masuk atau Daftar untuk langsung diarahkan ke autentikasi aplikasi.
          </p>
        </div>

        {/* 3 App Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {APPS.map((app) => {
            return (
              <div
                key={app.id}
                className={`relative rounded-3xl p-8 bg-gradient-to-b ${app.colorScheme.bgLight} border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5`}
              >
                {/* Top Card Bar: Status & Port */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${app.colorScheme.badgeBg} ${app.colorScheme.badgeText}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{app.badge}</span>
                    </span>

                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200 text-slate-600 shadow-2xs">
                      Port {app.port}
                    </span>
                  </div>

                  {/* App Title & Tagline */}
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 mb-3">
                    {app.tagline}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {app.description}
                  </p>

                  {/* Spec Mini Badges */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-white/80 border border-slate-200/60 mb-6">
                    {app.stats.map((s, idx) => (
                      <div key={idx} className="text-center">
                        <span className="block text-[10px] text-slate-400 font-medium">{s.label}</span>
                        <span className="block text-xs font-bold text-slate-800 font-mono mt-0.5">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 mb-8">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Spesifikasi Lingkungan:
                    </p>
                    {app.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons (Direct Auth Flow) */}
                <div className="pt-5 border-t border-slate-200/60 space-y-2.5">
                  <a
                    href={app.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl ${app.colorScheme.btnBg} ${app.colorScheme.btnHover} text-white font-bold text-sm shadow-md transition-all group-hover:shadow-lg active:scale-[0.98]`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke {app.name}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>

                  <a
                    href={app.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-300/80 text-slate-700 hover:text-slate-900 font-semibold text-xs shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Daftar Akun Baru</span>
                  </a>

                  <p className="text-[11px] text-center text-slate-400 pt-1">
                    PWA Standalone • Langsung ke login ({app.url})
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Multi-App Note */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-slate-700">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Multi-Session Browser Isolation</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Anda dapat membuka ketiga aplikasi secara bersamaan di browser yang sama tanpa saling menimpa data sesi maupun token login.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center space-x-2 font-mono text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Ready on ports 5173, 5174, 5175</span>
          </div>
        </div>
      </div>
    </section>
  );
};
