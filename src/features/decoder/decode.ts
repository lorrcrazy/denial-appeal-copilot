import type { CaseDocs, DenialReason, InsuranceType } from '../../lib/types'

export interface ReasonProfile {
  reason: DenialReason
  match: RegExp
  baseOdds: number
  plain: string
  needs: string
  policyCues: RegExp[]
  exceptionCues: RegExp[]
  evidenceCues: RegExp[]
  argument: string
}

export const REASON_PROFILES: ReasonProfile[] = [
  {
    reason: 'Step therapy',
    match: /step therapy|trial and failure|tried and failed|fail[- ]first/i,
    baseOdds: 62,
    plain: 'The plan wants you to try cheaper treatments first, and says your file doesn\'t prove you already did.',
    needs: 'Proof you tried (and failed or couldn\'t tolerate) the required treatment for long enough.',
    policyCues: [/tried and failed/i, /step therapy/i],
    exceptionCues: [/exception/i, /stopped earlier|intolerance/i, /documented by chart notes/i],
    evidenceCues: [/failed conventional|has failed/i, /discontinued/i, /continued for \d+ weeks/i],
    argument: 'You already completed the required step. Your chart documents the failed trial, and the plan\'s own exception language says that should be enough.',
  },
  {
    reason: 'Out-of-network',
    match: /out-of-network|non-participating|not in (?:the )?network/i,
    baseOdds: 70,
    plain: 'The plan says the hospital wasn\'t in its network and nobody got approval first, so it won\'t pay.',
    needs: 'Show it was an emergency by a regular person\'s standard. Emergency care can\'t require prior approval or network status.',
    policyCues: [/emergency services are covered/i, /prudent layperson/i],
    exceptionCues: [/no surprises act|balance billed/i, /presenting symptoms/i],
    evidenceCues: [/chest pain|severe pain|shortness of breath/i, /nearest emergency|heart attack/i, /diagnosis/i],
    argument: 'Emergency care is covered at in-network rates regardless of network, judged by your symptoms, not the final diagnosis.',
  },
  {
    reason: 'Prior authorization',
    match: /prior authori[sz]ation|pre-?authori[sz]ation|pre-?certification/i,
    baseOdds: 58,
    plain: 'The plan says the right paperwork wasn\'t approved before the service, or the request was missing required details.',
    needs: 'Show the plan\'s criteria were actually met, or that an exception (like urgent red-flag symptoms) applies.',
    policyCues: [/approved for|criteria/i, /red flag/i],
    exceptionCues: [/does not apply|exception/i, /expedited/i],
    evidenceCues: [/completed \d+ weeks|physical therapy/i, /foot drop|weakness|progressive/i, /urgent/i],
    argument: 'The criteria were met, and red-flag findings waive the waiting requirement altogether.',
  },
  {
    reason: 'Experimental / investigational',
    match: /experimental|investigational|unproven/i,
    baseOdds: 34,
    plain: 'The plan thinks the treatment isn\'t proven enough yet to pay for.',
    needs: 'Peer-reviewed studies, clinical guidelines, or FDA approval for your use.',
    policyCues: [/experimental|investigational/i, /guideline|peer-reviewed|FDA/i],
    exceptionCues: [/exception|clinical trial/i],
    evidenceCues: [/guideline|study|FDA/i, /failed|no response/i],
    argument: 'The treatment is supported by guidelines or evidence for your situation, and alternatives have failed.',
  },
  {
    reason: 'Coding / billing error',
    match: /coding|billing error|CPT|modifier|duplicate claim|invalid code/i,
    baseOdds: 76,
    plain: 'Something on the bill was coded in a way the plan rejected. Often a paperwork fix, not a medical dispute.',
    needs: 'A corrected claim from the provider\'s billing office, or proof the original code was right.',
    policyCues: [/code|billing/i],
    exceptionCues: [/corrected claim|resubmi/i],
    evidenceCues: [/procedure|diagnosis/i],
    argument: 'The service was billed correctly (or has been corrected) and is otherwise covered.',
  },
  {
    reason: 'Not a covered benefit',
    match: /not a covered|excluded|exclusion|not covered under/i,
    baseOdds: 24,
    plain: 'The plan says this service is excluded from your benefits entirely.',
    needs: 'Show it fits a covered benefit category, or that a state/federal mandate requires coverage.',
    policyCues: [/covered|benefit/i],
    exceptionCues: [/mandate|required by|exception/i],
    evidenceCues: [/medically necessary|diagnosis/i],
    argument: 'The service falls under a covered benefit or a coverage mandate.',
  },
  {
    reason: 'Medical necessity',
    match: /medically necessary|medical necessity|not necessary/i,
    baseOdds: 52,
    plain: 'The plan\'s reviewer decided the treatment isn\'t needed for your condition right now.',
    needs: 'A letter of medical necessity from your doctor tying your symptoms to the plan\'s own criteria.',
    policyCues: [/medically necessary/i, /criteria/i],
    exceptionCues: [/exception/i],
    evidenceCues: [/assessment|medically necessary/i, /diagnosis/i],
    argument: 'Your records meet the plan\'s own medical-necessity criteria.',
  },
]

