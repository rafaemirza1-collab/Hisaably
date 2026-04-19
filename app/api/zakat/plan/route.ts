import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ZakatPlan {
  monthly_target: number
  currency: string
  annual_zakat: number
  message: string
  generated_at: string
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await request.json() as { sessionId: string }

  if (!sessionId) {
    return Response.json({ error: 'sessionId required' }, { status: 400 })
  }

  const { data: session, error } = await supabase
    .from('zakat_sessions')
    .select('id, user_id, zakat_amount, answers, zakat_plan, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single() as { data: { id: string; user_id: string; zakat_amount: number | null; answers: Record<string, unknown> | null; zakat_plan: ZakatPlan | null; status: string } | null; error: unknown }

  if (error || !session) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.status !== 'complete') {
    return Response.json({ error: 'Session not complete' }, { status: 400 })
  }

  // Return existing plan if already generated
  if (session.zakat_plan) {
    return Response.json(session.zakat_plan)
  }

  const amount = session.zakat_amount ?? 0
  const currency = (session.answers as Record<string, unknown>)?.cash_currency as string ?? 'USD'
  const monthly = Math.ceil(amount / 12)

  let plan: ZakatPlan

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      system: 'You are a financial preparation assistant. Return ONLY valid JSON with exactly two keys: monthly_target (number, no decimals) and message (string, max 120 chars, encouraging and practical). No other text.',
      messages: [{
        role: 'user',
        content: `Annual Zakat: ${amount} ${currency}. Monthly target would be ${monthly} ${currency}. Generate a monthly preparation plan JSON.`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const parsed = JSON.parse(text) as { monthly_target: number; message: string }

    plan = {
      monthly_target: parsed.monthly_target ?? monthly,
      message: parsed.message ?? `Setting aside ${monthly} ${currency} per month will prepare you for next year.`,
      currency,
      annual_zakat: amount,
      generated_at: new Date().toISOString(),
    }
  } catch {
    plan = {
      monthly_target: monthly,
      message: `Setting aside ${monthly} ${currency} per month will keep you prepared for next year.`,
      currency,
      annual_zakat: amount,
      generated_at: new Date().toISOString(),
    }
  }

  await supabase
    .from('zakat_sessions')
    .update({ zakat_plan: plan })
    .eq('id', sessionId)

  return Response.json(plan)
}
