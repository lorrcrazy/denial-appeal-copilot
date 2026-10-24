import { motion } from 'framer-motion'
import { AnimatedNumber } from '../../components/AnimatedNumber'

export function OddsGauge({ score }: { score: number }) {
  const r = 80
  const c = Math.PI * r
  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <svg viewBox="0 0 200 116" className="w-full">
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0" stopColor="#C9C9C5" />
            <stop offset=".5" stopColor="#4CA4B2" />
            <stop offset="1" stopColor="#1A5966" />
          </linearGradient>
        </defs>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#ECECEA" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gauge)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="text-5xl font-extrabold tracking-tight">
          <AnimatedNumber value={score} suffix="%" />
        </p>
      </div>
    </div>
  )
}
