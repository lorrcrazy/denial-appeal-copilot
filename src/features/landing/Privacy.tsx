import { motion } from 'framer-motion'
import { CalendarRange, EyeOff, Fingerprint, Layers, ShieldCheck, Users } from 'lucide-react'
import { SectionHeading } from '../../components/SectionHeading'

const RULES = [
  { icon: ShieldCheck, title: 'Redacted before it leaves', body: 'Names, IDs, addresses and dates are swapped for placeholders in your browser.' },
  { icon: EyeOff, title: 'Preview before you post', body: 'Every Appeal Win shows exactly what will be public, with redactions highlighted.' },
  { icon: Fingerprint, title: 'Anonymous handles only', body: 'No real names on cards. Clinicians and staff are never named.' },
  { icon: Users, title: 'Groups of 5 or more', body: 'Stats only appear when at least five people share the same filter.' },
  { icon: CalendarRange, title: 'Dates become quarters', body: '"Nov 12, 2026" turns into "Q4 2026" so nobody can be pinpointed.' },
  { icon: Layers, title: 'Rare conditions grouped', body: 'Conditions are broad buckets, never a specific rare diagnosis.' },
]

export function Privacy() {
  return (
    <section id="privacy" className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative">
          <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/20">
            <img src="/img/exam-room.webp" alt="Modern medical examination room" loading="lazy" className="aspect-[4/3] w-full animate-kenburns object-cover" />
          </div>
          <div className="glass-light absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl p-4 shadow-xl sm:right-10">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">PHI stays local</p>
              <p className="text-xs text-slate-500">The LLM sees placeholders only</p>
            </div>
          </div>
        </motion.div>
        <div>
          <SectionHeading eyebrow="Privacy by design" title="Built so sharing a win never exposes you" sub="Synthetic data only in this demo. These rules are enforced in code, not just in a policy page." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {RULES.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }} className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <r.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{r.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
