import { pick, seeded } from '../../lib/random'
import type { ConditionCategory, DenialReason, InsuranceType } from '../../lib/types'

export type Outcome = 'Overturned' | 'Partially overturned' | 'Upheld'

export interface WinCard {
  id: string
  handle: string
  insuranceType: InsuranceType
  insurer: string
  network: string
  condition: ConditionCategory
  reason: DenialReason
  service: string
  tactic: string
  story: string
  outcome: Outcome
  level: 'Internal appeal' | 'External review' | 'State fair hearing'
  quarter: string
  daysToDecision: number
  helped: number
  mine?: boolean
}

// Fictional insurers and networks. Seed data is synthetic so no real company gets made-up stats.
export const INSURERS = ['Peachtree Health Plan', 'Summit BlueCare', 'Keystone Care', 'Meridian Mutual', 'Harbor Health', 'Lumen Health'] as const
export const NETWORKS = ['Riverbend Health', 'Northgate Medical', 'Lakeside Health System', 'Coastal Care Partners', 'Magnolia Children\'s'] as const
export const QUARTERS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'] as const

export const TACTICS: Record<DenialReason, { tactic: string; story: string; win: number }[]> = {
  'Step therapy': [
    { tactic: 'Documented a failed prior treatment', story: 'Pulled chart notes showing I\'d already failed the required drug for 16 weeks and quoted the plan\'s exception clause.', win: 0.78 },
    { tactic: 'Cited the plan\'s own policy language', story: 'Quoted the step-therapy section word for word next to my records. The reviewer reversed in 3 weeks.', win: 0.7 },
    { tactic: 'Letter of medical necessity', story: 'My specialist wrote a one-page letter answering each criterion. Approved on internal appeal.', win: 0.6 },
  ],
  'Medical necessity': [
    { tactic: 'Letter of medical necessity', story: 'Doctor\'s letter tied my symptoms to the plan\'s criteria line by line.', win: 0.62 },
    { tactic: 'Requested a peer-to-peer review', story: 'My surgeon got on a call with their medical director and walked through the imaging.', win: 0.58 },
    { tactic: 'Cited clinical guidelines', story: 'Attached the specialty society guideline showing this is standard of care.', win: 0.52 },
  ],
  'Prior authorization': [
    { tactic: 'Showed red-flag symptoms waive the wait', story: 'Their own imaging guideline waives the waiting period for nerve symptoms. I quoted it.', win: 0.74 },
    { tactic: 'Proved criteria were already met', story: 'PT notes proved I had done 8 weeks of therapy. The original request just left them out.', win: 0.66 },
    { tactic: 'Asked for an expedited appeal', story: 'Flagged it as urgent and got a decision in 2 days.', win: 0.55 },
  ],
  'Out-of-network': [
    { tactic: 'Prudent layperson + No Surprises Act', story: 'Explained I went to the nearest ER for chest pain and cited the federal emergency rules. Reprocessed at in-network rates.', win: 0.82 },
    { tactic: 'No in-network provider available', story: 'Showed there was no in-network specialist within 50 miles.', win: 0.6 },
  ],
  'Experimental / investigational': [
    { tactic: 'Cited FDA approval and studies', story: 'Sent two peer-reviewed studies and the FDA label for my exact use.', win: 0.42 },
    { tactic: 'Went to external review', story: 'Lost internally, won at external review with an independent oncologist.', win: 0.38 },
  ],
  'Coding / billing error': [
    { tactic: 'Got a corrected claim resubmitted', story: 'Billing office fixed one modifier and resubmitted. Paid in 2 weeks.', win: 0.85 },
    { tactic: 'Cited the plan\'s own policy language', story: 'Showed the code they rejected is listed as covered in their policy.', win: 0.7 },
  ],
  'Not a covered benefit': [
    { tactic: 'Cited a state coverage mandate', story: 'Our state requires coverage for this. Quoted the statute and they reversed.', win: 0.4 },
    { tactic: 'Reframed under a covered benefit', story: 'It was coded as cosmetic; doctor documented the functional problem it fixes.', win: 0.3 },
  ],
}

