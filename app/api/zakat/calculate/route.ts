import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchLivePrices, fetchUsdRate } from '@/lib/zakat/prices'
import { calculateZakat } from '@/lib/zakat/calculate'
import type { ZakatAnswers } from '@/lib/zakat/types'

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Gate: only return results if payment is active
  const { data: payment } = await supabase
    .from('payments')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!payment) {
    return NextResponse.json({ error: 'Payment required' }, { status: 402 })
  }

  const body = await request.json() as { sessionId: string }

  const { data: session, error } = await supabase
    .from('zakat_sessions')
    .select('answers, nisab_preference')
    .eq('id', body.sessionId)
    .eq('user_id', user.id)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const answers = session.answers as ZakatAnswers
  const currency = answers.cash_currency ?? 'USD'
  const [prices, usdRate] = await Promise.all([
    fetchLivePrices(answers.crypto_holdings ?? []),
    fetchUsdRate(currency),
  ])

  // Convert non-USD amounts to USD before calculation
  const convertedAnswers: ZakatAnswers = currency === 'USD' ? answers : {
    ...answers,
    cash_amount: (answers.cash_amount ?? 0) * usdRate,
    investments_value: (answers.investments_value ?? 0) * usdRate,
    receivables_amount: (answers.receivables_amount ?? 0) * usdRate,
    debts_amount: (answers.debts_amount ?? 0) * usdRate,
  }

  const result = calculateZakat(convertedAnswers, prices)

  await supabase
    .from('zakat_sessions')
    .update({ zakat_amount: result.zakat_amount_silver, status: 'complete', result_json: result })
    .eq('id', body.sessionId)

  return NextResponse.json({ result })
}
