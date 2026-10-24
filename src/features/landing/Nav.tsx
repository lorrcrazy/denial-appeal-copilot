import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Logo } from '../../components/Logo'

const LINKS = [
  ['How it works', '#how'],
  ['Copilot', '#copilot'],
  ['Appeal Wins', '#wins'],
  ['Privacy', '#privacy'],
]

export function Nav() {
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 80], ['rgba(5,11,24,0)', 'rgba(5,11,24,0.78)'])
  const border = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)'])
  return (
    <motion.header style={{ backgroundColor: bg, borderColor: border }} className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo dark />
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-300 transition hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <a href="#copilot" className="btn-primary !px-4 !py-2">
          Try it <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.header>
  )
}
