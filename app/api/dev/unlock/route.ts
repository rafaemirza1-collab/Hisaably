import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DEV ONLY — remove this file before going live
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete any existing payment row for this user first, then insert fresh
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('payments').delete().eq('user_id', user.id)
  await db.from('payments').insert({
    user_id: user.id,
    stripe_customer_id: 'dev_bypass',
    stripe_subscription_id: 'dev_bypass',
    status: 'active',
  })

  return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/results` })
}
