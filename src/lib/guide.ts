import { useEffect } from 'react'
import type { DenialReason } from './types'

export type GuideSection = 'copilot' | 'agent' | 'wins' | 'privacy' | 'how'
export interface GuideGo {
  section: GuideSection
  reason?: DenialReason
  sampleId?: string
}

const EVENT = 'guide:go'

export function guideGo(detail: GuideGo) {
  window.dispatchEvent(new CustomEvent<GuideGo>(EVENT, { detail }))
  setTimeout(() => document.getElementById(detail.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
}

export function useGuide(handler: (d: GuideGo) => void) {
  useEffect(() => {
    const h = (e: Event) => handler((e as CustomEvent<GuideGo>).detail)
    window.addEventListener(EVENT, h)
    return () => window.removeEventListener(EVENT, h)
  }, [handler])
}
