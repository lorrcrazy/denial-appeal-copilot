import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const RULES = [
  ['Your details are hidden before anything is sent.', 'Names, IDs, addresses and dates are swapped out in your browser.'],
  ['You see your story before anyone else does.', 'Every shared win shows a preview with the removed parts marked.'],
  ['No real names, ever.', 'You get a random handle. Doctors and staff are never named.'],
  ['Small groups stay hidden.', 'We only show a number when at least five people are in the group.'],
  ['Dates get fuzzy on purpose.', '"Nov 12, 2026" becomes "Q4 2026" so nobody can be pinpointed.'],
  ['Rare conditions are grouped.', 'Cards say "Autoimmune & GI", never a specific rare diagnosis.'],
]

export function Privacy() {
  return (
    <section id="privacy" className="py-24 sm:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <motion.figure initial={{ opacity: 0, rotate: 0 }} whileInView={{ opacity: 1, rotate: -2 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} className="relative mx-auto w-full max-w-md bg-white p-3 pb-12 shadow-paper">
          <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[3deg] bg-marker/70" />
          <img src="/img/privacy.webp" alt="An older couple sitting together on a porch" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          <figcaption className="absolute bottom-3 left-0 right-0 text-center font-hand text-xl text-ink-700">health stuff is personal. we get it.</figcaption>
        </motion.figure>
        <div>
          <p className="eyebrow">privacy</p>
          <h2 className="mt-1 font-serif text-[34px] font-medium leading-[1.1] tracking-tight sm:text-[44px]">Sharing what worked shouldn't mean sharing who you are</h2>
          <p className="mt-4 text-lg text-ink-700">This demo only uses made-up letters and people. The rules below are built into the code, not tucked away in a policy page.</p>
          <ul className="mt-8 space-y-5">
            {RULES.map(([t, b], i) => (
              <motion.li key={t} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }} className="flex gap-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-brand-600" strokeWidth={3} />
                <p className="text-[16px] leading-relaxed text-ink-700">
                  <span className="font-bold text-ink-950">{t}</span> {b}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
