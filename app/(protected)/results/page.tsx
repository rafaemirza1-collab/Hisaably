/* eslint-disable react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ResultsBreakdown } from '@/components/results/ResultsBreakdown'
import { ResultsAskMizan } from '@/components/results/ResultsAskMizan'
import type { ZakatResult } from '@/lib/zakat/types'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<ZakatResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hawlConfirmed, setHawlConfirmed] = useState<boolean | null>(null)
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedAt] = useState(() => new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }))

  useEffect(() => {
    async function loadResults() {
      try {
        const sessionRes = await fetch('/api/zakat/session')
        const { session } = await sessionRes.json()
        if (!session) { router.push('/flow'); return }

        const calcRes = await fetch('/api/zakat/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id }),
        })

        if (calcRes.status === 402) { router.push(`/flow/review?sessionId=${session.id}`); return }
        if (!calcRes.ok) { setError('Unable to load your results. Please try again.'); setLoading(false); return }

        const data = await calcRes.json()
        setResult(data.result)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [router])

  // Only stream summary after hawl is confirmed
  useEffect(() => {
    if (hawlConfirmed === true && result && !aiSummary) {
      streamSummary(result)
    }
  }, [hawlConfirmed, result])

  async function streamSummary(r: ZakatResult) {
    setAiLoading(true)
    const meetsNisab = r.nisab_met_silver || r.nisab_met_gold

    // Calculate raw net (before clamping) so AI understands negative wealth
    const totalAssets = r.categories.filter(c => c.included && c.zakatable_value > 0).reduce((s, c) => s + c.zakatable_value, 0)
    const totalDebts = Math.abs(r.categories.find(c => c.category === 'Debts Owed')?.zakatable_value ?? 0)
    const rawNet = totalAssets - totalDebts

    const categoryLines = r.categories
      .filter(c => c.included)
      .map(c => `${c.category}: $${fmt(c.zakatable_value)}`)
      .join(', ') || 'No zakatable assets entered'

    const summaryContext = `Write a warm, personalized Zakat result summary for this specific user. Reference their actual numbers directly.

Their financial breakdown:
- Total assets entered: $${fmt(totalAssets)}
- Total debts entered: $${fmt(totalDebts)}
- Net wealth (assets minus debts): $${fmt(rawNet)} ${rawNet < 0 ? '(negative — debts exceed assets)' : ''}
- Zakatable wealth used for calculation: $${fmt(r.total_zakatable_wealth)} (floored at $0)
- Silver nisab threshold today: $${fmt(r.nisab_silver_usd)}
- Gold nisab threshold today: $${fmt(r.nisab_gold_usd)}
- Meets silver nisab: ${r.nisab_met_silver}
- Meets gold nisab: ${r.nisab_met_gold}
- Zakat owed (silver nisab): $${fmt(r.zakat_amount_silver)}
- Asset categories: ${categoryLines}

Instructions: Write exactly 3-4 sentences. Use their actual dollar amounts. ${meetsNisab
  ? `They OWE Zakat of $${fmt(r.zakat_amount_silver)}. Be clear, encouraging, and specific about the amount.`
  : rawNet < 0
    ? `Their debts ($${fmt(totalDebts)}) exceed their assets ($${fmt(totalAssets)}), making Zakat not due. Explain this clearly and compassionately.`
    : `Their zakatable wealth ($${fmt(r.total_zakatable_wealth)}) is below the silver nisab threshold ($${fmt(r.nisab_silver_usd)}). Explain why no Zakat is due and be reassuring.`
}
End with one brief Islamic blessing or encouragement (one sentence). Warm, human tone — not robotic or formulaic.`

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'summary', summaryContext }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
        setAiSummary(fullText)
      }
    }
    setAiLoading(false)
  }

  async function handleCopy() {
    if (!result) return
    const meetsNisab = result.nisab_met_silver || result.nisab_met_gold
    const text = `Mizan Zakat Report — ${generatedAt}
${meetsNisab ? `Zakat Due: $${fmt(result.zakat_amount_silver)} (Silver Nisab · 2.5%)` : 'Status: Zakat not due this year'}
Zakatable Wealth: $${fmt(result.total_zakatable_wealth)}
Silver Nisab: $${fmt(result.nisab_silver_usd)} | Gold Nisab: $${fmt(result.nisab_gold_usd)}

${aiSummary}

This report is for personal reference only. Consult a qualified scholar for your situation. Mizan does not issue fatwas.`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-emerald rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-cream/50">Calculating your Zakat...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <p className="text-cream font-medium mb-2">Something went wrong</p>
          <p className="text-sm text-cream/50 mb-6">{error}</p>
          <button onClick={() => router.push('/flow')} className="px-6 py-3 bg-emerald text-white rounded-xl text-sm font-medium">
            Start over
          </button>
        </div>
      </main>
    )
  }

  if (!result) return null

  const meetsNisab = result.nisab_met_silver || result.nisab_met_gold
  const hasLargeDebt = result.categories.some(c => c.category === 'Debts Owed' && Math.abs(c.zakatable_value) > 50000)
  const totalAssets = result.categories.filter(c => c.included && c.zakatable_value > 0).reduce((s, c) => s + c.zakatable_value, 0)
  const totalDebts = Math.abs(result.categories.find(c => c.category === 'Debts Owed')?.zakatable_value ?? 0)
  const rawNet = totalAssets - totalDebts

  return (
    <main className="min-h-screen bg-navy">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Image src="/logo-icon.png" alt="Mizan" width={48} height={48} />
        <button
          onClick={() => router.push('/flow')}
          className="text-xs text-cream/40 hover:text-cream/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5"
        >
          ← Edit answers
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Header */}
        <div>
          <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">Mizan Zakat Report</p>
          <h1 className="text-3xl font-bold text-cream">Your Zakat Result</h1>
          <p className="text-cream/30 text-sm mt-1">{generatedAt}</p>
        </div>

        {/* Hawl confirmation — shown before result */}
        {hawlConfirmed === null && (
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
            <p className="text-gold text-sm font-semibold mb-1">One quick question before your result</p>
            <p className="text-cream/70 text-sm mb-1">
              Zakat is only due on wealth held for a full lunar year <span className="text-cream font-medium">(hawl)</span>.
            </p>
            <p className="text-cream/50 text-xs mb-5">
              This means your wealth must have been at or above the nisab threshold for one complete lunar year.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setHawlConfirmed(true)}
                className="flex-1 py-3 bg-emerald text-white rounded-xl text-sm font-semibold hover:bg-emerald/90 transition-colors"
              >
                Yes — full year
              </button>
              <button
                onClick={() => setHawlConfirmed(false)}
                className="flex-1 py-3 border border-white/10 text-cream/60 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                No / Not sure
              </button>
            </div>
          </div>
        )}

        {/* Hawl = No — show explanation but still allow them to see result */}
        {hawlConfirmed === false && (
          <>
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
              <p className="text-gold text-sm font-semibold mb-2">Hawl may not be complete</p>
              <p className="text-cream/70 text-sm leading-relaxed mb-3">
                Zakat is only obligatory on wealth held for one complete lunar year. If your assets have not yet been at or above the nisab threshold for a full year, Zakat is not yet due.
              </p>
              <p className="text-cream/50 text-xs leading-relaxed">
                Track the date your wealth first reached the nisab threshold. When one lunar year (354 days) has passed, that is when Zakat becomes due. Come back and recalculate then.
              </p>
              <button
                onClick={() => setHawlConfirmed(null)}
                className="mt-4 text-xs text-gold/70 hover:text-gold transition-colors underline"
              >
                ← Go back
              </button>
            </div>

            {/* Still show the result below with a note */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-cream/40 text-xs">Your calculation result is shown below for reference only.</span>
              <button
                onClick={() => setHawlConfirmed(true)}
                className="text-xs text-gold hover:text-gold/80 transition-colors whitespace-nowrap"
              >
                Show result →
              </button>
            </div>
          </>
        )}

        {/* Main result — shown when hawl answered (either yes or they click show anyway) */}
        {hawlConfirmed !== null && (
          <>
            {/* Verdict card */}
            <div className={`rounded-2xl p-8 border ${meetsNisab ? 'bg-emerald/10 border-emerald/30' : 'bg-white/5 border-white/10'}`}>
              {meetsNisab ? (
                <>
                  <p className="text-emerald text-xs font-semibold uppercase tracking-wide mb-3">Zakat is due this year</p>
                  <p className="text-5xl font-bold text-cream mb-2">${fmt(result.zakat_amount_silver)}</p>
                  <p className="text-cream/50 text-sm mb-1">Silver Nisab · 2.5% of ${fmt(result.total_zakatable_wealth)}</p>
                  {result.zakat_amount_gold !== result.zakat_amount_silver && (
                    <p className="text-cream/30 text-xs mb-4">
                      Gold Nisab result: ${fmt(result.zakat_amount_gold)}{!result.nisab_met_gold ? ' — below gold nisab, not obligatory by this measure' : ''}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-cream/60 text-sm italic">
                      "Paying it purifies your wealth and fulfills your obligation to Allah."
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-cream/40 text-xs font-semibold uppercase tracking-wide mb-3">No Zakat due this year</p>
                  <p className="text-3xl font-bold text-cream mb-2">
                    {rawNet < 0 ? 'Debts exceed assets' : 'Below nisab threshold'}
                  </p>
                  <p className="text-cream/50 text-sm mb-1">
                    {rawNet < 0
                      ? `Your debts ($${fmt(totalDebts)}) exceed your zakatable assets ($${fmt(totalAssets)})`
                      : `Your zakatable wealth ($${fmt(result.total_zakatable_wealth)}) is below the silver nisab of $${fmt(result.nisab_silver_usd)}`
                    }
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-cream/60 text-sm italic">
                      "You do not owe Zakat this year. May Allah bless your wealth and increase it."
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Nisab thresholds today */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-cream/40 mb-1">Silver Nisab today</p>
                <p className="text-lg font-semibold text-cream">${fmt(result.nisab_silver_usd)}</p>
                <p className="text-xs text-cream/30 mt-0.5">612g of silver</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-cream/40 mb-1">Gold Nisab today</p>
                <p className="text-lg font-semibold text-cream">${fmt(result.nisab_gold_usd)}</p>
                <p className="text-xs text-cream/30 mt-0.5">85g of gold</p>
              </div>
            </div>

            {/* Math breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-cream mb-4">How it was calculated</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream/60">Total zakatable assets</span>
                  <span className="text-sm font-medium text-cream">${fmt(totalAssets)}</span>
                </div>
                {totalDebts > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cream/60">− Debts deducted</span>
                    <span className="text-sm font-medium text-red-400">−${fmt(totalDebts)}</span>
                  </div>
                )}
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream/60">= Net zakatable wealth</span>
                  <span className={`text-sm font-semibold ${rawNet < 0 ? 'text-red-400' : 'text-cream'}`}>
                    {rawNet < 0 ? `−$${fmt(Math.abs(rawNet))}` : `$${fmt(result.total_zakatable_wealth)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream/60">Silver nisab threshold</span>
                  <span className="text-sm text-cream/50">${fmt(result.nisab_silver_usd)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-cream">
                    {meetsNisab ? '× 2.5% Zakat rate' : rawNet < 0 ? 'Debts exceed assets — no Zakat due' : 'Below nisab — no Zakat due'}
                  </span>
                  {meetsNisab && (
                    <span className="text-sm font-bold text-emerald">${fmt(result.zakat_amount_silver)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Personalized AI summary — only streams after hawl confirmed */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Mizan's Summary</p>
              {aiLoading && !aiSummary ? (
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
                  <div className="h-3 bg-white/10 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <p
                  className="text-cream/70 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: aiSummary
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cream">$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
              )}
            </div>

            {/* Asset breakdown */}
            <div>
              <h2 className="text-sm font-semibold text-cream mb-3">Asset Breakdown</h2>
              <ResultsBreakdown categories={result.categories} />
            </div>

            {/* Scholarly note — auto-shown for large debts */}
            {hasLargeDebt && (
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                <p className="text-gold text-xs font-semibold mb-1">Scholarly Note on Debts</p>
                <p className="text-cream/60 text-xs leading-relaxed">
                  You have a significant debt recorded. Scholars differ on whether long-term debts such as mortgages reduce zakatable wealth — some madhabs only allow short-term liabilities to be deducted. The Hanafi madhab generally allows all debts; others are more restrictive. You may wish to consult a qualified scholar for your specific situation.
                </p>
              </div>
            )}

            {/* What to do next */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-cream mb-4">What to do next</h2>
              {meetsNisab ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-emerald text-sm mt-0.5">✓</span>
                    <p className="text-sm text-cream/70">Pay your Zakat before the end of Ramadan if possible — it is the most blessed time to give.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald text-sm mt-0.5">✓</span>
                    <div>
                      <p className="text-sm text-cream/70 mb-1">Trusted organizations to give through:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['Islamic Relief', 'LaunchGood', 'Zakat Foundation', 'Local Masjid'].map(org => (
                          <span key={org} className="text-xs bg-white/5 border border-white/10 text-cream/60 rounded-lg px-3 py-1">{org}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald text-sm mt-0.5">✓</span>
                    <p className="text-sm text-cream/70">Set a reminder to recalculate next Ramadan — your obligation changes with your wealth.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-cream/30 text-sm mt-0.5">○</span>
                    <p className="text-sm text-cream/70">You do not owe Zakat this year. Check again next Ramadan — your situation may change.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-cream/30 text-sm mt-0.5">○</span>
                    <p className="text-sm text-cream/70">Consider giving voluntary charity (Sadaqah) — it is always rewarded and never obligatory, but always welcome.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-cream/30 text-sm mt-0.5">○</span>
                    <p className="text-sm text-cream/70">If your wealth grows to or above the nisab threshold during the year, that date starts your hawl countdown.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Unlimited Q&A */}
            <ResultsAskMizan />

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 border border-white/10 text-cream/60 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy summary'}
              </button>
              <button
                onClick={() => router.push('/flow')}
                className="flex-1 py-3 bg-emerald/10 border border-emerald/30 text-emerald rounded-xl text-sm font-medium hover:bg-emerald/20 transition-colors"
              >
                Recalculate
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-cream/20 text-center leading-relaxed pb-8">
              This report is for personal reference only. Consult a qualified scholar for your specific situation. Mizan does not issue fatwas.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
