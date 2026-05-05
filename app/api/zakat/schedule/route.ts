import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, schedule } = await request.json() as { sessionId: string; schedule: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('zakat_sessions') as any)
    .update({ payment_schedule: schedule })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
