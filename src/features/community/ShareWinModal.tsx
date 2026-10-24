import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CONDITION_CATEGORIES, DENIAL_REASONS, INSURANCE_TYPES } from '../../lib/types'
import { redactForSharing, SHARE_REPLACEMENTS } from '../redaction/redact'
import { INSURERS, NETWORKS, TACTICS, type Outcome, type WinCard } from './seed'
import type { SharePrefill } from './types'
import { WinCardView } from './WinCardView'

const ADJ = ['brave', 'steady', 'bright', 'calm', 'kind', 'bold']
const ANIMAL = ['heron', 'otter', 'finch', 'lynx', 'robin', 'falcon']

const DEFAULT: SharePrefill = {
  insuranceType: 'Employer PPO',
  insurer: INSURERS[0],
  condition: 'Autoimmune & GI',
  reason: 'Step therapy',
  service: 'Biologic drug',
  tactic: TACTICS['Step therapy'][0].tactic,
  story: 'Dr. Priya Natarajan sent chart notes showing I failed azathioprine starting January 6, 2025. I\'m 28 years old. Peachtree approved it on November 12, 2026.',
  knownNames: [],
}

const randomHandle = () => `${ADJ[Math.floor(Math.random() * ADJ.length)]}-${ANIMAL[Math.floor(Math.random() * ANIMAL.length)]}-${10 + Math.floor(Math.random() * 89)}`
const currentQuarter = () => {
  const d = new Date()
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
}

export function ShareWinModal({ prefill, onClose, onPost }: { prefill: SharePrefill | null; onClose: () => void; onPost: (c: WinCard) => void }) {
  return <AnimatePresence>{prefill && <ShareWinDialog key="share" prefill={prefill} onClose={onClose} onPost={onPost} />}</AnimatePresence>
}

function ShareWinDialog({ prefill, onClose, onPost }: { prefill: SharePrefill; onClose: () => void; onPost: (c: WinCard) => void }) {
  const [form, setForm] = useState(() => ({ ...DEFAULT, ...prefill, story: prefill.story || DEFAULT.story }))
  const [outcome, setOutcome] = useState<Outcome>('Overturned')
  const [network, setNetwork] = useState<string>(NETWORKS[0])
  const [story, setStory] = useState('')
  const typing = useRef<ReturnType<typeof setInterval> | null>(null)
  const [handle] = useState(randomHandle)
  const [quarter] = useState(currentQuarter)

  useEffect(() => {
    let i = 0
    typing.current = setInterval(() => {
      i += 2
      setStory(form.story.slice(0, i))
      if (i >= form.story.length && typing.current) clearInterval(typing.current)
    }, 18)
    return () => {
      if (typing.current) clearInterval(typing.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { spans, text } = useMemo(() => redactForSharing(story, form.knownNames), [story, form.knownNames])
  const preview: WinCard = {
    id: 'preview',
    handle,
    insuranceType: form.insuranceType,
    insurer: form.insurer,
    network,
    condition: form.condition,
    reason: form.reason,
    service: form.service,
    tactic: form.tactic,
    story: text || 'Your story will appear here, anonymized.',
    outcome,
    level: 'Internal appeal',
    quarter,
    daysToDecision: 21,
    helped: 0,
    mine: true,
  }

  const set = <K extends keyof SharePrefill>(k: K, v: SharePrefill[K]) => setForm((f) => ({ ...f, [k]: v }))
  const checks = [
    ['Names removed', spans.some((s) => s.type === 'PATIENT' || s.type === 'CLINICIAN')],
    ['Dates turned into quarters', spans.some((s) => s.type === 'DATE')],
    ['IDs, phones, addresses removed', spans.some((s) => ['ID', 'PHONE', 'ADDRESS', 'EMAIL'].includes(s.type))],
    ['Ages turned into ranges', spans.some((s) => s.type === 'AGE')],
    ['Anonymous handle', true],
    ['Condition shown as a broad bucket', true],
  ] as const

  return (
    <>
      {(
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="scrollbar-thin max-h-[92vh] w-full max-w-5xl overflow-auto rounded-t-3xl bg-white sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-7">
              <div>
                <h3 className="text-lg font-bold">Share your Appeal Win</h3>
                <p className="text-xs text-stone-500">Watch it get anonymized as you type.</p>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-stone-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Insurance type" value={form.insuranceType} options={INSURANCE_TYPES} onChange={(v) => set('insuranceType', v)} />
                  <Select label="Insurer" value={form.insurer} options={[...new Set([form.insurer, ...INSURERS])]} onChange={(v) => set('insurer', v)} />
                  <Select label="Denial reason" value={form.reason} options={DENIAL_REASONS} onChange={(v) => set('reason', v)} />
                  <Select label="Condition (broad)" value={form.condition} options={CONDITION_CATEGORIES} onChange={(v) => set('condition', v)} />
                  <Select label="Hospital network" value={network} options={NETWORKS} onChange={setNetwork} />
                  <Select label="Outcome" value={outcome} options={['Overturned', 'Partially overturned', 'Upheld'] as const} onChange={setOutcome} />
                </div>
                <Select label="What worked" value={form.tactic} options={[...new Set([form.tactic, ...Object.values(TACTICS).flat().map((t) => t.tactic)])]} onChange={(v) => set('tactic', v)} />
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-500">Your story (in your own words)</label>
                  <textarea
                    value={story}
                    onChange={(e) => {
                      if (typing.current) clearInterval(typing.current)
                      setStory(e.target.value)
                    }}
                    rows={5}
                    className="field resize-none"
                  />
                </div>
                <div className="rounded-2xl bg-stone-50 p-3 text-[13px] leading-relaxed text-stone-600">
                  <p className="mb-1 text-xs font-semibold text-stone-400">Live redaction</p>
                  <RedactedText story={story} spans={spans} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Public preview</p>
                <WinCardView card={preview} />
                <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {checks.map(([label, ok]) => (
                    <li key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-stone-700' : 'text-stone-400'}`}>
                      <span className={`grid h-4 w-4 place-items-center rounded-full ${ok ? 'bg-emerald-500 text-white' : 'bg-stone-200'}`}>{ok && <Check className="h-3 w-3" />}</span>
                      {label}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onPost({ ...preview, id: `mine-${Date.now()}`, story: text })} disabled={!text.trim()} className="btn-primary mt-6 w-full !py-3">
                  <ShieldCheck className="h-4 w-4" /> Post anonymously
                </button>
                <p className="mt-2 text-center text-[11px] text-stone-400">Demo: saved only in this browser.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

function RedactedText({ story, spans }: { story: string; spans: ReturnType<typeof redactForSharing>['spans'] }) {
  const parts: React.ReactNode[] = []
  let i = 0
  spans.forEach((s, k) => {
    parts.push(story.slice(i, s.start))
    parts.push(
      <motion.span key={`${k}-${s.start}`} initial={{ backgroundColor: '#FECDD3' }} animate={{ backgroundColor: '#CCFBF1' }} transition={{ duration: 0.6 }} className="rounded px-1 font-mono text-[12px] text-brand-700">
        <span className="mr-1 text-rose-500 line-through">{s.text}</span>
        {SHARE_REPLACEMENTS[s.type](s)}
      </motion.span>,
    )
    i = s.end
  })
  parts.push(story.slice(i))
  return <p>{story ? parts : <span className="text-stone-400">Start typing…</span>}</p>
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="field">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}
