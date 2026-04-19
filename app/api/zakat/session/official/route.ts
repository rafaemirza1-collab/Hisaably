import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { sessionId } = await request.json() as { sessionId: string }
  if (!sessionId) return new Response('Bad request', { status: 400 })

  // Clear official flag from all user's sessions
  await supabase
    .from('zakat_sessions')
    .update({ is_official: false })
    .eq('user_id', user.id)

  // Set the chosen session as official
  const { error } = await supabase
    .from('zakat_sessions')
    .update({ is_official: true })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return new Response('Failed to update', { status: 500 })

  return NextResponse.json({ ok: true })
}
