import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  let query = db
    .from('zakat_journal')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: true })

  if (sessionId) query = query.eq('session_id', sessionId)

  const { data } = await query
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const body = await request.json() as {
    session_id?: string
    entry_date: string
    amount?: number
    note?: string
    type: 'payment' | 'reminder'
  }

  const { data, error } = await db
    .from('zakat_journal')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.type === 'payment' && body.session_id) {
    const { data: payments } = await db
      .from('zakat_journal')
      .select('amount')
      .eq('session_id', body.session_id)
      .eq('type', 'payment')

    const total = (payments ?? []).reduce((sum: number, p: { amount: number }) => sum + (p.amount ?? 0), 0)
    await db
      .from('zakat_sessions')
      .update({ plan_progress: total })
      .eq('id', body.session_id)
      .eq('user_id', user.id)
  }

  return NextResponse.json(data)
}

// PATCH /api/zakat/journal?action=schedule — save payment schedule
export async function PATCH(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { sessionId, schedule } = await request.json() as { sessionId: string; schedule: string }
  await db.from('zakat_sessions').update({ payment_schedule: schedule }).eq('id', sessionId).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
