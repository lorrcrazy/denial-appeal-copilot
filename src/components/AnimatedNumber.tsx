import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function AnimatedNumber({ value, decimals = 0, suffix = '', prefix = '', duration = 1.4 }: { value: number; decimals?: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    from.current = value
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
