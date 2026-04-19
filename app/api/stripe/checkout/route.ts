import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const locale = body.locale ?? 'en'
  const base = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer_email: user.email,
    metadata: { user_id: user.id },
    success_url: `${base}/${locale}/results?payment=success`,
    cancel_url: `${base}/${locale}/flow/review?payment=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
