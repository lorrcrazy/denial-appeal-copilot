import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function SectionHeading({ eyebrow, title, sub, center = false }: { eyebrow: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 font-serif text-[34px] font-medium leading-[1.1] tracking-tight text-ink-950 sm:text-[44px]">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-ink-700">{sub}</p>}
    </motion.div>
  )
}
