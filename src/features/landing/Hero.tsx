import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Lock, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { KFF } from '../../data/credits'
import { SEED_CARDS } from '../community/seed'
import { quarterSeries } from '../community/stats'
import { HeroLines } from './HeroLines'

const SWAPS = [
  ['Jordan Rivera', '[PATIENT_1]'],
  ['PHP-883-20417', '[ID_1]'],
  ['03/14/1998', '[DOB]'],
  ['Dr. Priya Natarajan', '[CLINICIAN_1]'],
]

const ease = [0.16, 1, 0.3, 1] as const
const series = quarterSeries(SEED_CARDS)

function RedactionChip() {
  const [i, setI] = useState(0)
  const [swapped, setSwapped] = useState(false)
  useEffect(() => {
    const t = setInterval(() => {
      setSwapped((s) => {
        if (s) setI((x) => (x + 1) % SWAPS.length)
        return !s
      })
    }, 1300)
    return () => clearInterval(t)
  }, [])
  const [orig, ph] = SWAPS[i]
  return (
    <div className="glass rounded-2xl p-4 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300">
        <Lock className="h-3.5 w-3.5" /> Redacting on your device
      </div>
      <div className="mt-3 h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${i}-${swapped}`}
            initial={{ y: 16, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -16, opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.35 }}
            className={swapped ? 'font-mono text-lg font-semibold text-brand-300' : 'text-lg font-semibold text-rose-200 line-through decoration-rose-400/70'}
          >
            {swapped ? ph : orig}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink-950 pb-20 pt-28 text-white sm:pb-28 sm:pt-36">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-brand-500/20 blur-[120px]" />
      <div className="absolute -right-20 top-0 h-[480px] w-[480px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <HeroLines />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs font-medium text-slate-200">
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-brand-300">New</span>
            Patient details never leave your device
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease }} className="mt-6 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]">
            Most denials never get appealed.{' '}
            <span className="font-serif text-[1.08em] font-normal italic text-gradient">Nearly half of appeals win.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }} className="mt-6 max-w-xl text-lg text-slate-300">
            Upload your insurance denial. Get it in plain English, an appeal that quotes your plan's own rules, and the arguments that worked for people like you.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease }} className="mt-8 flex flex-wrap gap-3">
            <a href="#copilot" className="btn-primary !px-6 !py-3 !text-base">
              Try a sample denial <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#wins" className="btn-ghost-dark !px-6 !py-3 !text-base">
              See Appeal Wins
            </a>
          </motion.div>

          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs text-slate-400">Denied claims appealed</dt>
              <dd className="mt-1 text-2xl font-bold sm:text-3xl">
                {'<'}
                <AnimatedNumber value={1} suffix="%" />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Appeals overturned</dt>
              <dd className="mt-1 text-2xl font-bold text-brand-300 sm:text-3xl">
                <AnimatedNumber value={100 - KFF.upheld} suffix="%" />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Names sent to the cloud</dt>
              <dd className="mt-1 text-2xl font-bold sm:text-3xl">0</dd>
            </div>
          </motion.dl>
          <p className="mt-3 text-[11px] text-slate-500">
            Source:{' '}
            <a href={KFF.url} target="_blank" rel="noreferrer" className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300">
              {KFF.label}
            </a>
          </p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2, ease }} className="relative mx-auto w-full max-w-[560px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-brand-900/40 sm:aspect-[5/6]">
            <img src="/img/doctor-laptop.webp" alt="Clinician working on a laptop" className="h-full w-full animate-kenburns object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-indigo-500/20 mix-blend-overlay" />
          </div>

          <div className="absolute -left-4 top-8 w-60 animate-float sm:-left-12">
            <RedactionChip />
          </div>

          <div className="absolute -right-3 top-[38%] w-56 animate-float-slow sm:-right-10">
            <div className="glass rounded-2xl p-4 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-300" /> Win rate
                </span>
                <span className="text-brand-300">citing evidence</span>
              </div>
              <div className="mt-2 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2DD4BF" stopOpacity={0.6} />
                        <stop offset="1" stopColor="#2DD4BF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="citedWinRate" stroke="#5EEAD4" strokeWidth={2} fill="url(#spark)" animationDuration={2200} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 left-4 right-4 sm:left-10 sm:right-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7, ease }} className="glass flex items-center gap-3 rounded-2xl p-3.5 pr-5 shadow-2xl shadow-black/50">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400/20">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-400/30" />
                <BadgeCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Appeal overturned · Step therapy</p>
                <p className="truncate text-xs text-slate-400">Employer PPO · cited a failed prior treatment · Q3 2026</p>
              </div>
              <Sparkles className="ml-auto h-4 w-4 shrink-0 text-brand-300" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
