import type { ConditionCategory, DenialReason, InsuranceType } from '../../lib/types'

export interface SharePrefill {
  insuranceType: InsuranceType
  insurer: string
  condition: ConditionCategory
  reason: DenialReason
  service: string
  tactic: string
  story: string
  knownNames: string[]
}
