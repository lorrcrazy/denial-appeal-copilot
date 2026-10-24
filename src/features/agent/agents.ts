import type { DocKind } from '../../lib/types'
import { mockDraft, verifyCitations } from '../appeal/draft'
import { groupStats, reasonBreakdown } from '../community/stats'
import type { WinCard } from '../community/seed'
import { addDays, buildTimeline } from '../deadlines/deadlines'
import { findSentence, sentences } from '../decoder/decode'
import type { CaseState } from '../workspace/useCase'

export type AgentId = 'intake' | 'organizer' | 'policy' | 'evidence' | 'drafter' | 'tracker' | 'submit' | 'outcome'

export interface AgentDef {
  id: AgentId
  name: string
  verb: string
  where: 'device' | 'cloud'
}

export const AGENTS: AgentDef[] = [
  { id: 'intake', name: 'Denial intake', verb: 'Reading the denial letter', where: 'device' },
  { id: 'organizer', name: 'Case organizer', verb: 'Building a timeline and checking for missing records', where: 'device' },
  { id: 'policy', name: 'Policy researcher', verb: 'Finding the plan language that applies', where: 'device' },
  { id: 'evidence', name: 'Clinical evidence', verb: 'Pulling the chart notes that answer the denial', where: 'device' },
  { id: 'drafter', name: 'Appeal drafter', verb: 'Writing the appeal from placeholders only', where: 'cloud' },
  { id: 'tracker', name: 'Deadline tracker', verb: 'Working out deadlines and the packet', where: 'device' },
  { id: 'submit', name: 'Submission & follow-up', verb: 'Submitting and scheduling follow-ups', where: 'cloud' },
  { id: 'outcome', name: 'Outcome analyst', verb: 'Comparing against shared outcomes', where: 'device' },
]

export interface AgentResult {
  summary: string
  fields?: { label: string; value: string }[]
  checklist?: { label: string; ok: boolean; note: string }[]
  quotes?: { doc: DocKind; text: string; note?: string }[]
  bullets?: string[]
  flag?: string
}

export interface AgentContext {
  state: CaseState
  cards: WinCard[]
  today: Date
  authorized: boolean
}

const fmt = (d: Date | null) => (d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not stated')
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000)
const DATE_RE = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? \d{1,2},? \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i

const field = (text: string, labels: RegExp) => text.match(labels)?.[1]?.trim() ?? null

const NEEDS: Record<string, [string, RegExp][]> = {
  'Step therapy': [
    ['Proof you tried the cheaper drug first', /azathioprine|tried|trial of|failed/i],
    ['Why it stopped working or was stopped', /fail|discontinu|side effect|intoleran|inadequate/i],
    ['How long you were on it', /\d+ weeks/i],
  ],
  'Out-of-network': [
    ['Your symptoms when you went in', /chest pain|severe|shortness of breath/i],
    ['Why this was the nearest ER', /nearest|closest|ambulance/i],
    ['Final diagnosis from the visit', /diagnos/i],
  ],
  'Prior authorization': [
    ['Treatment you already tried', /physical therapy|completed \d+ weeks|conservative/i],
    ['Red-flag symptoms', /foot drop|weakness|progressive|numbness/i],
    ['Doctor saying it is urgent', /urgent|expedit/i],
  ],
}

