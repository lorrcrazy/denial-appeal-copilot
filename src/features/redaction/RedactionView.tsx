import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Cloud, Laptop, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DOC_LABELS, type CaseDocs, type DocKind } from '../../lib/types'
import { ENTITY_LABELS, type EntityType, type Span } from './redact'

interface Props {
  docs: CaseDocs
  redacted: Record<DocKind, { spans: Span[]; redacted: string }>
  onNext: () => void
}

function Segments({ text, spans, revealed, side }: { text: string; spans: Span[]; revealed: number; side: 'device' | 'cloud' }) {
  const parts: React.ReactNode[] = []
  let i = 0
  spans.forEach((s, idx) => {
    parts.push(text.slice(i, s.start))
    const done = idx < revealed
    if (side === 'device') {
      parts.push(
        <mark key={idx} className={`rounded px-0.5 transition-colors duration-300 ${done ? 'bg-rose-100 text-rose-700 line-through decoration-rose-400' : 'bg-transparent text-inherit'}`}>
          {s.text}
        </mark>,
      )
    } else {
      parts.push(
        done ? (
          <motion.span key={idx} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className="ph inline-block">
            {s.placeholder}
          </motion.span>
        ) : (
          <span key={idx} className="rounded bg-amber-100/70 text-amber-800 blur-[2px]">
            {s.text}
          </span>
        ),
      )
    }
    i = s.end
  })
  parts.push(text.slice(i))
  return <>{parts}</>
}

export function RedactionView({ docs, redacted, onNext }: Props) {
  const [doc, setDoc] = useState<DocKind>('denial')
  const [revealed, setRevealed] = useState(0)
  const spans = redacted[doc].spans
  const done = revealed >= spans.length

  useEffect(() => {
    const t = setInterval(() => setRevealed((r) => (r >= spans.length ? r : r + 1)), 140)
    return () => clearInterval(t)
  }, [doc, spans.length])

  const counts = useMemo(() => {
    const all = (Object.keys(redacted) as DocKind[]).flatMap((k) => redacted[k].spans)
    const by = new Map<EntityType, number>()
    for (const s of all) by.set(s.type, (by.get(s.type) ?? 0) + 1)
    return { total: all.length, by: [...by.entries()].sort((a, b) => b[1] - a[1]) }
  }, [redacted])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-medium">
          {(Object.keys(DOC_LABELS) as DocKind[]).map((k) => (
            <button key={k} onClick={() => {
                setDoc(k)
                setRevealed(0)
              }} className={`relative rounded-full px-3 py-1.5 transition sm:px-4 ${doc === k ? 'text-slate-900' : 'text-slate-500'}`}>
              {doc === k && <motion.span layoutId="doc" className="absolute inset-0 rounded-full bg-white shadow" />}
              <span className="relative">{DOC_LABELS[k]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {counts.by.map(([type, n]) => (
            <span key={type} className="chip bg-brand-50 text-brand-700">
              {n} {ENTITY_LABELS[type].toLowerCase()}
              {n > 1 ? 's' : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5" /> On your device
            </span>
            <span className="text-slate-400">original</span>
          </div>
          {!done && <motion.div className="pointer-events-none absolute inset-x-0 z-10 h-16 bg-gradient-to-b from-transparent via-brand-300/25 to-transparent" initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />}
          <pre className="scrollbar-thin h-[340px] overflow-auto whitespace-pre-wrap p-4 font-mono text-[11.5px] leading-relaxed text-slate-600 sm:h-[400px]">
            <Segments text={docs[doc]} spans={spans} revealed={revealed} side="device" />
          </pre>
        </div>
        <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white">
          <div className="flex items-center justify-between border-b border-indigo-100 px-4 py-2.5 text-xs font-semibold text-indigo-600">
            <span className="flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" /> What the cloud LLM sees
            </span>
            <span className="tabular-nums text-indigo-400">
              {Math.min(revealed, spans.length)}/{spans.length} swapped
            </span>
          </div>
          <pre className="scrollbar-thin h-[340px] overflow-auto whitespace-pre-wrap p-4 font-mono text-[11.5px] leading-relaxed text-slate-600 sm:h-[400px]">
            <Segments text={docs[doc]} spans={spans} revealed={revealed} side="cloud" />
          </pre>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <AnimatePresence mode="wait">
          <motion.p key={String(done)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className={`h-4 w-4 ${done ? 'text-emerald-500' : 'text-slate-400'}`} />
            {done ? `${counts.total} personal details replaced across 3 documents. The key stays in this browser tab.` : 'Scanning for names, IDs, dates, addresses…'}
          </motion.p>
        </AnimatePresence>
        <button onClick={onNext} className="btn-primary">
          Decode my denial <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
