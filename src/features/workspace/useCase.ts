import type { CaseDocs, ConditionCategory, DocKind, InsuranceType } from '../../lib/types'
import { decode, guessInsuranceType, type Decoded } from '../decoder/decode'
import { createVault, redact, type Span, type Vault } from '../redaction/redact'

export interface CaseState {
  docs: CaseDocs
  vault: Vault
  redacted: Record<DocKind, { spans: Span[]; redacted: string }>
  redactedDocs: CaseDocs
  decoded: Decoded
  insuranceType: InsuranceType
  condition: ConditionCategory
}

export function analyzeCase(docs: CaseDocs, insuranceType?: InsuranceType, condition?: ConditionCategory): CaseState {
  const vault = createVault([docs.denial, docs.records, docs.policy])
  const redacted = {
    denial: redact(docs.denial, vault),
    records: redact(docs.records, vault),
    policy: redact(docs.policy, vault),
  }
  return {
    docs,
    vault,
    redacted,
    redactedDocs: { denial: redacted.denial.redacted, records: redacted.records.redacted, policy: redacted.policy.redacted },
    decoded: decode(docs),
    insuranceType: insuranceType ?? guessInsuranceType(docs),
    condition: condition ?? 'Other / rare (grouped)',
  }
}
