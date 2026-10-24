export type EntityType = 'PATIENT' | 'CLINICIAN' | 'DOB' | 'DATE' | 'ID' | 'PHONE' | 'EMAIL' | 'ADDRESS' | 'SSN' | 'AGE'

export interface Span {
  start: number
  end: number
  type: EntityType
  text: string
  placeholder: string
}

export interface Vault {
  names: string[]
  toPlaceholder: Map<string, string>
  toOriginal: Map<string, string>
  counters: Partial<Record<EntityType, number>>
}

export const ENTITY_LABELS: Record<EntityType, string> = {
  PATIENT: 'Patient name',
  CLINICIAN: 'Clinician',
  DOB: 'Date of birth',
  DATE: 'Date',
  ID: 'ID number',
  PHONE: 'Phone',
  EMAIL: 'Email',
  ADDRESS: 'Address',
  SSN: 'SSN',
  AGE: 'Age',
}

const NAME = String.raw`[A-Z][a-z]+(?:[ '-][A-Z][a-z'-]+)+`
const MONTH = String.raw`(?:January|February|March|April|May|June|July|August|September|October|November|December)`
const NAME_LABELS = new RegExp(String.raw`(?:Member Name|Patient Name|Patient|Name|Dear)\s*:?[ \t]*(${NAME})`, 'g')

const PATTERNS: { type: EntityType; re: RegExp; group?: number }[] = [
  { type: 'DOB', re: /(?:DOB|Date of Birth)\s*:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/g, group: 1 },
  { type: 'SSN', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'EMAIL', re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g },
  { type: 'PHONE', re: /(?:\+?1[-.\s]?)?\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },
  {
    type: 'CLINICIAN',
    re: /\b(?:Dr|Nurse|Doctor)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z'-]+)?(?:,\s*(?:MD|DO|PharmD|NP|PA-C|RN))?/g,
  },
  {
    type: 'ADDRESS',
    re: /\b\d{2,5}\s+(?:[A-Z][a-z]+\s){1,3}(?:Ave|Avenue|St|Street|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)\b\.?(?:\s[NS][EW]\b)?/g,
  },
  { type: 'ADDRESS', re: /\b[A-Z][a-z]+(?: [A-Z][a-z]+)?,\s[A-Z]{2}\s\d{5}\b/g },
  {
    type: 'ID',
    re: /(?:Member ID|Claim Number|Claim #|MRN|Reference Number|Policy Number|Account Number|Group)\s*:?\s*([A-Z0-9][A-Z0-9-]{4,})/g,
    group: 1,
  },
  { type: 'ID', re: /\b[A-Z]{2,4}(?:-[A-Z0-9]+){1,4}\b/g },
  { type: 'DATE', re: new RegExp(String.raw`\b${MONTH}\s+\d{1,2},\s+\d{4}\b`, 'g') },
  { type: 'DATE', re: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g },
  { type: 'AGE', re: /\b\d{1,3}\s?(?:years? old|yo|y\/o)\b/gi },
]

export function createVault(docs: string[]): Vault {
  const names = new Set<string>()
  for (const doc of docs) {
    for (const m of doc.matchAll(NAME_LABELS)) names.add(m[1].trim())
  }
  return { names: [...names], toPlaceholder: new Map(), toOriginal: new Map(), counters: {} }
}

function placeholderFor(vault: Vault, type: EntityType, text: string): string {
  const key = `${type}:${text}`
  const existing = vault.toPlaceholder.get(key)
  if (existing) return existing
  const n = (vault.counters[type] ?? 0) + 1
  vault.counters[type] = n
  const ph = type === 'DOB' && n === 1 ? '[DOB]' : `[${type}_${n}]`
  vault.toPlaceholder.set(key, ph)
  vault.toOriginal.set(ph, text)
  return ph
}

function isPlausibleId(text: string): boolean {
  return /\d/.test(text) && text.replace(/\D/g, '').length >= 4
}

export function detect(text: string, vault: Vault): Span[] {
  const raw: Omit<Span, 'placeholder'>[] = []

  for (const name of vault.names) {
    const parts = [name, ...name.split(/\s+/).filter((p) => p.length >= 3)]
    for (const part of parts) {
      const re = new RegExp(String.raw`\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\b`, 'g')
      for (const m of text.matchAll(re)) raw.push({ start: m.index, end: m.index + part.length, type: 'PATIENT', text: part })
    }
  }

  for (const { type, re, group } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const value = group ? m[group] : m[0]
      const start = m.index + (group ? m[0].indexOf(value) : 0)
      if (type === 'ID' && !isPlausibleId(value)) continue
      raw.push({ start, end: start + value.length, type, text: value })
    }
  }

  raw.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
  const spans: Span[] = []
  let cursor = -1
  for (const s of raw) {
    if (s.start < cursor) continue
    if (s.type === 'CLINICIAN' && vault.names.some((n) => s.text.includes(n))) continue
    spans.push({ ...s, placeholder: placeholderFor(vault, s.type, s.text) })
    cursor = s.end
  }
  return spans
}

export function applySpans(text: string, spans: Span[], replace: (s: Span) => string = (s) => s.placeholder): string {
  let out = ''
  let i = 0
  for (const s of spans) {
    out += text.slice(i, s.start) + replace(s)
    i = s.end
  }
  return out + text.slice(i)
}

export function redact(text: string, vault: Vault) {
  const spans = detect(text, vault)
  return { spans, redacted: applySpans(text, spans) }
}

export function restore(text: string, vault: Vault): string {
  return text.replace(/\[[A-Z]+(?:_\d+)?\]/g, (ph) => vault.toOriginal.get(ph) ?? ph)
}

export function toQuarter(dateText: string): string {
  const d = new Date(dateText)
  if (Number.isNaN(d.getTime())) return '[date]'
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
}

function ageBand(text: string): string {
  const n = parseInt(text, 10)
  if (n < 18) return '[under 18]'
  if (n >= 65) return '[65+]'
  const lo = Math.floor((n - 5) / 10) * 10 + 5
  return `[age ${lo}–${lo + 9}]`
}

export const SHARE_REPLACEMENTS: Record<EntityType, (s: Span) => string> = {
  PATIENT: () => '[me]',
  CLINICIAN: () => '[clinician]',
  DOB: () => '[removed]',
  DATE: (s) => toQuarter(s.text),
  ID: () => '[removed]',
  PHONE: () => '[removed]',
  EMAIL: () => '[removed]',
  ADDRESS: () => '[removed]',
  SSN: () => '[removed]',
  AGE: (s) => ageBand(s.text),
}

export function redactForSharing(text: string, knownNames: string[]) {
  const vault: Vault = { names: knownNames, toPlaceholder: new Map(), toOriginal: new Map(), counters: {} }
  const spans = detect(text, vault)
  return { spans, text: applySpans(text, spans, (s) => SHARE_REPLACEMENTS[s.type](s)) }
}
