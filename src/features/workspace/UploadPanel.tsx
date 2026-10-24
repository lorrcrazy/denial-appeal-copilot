import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, FileText, HeartPulse, Lock, Paperclip, Pill, Plus, ScanLine, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { SAMPLE_CASES, type SampleCase } from '../../data/samples'
import { DOC_LABELS, type CaseDocs, type DocKind } from '../../lib/types'

const ICONS = { biologic: Pill, er: HeartPulse, mri: ScanLine } as Record<string, typeof Pill>
const EXTRA: DocKind[] = ['records', 'policy']

export function UploadPanel({ onAnalyze }: { onAnalyze: (docs: CaseDocs, sample?: SampleCase) => void }) {
  const [docs, setDocs] = useState<CaseDocs>({ denial: '', records: '', policy: '' })
  const [sample, setSample] = useState<SampleCase | null>(null)
  const [extraOpen, setExtraOpen] = useState<DocKind | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const edit = (kind: DocKind, text: string) => {
    setDocs((d) => ({ ...d, [kind]: text }))
    setSample(null)
  }
  const readFile = async (kind: DocKind, file: File | undefined) => {
    if (file) edit(kind, await file.text())
  }
  const pick = (s: SampleCase) => {
    setDocs(s.docs)
    setSample(s)
    setExtraOpen(null)
  }
  const clear = () => {
    setDocs({ denial: '', records: '', policy: '' })
    setSample(null)
    setExtraOpen(null)
  }
  const send = () => (sample ? onAnalyze(sample.docs, sample) : onAnalyze(docs))
  const ready = docs.denial.trim().length > 0

  return (
    <div className="mx-auto max-w-3xl py-4 sm:py-8">
      <div className="text-center">
        <motion.div
          className="mx-auto h-12 w-12 rounded-2xl bg-[conic-gradient(from_200deg,#7EC1CB,#2B8897,#9FD3C7,#A9C8F0,#7EC1CB)] shadow-lg shadow-brand-500/20"
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3 className="mt-5 text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">What did your insurance say?</h3>
        <p className="mx-auto mt-2 max-w-lg text-[15px] text-ink-700">Paste the denial letter or attach it. I'll explain it in plain English and help you write the appeal.</p>
      </div>

      <div className="mt-8 rounded-[28px] border border-paper-200 bg-white p-2 shadow-[0_2px_6px_rgba(16,40,48,.05),0_18px_40px_-18px_rgba(16,60,72,.28)] transition focus-within:border-brand-300 focus-within:shadow-[0_0_0_4px_rgba(43,136,151,.10),0_18px_40px_-18px_rgba(16,60,72,.32)]">
        <AnimatePresence>
          {sample && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 px-3 pt-2">
              {(Object.keys(DOC_LABELS) as DocKind[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-xl border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  <FileText className="h-3.5 w-3.5" /> {DOC_LABELS[k]}
                </span>
              ))}
              <button onClick={clear} className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-ink-700 hover:bg-paper-100" aria-label="Clear sample">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          value={docs.denial}
          onChange={(e) => edit('denial', e.target.value)}
          rows={sample ? 6 : 3}
          placeholder="Paste your denial letter here…"
          aria-label="Denial letter"
          className="scrollbar-thin block max-h-60 w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-700/50"
        />

        <AnimatePresence>
          {extraOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-2 mb-2 overflow-hidden rounded-2xl bg-paper-50">
              <div className="flex items-center justify-between px-3 pt-2 text-xs font-semibold text-ink-700">
                {DOC_LABELS[extraOpen]} (optional)
                <button onClick={() => setExtraOpen(null)} aria-label="Close" className="rounded p-0.5 hover:bg-paper-200">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea value={docs[extraOpen]} onChange={(e) => edit(extraOpen, e.target.value)} rows={3} placeholder={`Paste the ${DOC_LABELS[extraOpen].toLowerCase()}…`} className="block w-full resize-none bg-transparent px-3 py-2 text-sm outline-none" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5 px-2 pb-1">
          <button onClick={() => fileRef.current?.click()} className="grid h-9 w-9 place-items-center rounded-full text-ink-700 transition hover:bg-paper-100" aria-label="Attach a .txt file" title="Attach a .txt file">
            <Paperclip className="h-[18px] w-[18px]" />
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,text/plain" className="hidden" onChange={(e) => readFile('denial', e.target.files?.[0])} />
          {EXTRA.map((k) => (
            <button key={k} onClick={() => setExtraOpen(extraOpen === k ? null : k)} className={`hidden items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:inline-flex ${docs[k] ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-paper-100'}`}>
              <Plus className="h-3.5 w-3.5" /> {DOC_LABELS[k]}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1 text-xs text-ink-700/70 sm:inline-flex">
            <Lock className="h-3 w-3" /> Your details get hidden on this device first
          </span>
          <button onClick={send} disabled={!ready} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 disabled:bg-paper-200 disabled:text-ink-700/40 disabled:shadow-none sm:ml-2" aria-label="Analyze denial">
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm font-semibold text-ink-700">Or try one of our made-up letters</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {SAMPLE_CASES.map((s, i) => {
          const Icon = ICONS[s.id] ?? Pill
          const active = sample?.id === s.id
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => pick(s)}
              className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? 'border-brand-300 bg-brand-50 ring-4 ring-brand-100/70' : 'border-paper-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md'}`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${active ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100'}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-tight text-ink-950">{s.title}</span>
                <span className="mt-1 block text-xs text-ink-700">{s.subtitle}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs text-ink-700/70">Demo only. Please don't paste real medical records.</p>
    </div>
  )
}
