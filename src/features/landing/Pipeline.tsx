import { motion } from 'framer-motion'
import { BadgeCheck, Cloud, FileText, ShieldCheck, UserCheck } from 'lucide-react'
import { Fragment } from 'react'
import { FlowConnector } from '../../components/FlowConnector'
import { SectionHeading } from '../../components/SectionHeading'

const STEPS = [
  { icon: FileText, title: 'Upload', body: 'Denial letter, records, plan policy.', sample: 'Jordan Rivera, ID PHP-883-20417', zone: 'device' },
  { icon: ShieldCheck, title: 'Redact locally', body: 'Names, IDs, dates swapped for placeholders.', sample: '[PATIENT_1], ID [ID_1]', zone: 'device' },
  { icon: Cloud, title: 'LLM drafts', body: 'Cloud model only ever sees placeholders.', sample: '"…per Section 3.2…"', zone: 'cloud' },
  { icon: BadgeCheck, title: 'Verify quotes', body: 'Every citation matched to your documents.', sample: '4 / 4 quotes verified', zone: 'device' },
  { icon: UserCheck, title: 'Restore names', body: 'Real details put back on your device.', sample: 'Jordan Rivera, ID PHP-883-20417', zone: 'device' },
] as const

export function Pipeline() {
  return (
    <section id="how" className="relative overflow-hidden bg-ink-950 py-24 text-white sm:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
      <div className="container-x relative">
        <SectionHeading
          dark
          center
          eyebrow="How it works"
          title={
            <>
              Your data takes the <span className="font-serif font-normal italic text-gradient">scenic route</span>
            </>
          }
          sub="Personal details are stripped before anything leaves your browser, and put back only after the draft comes home."
        />

        <div className="mt-16 flex flex-col items-center lg:flex-row lg:items-stretch">
          {STEPS.map((s, i) => (
            <Fragment key={s.title}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative w-full max-w-xs rounded-3xl p-5 lg:max-w-none lg:flex-1 ${s.zone === 'cloud' ? 'border border-indigo-400/30 bg-indigo-500/10' : 'glass'}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl ${s.zone === 'cloud' ? 'bg-indigo-400/20 text-indigo-200' : 'bg-brand-400/15 text-brand-300'}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`chip ${s.zone === 'cloud' ? 'bg-indigo-400/15 text-indigo-200' : 'bg-white/5 text-slate-300'}`}>{s.zone === 'cloud' ? 'Cloud' : 'On device'}</span>
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{s.body}</p>
                <div className="mt-4 truncate rounded-xl bg-black/30 px-3 py-2 font-mono text-[11px] text-brand-200">{s.sample}</div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="flex shrink-0 items-center justify-center lg:w-10">
                  <div className="lg:hidden">
                    <FlowConnector vertical delay={i * 0.3} />
                  </div>
                  <div className="hidden w-full lg:block">
                    <FlowConnector delay={i * 0.3} />
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
