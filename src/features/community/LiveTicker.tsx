import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { WinCard } from './seed'
import { isWin } from './stats'

export function LiveTicker({ cards }: { cards: WinCard[] }) {
  const wins = cards.filter(isWin)
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => x + 1), 3200)
    return () => clearInterval(t)
  }, [])
  if (!wins.length) return null
  const c = wins[i % wins.length]
  return (
    <div className="flex h-10 max-w-full items-center gap-3 overflow-hidden rounded-full border border-stone-200 bg-white pl-3 pr-4 text-sm shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Live</span>
      <AnimatePresence mode="wait">
        <motion.span key={c.id + i} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.3 }} className="truncate text-stone-600">
          <span className="font-semibold text-stone-900">{c.handle}</span> won a {c.reason.toLowerCase()} appeal · {c.insuranceType}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
