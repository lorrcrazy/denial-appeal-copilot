import type { DenialReason, InsuranceType } from '../../lib/types'
import { QUARTERS, type WinCard } from './seed'

export const MIN_GROUP = 5

export const isWin = (c: WinCard) => c.outcome !== 'Upheld'

export interface GroupStats {
  n: number
  winRate: number | null
  topTactic: { tactic: string; winRate: number; n: number } | null
}

export function groupStats(cards: WinCard[]): GroupStats {
  const n = cards.length
  if (n < MIN_GROUP) return { n, winRate: null, topTactic: null }
  const byTactic = new Map<string, WinCard[]>()
  for (const c of cards) byTactic.set(c.tactic, [...(byTactic.get(c.tactic) ?? []), c])
  const wins = cards.filter(isWin)
  let topTactic: GroupStats['topTactic'] = null
  for (const [tactic, group] of byTactic) {
    const w = group.filter(isWin).length
    if (!topTactic || w > topTactic.n * (topTactic.winRate / 100)) {
      topTactic = { tactic, n: group.length, winRate: Math.round((w / group.length) * 100) }
    }
  }
  if (topTactic && topTactic.n < MIN_GROUP) {
    const wonWith = wins.filter((c) => c.tactic === topTactic!.tactic).length
    topTactic = { ...topTactic, winRate: Math.round((wonWith / Math.max(wins.length, 1)) * 100) }
  }
  return { n, winRate: Math.round((wins.length / n) * 100), topTactic }
}

export interface Insight {
  scope: string
  stats: GroupStats
}

export function peopleLikeYou(cards: WinCard[], reason: DenialReason, type: InsuranceType): Insight | null {
  const tiers: [string, WinCard[]][] = [
    [`${type} members denied for ${reason.toLowerCase()}`, cards.filter((c) => c.reason === reason && c.insuranceType === type)],
    [`people denied for ${reason.toLowerCase()}`, cards.filter((c) => c.reason === reason)],
  ]
  for (const [scope, group] of tiers) {
    const stats = groupStats(group)
    if (stats.winRate != null) return { scope, stats }
  }
  return null
}

export function quarterSeries(cards: WinCard[]) {
  return QUARTERS.map((q) => {
    const group = cards.filter((c) => c.quarter === q)
    const cited = group.filter((c) => /policy language|failed prior|red-flag|No Surprises|criteria/.test(c.tactic))
    const s = groupStats(group)
    const sc = groupStats(cited)
    return { quarter: q.replace(' 20', " '"), shared: group.length, winRate: s.winRate, citedWinRate: sc.winRate }
  })
}

export function reasonBreakdown(cards: WinCard[]) {
  const reasons = [...new Set(cards.map((c) => c.reason))]
  return reasons
    .map((reason) => {
      const s = groupStats(cards.filter((c) => c.reason === reason))
      return { reason, n: s.n, winRate: s.winRate }
    })
    .sort((a, b) => (b.winRate ?? -1) - (a.winRate ?? -1))
}
