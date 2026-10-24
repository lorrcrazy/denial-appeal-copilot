export function FlowConnector({ vertical = false, delay = 0 }: { vertical?: boolean; delay?: number }) {
  const id = `fc-${vertical ? 'v' : 'h'}-${delay}`
  const d = vertical ? 'M10 0 L10 60' : 'M0 10 L100 10'
  return (
    <svg viewBox={vertical ? '0 0 20 60' : '0 0 100 20'} preserveAspectRatio="none" className={vertical ? 'h-12 w-5' : 'h-5 w-full'} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
          <stop offset="0" stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <path d={d} stroke="rgba(255,255,255,.12)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
      <path d={d} stroke={`url(#${id})`} strokeWidth="2" fill="none" strokeDasharray="6 14" className="animate-dash" vectorEffect="non-scaling-stroke" style={{ animationDelay: `${delay}s` }} />
      <circle r="3" fill="#5EEAD4">
        <animateMotion dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" path={d} />
      </circle>
    </svg>
  )
}
