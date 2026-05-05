import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildSessionUpdate } from '@/lib/session'
import type { Answers } from '@/lib/session'

// GET /api/zakat/session — load the user's current session
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prefer an in-progress session (user mid-flow)
  const { data: inProgress } = await supabase
    .from('zakat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (inProgress) return NextResponse.json({ session: inProgress })

  // Prefer the official session (user's marked Zakat for this year)
  const { data: official } = await supabase
    .from('zakat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'complete')
    .eq('is_official', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (official) return NextResponse.json({ session: official })

  // Fall back to most recent completed session
  const { data: completed } = await supabase
    .from('zakat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({ session: completed ?? null })
}

// POST /api/zakat/session — create or update session
export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    sessionId?: string
    step: number
    answers: Answers
    nisabPreference?: 'gold' | 'silver' | 'both'
  }

  if (body.sessionId) {
    const { data: existing } = await supabase
      .from('zakat_sessions')
      .select('answers')
      .eq('id', body.sessionId)
      .eq('user_id', user.id)
      .single()

    const existingAnswers = (existing?.answers as Answers) ?? {}
    const update = buildSessionUpdate(body.step, existingAnswers, body.answers)

    const { data, error } = await supabase
      .from('zakat_sessions')
      .update(update)
      .eq('id', body.sessionId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ session: data })
  }

  const { data, error } = await supabase
    .from('zakat_sessions')
    .insert({
      user_id: user.id,
      current_step: body.step,
      answers: body.answers,
      nisab_preference: body.nisabPreference ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data }, { status: 201 })
}

// PATCH /api/zakat/session — handles label and official actions
export async function PATCH(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { action: 'label' | 'official'; sessionId: string; label?: string }

  if (body.action === 'label') {
    const { data: session } = await supabase.from('zakat_sessions').select('answers').eq('id', body.sessionId).eq('user_id', user.id).single()
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await supabase.from('zakat_sessions').update({ answers: { ...session.answers, session_label: body.label } }).eq('id', body.sessionId)
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'official') {
    await supabase.from('zakat_sessions').update({ is_official: false }).eq('user_id', user.id)
    const { error } = await supabase.from('zakat_sessions').update({ is_official: true }).eq('id', body.sessionId).eq('user_id', user.id)
    if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
