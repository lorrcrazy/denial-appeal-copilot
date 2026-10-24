import { AnimatePresence, motion } from 'framer-motion'
import { Check, FileUp, Gavel, ScanText, ShieldCheck, CalendarClock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SectionHeading } from '../../components/SectionHeading'
import type { SampleCase } from '../../data/samples'
import type { CaseDocs } from '../../lib/types'
import { AppealPanel } from '../appeal/AppealPanel'
import type { WinCard } from '../community/seed'
import { peopleLikeYou } from '../community/stats'
import type { SharePrefill } from '../community/types'
import { DeadlinePanel } from '../deadlines/DeadlinePanel'
import { estimateOdds } from '../decoder/decode'
import { DecoderPanel } from '../decoder/DecoderPanel'
import { RedactionView } from '../redaction/RedactionView'
import { UploadPanel } from './UploadPanel'
import { analyzeCase, type CaseState } from './useCase'

const STEPS = [
  { icon: FileUp, label: 'Upload' },
  { icon: ShieldCheck, label: 'Redact' },
  { icon: ScanText, label: 'Decode' },
  { icon: Gavel, label: 'Appeal' },
  { icon: CalendarClock, label: 'Deadlines' },
]

const STORIES: Record<string, string> = {
  biologic: 'Dr. Priya Natarajan sent chart notes showing Jordan Rivera failed azathioprine starting January 6, 2025 for 16 weeks. I\'m 28 years old. We quoted Section 5.1 of their step therapy policy and Peachtree approved it on November 12, 2026.',
  er: 'I went to the nearest ER for chest pain on July 3, 2026. Maya Chen here, 24 years old. Quoted their emergency services section and the No Surprises Act. Reprocessed at in-network rates. Call me at 404-555-0187 with questions.',
  mri: 'Dr. Elena Vasquez documented my foot drop on September 22, 2026. I\'m Marcus Bell, 39 years old. Their own imaging guideline waives the 6-week wait for red flags, and Keystone approved the MRI in 3 days.',
}

export function Workspace({ cards, onShare }: { cards: WinCard[]; onShare: (p: SharePrefill) => void }) {
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [state, setState] = useState<CaseState | null>(null)
  const [sampleId, setSampleId] = useState<string | null>(null)

  const go = (s: number) => {
    setStep(s)
    setMaxStep((m) => Math.max(m, s))
    document.getElementById('copilot-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const analyze = (docs: CaseDocs, sample?: SampleCase) => {
    setState(analyzeCase(docs, sample?.insuranceType, sample?.condition))
    setSampleId(sample?.id ?? null)
    setMaxStep(1)
    go(1)
  }

  const insight = useMemo(() => (state ? peopleLikeYou(cards, state.decoded.reason, state.insuranceType) : null), [cards, state])
  const odds = useMemo(() => (state ? estimateOdds(state.decoded, insight?.stats.winRate ?? null) : null), [state, insight])

  const share = () => {
    if (!state) return
    onShare({
      insuranceType: state.insuranceType,
      insurer: state.decoded.insurer.replace(/ Medicaid$/, ''),
      condition: state.condition,
      reason: state.decoded.reason,
      service: state.decoded.service.split('(')[0].trim(),
      tactic: insight?.stats.topTactic?.tactic ?? 'Cited the plan\'s own policy language',
      story: (sampleId && STORIES[sampleId]) || '',
      knownNames: state.vault.names,
    })
  }

  return (
    <section id="copilot" className="relative bg-slate-50 py-24 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/[0.04] to-transparent" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="The copilot" title="From denial letter to cited appeal in under a minute" sub="Pick a sample case and watch every step happen. Nothing here touches real patient data." />
          <div className="hidden overflow-hidden rounded-3xl shadow-xl lg:block">
            <img src="/img/xray.webp" alt="Clinician reviewing a chest X-ray" loading="lazy" className="h-36 w-64 object-cover" />
          </div>
        </div>

        <div id="copilot-card" className="card mt-10 scroll-mt-24 overflow-hidden">
          <div className="border-b border-slate-100 bg-white/80 px-3 py-3 sm:px-6">
            <ol className="relative flex items-center justify-between">
              <div className="absolute left-5 right-5 top-1/2 h-0.5 -translate-y-1/2 rounded bg-slate-100 sm:left-8 sm:right-8" />
              <motion.div className="absolute left-5 top-1/2 h-0.5 -translate-y-1/2 rounded bg-gradient-to-r from-brand-400 to-sky-500 sm:left-8" animate={{ width: `calc(${(maxStep / (STEPS.length - 1)) * 100}% - ${maxStep === 0 ? 0 : 40}px)` }} transition={{ duration: 0.6 }} />
              {STEPS.map((s, i) => {
                const unlocked = i <= maxStep && (i === 0 || state)
                const current = i === step
                return (
                  <li key={s.label} className="relative z-10">
                    <button disabled={!unlocked} onClick={() => go(i)} className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-1.5 text-sm font-medium transition sm:pr-4 ${current ? 'bg-ink-950 text-white shadow-lg' : unlocked ? 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300' : 'bg-white text-slate-300 ring-1 ring-slate-100'}`}>
                      <span className={`grid h-7 w-7 place-items-center rounded-full ${current ? 'bg-brand-500' : unlocked ? 'bg-brand-50 text-brand-600' : 'bg-slate-50'}`}>{unlocked && i < maxStep && !current ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}</span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="p-4 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                {step === 0 && <UploadPanel onAnalyze={analyze} />}
                {step === 1 && state && <RedactionView docs={state.docs} redacted={state.redacted} onNext={() => go(2)} />}
                {step === 2 && state && odds && <DecoderPanel decoded={state.decoded} odds={odds} insight={insight} onNext={() => go(3)} />}
                {step === 3 && state && <AppealPanel state={state} communityTactic={insight?.stats.topTactic?.tactic ?? null} onNext={() => go(4)} />}
                {step === 4 && state && <DeadlinePanel decoded={state.decoded} onShare={share} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
