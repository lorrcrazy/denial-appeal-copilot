import { motion } from 'framer-motion'

const STEPS = [
  { title: 'Add your letter', body: 'Paste or upload the denial, your doctor\'s notes, and the plan policy if you have it.', note: 'Jordan Rivera, ID PHP-883-20417' },
  { title: 'We hide your details', body: 'Names, member IDs, birthdays and addresses are swapped for placeholders right in your browser.', note: '[PATIENT_1], ID [ID_1]' },
  { title: 'The draft gets written', body: 'An AI writer only ever sees the placeholders. It has to quote your documents word for word.', note: '"…per Section 5.1…"' },
  { title: 'We check every quote', body: 'Each quote is matched against what you uploaded. If it isn\'t in your papers, it doesn\'t go in the letter.', note: '4 of 4 quotes found' },
  { title: 'Your name goes back in', body: 'Real details are filled back in on your device. You read it, edit it, and send it.', note: 'Jordan Rivera, ID PHP-883-20417' },
]

export function Pipeline() {
  return (
    <section id="how" className="relative border-y border-paper-200 bg-paper-100 py-24 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">how it works</p>
          <h2 className="mt-1 font-serif text-[34px] font-medium leading-[1.1] tracking-tight sm:text-[44px]">Five steps, and your name stays with you the whole way</h2>
        </div>

        <div className="relative mt-14">
          <svg className="pointer-events-none absolute left-[20px] top-0 hidden h-10 w-[80%] lg:block" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden>
            <motion.path
              d="M 0 20 C 60 4, 120 36, 250 20 S 420 6, 500 20 S 680 34, 750 20 S 900 8, 1000 20"
              fill="none"
              stroke="#C4603F"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
          </svg>
          <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((s, i) => (
              <motion.li key={s.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: 0.25 + i * 0.25, duration: 0.5 }} className="relative flex gap-4 lg:block">
                <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-serif text-lg font-semibold ${i === 2 ? 'border-clay-500 bg-clay-50 text-clay-700' : 'border-brand-600 bg-paper-50 text-brand-700'}`}>{i + 1}</span>
                <div className="lg:mt-5">
                  <p className="font-hand text-lg leading-none text-ink-700/70">{i === 2 ? 'in the cloud' : 'on your computer'}</p>
                  <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{s.body}</p>
                  <p className="mt-3 inline-block border-l-2 border-clay-300 pl-2.5 font-mono text-xs text-ink-800">{s.note}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
