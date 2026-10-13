import React from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2 } from 'lucide-react';

import { testimonialsData } from '../../../shared/constants/healthcare';

export default function Testimonials() {
  return (
    <section className='py-16 md:py-20 lg:py-24 bg-white'>
      <div className='container mx-auto px-4 sm:px-6 max-w-7xl'>
        <div className='text-center mb-10 md:mb-14'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-xs font-semibold text-primary mb-3 sm:mb-4'>
            <span>Verified Patient & Clinical Reviews</span>
          </div>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3 sm:mb-4'>
            Trusted by Professionals & Patients
          </h2>
          <p className='text-base sm:text-lg text-body max-w-2xl mx-auto'>
            Read what the medical community and our long-term users have to say about our healthcare
            solutions.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
          {testimonialsData.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className='p-6 sm:p-7 lg:p-8 rounded-2xl bg-surface-soft border border-hairline relative flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all'
            >
              <div>
                <div className='flex gap-1 mb-4 sm:mb-6'>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={16} className='fill-accent-amber text-accent-amber' />
                  ))}
                </div>
                <p className='text-sm sm:text-base text-body italic mb-6 sm:mb-8 leading-relaxed'>
                  &quot;{review.quote}&quot;
                </p>
              </div>

              <div className='flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-hairline'>
                <div className='relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0'>
                  <img
                    src={review.avatarUrl}
                    alt={review.author}
                    className='w-full h-full object-cover object-top'
                  />
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <p className='font-bold text-ink text-sm sm:text-base truncate'>
                      {review.author}
                    </p>
                    <CheckCircle2 size={14} className='text-accent-teal shrink-0' />
                  </div>
                  <p className='text-xs text-muted truncate'>{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
