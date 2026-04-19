import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new NextResponse('Webhook signature verification failed', { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (createClient() as any)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (!userId) return new NextResponse('Missing user_id', { status: 400 })

    await db.from('payments').upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      status: 'active',
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const status = subscription.status === 'active' ? 'active'
      : subscription.status === 'past_due' ? 'past_due'
      : 'cancelled'

    await db
      .from('payments')
      .update({ status, renewed_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscription.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await db
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', subscription.id)
  }

  return new NextResponse(null, { status: 200 })
}
