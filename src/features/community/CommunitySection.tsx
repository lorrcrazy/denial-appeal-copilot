import { AnimatePresence, motion } from 'framer-motion'
import { Filter, Lock, Plus, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { SectionHeading } from '../../components/SectionHeading'
import { CONDITION_CATEGORIES, DENIAL_REASONS, INSURANCE_TYPES } from '../../lib/types'
import { ReasonChart, WinRateChart } from './Charts'
import { LiveTicker } from './LiveTicker'
import { INSURERS, NETWORKS, type WinCard } from './seed'
import { groupStats, MIN_GROUP } from './stats'
import { WinCardView } from './WinCardView'

type Filters = { insuranceType: string; insurer: string; network: string; condition: string; reason: string }
const EMPTY: Filters = { insuranceType: '', insurer: '', network: '', condition: '', reason: '' }
const FILTERS: { key: keyof Filters; label: string; options: readonly string[] }[] = [
  { key: 'insuranceType', label: 'Insurance type', options: INSURANCE_TYPES },
  { key: 'insurer', label: 'Insurer', options: INSURERS },
  { key: 'network', label: 'Hospital network', options: NETWORKS },
  { key: 'condition', label: 'Condition', options: CONDITION_CATEGORIES },
  { key: 'reason', label: 'Denial reason', options: DENIAL_REASONS },
]


export function CommunitySection({ cards, onShare }: { cards: WinCard[]; onShare: () => void }) {
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [limit, setLimit] = useState(9)
  const filtered = useMemo(() => cards.filter((c) => (Object.keys(filters) as (keyof Filters)[]).every((k) => !filters[k] || c[k] === filters[k])), [cards, filters])
  const stats = groupStats(filtered)
  const active = Object.values(filters).some(Boolean)
  const median = useMemo(() => {
    const d = filtered.map((c) => c.daysToDecision).sort((a, b) => a - b)
    return d.length ? d[Math.floor(d.length / 2)] : 0
  }, [filtered])
  const hidden = stats.winRate == null

  return (
    <section id="wins" className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-brand-100/60 blur-[100px]" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Appeal Wins" title={<>What worked for <span className="font-serif font-normal italic text-gradient-dark">people like you</span></>} sub="Anonymized outcomes shared by patients. Filter to your plan and denial. Every win makes the copilot smarter." />
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <LiveTicker cards={cards} />
            <button onClick={onShare} className="btn-dark">
              <Plus className="h-4 w-4" /> Share a win
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Cards in view', value: filtered.length, suffix: '' },
            { label: 'Won or partly won', value: stats.winRate ?? 0, suffix: '%', hide: hidden },
            { label: 'Median days to decision', value: median, suffix: '', hide: hidden },
            { label: 'Top winning move', text: stats.topTactic?.tactic, hide: hidden },
          ].map((s) => (
            <div key={s.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5">
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              {s.hide ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
                  <Lock className="h-3.5 w-3.5" /> Hidden under {MIN_GROUP}
                </p>
              ) : s.text ? (
                <p className="mt-2 text-sm font-semibold leading-snug">{s.text}</p>
              ) : (
                <p className="mt-1 text-3xl font-extrabold tracking-tight">
                  <AnimatedNumber value={s.value ?? 0} suffix={s.suffix} />
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Win rate by quarter</p>
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" />Cited policy or evidence</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" />All</span>
              </div>
            </div>
            <WinRateChart cards={filtered} />
          </div>
          <div className="rounded-3xl border border-slate-200 p-5">
            <p className="font-semibold">Win rate by denial reason</p>
            <ReasonChart cards={filtered} />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Synthetic demo data. Points with fewer than {MIN_GROUP} cards are hidden.</p>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <Filter className="h-4 w-4" /> Filter
          </span>
          {FILTERS.map((f) => (
            <select key={f.key} value={filters[f.key]} onChange={(e) => setFilters((s) => ({ ...s, [f.key]: e.target.value }))} className={`rounded-full border px-3 py-1.5 text-sm outline-none transition ${filters[f.key] ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              <option value="">{f.label}</option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ))}
          {active && (
            <button onClick={() => setFilters(EMPTY)} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.slice(0, limit).map((c) => (
              <WinCardView key={c.id} card={c} />
            ))}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No cards match these filters yet.</p>}
        {filtered.length > limit && (
          <div className="mt-8 text-center">
            <button onClick={() => setLimit((l) => l + 9)} className="btn-ghost">
              Show more ({filtered.length - limit})
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
