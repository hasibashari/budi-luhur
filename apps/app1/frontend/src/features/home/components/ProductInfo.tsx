import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Award } from 'lucide-react';

export default function ProductInfo() {
  return (
    <section className='py-16 md:py-20 lg:py-24 bg-surface-soft relative overflow-hidden'>
      <div className='container mx-auto px-4 sm:px-6 max-w-7xl'>
        <div className='flex flex-col lg:flex-row items-center gap-10 lg:gap-12 xl:gap-16'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className='lg:w-1/2 w-full relative'
          >
            {/* Ambient subtle glow */}
            <div className='absolute -inset-2 bg-gradient-to-tr from-accent-teal/20 to-primary/20 rounded-3xl blur-xl -z-10 opacity-70'></div>

            <div className='aspect-[4/3] md:aspect-[4/3] lg:aspect-[4/3] xl:aspect-square rounded-3xl overflow-hidden shadow-xl border border-hairline bg-white relative group'>
              <img
                src='https://images.pexels.com/photos/5998474/pexels-photo-5998474.jpeg?auto=compress&cs=tinysrgb&w=1200'
                alt='Laboratory precision medicine research'
                className='w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent pointer-events-none' />
            </div>

            {/* Floating Top Left Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='absolute -top-3 -left-2 sm:-top-4 sm:-left-4 md:sm:-left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-hairline flex items-center gap-2.5 sm:gap-3'
            >
              <div className='h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
                <Sparkles size={18} />
              </div>
              <div>
                <p className='text-[11px] sm:text-xs font-semibold text-body'>Purity Standard</p>
                <p className='text-xs sm:text-sm font-bold text-ink'>99.8% Pharmaceutical Grade</p>
              </div>
            </motion.div>

            {/* Floating Bottom Right Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 md:sm:-right-6 bg-white/95 backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-hairline flex items-center gap-2.5 sm:gap-3'
            >
              <div className='h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-accent-teal/10 flex items-center justify-center text-accent-teal shrink-0'>
                <Award size={18} />
              </div>
              <div>
                <p className='text-[11px] sm:text-xs text-muted'>Absorption Rate</p>
                <p className='text-xs sm:text-sm font-bold text-ink'>4.8x Higher Bioavailability</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className='lg:w-1/2 w-full'
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-hairline text-xs font-semibold text-primary mb-3 sm:mb-4 shadow-sm'>
              <span>Next-Gen Formulation</span>
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-4 sm:mb-6'>
              Precision Medicine for Your Unique Needs
            </h2>
            <p className='text-base sm:text-lg text-body mb-6 sm:mb-8 leading-relaxed'>
              Developed by leading researchers and medical professionals, our core product utilizes
              advanced delivery mechanisms to ensure maximum bioavailability and efficacy. We
              maintain the highest standards of pharmaceutical manufacturing.
            </p>

            <ul className='space-y-3 sm:space-y-4 mb-8 sm:mb-10'>
              {[
                'FDA Registered Facility Manufacturing',
                'Third-party tested for purity and potency',
                'Sustained-release technology for all-day support',
                'Hypoallergenic and free from common allergens',
              ].map((item, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <CheckCircle2 className='text-accent-teal shrink-0 mt-1' size={18} />
                  <span className='text-sm sm:text-base text-body font-medium'>{item}</span>
                </li>
              ))}
            </ul>

            <button className='bg-primary hover:bg-primary-active text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.3)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.2)] cursor-pointer text-sm sm:text-base'>
              Read the Research
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
