import type { Payment } from '@/lib/supabase/types'

export function isPaymentActive(payment: Payment | null): boolean {
  return payment?.status === 'active'
}
