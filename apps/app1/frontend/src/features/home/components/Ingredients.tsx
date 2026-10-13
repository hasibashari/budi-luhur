'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FlaskConical } from 'lucide-react';

import { ingredientsData } from '../../../shared/constants/healthcare';

export default function Ingredients() {
  return (
    <section className='py-16 md:py-20 lg:py-24 bg-white'>
      <div className='container mx-auto px-4 sm:px-6 max-w-7xl'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12 items-start'>
          <div className='lg:w-1/3'>
            <div className='inline-flex items-center justify-center p-3 bg-accent-teal/10 rounded-2xl mb-4 sm:mb-6'>
              <FlaskConical className='text-accent-teal' size={28} />
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3 sm:mb-4'>
              Clinical-Grade Ingredients
            </h2>
            <p className='text-base sm:text-lg text-body'>
              Every compound is rigorously tested and optimally dosed according to the latest
              peer-reviewed clinical trials. We believe in complete transparency.
            </p>
          </div>

          <div className='lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full'>
            {ingredientsData.map((ing, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className='p-5 sm:p-6 rounded-2xl border border-hairline bg-surface-soft hover:bg-white hover:shadow-md transition-all'
              >
                <div className='flex justify-between items-baseline mb-2 sm:mb-3'>
                  <h3 className='font-semibold text-ink text-base sm:text-lg'>{ing.name}</h3>
                  <span className='text-xs sm:text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 sm:py-1 rounded-md'>
                    {ing.amount}
                  </span>
                </div>
                <p className='text-xs sm:text-sm text-body leading-relaxed'>{ing.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
