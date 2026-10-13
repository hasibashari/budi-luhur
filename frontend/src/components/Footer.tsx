import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { APPS } from '../config/apps';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">FEMORY</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Platform ekosistem pemantauan kepatuhan konsumsi Tablet Tambah Darah (TTD) untuk siswi dan remaja putri di lingkungan Budi Luhur.
            </p>
            <div className="text-xs text-slate-500">
              Didukung oleh sistem AI dan arsitektur database terisolasi untuk privasi maksimal.
            </div>
          </div>

          {/* Apps Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Aplikasi Mandiri
            </h4>
            <ul className="space-y-2.5 text-sm">
              {APPS.map((app) => (
                <li key={app.id}>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <span>{app.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#apps" className="hover:text-rose-400 transition-colors">
                  Gerbang Aplikasi
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-rose-400 transition-colors">
                  Manfaat TTD
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-rose-400 transition-colors">
                  Fitur Unggulan
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-rose-400 transition-colors">
                  Tanya Jawab (FAQ)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 FEMORY Ecosystem — Budi Luhur. Seluruh Hak Cipta Dilindungi.</p>
          <p className="text-center sm:text-right">
            Didedikasikan untuk Generasi Remaja Putri Indonesia Sehat & Bebas Anemia.
          </p>
        </div>
      </div>
    </footer>
  );
};
