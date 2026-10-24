export type DocKind = 'denial' | 'records' | 'policy'

export type CaseDocs = Record<DocKind, string>

export const DOC_LABELS: Record<DocKind, string> = {
  denial: 'Denial letter',
  records: 'Medical records',
  policy: 'Plan policy',
}

export const INSURANCE_TYPES = [
  'Employer PPO',
  'Employer HMO',
  'ACA Marketplace',
  'Medicaid',
  'Medicare Advantage',
  'TRICARE',
] as const
export type InsuranceType = (typeof INSURANCE_TYPES)[number]

export const DENIAL_REASONS = [
  'Step therapy',
  'Medical necessity',
  'Prior authorization',
  'Out-of-network',
  'Experimental / investigational',
  'Coding / billing error',
  'Not a covered benefit',
] as const
export type DenialReason = (typeof DENIAL_REASONS)[number]

export const CONDITION_CATEGORIES = [
  'Autoimmune & GI',
  'Mental health',
  'Cancer care',
  'Heart & vascular',
  'Bones, joints & pain',
  'Brain & nerves',
  'Emergency care',
  'Reproductive health',
  'Diabetes & hormones',
  'Other / rare (grouped)',
] as const
export type ConditionCategory = (typeof CONDITION_CATEGORIES)[number]
