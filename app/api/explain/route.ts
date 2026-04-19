import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LOCALE_NAMES: Record<string, string> = {
  en: 'English', ar: 'Arabic', ur: 'Urdu', hi: 'Hindi', bn: 'Bengali',
  fr: 'French', es: 'Spanish', tr: 'Turkish', fa: 'Farsi/Persian',
  kk: 'Kazakh', uz: 'Uzbek', ru: 'Russian', zh: 'Mandarin Chinese',
}

const SYSTEM_PROMPT = `You are Mizan, an AI Zakat assistant. You help Muslims understand their Zakat obligations clearly and confidently.

Rules:
- Answer Zakat questions only
- If asked about anything outside Zakat, briefly acknowledge and redirect: "That's a great question but outside Mizan's scope. For your Zakat specifically..."
- Never give a fatwa or claim religious authority
- Always recommend consulting a scholar for complex cases
- Keep responses under 150 words unless the user asks for more
- Tone: calm, clear, trustworthy, warm`

const STEP_EXPLANATIONS: Record<number, string> = {
  1: 'Explain why cash and bank balances are Zakatable. Mention that savings held for a full lunar year (hawl) above the nisab threshold are subject to 2.5% Zakat. Keep it under 80 words.',
  2: 'Explain the Zakat ruling on gold and silver. Mention that worn jewelry is generally excluded per Hanafi opinion, but some scholars include it. Keep it under 80 words.',
  3: 'Explain the Zakat ruling on cryptocurrency. Most contemporary scholars treat crypto as a tradeable asset subject to Zakat at market value. Keep it under 80 words.',
  4: 'Explain the Zakat ruling on stocks and investments. Actively traded stocks: full market value. Long-term holdings: consult a scholar. Retirement accounts vary by madhab. Keep it under 80 words.',
  5: 'Explain that money genuinely owed to you (receivables) is Zakatable if you expect to receive it. Doubtful debts may be excluded. Keep it under 80 words.',
  6: 'Explain that immediate debts you owe can be deducted from your Zakatable wealth. Long-term debts like mortgages: scholars differ — consult your madhab. Keep it under 80 words.',
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json() as {
    type: 'step' | 'question' | 'summary'
    step?: number
    question?: string
    summaryContext?: string
    zakatContext?: string
    madhab?: string
    locale?: string
  }

  const locale = body.locale ?? 'en'
  const languageName = LOCALE_NAMES[locale] ?? 'English'
  const languageInstruction = locale !== 'en'
    ? `\n\nIMPORTANT: You MUST respond entirely in ${languageName}. Do not use English. Islamic terms like Zakat, nisab, hawl, sadaqah should use their standard form in ${languageName}.`
    : ''

  const MADHAB_NOTES: Record<string, string> = {
    hanafi: 'The user follows the Hanafi madhab: worn gold/silver jewelry is exempt from Zakat; all debts (including long-term) are deductible from zakatable wealth.',
    maliki: "The user follows the Maliki madhab: worn jewelry is included in zakatable wealth; only short-term debts are deductible.",
    shafii: "The user follows the Shafi'i madhab: worn jewelry is included in zakatable wealth; only short-term debts are deductible.",
    hanbali: 'The user follows the Hanbali madhab: worn jewelry is included in zakatable wealth; only short-term debts are deductible.',
  }
  const madhabNote = body.madhab && MADHAB_NOTES[body.madhab]
    ? `\n\nMadhab context: ${MADHAB_NOTES[body.madhab]} Apply this madhab's rulings when answering.`
    : ''

  const contextAddition = body.zakatContext
    ? `\n\nUser's Zakat context: ${body.zakatContext}. Reference these specific numbers naturally when relevant — don't repeat them robotically.`
    : ''
  const systemPrompt = SYSTEM_PROMPT + madhabNote + contextAddition + languageInstruction

  let userMessage: string

  if (body.type === 'step' && body.step !== undefined) {
    userMessage = STEP_EXPLANATIONS[body.step] ?? 'Briefly explain Zakat in general terms.'
  } else if (body.type === 'question' && body.question) {
    userMessage = body.question
  } else if (body.type === 'summary' && body.summaryContext) {
    userMessage = body.summaryContext
  } else {
    return new Response('Invalid request', { status: 400 })
  }

  const maxTokens = body.type === 'summary' ? 350 : body.type === 'step' ? 120 : 200

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
