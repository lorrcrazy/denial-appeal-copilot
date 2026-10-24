import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { KFF } from '../../data/credits'

const SWAPS: [string, string][] = [
  ['Jordan Rivera', '[PATIENT_1]'],
  ['PHP-883-20417', '[ID_1]'],
  ['03/14/1998', '[DOB]'],
]

function Swap({ i, on }: { i: number; on: boolean }) {
  const [orig, ph] = SWAPS[i]
  return (
    <span className="relative inline-block min-w-[9ch] align-baseline">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={on ? 'ph' : 'orig'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className={on ? 'ph' : ''}>
          {on ? ph : orig}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function LetterCard() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1100)
    return () => clearInterval(t)
  }, [])
  const on = (i: number) => step > i && step < 7
  return (
    <div className="relative rotate-[-1.5deg] rounded-sm bg-white p-6 font-mono text-[12.5px] leading-[1.75] text-ink-800 shadow-paper sm:p-8 sm:text-[13px]">
      <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-ink-700/70">Peachtree Health Plan</p>
      <p className="mt-4">
        Member: <Swap i={0} on={on(0)} />
      </p>
      <p>
        Member ID: <Swap i={1} on={on(1)} />
      </p>
      <p>
        Date of birth: <Swap i={2} on={on(2)} />
      </p>
      <p className="mt-4">
        We reviewed the request for Humira and have denied coverage.{' '}
        <span className="hl text-ink-950">The records provided do not show a trial and failure of a conventional immunomodulator for at least 12 weeks.</span>
      </p>
      <p className="mt-4 text-ink-700/80">You may request an internal appeal within 180 days of the date of this letter.</p>
      <div className="absolute -bottom-3 right-6 rotate-[2deg] rounded-sm bg-ink-950 px-2.5 py-1 font-sans text-[11px] font-bold text-paper-50">{step > 0 && step < 7 ? 'Names swapped out before anything is sent' : 'Your letter, as written'}</div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="font-hand text-[26px] leading-none text-clay-600">
            for anyone holding a denial letter right now
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="mt-4 font-serif text-[44px] font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-[68px]">
            Your insurance said no. <span className="hl italic">That's usually not the last word.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700 sm:text-xl">
            Fewer than 1 in 100 denied claims ever get appealed. Of the ones that do, {100 - KFF.upheld}% get overturned. We'll help you read the letter, write the appeal in your plan's own words, and see what worked for people in the same spot.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#copilot" className="btn-primary !px-6 !py-3 !text-base">
              Try it with a sample letter <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#agent" className="btn-ghost !px-6 !py-3 !text-base">
              Let the case agent do it
            </a>
          </motion.div>
          <p className="mt-6 text-sm text-ink-700/70">
            Numbers from{' '}
            <a href={KFF.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink-950">
              {KFF.label}
            </a>
            . Free, and your name never leaves your computer.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }} className="relative mx-auto w-full max-w-[500px] pb-10">
          <figure className="ml-auto w-[78%] rotate-[2.5deg] bg-white p-2.5 pb-10 shadow-paper">
            <img src="/img/hero.webp" alt="A grandmother and her granddaughter smiling together" className="aspect-[4/5] w-full object-cover object-[30%_20%]" />
            <figcaption className="absolute bottom-2.5 left-0 right-0 text-center font-hand text-xl text-ink-700">you don't have to figure it out alone</figcaption>
          </figure>
          <div className="absolute -left-2 top-[38%] w-[86%] sm:-left-10">
            <LetterCard />
          </div>
          <div className="absolute -top-4 left-2 hidden w-40 rotate-[-6deg] bg-marker p-3 font-hand text-[22px] leading-tight text-ink-900 shadow-card sm:block">
            180 days to appeal. You have time.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
