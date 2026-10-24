interface Body {
  docs: { denial: string; records: string; policy: string }
  reason: string
  service: string
  argument: string
  communityTactic: string | null
}

const SYSTEM = `You draft health insurance appeal letters for patients.
The documents you receive are already de-identified: placeholders like [PATIENT_1], [ID_2], [DATE_3], [CLINICIAN_1] stand in for real details. Copy placeholders exactly; never guess the real values.
Return only JSON: {"subject": string, "paragraphs": [{"text": string, "citations": [{"doc": "denial" | "records" | "policy", "quote": string}]}]}
Rules:
- 5 to 7 short paragraphs: request, the plan's own policy standard, the medical evidence, any exception or legal protection that applies, the clinician's assessment, the ask (reverse, or send the claim file and criteria for external review), then a sign-off from the patient.
- Every factual claim about policy or records must be backed by a citation whose "quote" is copied verbatim from the named document (one full sentence, max 300 characters). Never invent policy language, sections, or facts.
- Paragraph text should not repeat the quotes; the UI shows them under the paragraph.
- Plain, firm, professional tone. No legal threats.`

export async function POST(request: Request): Promise<Response> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return new Response('LLM not configured', { status: 501 })
  const body = (await request.json()) as Body
  const total = Object.values(body.docs ?? {}).join('').length
  if (!body.docs || total > 30000) return new Response('Bad request', { status: 400 })

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: JSON.stringify({
            denialReason: body.reason,
            service: body.service,
            suggestedArgument: body.argument,
            whatWorkedForSimilarPatients: body.communityTactic,
            documents: body.docs,
          }),
        },
      ],
    }),
  })
  if (!res.ok) return new Response('Upstream error', { status: 502 })
  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  return new Response(data.choices[0].message.content, { headers: { 'Content-Type': 'application/json' } })
}
