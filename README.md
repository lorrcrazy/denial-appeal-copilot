# Denial Appeal Copilot

Upload an insurance denial and the relevant records. Patient details are swapped for placeholders on the device, an LLM drafts an appeal that quotes the plan's own policy (every quote is checked against the uploaded documents), and real names are put back locally. Patients can then share an anonymized "Appeal Win" to help the next person.

Hackathon prototype. **All letters, people, insurers, and Appeal Wins are synthetic.** Not legal or medical advice.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # oxlint
```

The demo works with no API key: appeal drafting falls back to a deterministic template that still cites real quotes from the documents.

To use a real LLM, set `OPENAI_API_KEY` (optional `OPENAI_MODEL`, default `gpt-4o-mini`) in Vercel project settings. `/api/appeal` only ever receives redacted text. Locally, `vercel dev` runs the API; plain `npm run dev` uses the fallback.

## Deploy

vercel.com → Add New → Project → Import `lorrcrazy/denial-appeal-copilot` → Deploy. Every push to `main` auto-deploys. Keep `main` runnable.

## Demo flow

1. Copilot → pick a sample case → Analyze denial
2. Watch the redaction (left: on device, right: what the LLM sees)
3. Decoder: plain English, odds score, "people like you won with X"
4. Appeal: click any quote to see it highlighted in the source document
5. Deadlines → "Share the win" → watch the live redaction → Post anonymously

## Structure

One folder per feature. Each folder has pure logic (`*.ts`) plus its UI (`*.tsx`), so logic can be changed without touching layout.

```
api/appeal.ts                 Vercel serverless function (OpenAI, redacted input only)
src/App.tsx                   Page composition + shared state (posted wins)
src/features/
  agent/       agents.ts       8 helpers: intake, organizer, policy, evidence, drafter, tracker, submit (simulated), outcomes
               AgentSection    Step-by-step agent run with approval gate
  guide/       GuideWidget     "June" chat bubble: asks name + issue, routes to sections (scripted, no API)
  redaction/   redact.ts       Local PII detection, placeholder vault, restore, share-time anonymizer
               RedactionView   Side-by-side animated redaction
  decoder/     decode.ts       Denial reason, windows, evidence, odds estimate
               DecoderPanel, OddsGauge
  appeal/      draft.ts        Mock draft, API call, citation verification
               AppealPanel     Draft + clickable verified citations
  deadlines/   deadlines.ts    Timeline + .ics reminders
               DeadlinePanel   Timeline, checklist, share CTA
  community/   seed.ts         60 synthetic Appeal Win cards
               stats.ts        Group stats (hidden under 5), quarter series
               CommunitySection, WinCardView, ShareWinModal, Charts, LiveTicker
  workspace/   useCase.ts      Runs redaction + decoding for a case
               UploadPanel, Workspace (step flow)
  landing/     Nav, Hero, HeroLines, Pipeline, Privacy, Footer
src/data/      samples.ts (3 synthetic cases), credits.ts (photo credits)
src/components Shared UI bits (AnimatedNumber, FlowConnector, ...)
```

## Who owns what

Fill in names so turns don't collide:

| Area | Folder | Owner |
| --- | --- | --- |
| Redaction / privacy | `src/features/redaction` | |
| Decoder + odds | `src/features/decoder` | |
| Appeal drafting + API | `src/features/appeal`, `api/` | |
| Deadlines | `src/features/deadlines` | |
| Appeal Wins community | `src/features/community` | |
| Case agent (8-step workflow) | `src/features/agent` | |
| Chat guide (June) | `src/features/guide`, `src/lib/guide.ts` | |
| Landing / design | `src/features/landing`, `src/index.css` | |

## Privacy rules (enforced in code)

- Names, IDs, DOBs, addresses, phones, emails, dates are replaced before any network call (`redaction/redact.ts`)
- Shared wins: anonymous handle, dates → quarters, ages → ranges, clinicians → `[clinician]`, broad condition buckets
- Community stats hidden for groups under 5 (`community/stats.ts`, `MIN_GROUP`)

Regex redaction is a demo stand-in; a production version should use a proper PII model (e.g. Microsoft Presidio) on device.

## Sources and credits

- "Fewer than 1% of denied claims were appealed" and 56% of appeals upheld (44% overturned): [KFF, Claims Denials and Appeals in ACA Marketplace Plans in 2023](https://www.kff.org/private-insurance/claims-denials-and-appeals-in-aca-marketplace-plans-in-2023/)
- Photos: Flickr, CC BY / CC BY-SA 2.0 (authors and links in `src/data/credits.ts` and the site footer)

## Roadmap

Accounts, comments, moderation, PDF/OCR upload, on-device PII model, real insurer policy library.