export interface Decoded {
  insurer: string
  plan: string
  service: string
  reason: DenialReason
  profile: ReasonProfile
  reasonSentence: string
  letterDate: Date | null
  appealWindowDays: number | null
  externalWindowMonths: number | null
  expeditedHours: number | null
  billed: string | null
  evidence: string[]
}

const field = (text: string, labels: string[]): string | null => {
  for (const l of labels) {
    const m = text.match(new RegExp(String.raw`${l}\s*:\s*(.+)`, 'i'))
    if (m) return m[1].trim()
  }
  return null
}

export function sentences(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter((s) => s.length > 20)
}

export function findSentence(text: string, cues: RegExp[], exclude: string[] = []): string | null {
  const all = sentences(text).filter((s) => !exclude.includes(s))
  for (const cue of cues) {
    const hit = all.find((s) => cue.test(s))
    if (hit) return hit
  }
  return null
}

export function decode(docs: CaseDocs): Decoded {
  const { denial, records } = docs
  const reasonText = denial.match(/reason for (?:denial|action)?:?\s*([^\n]+)/i)?.[1] ?? denial
  const profile = REASON_PROFILES.find((p) => p.match.test(reasonText)) ?? REASON_PROFILES[REASON_PROFILES.length - 1]
  const reasonSentence = findSentence(denial, [/reason for denial/i, /denied/i]) ?? reasonText

  const dateMatch = denial.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/)
  const letterDate = dateMatch ? new Date(dateMatch[0]) : null

  const evidence = profile.evidenceCues
    .map((cue) => sentences(records).find((s) => cue.test(s)))
    .filter((s): s is string => Boolean(s))

  return {
    insurer: denial.split('\n').find((l) => l.trim())?.trim() ?? 'Your insurer',
    plan: field(denial, ['Plan']) ?? 'Your plan',
    service: field(denial, ['Service Requested', 'Facility', 'Service']) ?? 'the requested service',
    reason: profile.reason,
    profile,
    reasonSentence,
    letterDate,
    appealWindowDays: Number(denial.match(/within (\d+) days/i)?.[1]) || null,
    externalWindowMonths: Number(denial.match(/within (\d+) months/i)?.[1]) || null,
    expeditedHours: Number(denial.match(/within (\d+) hours/i)?.[1]) || null,
    billed: denial.match(/\$[\d,]+(?:\.\d{2})?/)?.[0] ?? null,
    evidence: [...new Set(evidence)],
  }
}

export interface Odds {
  score: number
  base: number
  community: number | null
  evidenceBonus: number
}

export function estimateOdds(decoded: Decoded, communityWinRate: number | null): Odds {
  const base = decoded.profile.baseOdds
  const blended = communityWinRate == null ? base : base * 0.6 + communityWinRate * 0.4
  const evidenceBonus = Math.min(decoded.evidence.length * 4, 10)
  return {
    score: Math.round(Math.min(blended + evidenceBonus, 92)),
    base,
    community: communityWinRate,
    evidenceBonus,
  }
}

export function guessInsuranceType(docs: CaseDocs): InsuranceType {
  const t = docs.denial
  if (/medicaid/i.test(t)) return 'Medicaid'
  if (/medicare/i.test(t)) return 'Medicare Advantage'
  if (/tricare/i.test(t)) return 'TRICARE'
  if (/marketplace|healthcare\.gov/i.test(t)) return 'ACA Marketplace'
  if (/hmo/i.test(t)) return 'Employer HMO'
  return 'Employer PPO'
}
