import type { Decoded } from '../decoder/decode'

export interface Milestone {
  id: string
  title: string
  detail: string
  date: Date | null
  kind: 'task' | 'deadline' | 'wait'
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate())

export function buildTimeline(decoded: Decoded, today = new Date()): Milestone[] {
  const start = decoded.letterDate ?? today
  const window = decoded.appealWindowDays ?? 180
  const internalDue = addDays(start, window)
  const submitBy = addDays(start, Math.min(30, Math.floor(window / 2)))
  const decisionBy = addDays(submitBy, decoded.reason === 'Out-of-network' ? 60 : 30)
  const externalDue = addMonths(decisionBy, decoded.externalWindowMonths ?? 4)

  return [
    { id: 'file', title: 'Request your claim file', detail: 'Ask the plan for every document and the exact criteria used. They must send it free.', date: addDays(start, 3), kind: 'task' },
    { id: 'lmn', title: 'Get a letter from your doctor', detail: 'A letter of medical necessity that answers the denial reason point by point.', date: addDays(start, 14), kind: 'task' },
    { id: 'submit', title: 'Send the internal appeal', detail: `Recommended target. The hard deadline is ${window} days from the letter.`, date: submitBy, kind: 'task' },
    { id: 'internal', title: 'Internal appeal deadline', detail: decoded.expeditedHours ? `Urgent? Ask for an expedited appeal, decided within ${decoded.expeditedHours} hours.` : 'Missing this usually ends your appeal rights.', date: internalDue, kind: 'deadline' },
    { id: 'decision', title: 'Plan decision expected', detail: 'Usually 30 days for pre-service care, 60 days for services already received.', date: decisionBy, kind: 'wait' },
    { id: 'external', title: 'External review window closes', detail: 'If denied again, an independent reviewer can overrule the plan. Their decision is binding.', date: externalDue, kind: 'deadline' },
  ]
}

const icsDate = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`

export function toIcs(milestones: Milestone[]): string {
  const events = milestones
    .filter((m) => m.date)
    .map((m) => {
      const d = m.date as Date
      return [
        'BEGIN:VEVENT',
        `UID:${m.id}-${icsDate(d)}@denial-appeal-copilot`,
        `DTSTAMP:${icsDate(new Date())}T000000Z`,
        `DTSTART;VALUE=DATE:${icsDate(d)}`,
        `DTEND;VALUE=DATE:${icsDate(addDays(d, 1))}`,
        `SUMMARY:${m.title}`,
        `DESCRIPTION:${m.detail.replace(/[,;]/g, '\\$&')}`,
        'BEGIN:VALARM',
        'TRIGGER:-P2D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${m.title}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n')
    })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Denial Appeal Copilot//EN', ...events, 'END:VCALENDAR'].join('\r\n')
}
