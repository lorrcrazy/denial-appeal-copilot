import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function SectionHeading({ eyebrow, title, sub, dark = false, center = false }: { eyebrow: string; title: ReactNode; sub?: ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}
    >
      <p className={`eyebrow ${dark ? 'text-brand-300' : 'text-brand-600'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.1] ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base sm:text-lg ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{sub}</p>}
    </motion.div>
  )
}
