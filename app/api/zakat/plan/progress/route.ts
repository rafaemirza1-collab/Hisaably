import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, progress } = await request.json() as { sessionId: string; progress: number }

  if (!sessionId || progress == null) {
    return Response.json({ error: 'sessionId and progress required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('zakat_sessions') as any)
    .update({ plan_progress: progress })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  return Response.json({ ok: true })
}
