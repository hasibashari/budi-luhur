import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export default function CTA() {
  return (
    <section className='py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden'>
      <div className='container mx-auto px-4 sm:px-6 max-w-5xl relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='bg-gradient-to-tr from-[#e11d48] via-[#f43f5e] to-[#fb7185] rounded-3xl md:rounded-[2.5rem] p-7 sm:p-10 md:p-14 lg:p-16 text-center text-white shadow-2xl shadow-rose-500/30 relative overflow-hidden'
        >
          {/* Background decorations */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20'></div>
          <div className='absolute bottom-0 left-0 w-80 h-80 bg-rose-300 opacity-20 rounded-full blur-3xl -ml-20 -mb-20'></div>

          <div className='relative z-10'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight'>
              Siap Hidup Sehat & Bebas Anemia? 🌸
            </h2>
            <p className='text-base sm:text-lg md:text-xl text-rose-100 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed'>
              Mulai kebiasaan baik minum Tablet Tambah Darah (TTD) secara rutin, pantau kepatuhanmu,
              dan konsultasi kesehatan secara mudah.
            </p>

            <div className='flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4'>
              <Link
                to='/splash'
                className='inline-flex items-center justify-center gap-2 bg-white text-[#e11d48] hover:bg-rose-50 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-bold transition-transform hover:-translate-y-1 shadow-lg text-sm sm:text-base cursor-pointer'
              >
                <Sparkles size={18} />
                <span>Buka Aplikasi Sekarang</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to='/onboarding'
                className='inline-flex items-center justify-center gap-2 bg-rose-700/60 border border-rose-300/40 text-white hover:bg-rose-700/80 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold transition-colors text-sm sm:text-base cursor-pointer'
              >
                <BookOpen size={18} />
                <span>Pelajari Panduan</span>
              </Link>
            </div>
            <p className='mt-6 text-xs sm:text-sm text-rose-100/90 font-medium tracking-wide'>
              100% Gratis • Pengingat Mingguan Otomatis • Didukung Puskesmas & Kemenkes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
