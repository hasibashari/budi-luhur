import React from 'react';
import { Award, BookOpen, Heart, MapPin, Globe2 } from 'lucide-react';

export const InstitutionalProfileSection: React.FC = () => {
  return (
    <section id='profil' className='py-12 sm:py-16 lg:py-24 bg-white border-b border-slate-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center max-w-3xl mx-auto mb-8 sm:mb-12'>
          <div className='inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#005EB8] text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4'>
            <Award className='w-4 h-4 text-[#fdc800]' />
            <span>Pendidikan Kesehatan Terpercaya</span>
          </div>
          <h2 className='text-2xl sm:text-4xl lg:text-5xl font-black text-[#202020] tracking-tight'>
            Sekilas STIKes Budi Luhur Cimahi
          </h2>
          <div className='title-accent-blue' />
          <p className='mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-[#444444] leading-relaxed'>
            Berdiri sejak 1981 di bawah naungan Yayasan Pambudhi Luhur 1976. Berdedikasi mencetak
            tenaga kesehatan profesional, religius, dan berdaya saing global.
          </p>
        </div>

        {/* Vision & Core Values Banner (Deep Academic Blue #004B87) */}
        <div className='rounded-3xl bg-[#004B87] text-white p-5 sm:p-8 lg:p-10 mb-10 sm:mb-14 shadow-md relative overflow-hidden'>
          {/* Subtle Accent Glow */}
          <div className='absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-sky-400/20 to-transparent rounded-full blur-2xl pointer-events-none' />

          <div className='relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center'>
            <div className='lg:col-span-7 space-y-2.5 sm:space-y-3'>
              <span className='inline-block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#fdc800]'>
                Visi Institusi 2040
              </span>
              <h3 className='text-xl sm:text-2xl lg:text-3xl font-extrabold leading-snug'>
                "Menjadi Perguruan Tinggi yang Religius, Berbudi Luhur, dan Unggul di Tingkat
                Internasional Tahun 2040."
              </h3>
              <p className='text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-xl'>
                Menyelenggarakan pendidikan kesehatan berstandar internasional, berkarakter luhur,
                dan bereputasi global.
              </p>
            </div>

            {/* 3 Pillars: Horizontal 3-column mini row on both mobile and desktop */}
            <div className='lg:col-span-5 grid grid-cols-3 gap-2 sm:gap-3.5'>
              <div className='bg-white/10 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 text-center'>
                <Heart className='w-4 h-4 sm:w-6 sm:h-6 text-[#fdc800] mx-auto mb-1.5' />
                <h4 className='font-bold text-xs sm:text-sm'>Religius</h4>
                <p className='text-[10px] sm:text-[11px] text-sky-200 mt-0.5 leading-tight'>
                  Iman & taqwa profesi.
                </p>
              </div>
              <div className='bg-white/10 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 text-center'>
                <BookOpen className='w-4 h-4 sm:w-6 sm:h-6 text-sky-300 mx-auto mb-1.5' />
                <h4 className='font-bold text-xs sm:text-sm'>Budi Luhur</h4>
                <p className='text-[10px] sm:text-[11px] text-sky-200 mt-0.5 leading-tight'>
                  Moral & empati.
                </p>
              </div>
              <div className='bg-white/10 backdrop-blur-xs p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 text-center'>
                <Globe2 className='w-4 h-4 sm:w-6 sm:h-6 text-emerald-300 mx-auto mb-1.5' />
                <h4 className='font-bold text-xs sm:text-sm'>Unggul</h4>
                <p className='text-[10px] sm:text-[11px] text-sky-200 mt-0.5 leading-tight'>
                  Klinis global.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campus & Location Info Strip */}
        <div className='p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4'>
          <div className='flex items-center space-x-3 text-slate-700'>
            <div className='p-2 sm:p-2.5 rounded-xl bg-blue-100 text-[#004B87] shrink-0'>
              <MapPin className='w-4 h-4 sm:w-5 sm:h-5' />
            </div>
            <div>
              <h4 className='text-xs sm:text-sm font-bold text-[#202020]'>
                Kampus STIKes Budi Luhur Cimahi
              </h4>
              <p className='text-[11px] sm:text-xs text-[#777777] mt-0.5'>
                Jl. Kerkof No. 243, Leuwigajah, Cimahi Selatan, Kota Cimahi 40532, Jawa Barat -
                Indonesia
              </p>
            </div>
          </div>
          <a
            href='https://stikesbudiluhurcimahi.ac.id/index/profil'
            target='_blank'
            rel='noopener noreferrer'
            className='btn-budi-outline text-xs whitespace-nowrap shrink-0 min-h-[40px]'
          >
            Kunjungi Website Resmi &gt;&gt;
          </a>
        </div>
      </div>
    </section>
  );
};
