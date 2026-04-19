import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, label } = await request.json()

  const { data: session } = await supabase
    .from('zakat_sessions')
    .select('answers')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase
    .from('zakat_sessions')
    .update({ answers: { ...session.answers, session_label: label } })
    .eq('id', sessionId)

  return NextResponse.json({ ok: true })
}
