import { motion } from 'framer-motion'
import { ArrowRight, FileUp, HeartPulse, Pill, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { SAMPLE_CASES, type SampleCase } from '../../data/samples'
import { DOC_LABELS, type CaseDocs, type DocKind } from '../../lib/types'

const ICONS = { biologic: Pill, er: HeartPulse, mri: ScanLine } as Record<string, typeof Pill>

export function UploadPanel({ onAnalyze }: { onAnalyze: (docs: CaseDocs, sample?: SampleCase) => void }) {
  const [selected, setSelected] = useState(SAMPLE_CASES[0].id)
  const [custom, setCustom] = useState<CaseDocs>({ denial: '', records: '', policy: '' })
  const [mode, setMode] = useState<'sample' | 'custom'>('sample')
  const sample = SAMPLE_CASES.find((s) => s.id === selected)!

  const readFile = async (kind: DocKind, file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    setCustom((c) => ({ ...c, [kind]: text }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <div className="inline-flex rounded-full bg-stone-100 p-1 text-sm font-medium">
          {(['sample', 'custom'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`relative rounded-full px-4 py-1.5 transition ${mode === m ? 'text-stone-900' : 'text-stone-500'}`}>
              {mode === m && <motion.span layoutId="mode" className="absolute inset-0 rounded-full bg-white shadow" />}
              <span className="relative">{m === 'sample' ? 'Sample cases' : 'Your own files'}</span>
            </button>
          ))}
        </div>

        {mode === 'sample' ? (
          <div className="mt-5 space-y-3">
            {SAMPLE_CASES.map((s) => {
              const Icon = ICONS[s.id] ?? Pill
              const active = s.id === selected
              return (
                <button key={s.id} onClick={() => setSelected(s.id)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? 'border-brand-400 bg-brand-50/60 ring-4 ring-brand-100' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}>
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${active ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-stone-500">{s.subtitle}</p>
                  </div>
                </button>
              )
            })}
            <p className="pt-1 text-xs text-stone-400">All sample letters and people are synthetic.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {(Object.keys(DOC_LABELS) as DocKind[]).map((k) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium">{DOC_LABELS[k]}</label>
                  <label className="flex cursor-pointer items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                    <FileUp className="h-3.5 w-3.5" /> .txt file
                    <input type="file" accept=".txt,.md,text/plain" className="hidden" onChange={(e) => readFile(k, e.target.files?.[0])} />
                  </label>
                </div>
                <textarea value={custom[k]} onChange={(e) => setCustom((c) => ({ ...c, [k]: e.target.value }))} rows={3} placeholder={`Paste the ${DOC_LABELS[k].toLowerCase()}…`} className="field resize-none font-mono text-xs" />
              </div>
            ))}
            <p className="text-xs text-stone-400">Demo only: please use synthetic text, not real medical records.</p>
          </div>
        )}

        <button
          onClick={() => (mode === 'sample' ? onAnalyze(sample.docs, sample) : onAnalyze(custom))}
          disabled={mode === 'custom' && !custom.denial.trim()}
          className="btn-primary mt-6 w-full !py-3 sm:w-auto"
        >
          Analyze denial <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
        <div className="flex items-center gap-2 border-b border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-500">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2">{mode === 'sample' ? 'denial-letter.txt' : 'preview'}</span>
        </div>
        <motion.pre key={selected + mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="scrollbar-thin max-h-[420px] overflow-auto whitespace-pre-wrap p-5 font-mono text-[11.5px] leading-relaxed text-stone-600">
          {mode === 'sample' ? sample.docs.denial : custom.denial || 'Your denial letter will show here.'}
        </motion.pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white" />
      </div>
    </div>
  )
}
