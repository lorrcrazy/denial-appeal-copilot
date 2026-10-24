import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommunitySection } from './features/community/CommunitySection'
import { SEED_CARDS, type WinCard } from './features/community/seed'
import { ShareWinModal } from './features/community/ShareWinModal'
import type { SharePrefill } from './features/community/types'
import { Footer } from './features/landing/Footer'
import { Hero } from './features/landing/Hero'
import { Nav } from './features/landing/Nav'
import { Pipeline } from './features/landing/Pipeline'
import { Privacy } from './features/landing/Privacy'
import { Workspace } from './features/workspace/Workspace'

const STORAGE_KEY = 'appeal-wins:mine'

const EMPTY_PREFILL: SharePrefill = {
  insuranceType: 'Employer PPO',
  insurer: 'Peachtree Health Plan',
  condition: 'Autoimmune & GI',
  reason: 'Step therapy',
  service: 'Biologic drug',
  tactic: 'Documented a failed prior treatment',
  story: '',
  knownNames: [],
}

export default function App() {
  const [mine, setMine] = useState<WinCard[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as WinCard[]
    } catch {
      return []
    }
  })
  const [prefill, setPrefill] = useState<SharePrefill | null>(null)
  const [toast, setToast] = useState(false)

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(mine)), [mine])

  const post = (card: WinCard) => {
    setMine((m) => [card, ...m])
    setPrefill(null)
    setToast(true)
    setTimeout(() => setToast(false), 3200)
    setTimeout(() => document.getElementById('wins')?.scrollIntoView({ behavior: 'smooth' }), 200)
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Pipeline />
        <Workspace cards={[...mine, ...SEED_CARDS]} onShare={setPrefill} />
        <CommunitySection cards={[...mine, ...SEED_CARDS]} onShare={() => setPrefill(EMPTY_PREFILL)} />
        <Privacy />
      </main>
      <Footer />
      <ShareWinModal prefill={prefill} onClose={() => setPrefill(null)} onPost={post} />
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-medium text-white shadow-2xl">
            <BadgeCheck className="h-4 w-4 text-emerald-400" /> Posted anonymously. Thanks for helping the next person.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
