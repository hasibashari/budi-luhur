import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Star, Sparkles, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className='relative overflow-hidden bg-white pt-20 pb-20 md:pt-24 md:pb-24 lg:pt-28 lg:pb-28 xl:pt-36 xl:pb-36'>
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]'></div>
      <div className='absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-rose-500/20 opacity-40 blur-[100px]'></div>

      <div className='container relative mx-auto px-4 sm:px-6 max-w-7xl'>
        <div className='flex flex-col lg:flex-row items-center gap-10 lg:gap-12 xl:gap-16'>
          <div className='lg:w-1/2 flex flex-col items-start text-left'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs sm:text-sm text-[#e11d48] mb-4 sm:mb-6 shadow-xs'
            >
              <ShieldCheck size={16} className='text-[#e11d48] shrink-0' />
              <span className='font-semibold'>Program Pencegahan Anemia Remaja Putri & WUS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#1e293b] leading-[1.15] mb-4 sm:mb-6'
            >
              Small Habit, <br />
              <span className='text-[#e11d48]'>Big Impact 🌸</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-base sm:text-lg lg:text-lg xl:text-xl text-[#475569] mb-6 sm:mb-8 max-w-lg leading-relaxed'
            >
              Aplikasi pendamping cerdas untuk memantau konsumsi Tablet Tambah Darah (TTD), menjaga
              streak sehat bersama sahabat, dan konsultasi kesehatan langsung.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto'
            >
              <Link
                to='/splash'
                className='inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e11d48] to-[#fb7185] hover:from-[#be123c] hover:to-[#e11d48] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base'
              >
                <Sparkles size={18} />
                <span>Buka Aplikasi</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to='/onboarding'
                className='inline-flex items-center justify-center gap-2 bg-white border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-[#1e293b] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold transition-all shadow-xs cursor-pointer text-sm sm:text-base'
              >
                Lihat Panduan
              </Link>
            </motion.div>

            {/* Micro stats banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-hairline w-full'
            >
              <div className='flex items-center gap-2'>
                <div className='flex -space-x-2'>
                  <span className='inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary/20 overflow-hidden relative'>
                    <img
                      src='https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150'
                      alt='Doctor avatarUrl'
                      className='w-full h-full object-cover object-top'
                    />
                  </span>
                  <span className='inline-block h-8 w-8 rounded-full ring-2 ring-white bg-accent-teal/20 overflow-hidden relative'>
                    <img
                      src='https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150'
                      alt='Doctor avatarUrl'
                      className='w-full h-full object-cover object-top'
                    />
                  </span>
                  <span className='inline-block h-8 w-8 rounded-full ring-2 ring-white bg-accent-amber/20 overflow-hidden relative'>
                    <img
                      src='https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                      alt='Patient avatarUrl'
                      className='w-full h-full object-cover object-top'
                    />
                  </span>
                </div>
                <div className='text-xs'>
                  <div className='flex items-center gap-1 font-bold text-ink'>
                    <span>4.9/5.0</span>
                    <Star size={12} className='fill-accent-amber text-accent-amber' />
                  </div>
                  <span className='text-muted'>10k+ active patients</span>
                </div>
              </div>

              <div className='h-8 w-px bg-hairline'></div>

              <div className='flex items-center gap-2 text-xs text-body'>
                <Users size={16} className='text-primary' />
                <span>
                  <strong>50+</strong> Medical Specialists
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='lg:w-1/2 relative w-full mt-10 lg:mt-0'
          >
            {/* Ambient background glow */}
            <div className='absolute -inset-2 bg-gradient-to-tr from-primary/30 via-accent-teal/20 to-primary/10 rounded-3xl blur-2xl -z-10 opacity-75'></div>

            {/* Main Image Container */}
            <div className='aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl border border-hairline bg-surface-soft relative group'>
              <img
                src='https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=1200'
                alt='Doctor specialist with digital medical tablet'
                className='w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none' />
            </div>

            {/* Floating Top Right Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-hairline items-center gap-3 hidden sm:flex'
            >
              <span className='relative flex h-3 w-3'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-accent-teal'></span>
              </span>
              <div>
                <p className='text-xs font-semibold text-ink'>Specialist Available</p>
                <p className='text-[11px] text-muted'>Ready for telehealth</p>
              </div>
            </motion.div>

            {/* Floating Bottom Left Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className='absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-hairline flex items-center gap-4'
            >
              <div className='h-12 w-12 rounded-full bg-accent-teal/10 flex items-center justify-center'>
                <ShieldCheck className='text-accent-teal' size={24} />
              </div>
              <div>
                <p className='text-xs font-medium text-body'>Certified Facility</p>
                <p className='font-bold text-ink text-sm sm:text-base'>FDA Registered & cGMP</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
