'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { ZakatAnswers } from '@/lib/zakat/types'

export default function ReviewPage() {
  const [answers, setAnswers] = useState<ZakatAnswers | null>(null)
  const [loading, setLoading] = useState(false)
  const [devLoading, setDevLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/zakat/session')
      const { session } = await res.json()
      if (session) setAnswers(session.answers as ZakatAnswers)
    }
    load()
  }, [])

  async function handleDevUnlock() {
    setDevLoading(true)
    const res = await fetch('/api/dev/unlock', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setDevLoading(false)
  }

  async function handleUnlock() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  const summaryRows = [
    { label: 'Cash & Bank', value: answers?.cash_amount ?? 0 },
    { label: 'Gold & Silver', value: (answers?.gold_is_jewelry ? 0 : answers?.gold_grams ?? 0) },
    { label: 'Crypto', value: (answers?.crypto_holdings?.length ?? 0) > 0 ? '✓ Added' : '—' },
    { label: 'Investments', value: answers?.investments_value ?? 0 },
    { label: 'Receivables', value: answers?.receivables_amount ?? 0 },
    { label: 'Debts', value: answers?.debts_amount ?? 0 },
  ]

  return (
    <main className="min-h-screen bg-navy">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 relative">
        <Image src="/logo-icon.png" alt="Mizan" width={48} height={48} />
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-cream mb-2">Your Zakat Summary</h1>
        <p className="text-cream/50 mb-8">Review your inputs before unlocking your result.</p>

        {/* Summary table */}
        <div className="border border-white/10 rounded-xl overflow-hidden mb-8">
          {summaryRows.map(row => (
            <div key={row.label} className="flex justify-between px-5 py-3 border-b border-white/5 last:border-0">
              <span className="text-sm text-cream/50">{row.label}</span>
              <span className="text-sm font-medium text-cream">
                {typeof row.value === 'number' ? `$${row.value.toLocaleString()}` : row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Blurred result preview */}
        <div className="relative border border-white/10 rounded-xl p-6 mb-8 overflow-hidden bg-white/5">
          <div className="blur-sm select-none">
            <p className="text-xs text-cream/40 uppercase tracking-wide mb-1">Zakat Due</p>
            <p className="text-4xl font-bold text-cream">$•••.••</p>
            <p className="text-sm text-cream/30 mt-1">Based on silver nisab · 2.5%</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-semibold text-gold">Unlock to see your result</p>
          </div>
        </div>

        {/* Paywall CTA */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <p className="text-cream font-semibold mb-1">Unlock your full Zakat calculation</p>
          <p className="text-cream/40 text-sm mb-6">
            Breakdown by category · AI explanations · Exportable report
          </p>
          <button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-4 bg-emerald text-white rounded-xl font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Redirecting...' : 'Unlock for $24.99/year'}
          </button>
          <p className="text-xs text-cream/30 mt-3">Cancel anytime. Billed annually.</p>

          {/* DEV ONLY — remove before launch */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleDevUnlock}
              disabled={devLoading}
              className="w-full py-3 border border-dashed border-white/20 text-cream/30 rounded-xl text-sm hover:border-white/30 hover:text-cream/50 disabled:opacity-50 transition-colors"
            >
              {devLoading ? 'Loading...' : '[Dev] View results for free'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
