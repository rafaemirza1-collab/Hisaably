import { isPaymentActive } from '@/lib/payments'
import type { Payment } from '@/lib/supabase/types'

describe('isPaymentActive', () => {
  it('returns true when payment status is active', () => {
    const payment = { status: 'active' } as Payment
    expect(isPaymentActive(payment)).toBe(true)
  })

  it('returns false when payment status is cancelled', () => {
    const payment = { status: 'cancelled' } as Payment
    expect(isPaymentActive(payment)).toBe(false)
  })

  it('returns false when payment status is past_due', () => {
    const payment = { status: 'past_due' } as Payment
    expect(isPaymentActive(payment)).toBe(false)
  })

  it('returns false when payment is null', () => {
    expect(isPaymentActive(null)).toBe(false)
  })
})
