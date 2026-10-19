import React from 'react';
import { ArrowRight, Award } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className='relative overflow-hidden hero-academic-bg pt-32 pb-14 sm:pt-40 sm:pb-16 lg:pt-44 lg:pb-20 border-b border-slate-200'>
      {/* Decorative Subtle Blur Spheres */}
      <div className='absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-indigo-500/10 blur-3xl -z-10 rounded-full pointer-events-none' />

      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
        {/* Top Institutional Badge with Proper Spacing */}
        <div className='inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#004B87] text-xs sm:text-sm font-semibold mb-5 sm:mb-7 shadow-2xs'>
          <Award className='w-4 h-4 text-[#fdc800] shrink-0' />
          <span>STIKes Budi Luhur Cimahi</span>
          <span className='hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#00A3E0]' />
          <span className='hidden sm:inline text-[#005EB8] font-bold'>Kampus Kesehatan Unggul</span>
        </div>

        {/* Main Display Heading with Generous Line-Height */}
        <h1 className='text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.22] sm:leading-[1.18]'>
          Mencetak Tenaga Kesehatan <span className='text-[#005EB8]'>Unggul & Berbudi Luhur</span>{' '}
          di Tingkat Internasional
        </h1>

        {/* Subtitle with Ample Breathing Room */}
        <p className='mt-5 sm:mt-7 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed'>
          Perguruan tinggi kesehatan di Cimahi dengan kurikulum berstandar internasional,
          laboratorium modern, serta kemitraan karir global di Jepang, Jerman, dan RS terkemuka.
        </p>

        {/* Action Buttons with Comfortable Touch Targets */}
        <div className='mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none mx-auto'>
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
            className='w-full sm:w-auto btn-budi-outline text-sm sm:text-base py-3 sm:py-3.5 px-6 sm:px-8'
          >
            <span>Jelajahi Program Studi</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
