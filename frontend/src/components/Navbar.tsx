import React, { useState } from 'react';
import { Heart, Menu, X, ExternalLink, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  FEMORY
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Budi Luhur
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Portal Ekosistem Monitoring Tablet Tambah Darah
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#apps"
              className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              Pilih Aplikasi
            </a>
            <a
              href="#benefits"
              className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              Manfaat
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              Fitur Unggulan
            </a>
            <a
              href="#faq"
              className="text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Call to Action Button */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="#apps"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-sm font-bold shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Masuk Portal</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <a
            href="#apps"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50"
          >
            Pilih Aplikasi
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50"
          >
            Manfaat TTD
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50"
          >
            Fitur Unggulan
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50"
          >
            FAQ
          </a>
          <div className="pt-2">
            <a
              href="#apps"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-center shadow-md shadow-rose-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Menu Aplikasi</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
