import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { guideGo, type GuideGo } from '../../lib/guide'
import type { DenialReason } from '../../lib/types'
import type { WinCard } from '../community/seed'
import { groupStats } from '../community/stats'
import { Avatar } from './Avatar'

type Reply = { label: string; run: () => void }
type Msg = { id: number; from: 'june' | 'me'; text: string }
type Topic = 'deadline' | 'privacy' | 'stories' | 'agent' | 'thanks'

const ISSUES: { label: string; reason: DenialReason | null }[] = [
  { label: 'They denied a medication', reason: 'Step therapy' },
  { label: 'An ER or out-of-network bill', reason: 'Out-of-network' },
  { label: 'They said I needed prior approval', reason: 'Prior authorization' },
  { label: "They said it wasn't medically necessary", reason: 'Medical necessity' },
  { label: 'A billing or coding mistake', reason: 'Coding / billing error' },
  { label: 'Just looking around', reason: null },
]

const SAMPLE_FOR: Partial<Record<DenialReason, string>> = {
  'Step therapy': 'biologic',
  'Out-of-network': 'er',
  'Prior authorization': 'mri',
}

const EMPATHY: Record<DenialReason, string> = {
  'Step therapy': "I'm sorry, that's frustrating. Usually it means the plan wants you to try cheaper drugs first. If you already tried them, or can't take them, that's often what wins the appeal.",
  'Out-of-network': "Surprise bills after an ER visit are so stressful. The good news is that emergency care usually has to be covered at in-network rates, even at an out-of-network hospital.",
  'Prior authorization': "That one is often a paperwork problem rather than a no on the care itself, and those tend to get fixed.",
  'Medical necessity': "\"Not medically necessary\" usually means they want more from your doctor about why you need it. A clear letter from your doctor goes a long way.",
  'Experimental / investigational': "These are harder, but appeals do win when published studies or guidelines back up the treatment.",
  'Coding / billing error': "Good news: billing and coding mistakes are some of the easiest to fix. Often your provider just needs to send a corrected claim.",
  'Not a covered benefit': "With these, the trick is reading the exact plan wording and checking for exceptions that fit you.",
}

