import type { CaseDocs, DocKind } from '../../lib/types'
import { findSentence, type Decoded } from '../decoder/decode'

export interface Citation {
  doc: DocKind
  quote: string
  verified?: boolean
}

export interface Paragraph {
  text: string
  citations: Citation[]
}

export interface AppealDraft {
  subject: string
  paragraphs: Paragraph[]
  source: 'llm' | 'mock'
}

export interface DraftRequest {
  docs: CaseDocs
  reason: string
  service: string
  argument: string
  communityTactic: string | null
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

export function verifyCitations(draft: AppealDraft, docs: CaseDocs): AppealDraft {
  return {
    ...draft,
    paragraphs: draft.paragraphs.map((p) => ({
      ...p,
      citations: p.citations.map((c) => ({ ...c, verified: Boolean(docs[c.doc]) && norm(docs[c.doc]).includes(norm(c.quote)) })),
    })),
  }
}

const label = (doc: string, labels: string[]) => {
  for (const l of labels) {
    const m = doc.match(new RegExp(String.raw`${l}\s*:\s*([^\n]+)`, 'i'))
    if (m) return m[1].trim()
  }
  return null
}

export function mockDraft(docs: CaseDocs, decoded: Decoded): AppealDraft {
  const { denial, records } = docs
  const p = decoded.profile
  const patient = label(denial, ['Member Name']) ?? '[PATIENT]'
  const memberId = label(denial, ['Member ID'])
  const claim = label(denial, ['Claim Number', 'Reference Number'])
  const clinician = label(denial, ['Requesting Provider', 'Ordering Provider'])?.split(',')[0] ?? label(records, ['Provider', 'Attending'])?.split(',')[0]

  const used: string[] = []
  const take = (doc: DocKind, cues: RegExp[]): Citation | null => {
    const quote = findSentence(docs[doc], cues, used)
    if (!quote) return null
    used.push(quote)
    return { doc, quote }
  }

  const denialQ = take('denial', [/reason for denial/i, /denied/i])
  const policyQ = take('policy', p.policyCues)
  const exceptionQ = take('policy', p.exceptionCues)
  const evidenceQs = p.evidenceCues.map((c) => take('records', [c])).filter((c): c is Citation => Boolean(c))
  const assessmentQ = take('records', [/assessment/i, /plan:/i])

  const cites = (...c: (Citation | null)[]) => c.filter((x): x is Citation => Boolean(x))
  const paragraphs: Paragraph[] = [
    {
      text: `I am writing to request an internal appeal of the denial of ${decoded.service} for ${patient}${memberId ? ` (Member ID ${memberId})` : ''}${claim ? `, reference ${claim}` : ''}. The denial states the request was refused for ${decoded.reason.toLowerCase()}. ${p.argument}`,
      citations: cites(denialQ),
    },
    {
      text: `${decoded.insurer}'s own policy sets out the standard that applies here, and the request meets it.`,
      citations: cites(policyQ),
    },
    {
      text: 'The medical record submitted with this appeal documents exactly what the policy requires:',
      citations: evidenceQs.slice(0, 3),
    },
    {
      text: `In addition, the policy expressly provides for this situation. Because the record satisfies this language, the denial is inconsistent with the plan's own terms.`,
      citations: cites(exceptionQ),
    },
    {
      text: `${clinician ? `${clinician} has` : 'My treating clinician has'} concluded that the service is necessary, as reflected in the clinical assessment.`,
      citations: cites(assessmentQ),
    },
    {
      text: `I ask that you reverse the denial and approve ${decoded.service}. If the denial is upheld, please provide the complete claim file, the specific criteria relied on, and the credentials of the reviewer, as required by law, so that I can request an external review.`,
      citations: [],
    },
    { text: `Sincerely,\n${patient}${clinician ? `\ncc: ${clinician}` : ''}`, citations: [] },
  ].filter((para) => para.citations.length > 0 || !para.text.endsWith(':'))

  return { subject: `Request for internal appeal: ${decoded.service}`, paragraphs, source: 'mock' }
}

export async function generateDraft(req: DraftRequest, fallback: () => AppealDraft): Promise<AppealDraft> {
  try {
    const res = await fetch('/api/appeal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as Omit<AppealDraft, 'source'>
    if (!Array.isArray(data.paragraphs) || data.paragraphs.length === 0) throw new Error('empty')
    return { ...data, source: 'llm' }
  } catch {
    return fallback()
  }
}
