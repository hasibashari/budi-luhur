'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Microscope, Award, Clock } from 'lucide-react'

export default function Features() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface-dark text-white relative overflow-hidden">
      {/* Abstract background element */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Excellence in Healthcare</h2>
          <p className="text-surface-soft/80 text-base sm:text-lg">
            Our commitment to quality ensures that you receive the highest standard of care and product efficacy available in modern medicine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: <Microscope size={28} className="text-primary" />,
              title: 'Advanced Research',
              desc: 'Our proprietary formulas are developed in state-of-the-art facilities by leading research scientists.'
            },
            {
              icon: <Award size={28} className="text-accent-teal" />,
              title: 'Certified Quality',
              desc: 'Rigorous third-party auditing and strict compliance with global pharmaceutical manufacturing protocols.'
            },
            {
              icon: <Clock size={28} className="text-primary" />,
              title: '24/7 Medical Support',
              desc: 'Access our dedicated team of healthcare professionals around the clock for any questions or guidance.'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-surface-dark-elevated p-6 sm:p-7 lg:p-8 rounded-2xl border border-white/5 flex flex-col justify-start"
            >
              <div className="mb-4 sm:mb-6 bg-white/5 inline-flex p-3 sm:p-4 rounded-xl w-fit">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-surface-soft/70 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
