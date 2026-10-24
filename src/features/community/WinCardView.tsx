import { motion } from 'framer-motion'
import { Clock, Heart, Sparkles } from 'lucide-react'
import type { WinCard } from './seed'

const OUTCOME_STYLE = {
  Overturned: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Partially overturned': 'bg-amber-50 text-amber-700 ring-amber-200',
  Upheld: 'bg-stone-100 text-stone-600 ring-stone-200',
}

const GRADIENTS = ['bg-brand-600', 'bg-clay-500', 'bg-amber-600', 'bg-ink-800', 'bg-brand-400']

export function WinCardView({ card }: { card: WinCard }) {
  const g = GRADIENTS[card.handle.length % GRADIENTS.length]
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-card ${card.mine ? 'border-brand-300 ring-4 ring-brand-100' : 'border-stone-200'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`chip ring-1 ${OUTCOME_STYLE[card.outcome]}`}>{card.outcome}</span>
        <span className="text-xs text-stone-400">{card.quarter}</span>
      </div>
      <p className="mt-3 font-semibold leading-snug">
        {card.service} · <span className="text-stone-500">{card.insurer}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="chip bg-rose-50 !py-0.5 text-rose-700">{card.reason}</span>
        <span className="chip bg-stone-100 !py-0.5 text-stone-600">{card.insuranceType}</span>
        <span className="chip bg-stone-100 !py-0.5 text-stone-600">{card.condition}</span>
      </div>
      <div className="mt-4 flex-1 rounded-2xl bg-stone-50 p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" /> {card.tactic}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{card.story}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
        <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold uppercase text-white ${g}`}>{card.handle[0]}</span>
        <span className="truncate font-medium text-stone-700">{card.handle}</span>
        {card.mine && <span className="chip bg-brand-50 !py-0 text-brand-700">you</span>}
        <span className="ml-auto flex items-center gap-1">
          <Clock className="h-3 w-3" /> {card.daysToDecision}d
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" /> {card.helped}
        </span>
      </div>
    </motion.article>
  )
}
