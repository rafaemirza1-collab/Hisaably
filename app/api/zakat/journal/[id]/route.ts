import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: entry } = await supabase
    .from('zakat_journal')
    .select('session_id, type')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  await supabase.from('zakat_journal').delete().eq('id', params.id).eq('user_id', user.id)

  if (entry?.type === 'payment' && entry?.session_id) {
    const { data: payments } = await supabase
      .from('zakat_journal')
      .select('amount')
      .eq('session_id', entry.session_id)
      .eq('type', 'payment')

    const total = (payments ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('zakat_sessions') as any)
      .update({ plan_progress: total })
      .eq('id', entry.session_id)
      .eq('user_id', user.id)
  }

  return NextResponse.json({ ok: true })
}
