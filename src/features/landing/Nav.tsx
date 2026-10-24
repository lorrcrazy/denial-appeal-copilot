import { motion, useScroll, useTransform } from 'framer-motion'
import { Logo } from '../../components/Logo'

const LINKS = [
  ['How it works', '#how'],
  ['Try it', '#copilot'],
  ['Case agent', '#agent'],
  ['Stories', '#wins'],
  ['Privacy', '#privacy'],
]

export function Nav() {
  const { scrollY } = useScroll()
  const border = useTransform(scrollY, [0, 60], ['rgba(31,27,22,0)', 'rgba(31,27,22,0.1)'])
  return (
    <motion.header style={{ borderColor: border }} className="fixed inset-x-0 top-0 z-50 border-b bg-paper-50/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-[15px] text-ink-700 underline-offset-4 transition hover:text-ink-950 hover:underline">
              {label}
            </a>
          ))}
        </nav>
        <a href="#copilot" className="btn-primary !px-4 !py-2 !text-sm">
          Start an appeal
        </a>
      </div>
    </motion.header>
  )
}
