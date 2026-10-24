import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, FileSearch, Quote, Target, Users } from 'lucide-react'
import type { Insight } from '../community/stats'
import type { Decoded, Odds } from './decode'
import { OddsGauge } from './OddsGauge'

const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } })

export function DecoderPanel({ decoded, odds, insight, onNext }: { decoded: Decoded; odds: Odds; insight: Insight | null; onNext: () => void }) {
  const p = decoded.profile
  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <motion.div {...fade(0)} className="rounded-2xl border border-stone-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-rose-50 text-rose-700">{decoded.reason}</span>
          <span className="chip bg-stone-100 text-stone-600">{decoded.insurer}</span>
          {decoded.billed && <span className="chip bg-amber-50 text-amber-700">{decoded.billed} at stake</span>}
        </div>
        <h3 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{p.plain}</h3>
        <p className="mt-2 text-sm text-stone-500">
          Service: <span className="font-medium text-stone-700">{decoded.service}</span>
        </p>

        <blockquote className="mt-5 flex gap-3 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
          <Quote className="h-4 w-4 shrink-0 text-stone-400" />
          <span>{decoded.reasonSentence}</span>
        </blockquote>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <FileSearch className="h-3.5 w-3.5" /> What they need
            </p>
            <p className="mt-1.5 text-sm text-stone-700">{p.needs}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <Target className="h-3.5 w-3.5" /> Your strongest move
            </p>
            <p className="mt-1.5 text-sm text-stone-700">{p.argument}</p>
          </div>
        </div>

        {decoded.evidence.length > 0 && (
          <div className="mt-5 border-t border-stone-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Found in your records</p>
            <ul className="mt-2 space-y-2">
              {decoded.evidence.map((e, i) => (
                <motion.li key={e} {...fade(0.3 + i * 0.12)} className="flex gap-2 text-sm text-stone-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {e}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col gap-5">
        <motion.div {...fade(0.1)} className="rounded-2xl border border-stone-200 p-5 text-center sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Your odds (estimate)</p>
          <div className="mt-3">
            <OddsGauge score={odds.score} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-stone-50 p-2">
              <p className="text-stone-400">Denial type</p>
              <p className="font-semibold">{odds.base}%</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-2">
              <p className="text-stone-400">Community</p>
              <p className="font-semibold">{odds.community == null ? '—' : `${odds.community}%`}</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-2">
              <p className="text-stone-400">Evidence</p>
              <p className="font-semibold text-emerald-600">+{odds.evidenceBonus}</p>
            </div>
          </div>
        </motion.div>

        <motion.div {...fade(0.2)} className="relative overflow-hidden rounded-2xl bg-ink-950 p-5 text-white sm:p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/30 blur-3xl" />
          <p className="relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300">
            <Users className="h-3.5 w-3.5" /> People like you
          </p>
          {insight?.stats.winRate != null ? (
            <p className="relative mt-3 text-[15px] leading-relaxed text-stone-200">
              <span className="text-2xl font-bold text-white">{insight.stats.n}</span> {insight.scope} shared their outcome.{' '}
              <span className="font-semibold text-brand-300">{insight.stats.winRate}% won</span>
              {insight.stats.topTactic && (
                <>
                  , most often by <span className="font-semibold text-white">{insight.stats.topTactic.tactic.toLowerCase()}</span>.
                </>
              )}
            </p>
          ) : (
            <p className="relative mt-3 text-sm text-stone-300">Fewer than 5 similar cases yet, so stats are hidden to protect privacy.</p>
          )}
          <button onClick={onNext} className="btn-primary relative mt-5 w-full">
            Draft my appeal <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
