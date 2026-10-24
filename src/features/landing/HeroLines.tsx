const PATHS = [
  'M-50 520 C 250 520, 380 300, 720 330 S 1150 160, 1500 120',
  'M-50 600 C 300 560, 420 420, 760 420 S 1180 300, 1500 260',
  'M-50 680 C 260 650, 520 520, 820 500 S 1200 420, 1500 400',
  'M-50 440 C 200 460, 360 220, 640 240 S 1100 60, 1500 40',
]

export function HeroLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="hl" x1="0" x2="1">
          <stop offset="0" stopColor="#2DD4BF" stopOpacity="0" />
          <stop offset=".35" stopColor="#2DD4BF" stopOpacity=".7" />
          <stop offset=".75" stopColor="#38BDF8" stopOpacity=".6" />
          <stop offset="1" stopColor="#818CF8" stopOpacity="0" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {PATHS.map((d, i) => (
        <g key={d}>
          <path d={d} stroke="url(#hl)" strokeWidth="1.2" fill="none" opacity={0.5} />
          <path d={d} stroke="url(#hl)" strokeWidth="2" fill="none" strokeDasharray="2 18" className="animate-dash" style={{ animationDuration: `${1.4 + i * 0.4}s` }} />
          {[0, 1].map((k) => (
            <circle key={k} r={k ? 2.5 : 3.5} fill={k ? '#A5B4FC' : '#5EEAD4'} filter="url(#glow)">
              <animateMotion dur={`${6 + i * 1.5}s`} begin={`${i * 0.9 + k * 3}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
        </g>
      ))}
    </svg>
  )
}