const RULES: [RegExp, DenialReason | Topic][] = [
  [/deadline|how long|how much time|when do i/i, 'deadline'],
  [/privacy|private|safe|secure|my data|personal info/i, 'privacy'],
  [/wrong code|coding|billing (error|mistake)|miscod|billed (me )?wrong|duplicate/i, 'Coding / billing error'],
  [/\ber\b|emergenc|out[- ]of[- ]network|surprise|ambulance|urgent care/i, 'Out-of-network'],
  [/prior auth|pre-?auth|pre-?approv|authoriz|referral|approval/i, 'Prior authorization'],
  [/experimental|investigational|clinical trial|off[- ]label/i, 'Experimental / investigational'],
  [/necessar|necessity|not needed/i, 'Medical necessity'],
  [/not covered|exclu|benefit/i, 'Not a covered benefit'],
  [/step|tried|cheaper|medication|medicine|drug|prescri|pharmac|biologic|pill|insulin/i, 'Step therapy'],
  [/stor(y|ies)|other people|anyone else|community/i, 'stories'],
  [/agent|do it for me|automat/i, 'agent'],
  [/thank|thx|bye|that'?s all/i, 'thanks'],
]

const classify = (t: string) => RULES.find(([re]) => re.test(t))?.[1] ?? null
const isReason = (x: DenialReason | Topic): x is DenialReason => !['deadline', 'privacy', 'stories', 'agent', 'thanks'].includes(x)

export function GuideWidget({ cards }: { cards: WinCard[] }) {
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [typing, setTyping] = useState(false)
  const [askingName, setAskingName] = useState(true)
  const [text, setText] = useState('')
  const nextId = useRef(0)
  const timers = useRef<number[]>([])
  const started = useRef(false)
  const who = useRef('')
  const ctx = useRef<{ reason?: DenialReason; sampleId?: string }>({})
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setTeaser(true), 2500)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])
  useEffect(() => {
    const el = listRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing, replies])

  const comma = () => (who.current ? `, ${who.current}` : '')

  const push = (from: Msg['from'], t: string) => {
    const id = nextId.current++
    setMsgs((m) => [...m, { id, from, text: t }])
  }

  const say = (lines: string[], next: Reply[] = []) => {
    setReplies([])
    setTyping(true)
    lines.forEach((line, i) => {
      timers.current.push(
        window.setTimeout(() => {
          push('june', line)
          if (i === lines.length - 1) {
            setTyping(false)
            setReplies(next)
          }
        }, 700 + i * 1000),
      )
    })
  }

  const echo = (label: string, then: () => void): Reply => ({ label, run: () => { push('me', label); then() } })

  const goReply = (label: string, go: GuideGo): Reply =>
    echo(label, () => {
      guideGo(go)
      if (window.innerWidth < 640) setTimeout(() => setOpen(false), 350)
      say(["Taking you there now. I'll be right down here if you need me."], [menuReply()])
    })

  const nextSteps = (reason?: DenialReason, sampleId?: string): Reply[] => [
    sampleId ? goReply('Walk me through a letter like mine', { section: 'copilot', sampleId }) : goReply('Try the step-by-step walkthrough', { section: 'copilot' }),
    goReply('Have the case agent do it', { section: 'agent', sampleId }),
    goReply(reason ? 'Show me stories like mine' : "Read other people's stories", { section: 'wins', reason }),
    echo('How long do I have?', deadlines),
    echo('Is my info safe?', privacy),
  ]

  const issueReplies = (): Reply[] => ISSUES.map((i) => echo(i.label, () => (i.reason ? explain(i.reason) : tour())))

  const menuReply = (): Reply => echo('Something else', menu)

  function greet() {
    say(["Hi, I'm June. I help people make sense of insurance denials and figure out what to do next.", 'What should I call you?'], [{ label: "I'd rather not say", run: () => takeName('') }])
  }

  function takeName(raw: string) {
    const first = (raw.trim().split(/\s+/)[0] ?? '').replace(/[^\p{L}'-]/gu, '').slice(0, 24)
    who.current = first ? first[0].toUpperCase() + first.slice(1) : ''
    push('me', raw.trim() || "I'd rather not say")
    setAskingName(false)
    say([who.current ? `Nice to meet you, ${who.current}.` : 'No problem at all.', 'So what happened with your insurance? Pick one, or tell me in your own words.'], issueReplies())
  }

  function explain(reason: DenialReason) {
    const sampleId = SAMPLE_FOR[reason]
    ctx.current = { reason, sampleId }
    const s = groupStats(cards.filter((c) => c.reason === reason))
    const stat =
      s.winRate != null
        ? `In our demo stories, ${s.winRate}% of the ${s.n} people who appealed a ${reason.toLowerCase()} denial won or partly won.${s.topTactic ? ` What worked most often: ${s.topTactic.tactic.toLowerCase()}.` : ''}`
        : "Not enough people have shared this kind yet for me to show numbers. I only show groups of 5 or more, for privacy."
    say([EMPATHY[reason], stat, `Here's where I'd go next${comma()}:`], nextSteps(reason, sampleId))
  }

  function tour() {
    say(
      ["No problem. Here's the quick tour:", '"Try it" walks a sample letter all the way to a finished appeal. The case agent does the whole thing for you, step by step. Stories show what worked for other people.'],
      nextSteps(),
    )
  }

  function deadlines() {
    say(
      [
        'Most plans give you 180 days from the date on the denial letter to file an internal appeal. If it\'s urgent, you can ask for a fast decision, usually within 72 hours.',
        'If they say no again, you usually get 4 months to ask for an independent external review. Plans vary, so check your letter. The walkthrough works out your exact dates and reminders.',
      ],
      [goReply('Work out my dates', { section: 'copilot', sampleId: ctx.current.sampleId }), menuReply()],
    )
  }

  function privacy() {
    say(
      [
        'Yes. Your name, birthday, member ID and other details are swapped for placeholders on your device before anything goes to the AI, and put back only on your screen.',
        'If you share your story, it stays anonymous: no names, dates rounded to the quarter, and no numbers for groups smaller than 5.',
      ],
      [goReply('Show me the privacy rules', { section: 'privacy' }), menuReply()],
    )
  }

  function menu() {
    say(['What else can I help with?'], [echo('Tell you about my denial', () => say(['Of course. What happened?'], issueReplies())), ...nextSteps(ctx.current.reason, ctx.current.sampleId).slice(0, 3), echo("That's all, thanks", bye)])
  }

  function bye() {
    say([`Good luck${comma()}. Appeals are worth it, and you don't have to do it alone. I'm right down here if you need me.`], [menuReply()])
  }

  const restart = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    who.current = ''
    ctx.current = {}
    setMsgs([])
    setTyping(false)
    setAskingName(true)
    greet()
  }

  const openChat = () => {
    setOpen(true)
    setTeaser(false)
    if (!started.current) {
      started.current = true
      greet()
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t || typing) return
    setText('')
    if (askingName) return takeName(t)
    push('me', t)
    const c = classify(t)
    if (!c) return say(["Thanks for telling me. I want to point you the right way. Which of these sounds closest?"], issueReplies())
    if (isReason(c)) return explain(c)
    if (c === 'deadline') return deadlines()
    if (c === 'privacy') return privacy()
    if (c === 'thanks') return bye()
    if (c === 'stories') return goReply('', { section: 'wins', reason: ctx.current.reason }).run()
    return goReply('', { section: 'agent', sampleId: ctx.current.sampleId }).run()
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="flex h-[min(580px,calc(100dvh-7.5rem))] w-[calc(100vw-2rem)] max-w-[380px] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-2xl"
            role="dialog"
            aria-label="Chat with June"
          >
            <div className="flex items-center gap-3 bg-brand-700 px-4 py-3 text-white">
              <Avatar className="h-10 w-10 ring-2 ring-white/70" />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold leading-tight">June</p>
                <p className="truncate text-xs text-white/75">Automated guide · not a real person</p>
              </div>
              <button onClick={restart} className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Start over">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close chat">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto bg-paper-50 px-4 py-4">
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${m.from === 'me' ? 'justify-end' : ''}`}>
                  {m.from === 'june' && <Avatar className="h-6 w-6" />}
                  <p className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${m.from === 'me' ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md border border-paper-200 bg-white text-ink-900'}`}>{m.text}</p>
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-end gap-2">
                  <Avatar className="h-6 w-6" />
                  <span className="flex gap-1 rounded-2xl rounded-bl-md border border-paper-200 bg-white px-3.5 py-3" aria-label="June is typing">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-400" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </span>
                </div>
              )}
              {replies.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 pl-8 pt-1">
                  {replies.map((r) => (
                    <button key={r.label} onClick={r.run} className="rounded-full border border-brand-300 bg-white px-3 py-1.5 text-left text-sm font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-50">
                      {r.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-paper-200 bg-white px-3 pb-2 pt-3">
              <div className="flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={askingName ? 'Type your first name' : 'Tell June what happened…'} aria-label="Message June" className="field !text-[15px]" maxLength={300} />
                <button type="submit" disabled={!text.trim() || typing} className="btn-primary !px-3" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[11px] text-ink-700/70">Demo guide. No need to type medical or personal details.</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {teaser && !open && (
          <motion.div key="teaser" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="relative max-w-[250px] rounded-2xl rounded-br-md border border-paper-200 bg-white py-3 pl-4 pr-8 text-sm text-ink-900 shadow-xl">
            <button onClick={openChat} className="text-left">
              <span className="font-bold">Hi, I'm June.</span> Got a denial letter? I can help you figure out where to start.
            </button>
            <button onClick={() => setTeaser(false)} className="absolute right-2 top-2 rounded p-0.5 text-ink-700/60 hover:text-ink-900" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => (open ? setOpen(false) : openChat())}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative rounded-full shadow-xl ring-4 ring-white"
        aria-label={open ? 'Close chat' : 'Chat with June'}
      >
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16" />
        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      </motion.button>
    </div>
  )
}
