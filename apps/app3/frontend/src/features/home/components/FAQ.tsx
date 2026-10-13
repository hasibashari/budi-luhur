'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'

import { faqData } from '../../../shared/constants/healthcare'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface-soft">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3 md:mb-4">Frequently Asked Questions</h2>
          <p className="text-base sm:text-lg text-body">Clear answers for your peace of mind.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, i) => (
            <div key={i} className="bg-white border border-hairline rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-medium text-ink hover:bg-surface-soft transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'shrink-0 text-muted-soft transition-transform duration-300',
                    openIndex === i && 'rotate-180'
                  )}
                  size={20}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-1 text-body leading-relaxed border-t border-hairline/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