const SERVICES: Record<ConditionCategory, string[]> = {
  'Autoimmune & GI': ['Biologic drug', 'Infusion therapy', 'Colonoscopy'],
  'Mental health': ['Residential treatment', 'Therapy sessions', 'TMS therapy'],
  'Cancer care': ['PET scan', 'Targeted therapy', 'Proton therapy'],
  'Heart & vascular': ['Cardiac MRI', 'Cardiac rehab', 'Echocardiogram'],
  'Bones, joints & pain': ['MRI', 'Spinal surgery', 'Physical therapy'],
  'Brain & nerves': ['Migraine drug', 'EEG monitoring', 'Botox injections'],
  'Emergency care': ['ER visit', 'Ambulance', 'Observation stay'],
  'Reproductive health': ['Fertility medication', 'Ultrasound', 'Genetic testing'],
  'Diabetes & hormones': ['CGM sensor', 'Insulin pump', 'GLP-1 drug'],
  'Other / rare (grouped)': ['Specialty drug', 'Genetic testing', 'Specialist visit'],
}

const REASON_CONDITIONS: Record<DenialReason, ConditionCategory[]> = {
  'Step therapy': ['Autoimmune & GI', 'Brain & nerves', 'Diabetes & hormones', 'Mental health'],
  'Medical necessity': ['Mental health', 'Bones, joints & pain', 'Heart & vascular', 'Cancer care'],
  'Prior authorization': ['Bones, joints & pain', 'Heart & vascular', 'Brain & nerves', 'Reproductive health'],
  'Out-of-network': ['Emergency care', 'Emergency care', 'Cancer care'],
  'Experimental / investigational': ['Cancer care', 'Other / rare (grouped)', 'Brain & nerves'],
  'Coding / billing error': ['Emergency care', 'Reproductive health', 'Heart & vascular'],
  'Not a covered benefit': ['Reproductive health', 'Other / rare (grouped)', 'Mental health'],
}

const ADJ = ['quiet', 'brave', 'steady', 'bright', 'calm', 'swift', 'kind', 'bold', 'lucky', 'gentle', 'clever', 'sunny']
const ANIMAL = ['heron', 'otter', 'fox', 'finch', 'lynx', 'koala', 'panda', 'robin', 'whale', 'falcon', 'badger', 'gecko']

const REASON_WEIGHTS: [DenialReason, number][] = [
  ['Step therapy', 13],
  ['Medical necessity', 13],
  ['Prior authorization', 12],
  ['Out-of-network', 9],
  ['Coding / billing error', 5],
  ['Experimental / investigational', 4],
  ['Not a covered benefit', 4],
]

const TYPE_WEIGHTS: [InsuranceType, number][] = [
  ['Employer PPO', 18],
  ['ACA Marketplace', 12],
  ['Employer HMO', 9],
  ['Medicaid', 10],
  ['Medicare Advantage', 9],
  ['TRICARE', 2],
]

function weighted<T>(rand: () => number, items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [item, w] of items) {
    r -= w
    if (r <= 0) return item
  }
  return items[0][0]
}

export function generateSeedCards(count = 60): WinCard[] {
  const rand = seeded(2026)
  return Array.from({ length: count }, (_, i): WinCard => {
    const reason = weighted(rand, REASON_WEIGHTS)
    const insuranceType = weighted(rand, TYPE_WEIGHTS)
    const condition = pick(rand, REASON_CONDITIONS[reason])
    const t = pick(rand, TACTICS[reason])
    const qIdx = Math.min(QUARTERS.length - 1, Math.floor(Math.pow(rand(), 0.7) * QUARTERS.length))
    const roll = rand()
    const outcome: Outcome = roll < t.win * 0.85 ? 'Overturned' : roll < t.win ? 'Partially overturned' : 'Upheld'
    return {
      id: `seed-${i}`,
      handle: `${pick(rand, ADJ)}-${pick(rand, ANIMAL)}-${10 + Math.floor(rand() * 89)}`,
      insuranceType,
      insurer: insuranceType === 'Medicaid' ? 'Keystone Care' : pick(rand, INSURERS),
      network: pick(rand, NETWORKS),
      condition,
      reason,
      service: pick(rand, SERVICES[condition]),
      tactic: t.tactic,
      story: t.story,
      outcome,
      level: rand() < 0.8 ? 'Internal appeal' : insuranceType === 'Medicaid' ? 'State fair hearing' : 'External review',
      quarter: QUARTERS[qIdx],
      daysToDecision: 6 + Math.floor(rand() * 50),
      helped: Math.floor(rand() * 120),
    }
  }).sort((a, b) => QUARTERS.indexOf(b.quarter as (typeof QUARTERS)[number]) - QUARTERS.indexOf(a.quarter as (typeof QUARTERS)[number]))
}

export const SEED_CARDS = generateSeedCards()
