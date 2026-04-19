/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { NisabPreference } from '@/lib/zakat/types'

export default function FlowWelcomePage() {
  const router = useRouter()
  const [nisab, setNisab] = useState<NisabPreference>('silver')
  const [loading, setLoading] = useState(false)

  async function handleBegin() {
    setLoading(true)
    const res = await fetch('/api/zakat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 0,
        answers: { nisab_preference: nisab },
        nisabPreference: nisab,
      }),
    })
    const { session } = await res.json()
    router.push(`/flow/1?sessionId=${session.id}`)
  }

  const options = [
    { value: 'silver' as NisabPreference, label: 'Silver nisab', desc: '612g of silver (~$350) — most scholars recommend this' },
    { value: 'gold' as NisabPreference, label: 'Gold nisab', desc: '85g of gold (~$8,500) — more restrictive' },
    { value: 'both' as NisabPreference, label: 'Show both', desc: 'Calculate using gold and silver nisab' },
  ]

  return (
    <main className="min-h-screen bg-navy flex flex-col">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 relative">
        <Image src="/logo-icon.png" alt="Mizan" width={48} height={48} />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <p className="text-gold text-sm font-semibold uppercase tracking-wide mb-3">Assalamu Alaikum</p>
          <h1 className="text-3xl font-bold text-cream mb-3">Let's calculate your Zakat</h1>
          <p className="text-cream/50 mb-10">
            This takes about 5 minutes. We'll walk through each asset category step by step.
          </p>

          <p className="text-sm font-semibold text-cream/70 mb-4">
            Which nisab threshold would you like to use?
          </p>

          <div className="flex flex-col gap-3 mb-10">
            {options.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-4 border rounded-xl p-4 cursor-pointer transition-all ${
                  nisab === opt.value
                    ? 'border-emerald bg-emerald/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="nisab"
                  value={opt.value}
                  checked={nisab === opt.value}
                  onChange={() => setNisab(opt.value)}
                  className="mt-0.5 accent-emerald"
                />
                <div>
                  <p className="font-semibold text-cream">{opt.label}</p>
                  <p className="text-sm text-cream/40 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleBegin}
            disabled={loading}
            className="w-full py-4 bg-emerald text-white rounded-xl text-base font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Starting...' : 'Begin Zakat calculation →'}
          </button>
        </div>
      </div>
    </main>
  )
}
