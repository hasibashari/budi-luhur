import React from 'react';
import { ArrowRight, Award, GraduationCap, Globe2, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className='relative overflow-hidden hero-academic-bg pt-28 pb-14 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-28 border-b border-slate-200'>
      {/* Decorative Blur Spheres in Budi Luhur Cyan/Blue */}
      <div className='absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-indigo-500/10 blur-3xl -z-10 rounded-full pointer-events-none' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
        {/* Top Institutional Badge */}
        <div className='inline-flex items-center space-x-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#004B87] text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-2xs'>
          <Award className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fdc800] shrink-0' />
          <span>STIKes Budi Luhur Cimahi</span>
          <span className='hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#00A3E0]' />
          <span className='hidden sm:inline text-[#005EB8] font-bold'>Kampus Kesehatan Unggul</span>
        </div>

        {/* Main Display Heading */}
        <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#202020] max-w-4xl mx-auto leading-tight sm:leading-tight lg:leading-[1.15]'>
          Mencetak Tenaga Kesehatan{' '}
          <span className='text-[#005EB8] relative inline-block'>
            Unggul & Berbudi Luhur
            <span className='absolute left-0 right-0 -bottom-1 h-1.5 bg-[#fdc800] rounded-full opacity-80' />
          </span>{' '}
          di Tingkat Internasional
        </h1>

        {/* Subtitle */}
        <p className='mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-[#444444] max-w-2xl sm:max-w-3xl mx-auto leading-relaxed'>
          Perguruan tinggi kesehatan di Cimahi berstandar internasional dengan laboratorium modern
          untuk mencetak perawat dan bidan profesional berdaya saing global.
        </p>

        {/* Action Buttons (Fokus 2 Aksi Utama) */}
        <div className='mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto'>
          <a
            href='https://pmb.stikesbudiluhurcimahi.ac.id/'
            target='_blank'
            rel='noopener noreferrer'
            className='w-full sm:w-auto btn-budi-primary text-sm sm:text-base py-3 sm:py-3.5 px-7 sm:px-9 shadow-md hover:shadow-lg'
          >
            <span>Pendaftaran PMB Online</span>
            <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-2' />
          </a>
          <a
            href='#prodi'
            className='w-full sm:w-auto btn-budi-outline text-sm sm:text-base py-2.5 sm:py-3 px-6 sm:px-8'
          >
            <span>Jelajahi Program Studi</span>
          </a>
        </div>

        {/* Mobile-Only Compact Trust Strip */}
        <div className='mt-8 pt-6 border-t border-slate-200/80 sm:hidden'>
          <div className='flex flex-wrap items-center justify-center gap-2 text-xs font-semibold'>
            <span className='inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 text-[#005EB8] border border-blue-100'>
              <CheckCircle2 className='w-3.5 h-3.5 shrink-0' />
              <span>Akreditasi LAM-PTKes</span>
            </span>
            <span className='inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-sky-50/80 text-[#00A3E0] border border-sky-100'>
              <GraduationCap className='w-3.5 h-3.5 shrink-0' />
              <span>4 Program Studi</span>
            </span>
            <span className='inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50/80 text-amber-700 border border-amber-100'>
              <Globe2 className='w-3.5 h-3.5 text-amber-600 shrink-0' />
              <span>Karir Global</span>
            </span>
          </div>
        </div>

        {/* Tablet & Desktop 3 Institutional Metric Cards */}
        <div className='hidden sm:grid sm:grid-cols-3 gap-5 lg:gap-6 mt-12 lg:mt-16 pt-8 lg:pt-10 border-t border-slate-200/80 max-w-4xl mx-auto text-left'>
          <div className='flex items-start space-x-3.5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all'>
            <div className='p-2.5 rounded-xl bg-blue-50 text-[#005EB8] shrink-0'>
              <Award className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-sm font-bold text-[#202020]'>Akreditasi LAM-PTKes</h2>
              <p className='text-xs text-[#777777] mt-0.5'>
                Penjaminan mutu pendidikan kesehatan dengan tata kelola modern.
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-3.5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all'>
            <div className='p-2.5 rounded-xl bg-sky-50 text-[#00A3E0] shrink-0'>
              <GraduationCap className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-sm font-bold text-[#202020]'>4 Program Studi Resmi</h2>
              <p className='text-xs text-[#777777] mt-0.5'>
                D3 & S1 Keperawatan (Profesi Ners), D3 & Sarjana Kebidanan (Profesi Bidan).
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-3.5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all'>
            <div className='p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0'>
              <Globe2 className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-sm font-bold text-[#202020]'>Kemitraan Karir Global</h2>
              <p className='text-xs text-[#777777] mt-0.5'>
                Peluang magang dan penempatan kerja di Jepang, Jerman, dan RS terkemuka.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
