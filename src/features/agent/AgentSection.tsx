import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Cloud, Laptop, Loader2, Lock, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SAMPLE_CASES } from '../../data/samples'
import { useGuide } from '../../lib/guide'
import { DOC_LABELS } from '../../lib/types'
import type { WinCard } from '../community/seed'
import { analyzeCase } from '../workspace/useCase'
import { AGENTS, runAgent } from './agents'

type Status = 'idle' | 'working' | 'done' | 'waiting'

export function AgentSection({ cards }: { cards: WinCard[] }) {
  const [sample, setSample] = useState(0)
  const [done, setDone] = useState(0)
  const [running, setRunning] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [selected, setSelected] = useState(0)
  const [today] = useState(() => new Date())

  const state = useMemo(() => {
    const s = SAMPLE_CASES[sample]
    return analyzeCase(s.docs, s.insuranceType, s.condition)
  }, [sample])

  const waiting = running && AGENTS[done]?.id === 'submit' && !authorized

  useEffect(() => {
    if (!running || waiting) return
    if (done >= AGENTS.length) {
      const t = setTimeout(() => setRunning(false), 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setDone((d) => d + 1)
      setSelected(AGENTS[done + 1]?.id === 'submit' && !authorized ? done + 1 : done)
    }, 1100)
    return () => clearTimeout(t)
  }, [running, done, waiting, authorized])

  const status = (i: number): Status => (i < done ? 'done' : i === done && running ? (waiting ? 'waiting' : 'working') : 'idle')

  const start = () => {
    setDone(0)
    setSelected(0)
    setRunning(true)
  }
  const pick = (i: number) => {
    setSample(i)
    setDone(0)
    setRunning(false)
    setSelected(0)
  }
  useGuide((d) => {
    const i = SAMPLE_CASES.findIndex((c) => c.id === d.sampleId)
    if (d.section === 'agent' && i >= 0) pick(i)
  })
  const approve = () => {
    setAuthorized(true)
    setSelected(done)
  }

  const agent = AGENTS[selected]
  const st = status(selected)
  const result = st === 'done' || (agent.id === 'submit' && st === 'waiting') ? runAgent(agent.id, { state, cards, today, authorized }) : null

  return (
    <section id="agent" className="border-y border-paper-200 bg-paper-100 py-24 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">the case agent</p>
          <h2 className="mt-1 font-serif text-[34px] font-medium leading-[1.1] tracking-tight sm:text-[44px]">Hand over the paperwork. It shows you every step.</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">Eight small helpers work through the case in order. Most of them run on your computer. The two that touch the cloud only ever see placeholders, and nothing gets submitted until you say so.</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {SAMPLE_CASES.map((s, i) => (
            <button key={s.id} onClick={() => pick(i)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${i === sample ? 'border-ink-950 bg-white shadow-card' : 'border-paper-300 bg-transparent text-ink-700 hover:border-ink-700'}`}>
              <span className="block font-bold">{s.title}</span>
              <span className="text-xs text-ink-700">{s.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="card mt-6 grid overflow-hidden lg:grid-cols-[320px_1fr]">
          <div className="border-b border-paper-200 bg-paper-50 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2">
              <button onClick={start} disabled={running} className="btn-primary flex-1">
                {done >= AGENTS.length ? <RotateCcw className="h-4 w-4" /> : running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {done >= AGENTS.length ? 'Run again' : running ? 'Working…' : 'Run the agent'}
              </button>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mt-1 accent-ink-950" />
              Allow it to submit the appeal for me (demo, nothing is really sent)
            </label>

            <ol className="relative mt-6">
              <span className="absolute bottom-4 left-[13px] top-4 w-px bg-paper-300" />
              <motion.span className="absolute left-[13px] top-4 w-px origin-top bg-ink-950" animate={{ height: `${(Math.max(done - 0.5, 0) / (AGENTS.length - 1)) * 92}%` }} transition={{ duration: 0.6 }} />
              {AGENTS.map((a, i) => {
                const s = status(i)
                return (
                  <li key={a.id}>
                    <button onClick={() => (s === 'done' || s === 'waiting') && setSelected(i)} className={`relative flex w-full items-center gap-3 rounded-lg px-0 py-2 text-left transition ${selected === i && s !== 'idle' ? 'font-bold text-ink-950' : 'text-ink-700'} ${s === 'idle' ? 'cursor-default opacity-60' : 'hover:text-ink-950'}`}>
                      <span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${s === 'done' ? 'border-ink-950 bg-ink-950 text-white' : s === 'working' ? 'border-ink-950 bg-white' : s === 'waiting' ? 'border-clay-500 bg-clay-50 text-clay-600' : 'border-paper-300 bg-white'}`}>
                        {s === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s === 'working' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : s === 'waiting' ? <Lock className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className="flex-1 text-[15px]">{a.name}</span>
                      {a.where === 'cloud' ? <Cloud className="h-4 w-4 text-ink-700/60" aria-label="cloud" /> : <Laptop className="h-4 w-4 text-ink-700/60" aria-label="on device" />}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="min-h-[460px] p-5 sm:p-8">
            {done === 0 && !running ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="font-hand text-2xl text-clay-600">ready when you are</p>
                  <p className="mx-auto mt-2 max-w-sm text-ink-700">Pick a sample case above and press "Run the agent". Click any finished step to see what it found.</p>
                </div>
              </div>
            ) : running && st === 'working' && !result ? (
              <div className="flex items-center gap-3 text-ink-700">
                <Loader2 className="h-5 w-5 animate-spin" /> {agent.verb}…
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={`${sample}-${selected}-${authorized}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-paper-100 text-ink-800">Step {selected + 1} of 8</span>
                    <span className="chip bg-paper-100 text-ink-800">{agent.where === 'cloud' ? 'Cloud, placeholders only' : 'Ran on your device'}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl font-medium">{agent.name}</h3>
                  <p className="mt-1 text-lg text-ink-800">{result?.summary}</p>

                  {agent.id === 'submit' && !authorized && (
                    <button onClick={approve} className="btn-dark mt-4">
                      <Lock className="h-4 w-4" /> OK, submit it for me
                    </button>
                  )}

                  {result?.fields && (
                    <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {result.fields.map((f) => (
                        <div key={f.label} className="border-b border-dashed border-paper-300 pb-2">
                          <dt className="text-xs font-bold uppercase tracking-wide text-ink-700/70">{f.label}</dt>
                          <dd className="mt-0.5 text-[15px] text-ink-950">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {result?.checklist && (
                    <ul className="mt-5 space-y-2">
                      {result.checklist.map((c) => (
                        <li key={c.label} className="flex items-start gap-2.5 text-[15px]">
                          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded ${c.ok ? 'bg-ink-950 text-white' : 'border-2 border-clay-400'}`}>{c.ok && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                          <span>
                            {c.label} <span className={`text-sm ${c.ok ? 'text-ink-700' : 'font-bold text-clay-600'}`}>· {c.note}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {result?.quotes && result.quotes.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {result.quotes.map((q, i) => (
                        <figure key={i} className="rounded-lg border border-paper-200 bg-paper-50 p-3.5">
                          <figcaption className="text-xs font-bold text-ink-700">
                            {DOC_LABELS[q.doc]}
                            {q.note && <span className="font-normal"> · {q.note}</span>}
                          </figcaption>
                          <blockquote className="mt-1 font-mono text-[13px] leading-relaxed text-ink-900">"{q.text}"</blockquote>
                        </figure>
                      ))}
                    </div>
                  )}

                  {result?.bullets && result.bullets.length > 0 && (
                    <ul className="mt-5 space-y-2 border-l-2 border-paper-300 pl-4 text-[15px] leading-relaxed text-ink-800">
                      {result.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {result?.flag && (
                    <p className="mt-5 flex items-start gap-2 rounded-lg bg-marker/40 px-3 py-2 text-sm text-ink-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {result.flag}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