export function runAgent(id: AgentId, { state, cards, today, authorized }: AgentContext): AgentResult {
  const { docs, decoded } = state
  const deadline = decoded.letterDate ? addDays(decoded.letterDate, decoded.appealWindowDays ?? 180) : null

  switch (id) {
    case 'intake': {
      const claim = field(docs.denial, /(?:claim|reference|case|authorization)\s*(?:number|no\.?|#)\s*:\s*(\S+)/i)
      return {
        summary: `${decoded.insurer} denied ${decoded.service.toLowerCase()} for ${decoded.reason.toLowerCase()}.`,
        fields: [
          { label: 'Insurer', value: decoded.insurer },
          { label: 'Plan', value: decoded.plan },
          { label: 'Service', value: decoded.service },
          { label: 'Denial reason', value: decoded.reason },
          { label: 'Claim / reference #', value: claim ?? 'Not found' },
          { label: 'Letter date', value: fmt(decoded.letterDate) },
          { label: 'Appeal deadline', value: deadline ? `${fmt(deadline)} (${decoded.appealWindowDays ?? 180} days)` : 'Ask the plan' },
          ...(decoded.billed ? [{ label: 'Amount at stake', value: decoded.billed }] : []),
        ],
        quotes: [{ doc: 'denial', text: decoded.reasonSentence, note: 'The reason, in their words' }],
      }
    }
    case 'organizer': {
      const events = sentences(docs.records).filter((s) => DATE_RE.test(s) && !/patient:|DOB|MRN|member id/i.test(s)).slice(0, 4)
      const needs = NEEDS[decoded.reason] ?? [['Doctor explaining why this is medically necessary', /medically necessary|recommend/i]]
      const checklist = [
        ...needs.map(([label, re]) => ({ label, ok: re.test(docs.records), note: re.test(docs.records) ? 'Found in your records' : 'Missing, ask your doctor' })),
        { label: 'Letter of medical necessity', ok: /letter of medical necessity/i.test(docs.records), note: /letter of medical necessity/i.test(docs.records) ? 'Found' : 'Request from your doctor' },
        { label: 'Full claim file from the plan', ok: false, note: 'Request from the plan (free by law)' },
      ]
      const missing = checklist.filter((c) => !c.ok).length
      return {
        summary: `${events.length} dated events found. ${missing} item${missing === 1 ? '' : 's'} to request.`,
        bullets: events.map((e) => e.replace(/\s+/g, ' ')),
        checklist,
      }
    }
    case 'policy': {
      const rule = findSentence(docs.policy, decoded.profile.policyCues)
      const exception = sentences(docs.policy).find((x) => x !== rule && x.length > 50 && decoded.profile.exceptionCues.some((re) => re.test(x))) ?? null
      const quotes = [rule && { doc: 'policy' as DocKind, text: rule, note: 'The rule they used' }, exception && { doc: 'policy' as DocKind, text: exception, note: 'Where your case may fit' }].filter(Boolean) as AgentResult['quotes']
      return {
        summary: quotes?.length ? `Found ${quotes.length} passage${quotes.length === 1 ? '' : 's'} in the plan policy worth quoting.` : 'No matching plan language found. Ask the plan for the criteria they used.',
        quotes,
        bullets: [decoded.profile.argument],
      }
    }
    case 'evidence': {
      const rationale = findSentence(docs.records, [/medically necessary|recommend|indicated|urgent/i], decoded.evidence)
      return {
        summary: `${decoded.evidence.length + (rationale ? 1 : 0)} lines from your records answer the denial.`,
        quotes: [...decoded.evidence.map((e) => ({ doc: 'records' as DocKind, text: e })), ...(rationale ? [{ doc: 'records' as DocKind, text: rationale, note: 'Your doctor\'s reasoning' }] : [])],
      }
    }
    case 'drafter': {
      const draft = verifyCitations(mockDraft(docs, decoded), docs)
      const cites = draft.paragraphs.flatMap((p) => p.citations)
      const ok = cites.filter((c) => c.verified).length
      return {
        summary: `Draft ready: ${draft.paragraphs.length} paragraphs, ${ok} of ${cites.length} quotes found word for word in your documents.`,
        fields: [{ label: 'Subject', value: draft.subject }],
        bullets: draft.paragraphs.slice(0, 2).map((p) => p.text),
        flag: 'The writer only saw placeholders like [PATIENT_1]. Your name was put back on this device.',
      }
    }
    case 'tracker': {
      const tl = buildTimeline(decoded, today).filter((m) => m.date && m.date >= today).slice(0, 4)
      const left = deadline ? daysBetween(today, deadline) : null
      const urgent = !!decoded.expeditedHours && /urgent|progressive|foot drop/i.test(docs.records)
      return {
        summary: left == null ? 'No deadline stated. We used 180 days as a safe default.' : `${left} days left to file the internal appeal.`,
        fields: tl.map((m) => ({ label: m.title, value: fmt(m.date) })),
        bullets: ['Packet: appeal letter, denial letter, chart notes, letter of medical necessity, plan policy pages'],
        flag: urgent ? `Looks urgent. Ask for an expedited appeal (decided within ${decoded.expeditedHours} hours).` : undefined,
      }
    }
    case 'submit': {
      if (!authorized) return { summary: 'Waiting for your OK before sending anything.' }
      const seed = [...decoded.insurer + decoded.service].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1e6, 7)
      return {
        summary: 'Submitted (simulated). Follow-ups are on the calendar.',
        fields: [
          { label: 'Channel', value: `${decoded.insurer} member portal (demo)` },
          { label: 'Confirmation #', value: `APL-${String(seed).padStart(6, '0')}` },
          { label: 'Status check', value: fmt(addDays(today, 7)) },
          { label: 'Decision expected by', value: fmt(addDays(today, decoded.reason === 'Out-of-network' ? 60 : 30)) },
        ],
        flag: 'Demo only. Nothing was actually sent.',
      }
    }
    case 'outcome': {
      const same = groupStats(cards.filter((c) => c.reason === decoded.reason))
      const insurer = cards.filter((c) => c.insurer === decoded.insurer.replace(/ Medicaid$/, ''))
      const ins = groupStats(insurer)
      const days = insurer.map((c) => c.daysToDecision).sort((a, b) => a - b)
      const top = reasonBreakdown(insurer).sort((a, b) => b.n - a.n)[0]
      return {
        summary: same.winRate != null ? `${same.winRate}% of ${same.n} shared ${decoded.reason.toLowerCase()} appeals won.` : 'Not enough shared cases yet to show a rate.',
        fields: [
          { label: `${decoded.insurer} overturn rate`, value: ins.winRate != null ? `${ins.winRate}% of ${ins.n}` : 'Fewer than 5 cases' },
          { label: 'Median time to decision', value: days.length >= 5 ? `${days[Math.floor(days.length / 2)]} days` : 'Fewer than 5 cases' },
          { label: 'Most common denial here', value: top ? top.reason : '—' },
          { label: 'What worked most', value: same.topTactic?.tactic ?? '—' },
        ],
        bullets: ['For clinics: denials for this reason tend to drop when the chart note names the prior treatment, dates, and why it stopped.'],
      }
    }
  }
}
