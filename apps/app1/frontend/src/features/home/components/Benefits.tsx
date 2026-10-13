'use client'

import React from 'react'
import { motion } from 'motion/react'


import { benefitsData } from '../../../shared/constants/healthcare'

export default function Benefits() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3 md:mb-4">Comprehensive Health Benefits</h2>
          <p className="text-base sm:text-lg text-body">
            Our specialized formula addresses multiple aspects of your well-being, providing a holistic approach to long-term health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-6 xl:gap-8">
          {benefitsData.map((benefit, index) => {
            const IconComponent = benefit.Icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-surface-soft rounded-2xl p-6 sm:p-7 border border-hairline hover:shadow-lg transition-shadow flex flex-col justify-start"
              >
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 sm:mb-5 shrink-0">
                  <IconComponent size={22} className={benefit.iconColor} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-ink mb-2 sm:mb-3">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-body leading-relaxed">{benefit.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
