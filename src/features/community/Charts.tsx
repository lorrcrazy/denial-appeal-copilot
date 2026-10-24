import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WinCard } from './seed'
import { quarterSeries, reasonBreakdown } from './stats'

const tooltipStyle = { borderRadius: 12, border: '1px solid #DEDEDB', boxShadow: '0 8px 24px -8px rgba(15,23,42,.2)', fontSize: 12 }

export function WinRateChart({ cards }: { cards: WinCard[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const data = quarterSeries(cards)
  return (
    <div ref={ref} className="h-64 w-full">
      {inView && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="gAll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#9AA6A6" stopOpacity={0.35} />
                <stop offset="1" stopColor="#9AA6A6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCited" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#C4603F" stopOpacity={0.45} />
                <stop offset="1" stopColor="#C4603F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ECECEA" />
            <XAxis dataKey="quarter" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#55555B' }} />
            <YAxis yAxisId="r" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#55555B' }} unit="%" />
            <YAxis yAxisId="n" orientation="right" hide />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => (name === 'shared' ? [v, 'Cards shared'] : [`${v}%`, name === 'winRate' ? 'All appeals' : 'Cited policy or evidence'])} />
            <Bar yAxisId="n" dataKey="shared" fill="#DEDEDB" radius={[6, 6, 0, 0]} barSize={18} animationDuration={1200} />
            <Area yAxisId="r" type="monotone" dataKey="winRate" stroke="#9AA6A6" strokeWidth={2.5} fill="url(#gAll)" connectNulls animationDuration={1800} dot={false} />
            <Area yAxisId="r" type="monotone" dataKey="citedWinRate" stroke="#C4603F" strokeWidth={2.5} fill="url(#gCited)" connectNulls animationDuration={2200} dot={{ r: 3, fill: '#C4603F', strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const BAR_COLORS = ['#C4603F', '#3C4748', '#525F60', '#6F7D7D', '#9AA6A6', '#B5BDBD', '#C9C9C5']

export function ReasonChart({ cards }: { cards: WinCard[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const data = reasonBreakdown(cards).filter((d) => d.winRate != null)
  return (
    <div ref={ref} className="h-64 w-full">
      {inView && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="reason" width={128} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
            <Tooltip cursor={{ fill: '#F6F6F5' }} contentStyle={tooltipStyle} formatter={(v, _n, item) => [`${v}% won (n=${(item?.payload as { n?: number } | undefined)?.n ?? '?'})`, 'Win rate']} />
            <Bar dataKey="winRate" radius={[0, 8, 8, 0]} barSize={16} animationDuration={1400} label={{ position: 'right', fontSize: 11, fill: '#64748B', formatter: (v: unknown) => `${v}%` }}>
              {data.map((d, i) => (
                <Cell key={d.reason} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
