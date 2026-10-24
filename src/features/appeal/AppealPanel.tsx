import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Check, Cloud, Copy, Download, Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DOC_LABELS, type DocKind } from '../../lib/types'
import { restore } from '../redaction/redact'
import type { CaseState } from '../workspace/useCase'
import { generateDraft, mockDraft, verifyCitations, type AppealDraft, type Citation } from './draft'

const STAGES = [
  { icon: ShieldCheck, label: 'Sending placeholders only' },
  { icon: Cloud, label: 'Drafting with your plan\'s language' },
  { icon: BadgeCheck, label: 'Checking every quote against your files' },
  { icon: UserCheck, label: 'Restoring names on your device' },
]

const DOC_COLORS: Record<DocKind, string> = {
  denial: 'bg-rose-50 text-rose-700 ring-rose-200',
  records: 'bg-sky-50 text-sky-700 ring-sky-200',
  policy: 'bg-violet-50 text-violet-700 ring-violet-200',
}

export function AppealPanel({ state, communityTactic, onNext }: { state: CaseState; communityTactic: string | null; onNext: () => void }) {
  const [draft, setDraft] = useState<AppealDraft | null>(null)
  const [stage, setStage] = useState(0)
  const [active, setActive] = useState<{ p: number; c: number } | null>(null)
  const [showRedacted, setShowRedacted] = useState(false)
  const [copied, setCopied] = useState(false)
  const markRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    setDraft(null)
    setStage(0)
    const timers = [1, 2, 3].map((s) => setTimeout(() => !cancelled && setStage(s), s * 700))
    const started = Date.now()
    generateDraft(
      {
        docs: state.redactedDocs,
        reason: state.decoded.reason,
        service: state.decoded.service,
        argument: state.decoded.profile.argument,
        communityTactic,
      },
      () => mockDraft(state.redactedDocs, state.decoded),
    ).then((d) => {
      const wait = Math.max(0, 2900 - (Date.now() - started))
      setTimeout(() => {
        if (cancelled) return
        const verified = verifyCitations(d, state.redactedDocs)
        setDraft(verified)
        const first = verified.paragraphs.findIndex((p) => p.citations.length > 0)
        setActive(first >= 0 ? { p: first, c: 0 } : null)
      }, wait)
    })
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [state, communityTactic])

  const show = (t: string) => (showRedacted ? t : restore(t, state.vault))
  const activeCite: Citation | null = draft && active ? draft.paragraphs[active.p]?.citations[active.c] ?? null : null

  const sourceView = useMemo(() => {
    if (!activeCite) return null
    const text = showRedacted ? state.redactedDocs[activeCite.doc] : state.docs[activeCite.doc]
    const q = show(activeCite.quote)
    const idx = text.indexOf(q)
    return { text, idx, len: q.length, doc: activeCite.doc }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCite, showRedacted, state])

  useEffect(() => {
    markRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [sourceView])

  const allCites = draft?.paragraphs.flatMap((p) => p.citations) ?? []
  const verifiedCount = allCites.filter((c) => c.verified).length
  const letterText = draft ? [draft.subject, '', ...draft.paragraphs.map((p) => restore(p.text, state.vault) + (p.citations.length ? '\n' + p.citations.map((c) => `  "${restore(c.quote, state.vault)}" (${DOC_LABELS[c.doc]})`).join('\n') : ''))].join('\n\n') : ''

  const copy = async () => {
    await navigator.clipboard.writeText(letterText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([letterText], { type: 'text/plain' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'appeal-letter.txt' })
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!draft) {
    return (
      <div className="grid place-items-center py-10">
        <div className="w-full max-w-md space-y-3">
          {STAGES.map((s, i) => {
            const status = i < stage ? 'done' : i === stage ? 'active' : 'todo'
            return (
              <motion.div key={s.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: status === 'todo' ? 0.4 : 1, x: 0 }} transition={{ delay: i * 0.08 }} className={`flex items-center gap-3 rounded-2xl border p-4 ${status === 'active' ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200'}`}>
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${status === 'done' ? 'bg-emerald-500 text-white' : status === 'active' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {status === 'done' ? <Check className="h-4 w-4" /> : status === 'active' ? <Loader2 className="h-4 w-4 animate-spin" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip ${verifiedCount === allCites.length ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {verifiedCount === allCites.length ? <BadgeCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {verifiedCount}/{allCites.length} quotes verified
          </span>
          <span className="chip bg-slate-100 text-slate-600">
            <Sparkles className="h-3.5 w-3.5" /> {draft.source === 'llm' ? 'Drafted by cloud LLM' : 'Demo mode: template draft (no API key)'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowRedacted((v) => !v)} className="btn-ghost !px-3 !py-1.5 !text-xs">
            {showRedacted ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {showRedacted ? 'Show real names' : 'What the AI saw'}
          </button>
          <button onClick={copy} className="btn-ghost !px-3 !py-1.5 !text-xs">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy
          </button>
          <button onClick={download} className="btn-ghost !px-3 !py-1.5 !text-xs">
            <Download className="h-3.5 w-3.5" /> .txt
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="scrollbar-thin max-h-[560px] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-inner shadow-slate-100 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subject</p>
          <h3 className="mt-1 font-semibold">{show(draft.subject)}</h3>
          <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-slate-700">
            {draft.paragraphs.map((p, pi) => (
              <motion.div key={pi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.12 }}>
                <p className="whitespace-pre-line">{show(p.text)}</p>
                {p.citations.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {p.citations.map((c, ci) => {
                      const isActive = active?.p === pi && active.c === ci
                      return (
                        <button key={ci} onClick={() => setActive({ p: pi, c: ci })} className={`block w-full rounded-xl border-l-4 px-3 py-2 text-left text-[13px] transition ${isActive ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                          <span className="italic text-slate-600">“{show(c.quote)}”</span>
                          <span className="mt-1 flex items-center gap-2">
                            <span className={`chip !py-0.5 ring-1 ${DOC_COLORS[c.doc]}`}>{DOC_LABELS[c.doc]}</span>
                            {c.verified ? (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                <BadgeCheck className="h-3 w-3" /> verified in source
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                                <ShieldAlert className="h-3 w-3" /> not found, review
                              </span>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500">
            <span>Source: {sourceView ? DOC_LABELS[sourceView.doc] : 'select a quote'}</span>
            <span className="text-slate-400">click any quote</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.pre key={sourceView ? `${sourceView.doc}-${sourceView.idx}-${showRedacted}` : 'none'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scrollbar-thin max-h-[300px] flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-[11.5px] leading-relaxed text-slate-500 lg:max-h-[500px]">
              {sourceView ? (
                sourceView.idx >= 0 ? (
                  <>
                    {sourceView.text.slice(0, sourceView.idx)}
                    <mark ref={markRef} className="rounded bg-brand-200/70 px-0.5 text-slate-900 ring-2 ring-brand-300">
                      {sourceView.text.slice(sourceView.idx, sourceView.idx + sourceView.len)}
                    </mark>
                    {sourceView.text.slice(sourceView.idx + sourceView.len)}
                  </>
                ) : (
                  sourceView.text
                )
              ) : null}
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button onClick={onNext} className="btn-primary">
          Track deadlines <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
