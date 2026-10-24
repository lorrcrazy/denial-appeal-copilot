import { motion } from 'framer-motion'
import { CalendarPlus, Check, Clock, Flag, Hourglass, PartyPopper } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Decoded } from '../decoder/decode'
import { buildTimeline, toIcs, type Milestone } from './deadlines'

const CHECKLIST = ['Copy of the denial letter', 'Full claim file from the plan', 'Letter of medical necessity', 'Relevant chart notes and test results', 'Plan policy / clinical criteria', 'Signed appeal letter']

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function relative(d: Date, today: Date) {
  const days = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (days === 0) return 'today'
  return days > 0 ? `in ${days} days` : `${-days} days ago`
}

const KIND_STYLE: Record<Milestone['kind'], { icon: typeof Clock; color: string }> = {
  task: { icon: Check, color: 'bg-brand-500' },
  deadline: { icon: Flag, color: 'bg-rose-500' },
  wait: { icon: Hourglass, color: 'bg-clay-500' },
}

export function DeadlinePanel({ decoded, onShare }: { decoded: Decoded; onShare: () => void }) {
  const [today] = useState(() => new Date())
  const timeline = useMemo(() => buildTimeline(decoded, today), [decoded, today])
  const [checked, setChecked] = useState<Set<number>>(new Set([0]))
  const internal = timeline.find((m) => m.id === 'internal')?.date
  const daysLeft = internal ? Math.round((internal.getTime() - today.getTime()) / 86400000) : null

  const downloadIcs = () => {
    const url = URL.createObjectURL(new Blob([toIcs(timeline)], { type: 'text/calendar' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'appeal-deadlines.ics' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-2xl border border-stone-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Internal appeal deadline</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{internal ? fmt(internal) : '—'}</p>
            {daysLeft != null && <p className={`text-sm font-medium ${daysLeft < 30 ? 'text-rose-600' : 'text-emerald-600'}`}>{daysLeft >= 0 ? `${daysLeft} days left` : 'Deadline passed: ask about late-filing exceptions'}</p>}
          </div>
          <button onClick={downloadIcs} className="btn-dark !py-2 !text-xs">
            <CalendarPlus className="h-4 w-4" /> Add reminders (.ics)
          </button>
        </div>

        <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-stone-200">
          {timeline.map((m, i) => {
            const s = KIND_STYLE[m.kind]
            const past = m.date ? m.date < today : false
            return (
              <motion.li key={m.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative flex gap-4 pl-0">
                <div className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ring-4 ring-white ${past ? 'bg-stone-300' : s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className={`font-semibold ${past ? 'text-stone-400' : ''}`}>{m.title}</p>
                    {m.date && (
                      <p className="text-xs tabular-nums text-stone-500">
                        {fmt(m.date)} · <span className={past ? '' : 'font-medium text-stone-700'}>{relative(m.date, today)}</span>
                      </p>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-stone-500">{m.detail}</p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-5">
        <div className="relative overflow-hidden rounded-2xl">
          <img src="/img/packet.webp" alt="Three generations of a family with a new baby" loading="lazy" className="h-40 w-full object-cover" />
          <div className="absolute inset-0 bg-ink-950/35" />
          <p className="absolute bottom-3 left-4 right-4 text-sm font-semibold text-white">Your appeal packet</p>
        </div>
        <div className="rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Checklist</p>
            <p className="text-xs tabular-nums text-stone-500">
              {checked.size}/{CHECKLIST.length}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
            <motion.div className="h-full rounded-full bg-brand-500" animate={{ width: `${(checked.size / CHECKLIST.length) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {CHECKLIST.map((item, i) => {
              const on = checked.has(i)
              return (
                <li key={item}>
                  <button
                    onClick={() =>
                      setChecked((s) => {
                        const n = new Set(s)
                        if (on) n.delete(i)
                        else n.add(i)
                        return n
                      })
                    }
                    className="flex w-full items-center gap-3 text-left text-sm"
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${on ? 'border-brand-500 bg-brand-500 text-white' : 'border-stone-300'}`}>{on && <Check className="h-3.5 w-3.5" />}</span>
                    <span className={on ? 'text-stone-400 line-through' : 'text-stone-700'}>{item}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <button onClick={onShare} className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-clay-300 bg-clay-50 p-5 text-left text-ink-950">
          <PartyPopper className="h-6 w-6" />
          <p className="mt-2 font-semibold">Won your appeal? Share the win</p>
          <p className="text-sm text-ink-700">We strip out anything that could identify you, and show you a preview first.</p>
        </button>
      </div>
    </div>
  )
}
