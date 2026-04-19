import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('zakat_sessions')
    .select('id, created_at, updated_at, zakat_amount, nisab_preference, answers, result_json, is_official')
    .eq('user_id', user.id)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ history: data ?? [] })
}
