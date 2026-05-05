'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { AppShell } from '@/components/AppShell'
import { ResultsBreakdown } from '@/components/results/ResultsBreakdown'
import { ResultsAskHisaably } from '@/components/results/ResultsAskHisaably'
import { PdfDownloadButton } from '@/components/results/PdfDownloadButton'
import { ZakatRoadmap } from '@/components/roadmap/ZakatRoadmap'
import type { ZakatResult } from '@/lib/zakat/types'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('results')
  const locale = useLocale()
  const [result, setResult] = useState<ZakatResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hawlConfirmed, setHawlConfirmed] = useState<boolean | null>(null)
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isReturnVisit, setIsReturnVisit] = useState(false)
  const [userName, setUserName] = useState('')
  const [madhab, setMadhab] = useState('')
  const [needsRecalculate, setNeedsRecalculate] = useState(false)
  const [activeTab, setActiveTab] = useState<'result' | 'history'>(
    searchParams.get('tab') === 'history' ? 'history' : 'result'
  )
  const [history, setHistory] = useState<Array<{
    id: string
    created_at: string
    zakat_amount: number | null
    nisab_preference: string | null
    answers: Record<string, unknown>
    result_json: { zakat_amount_silver: number; total_zakatable_wealth: number; nisab_met_silver: boolean } | null
    is_official: boolean | null
  }>>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [markingOfficial, setMarkingOfficial] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState(() => new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }))
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hisaably_display_currency') || 'USD'
    }
    return 'USD'
  })
  const [fxRate, setFxRate] = useState(1)
  const [sessionLabel, setSessionLabel] = useState('')
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelInput, setLabelInput] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [zakatFitrOpen, setZakatFitrOpen] = useState(false)
  const [zakatFitrPeople, setZakatFitrPeople] = useState(1)
  const [zakatPlan, setZakatPlan] = useState<{ monthly_target: number; currency: string; annual_zakat: number; message: string; generated_at: string } | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [paymentSchedule, setPaymentSchedule] = useState<'monthly' | 'biweekly' | 'lump'>('monthly')
  const [currentSessionCreatedAt, setCurrentSessionCreatedAt] = useState<string | undefined>(undefined)

  const DISPLAY_CURRENCIES = [
    { code: 'USD', symbol: '$' }, { code: 'GBP', symbol: '£' }, { code: 'EUR', symbol: '€' },
    { code: 'CAD', symbol: 'CA$' }, { code: 'AUD', symbol: 'A$' }, { code: 'AED', symbol: 'AED' },
    { code: 'SAR', symbol: 'SAR' }, { code: 'PKR', symbol: '₨' }, { code: 'INR', symbol: '₹' },
    { code: 'BDT', symbol: '৳' }, { code: 'MYR', symbol: 'RM' }, { code: 'IDR', symbol: 'Rp' },
    { code: 'TRY', symbol: '₺' }, { code: 'EGP', symbol: 'EGP' }, { code: 'NGN', symbol: '₦' },
    { code: 'KZT', symbol: '₸' },
  ]

  function fmtC(n: number) {
    const converted = n * fxRate
    const num = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${num} ${displayCurrency}`
  }

  useEffect(() => {
    async function loadResults() {
      try {
        const sessionRes = await fetch('/api/zakat/session')
        const { session } = await sessionRes.json()
        if (!session) { router.push(`/${locale}/flow?new=1`); setLoading(false); return }

        // Show name immediately from session, then overwrite with profile (source of truth)
        const sessionName = session.answers?.display_name as string | undefined
        if (sessionName) setUserName(sessionName)
        const sessionMadhab = session.answers?.madhab as string | undefined
        if (sessionMadhab) setMadhab(sessionMadhab)
        fetch('/api/user/profile')
          .then(r => r.json())
          .then(({ display_name }) => { if (display_name) setUserName(display_name) })
          .catch(() => {})

        // Completed session with saved result → always show it, never recalculate
        if (session.status === 'complete' && session.result_json) {
          setResult(session.result_json)
          setIsReturnVisit(true)
          setHawlConfirmed(true)
          setCurrentSessionId(session.id)
          const label = session.answers?.session_label ?? ''
          if (label) { setSessionLabel(label as string); setLabelInput(label as string) }
          const date = new Date(session.updated_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
          setGeneratedAt(date)
          // Load plan progress from DB (falls back to 0)
          setPaymentSchedule((session.payment_schedule as 'monthly' | 'biweekly' | 'lump') ?? 'monthly')
          setCurrentSessionCreatedAt(session.created_at)
          // Load journal entries
          fetch(`/api/zakat/journal?sessionId=${session.id}`)
            .then(r => r.json())
            .then(setJournalEntries)
            .catch(() => {})
          setLoading(false)
          return
        }

        // Completed session but no saved result (pre-migration) → prompt to redo
        if (session.status === 'complete' && !session.result_json) {
          setNeedsRecalculate(true)
          setLoading(false)
          return
        }

        // In-progress session → calculate fresh
        setCurrentSessionId(session.id)
        const calcRes = await fetch('/api/zakat/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id }),
        })

        if (calcRes.status === 402) { router.push(`/${locale}/flow/review?sessionId=${session.id}`); return }
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
  }, [router, locale])

  useEffect(() => {
    if (displayCurrency === 'USD') { setFxRate(1); return }
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => setFxRate(d.rates?.[displayCurrency] ?? 1))
      .catch(() => {})
  }, [displayCurrency])

  useEffect(() => {
    if (activeTab !== 'history') return
    setHistoryLoading(true)
    fetch('/api/zakat/history')
      .then(r => r.json())
      .then(d => setHistory(d.history ?? []))
      .finally(() => setHistoryLoading(false))
  }, [activeTab])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hawlConfirmed === true && result && !aiSummary) {
      streamSummary(result)
    }
  }, [hawlConfirmed, result]) // streamSummary is stable; aiSummary omitted intentionally

  useEffect(() => {
    if (!currentSessionId || !result) return
    const meetsNisab = result.nisab_met_silver || result.nisab_met_gold
    if (!meetsNisab) return
    // Fetch plan (or generate if not yet saved) — plan_progress comes back from session API
    setPlanLoading(true)
    fetch('/api/zakat/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId }),
    })
      .then(r => r.json())
      .then(plan => { if (plan?.monthly_target) setZakatPlan(plan) })
      .catch(() => {})
      .finally(() => setPlanLoading(false))
  }, [currentSessionId, result])

  async function streamSummary(r: ZakatResult) {
    setAiLoading(true)
    const meetsNisab = r.nisab_met_silver || r.nisab_met_gold
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
      body: JSON.stringify({ type: 'summary', summaryContext, locale }),
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

  function handleDownloadIcs() {
    const now = new Date()
    // Lunar year = 354 days
    const reminderDate = new Date(now.getTime() + 354 * 24 * 60 * 60 * 1000)
    const fmt8 = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hisaably//Zakat Reminder//EN',
      'BEGIN:VEVENT',
      `UID:zakat-${now.getTime()}@hisaably`,
      `DTSTAMP:${fmt8(now)}`,
      `DTSTART;VALUE=DATE:${reminderDate.toISOString().slice(0, 10).replace(/-/g, '')}`,
      'SUMMARY:Zakat Due — Check Hisaably',
      'DESCRIPTION:Your annual Zakat reminder. Open Hisaably to recalculate.',
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Zakat reminder in 7 days',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zakat-reminder.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    if (!result) return
    const meetsNisab = result.nisab_met_silver || result.nisab_met_gold
    const text = `Hisaably Zakat Report — ${generatedAt}
${meetsNisab ? `Zakat Due: $${fmt(result.zakat_amount_silver)} (Silver Nisab · 2.5%)` : 'Status: Zakat not due this year'}
Zakatable Wealth: $${fmt(result.total_zakatable_wealth)}
Silver Nisab: $${fmt(result.nisab_silver_usd)} | Gold Nisab: $${fmt(result.nisab_gold_usd)}

${aiSummary}

This report is for personal reference only. Consult a qualified scholar for your situation. Hisaably does not issue fatwas.`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  async function markAsOfficial(sessionId: string) {
    setMarkingOfficial(sessionId)
    await fetch('/api/zakat/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'official', sessionId }),
    })
    // Update local history state to reflect the change
    setHistory(prev => prev.map(h => ({ ...h, is_official: h.id === sessionId })))
    setMarkingOfficial(null)
  }

  if (loading) {
    return (
      <AppShell locale={locale} userName={userName}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="w-8 h-8 border-2 border-white/10 border-t-emerald rounded-full animate-spin mx-auto mb-4" />
            <p style={{ fontSize: 14, color: 'rgba(244,238,223,.5)' }}>{t('loading')}</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell locale={locale} userName={userName}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 24px' }}>
            <p style={{ color: '#F4EEDF', fontWeight: 600, marginBottom: 8 }}>{t('error_title')}</p>
            <p style={{ fontSize: 14, color: 'rgba(244,238,223,.5)', marginBottom: 24 }}>{error}</p>
            <button onClick={() => router.push(`/${locale}/flow`)} style={{ padding: '12px 24px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {t('start_over')}
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  if (needsRecalculate) {
    return (
      <AppShell locale={locale} userName={userName}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 24px' }}>
            <p style={{ color: '#F4EEDF', fontWeight: 600, marginBottom: 8 }}>Your previous result needs to be recalculated</p>
            <p style={{ fontSize: 14, color: 'rgba(244,238,223,.5)', marginBottom: 24 }}>We updated our system — please run through the flow again. It only takes 2 minutes.</p>
            <button onClick={() => router.push(`/${locale}/flow?new=1`)} style={{ padding: '12px 24px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Recalculate now →
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!result) return null

  const meetsNisab = result.nisab_met_silver || result.nisab_met_gold
  const hasLargeDebt = result.categories.some(c => c.category === 'Debts Owed' && Math.abs(c.zakatable_value) > 50000)
  const totalAssets = result.categories.filter(c => c.included && c.zakatable_value > 0).reduce((s, c) => s + c.zakatable_value, 0)
  const totalDebts = Math.abs(result.categories.find(c => c.category === 'Debts Owed')?.zakatable_value ?? 0)
  const rawNet = totalAssets - totalDebts

  return (
    <AppShell locale={locale} userName={userName}>
    <style>{`
      .results-page .bg-emerald { background: #10B981 !important; }
      .results-page .bg-emerald\\/10 { background: rgba(16,185,129,.1) !important; }
      .results-page .bg-emerald\\/20 { background: rgba(16,185,129,.2) !important; }
      .results-page .bg-emerald\\/5 { background: rgba(16,185,129,.05) !important; }
      .results-page .text-emerald { color: #10B981 !important; }
      .results-page .border-emerald\\/30 { border-color: rgba(16,185,129,.3) !important; }
      .results-page .border-emerald\\/20 { border-color: rgba(16,185,129,.2) !important; }
      .results-page .hover\\:bg-emerald\\/90:hover { background: #059669 !important; }
      .results-page .text-gold { color: #D4AF6A !important; }
      .results-page .text-cream { color: #F4EEDF !important; }
      .results-page .text-cream\\/70 { color: rgba(244,238,223,.7) !important; }
      .results-page .text-cream\\/60 { color: rgba(244,238,223,.6) !important; }
      .results-page .text-cream\\/50 { color: rgba(244,238,223,.5) !important; }
      .results-page .text-cream\\/40 { color: rgba(244,238,223,.4) !important; }
      .results-page .text-cream\\/30 { color: rgba(244,238,223,.3) !important; }
      .results-page .bg-gold\\/10 { background: rgba(212,175,106,.1) !important; }
      .results-page .bg-gold\\/20 { background: rgba(212,175,106,.2) !important; }
      .results-page .bg-gold\\/5 { background: rgba(212,175,106,.05) !important; }
      .results-page .border-gold\\/30 { border-color: rgba(212,175,106,.3) !important; }
      .results-page .bg-white\\/5 { background: rgba(244,238,223,.04) !important; }
      .results-page .bg-white\\/10 { background: rgba(244,238,223,.07) !important; }
      .results-page .border-white\\/10 { border-color: rgba(212,175,106,.14) !important; }
      .results-page .border-white\\/5 { border-color: rgba(212,175,106,.08) !important; }
      .results-page .border-white\\/20 { border-color: rgba(212,175,106,.22) !important; }
      .results-page .bg-white\\/8 { background: rgba(244,238,223,.06) !important; }
      .results-page .rounded-2xl { border-radius: 18px !important; }
      .results-page .rounded-xl { border-radius: 14px !important; }
      .results-page .rounded-lg { border-radius: 10px !important; }
      .results-page select { background: rgba(13,31,62,.8); border: 1px solid rgba(212,175,106,.2); color: #F4EEDF; border-radius: 8px; padding: 5px 10px; font-size: 12px; outline: none; }
      .results-page select option { background: #0A1830; }
      @media (max-width: 600px) {
        .results-page { padding: 20px 16px 48px !important; }
        .results-page .text-5xl { font-size: 2.4rem !important; }
        .results-page .text-3xl { font-size: 1.6rem !important; }
        .results-page .p-8 { padding: 20px !important; }
        .results-page .p-6 { padding: 16px !important; }
        .results-page .p-5 { padding: 14px !important; }
        .results-page .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
        .results-res-zakat { font-size: 2.2rem !important; }
      }
    `}</style>
    <div className="results-page" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 60px', display: 'flex', flexDirection: 'column', gap: 24, overflowX: 'hidden' }}>

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-bold text-cream mb-6">Your Zakat History</h2>
            {historyLoading ? (
              <div className="flex items-center gap-3 py-8">
                <div className="w-5 h-5 border-2 border-white/10 border-t-emerald rounded-full animate-spin" />
                <p className="text-sm text-cream/50">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-cream/40 py-8">No past calculations found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Year-over-year comparison — only for official sessions from different years */}
                {(() => {
                  const officials = history.filter(h => h.is_official && h.result_json)
                  if (officials.length < 2) return null
                  const curr = officials[0]
                  const prev = officials[1]
                  const currYear = new Date(curr.created_at).getFullYear()
                  const prevYear = new Date(prev.created_at).getFullYear()
                  if (currYear === prevYear) return null
                  const currAmt = curr.result_json!.zakat_amount_silver
                  const prevAmt = prev.result_json!.zakat_amount_silver
                  if (!prevAmt || !currAmt) return null
                  const diff = currAmt - prevAmt
                  const pct = Math.abs(Math.round((diff / prevAmt) * 100))
                  const up = diff > 0
                  return (
                    <div className={`rounded-xl p-4 border ${up ? 'bg-emerald/5 border-emerald/20' : 'bg-white/5 border-white/10'}`}>
                      <p className="text-xs font-semibold text-cream/50 uppercase tracking-wide mb-1">Year-over-year · Official Zakat</p>
                      <p className="text-sm text-cream">
                        Your Zakat {up ? 'increased' : 'decreased'} by{' '}
                        <span className={`font-bold ${up ? 'text-emerald' : 'text-red-400'}`}>{up ? '↑' : '↓'} {pct}%</span>
                        {' '}from {prevYear} to {currYear}
                      </p>
                      <p className="text-xs text-cream/40 mt-1">{fmtC(prevAmt)} → {fmtC(currAmt)}</p>
                    </div>
                  )
                })()}

                {/* Sort: official first, then by date */}
                {[...history].sort((a, b) => {
                  if (a.is_official && !b.is_official) return -1
                  if (!a.is_official && b.is_official) return 1
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                }).map((h) => {
                  const dt = new Date(h.created_at)
                  const date = dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  const zakat = h.result_json?.zakat_amount_silver ?? h.zakat_amount ?? 0
                  const wealth = h.result_json?.total_zakatable_wealth ?? 0
                  const meetsNisab = h.result_json?.nisab_met_silver ?? (zakat > 0)
                  const label = (h.answers?.session_label as string) ?? ''
                  const isExpanded = expandedHistory === h.id
                  const isOfficial = !!h.is_official
                  return (
                    <div key={h.id} className={`border rounded-xl overflow-hidden ${isOfficial ? 'border-gold/30 bg-gold/5' : 'border-white/10 bg-white/5'}`}>
                      <button
                        onClick={() => setExpandedHistory(isExpanded ? null : h.id)}
                        className="w-full p-5 text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-cream/40 mb-0.5">{date} · {time}</p>
                            {label && <p className="text-xs text-emerald/70 font-medium">&ldquo;{label}&rdquo;</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {isOfficial && (
                              <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-gold/20 text-gold">★ My Zakat {new Date(h.created_at).getFullYear()}</span>
                            )}
                            {!isOfficial && (
                              <span className="text-xs px-2 py-1 rounded-lg font-medium bg-white/10 text-cream/40">Draft</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${meetsNisab ? 'bg-emerald/20 text-emerald' : 'bg-white/10 text-cream/50'}`}>
                              {meetsNisab ? 'Zakat due' : 'No Zakat due'}
                            </span>
                            <span className="text-cream/30 text-xs">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        {meetsNisab && (
                          <p className="text-2xl font-bold text-cream mb-1">{fmtC(zakat)}</p>
                        )}
                        {wealth > 0 && (
                          <p className="text-xs text-cream/40">Zakatable wealth: {fmtC(wealth)}</p>
                        )}
                      </button>

                      {isExpanded && h.result_json && (
                        <div className="border-t border-white/10 p-5 space-y-3">
                          {/* Category breakdown */}
                          <div>
                            <p className="text-xs font-semibold text-cream/50 uppercase tracking-wide mb-3">Asset Breakdown</p>
                            <div className="space-y-2">
                              {(h.result_json as unknown as { categories: Array<{ category: string; zakatable_value: number; included: boolean }> }).categories
                                ?.filter((c) => c.included)
                                .map((c) => (
                                  <div key={c.category} className="flex justify-between text-xs">
                                    <span className="text-cream/50">{c.category}</span>
                                    <span className={`font-medium ${c.zakatable_value < 0 ? 'text-red-400' : 'text-cream'}`}>
                                      {c.zakatable_value < 0 ? '−' : ''}${Math.abs(c.zakatable_value).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setResult(h.result_json as unknown as ZakatResult)
                                setActiveTab('result')
                                setIsReturnVisit(true)
                                setGeneratedAt(date)
                                setSessionLabel(label)
                                setLabelInput(label)
                              }}
                              className="flex-1 py-2 text-xs text-emerald border border-emerald/30 rounded-lg hover:bg-emerald/10 transition-colors"
                            >
                              View full result →
                            </button>
                            {!isOfficial && (
                              <button
                                onClick={() => markAsOfficial(h.id)}
                                disabled={markingOfficial === h.id}
                                className="flex-1 py-2 text-xs text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-50"
                              >
                                {markingOfficial === h.id ? 'Saving...' : '★ Make this my Zakat this year'}
                              </button>
                            )}
                            {isOfficial && (
                              <div className="flex-1 py-2 text-xs text-gold/60 border border-gold/20 rounded-lg text-center">
                                ★ Official Zakat {new Date(h.created_at).getFullYear()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <button
              onClick={() => router.push(`/${locale}/flow?new=1`)}
              className="mt-6 w-full py-3 border border-dashed border-white/20 text-cream/50 rounded-xl text-sm hover:border-emerald/50 hover:text-emerald transition-colors"
            >
              + New calculation
            </button>
          </div>
        )}

        {/* Result Tab */}
        {activeTab === 'result' && <>
        <div>
          <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">Hisaably Zakat Report</p>
          <h1 className="text-3xl font-bold text-cream">
            {userName ? `${t('page_title')}, ${userName}` : t('page_title')}
          </h1>
          <p className="text-cream/30 text-sm mt-1">{generatedAt}</p>
        </div>

        {/* Currency toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-cream/40">Display in:</span>
          <select
            value={displayCurrency}
            onChange={e => { setDisplayCurrency(e.target.value); localStorage.setItem('hisaably_display_currency', e.target.value) }}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-cream focus:outline-none focus:border-emerald transition-colors"
          >
            {DISPLAY_CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="bg-navy">{c.code}</option>
            ))}
          </select>
        </div>

        {hawlConfirmed === null && (
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
            <p className="text-gold text-sm font-semibold mb-1">{t('hawl_title')}</p>
            <p className="text-cream/70 text-sm mb-1">{t('hawl_desc')}</p>
            <p className="text-cream/50 text-xs mb-5">{t('hawl_sub')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setHawlConfirmed(true)}
                className="flex-1 py-3 bg-emerald text-white rounded-xl text-sm font-semibold hover:bg-emerald/90 transition-colors"
              >
                {t('hawl_yes')}
              </button>
              <button
                onClick={() => setHawlConfirmed(false)}
                className="flex-1 py-3 border border-white/10 text-cream/60 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                {t('hawl_no')}
              </button>
            </div>
          </div>
        )}

        {hawlConfirmed === false && (
          <>
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
              <p className="text-gold text-sm font-semibold mb-2">{t('hawl_no_title')}</p>
              <p className="text-cream/70 text-sm leading-relaxed mb-3">{t('hawl_no_desc')}</p>
              <p className="text-cream/50 text-xs leading-relaxed">{t('hawl_no_advice')}</p>
              <button
                onClick={() => setHawlConfirmed(null)}
                className="mt-4 text-xs text-gold/70 hover:text-gold transition-colors underline"
              >
                ← Go back
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-cream/40 text-xs">Your calculation result is shown below for reference only.</span>
              <button
                onClick={() => setHawlConfirmed(true)}
                className="text-xs text-gold hover:text-gold/80 transition-colors whitespace-nowrap"
              >
                {t('hawl_show_anyway')}
              </button>
            </div>
          </>
        )}

        {hawlConfirmed !== null && (
          <>
            <div className={`rounded-2xl p-8 border ${meetsNisab ? 'bg-emerald/10 border-emerald/30' : 'bg-white/5 border-white/10'}`}>
              {/* Header: label + date + recalculate */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  {editingLabel ? (
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={labelInput}
                        onChange={e => setLabelInput(e.target.value)}
                        placeholder="e.g. Ramadan 2026"
                        maxLength={40}
                        className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-cream focus:outline-none focus:border-emerald"
                      />
                      <button
                        onClick={async () => {
                          if (!currentSessionId) return
                          await fetch('/api/zakat/session', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'label', sessionId: currentSessionId, label: labelInput.trim() }),
                          })
                          setSessionLabel(labelInput.trim())
                          setEditingLabel(false)
                        }}
                        className="text-xs text-emerald hover:text-emerald/80"
                      >Save</button>
                      <button onClick={() => setEditingLabel(false)} className="text-xs text-cream/30">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingLabel(true)} className="flex items-center gap-1.5 mb-1 group">
                      <span className="text-xs font-semibold text-cream/60 group-hover:text-cream/90 transition-colors">
                        {sessionLabel ? `"${sessionLabel}"` : 'Name this calculation'}
                      </span>
                      <span className="text-cream/20 text-xs group-hover:text-cream/40">✎</span>
                    </button>
                  )}
                  <p className="text-xs text-cream/30">{generatedAt}</p>
                </div>
                {isReturnVisit && (
                  <button
                    onClick={() => router.push(`/${locale}/flow?new=1`)}
                    className="text-xs text-emerald/70 hover:text-emerald transition-colors border border-emerald/20 rounded-lg px-3 py-1.5 hover:border-emerald/40"
                  >
                    Recalculate →
                  </button>
                )}
              </div>

              {meetsNisab ? (
                <>
                  <p className="text-emerald text-xs font-semibold uppercase tracking-wide mb-3">
                    {sessionLabel
                      ? `Based on "${sessionLabel}" — Zakat is due this year`
                      : 'Zakat is due this year'}
                  </p>
                  <p className="text-5xl font-bold text-cream mb-2">{fmtC(result.zakat_amount_silver)}</p>
                  <p className="text-cream/50 text-sm mb-1">Silver Nisab · 2.5% of {fmtC(result.total_zakatable_wealth)}</p>
                  {result.zakat_amount_gold !== result.zakat_amount_silver && (
                    <p className="text-cream/30 text-xs mb-4">
                      Gold Nisab result: {fmtC(result.zakat_amount_gold)}{!result.nisab_met_gold ? ' — below gold nisab, not obligatory by this measure' : ''}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-cream/60 text-sm italic">
                      &ldquo;Paying it purifies your wealth and fulfills your obligation to Allah.&rdquo;
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-cream/40 text-xs font-semibold uppercase tracking-wide mb-3">
                    {sessionLabel ? `Based on "${sessionLabel}" — no Zakat due this year` : 'No Zakat due this year'}
                  </p>
                  <p className="text-3xl font-bold text-cream mb-2">
                    {rawNet < 0 ? 'Debts exceed assets' : 'Below nisab threshold'}
                  </p>
                  <p className="text-cream/50 text-sm mb-1">
                    {rawNet < 0
                      ? `Your debts (${fmtC(totalDebts)}) exceed your zakatable assets (${fmtC(totalAssets)})`
                      : `Your zakatable wealth (${fmtC(result.total_zakatable_wealth)}) is below the silver nisab of ${fmtC(result.nisab_silver_usd)}`
                    }
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-cream/60 text-sm italic">
                      &ldquo;You do not owe Zakat this year. May Allah bless your wealth and increase it.&rdquo;
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-cream/40 mb-1">Silver Nisab today</p>
                <p className="text-lg font-semibold text-cream">{fmtC(result.nisab_silver_usd)}</p>
                <p className="text-xs text-cream/30 mt-0.5">612g of silver</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-cream/40 mb-1">Gold Nisab today</p>
                <p className="text-lg font-semibold text-cream">{fmtC(result.nisab_gold_usd)}</p>
                <p className="text-xs text-cream/30 mt-0.5">85g of gold</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-cream mb-4">How it was calculated</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream/60">Total zakatable assets</span>
                  <span className="text-sm font-medium text-cream">{fmtC(totalAssets)}</span>
                </div>
                {totalDebts > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cream/60">− Debts deducted</span>
                    <span className="text-sm font-medium text-red-400">−{fmtC(totalDebts)}</span>
                  </div>
                )}
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream/60">= Net zakatable wealth</span>
                  <span className={`text-sm font-semibold ${rawNet < 0 ? 'text-red-400' : 'text-cream'}`}>
                    {rawNet < 0 ? `−${fmtC(Math.abs(rawNet))}` : fmtC(result.total_zakatable_wealth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cream/60">Silver nisab threshold</span>
                  <span className="text-sm text-cream/50">{fmtC(result.nisab_silver_usd)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-cream">
                    {meetsNisab ? '× 2.5% Zakat rate' : rawNet < 0 ? 'Debts exceed assets — no Zakat due' : 'Below nisab — no Zakat due'}
                  </span>
                  {meetsNisab && (
                    <span className="text-sm font-bold text-emerald">{fmtC(result.zakat_amount_silver)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">Hisaably&apos;s Summary</p>
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

            {/* Zakat Roadmap */}
            {meetsNisab && planLoading && !zakatPlan && (
              <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 20, padding: 24 }}>
                <div style={{ height: 12, background: 'rgba(255,255,255,.08)', borderRadius: 6, width: '40%', marginBottom: 12 }} />
                <div style={{ height: 12, background: 'rgba(255,255,255,.08)', borderRadius: 6, width: '70%' }} />
              </div>
            )}
            {meetsNisab && zakatPlan && currentSessionId && (
              <ZakatRoadmap
                sessionId={currentSessionId}
                annualZakat={result.zakat_amount_silver * fxRate}
                currency={displayCurrency}
                fxRate={fxRate}
                initialSchedule={paymentSchedule}
                initialEntries={journalEntries}
                displayCurrencies={DISPLAY_CURRENCIES.map(c => c.code)}
                onCurrencyChange={(c) => { setDisplayCurrency(c); localStorage.setItem('hisaably_display_currency', c) }}
              />
            )}

            {/* AI Chat — primary action */}
            <ResultsAskHisaably
              zakatAmount={result.zakat_amount_silver * fxRate}
              currency={displayCurrency}
              userName={userName || undefined}
              madhab={madhab || undefined}
              annualZakat={meetsNisab ? result.zakat_amount_silver * fxRate : undefined}
              journalEntries={journalEntries}
              paymentSchedule={paymentSchedule}
              sessionCreatedAt={currentSessionCreatedAt}
            />

            {/* Zakat al-Fitr card */}
            <div className="bg-gold/5 border border-gold/20 rounded-2xl overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">Zakat al-Fitr</p>
                  <p className="text-cream text-sm font-medium mb-1">Calculate your Eid obligation</p>
                  <p className="text-cream/50 text-xs">A separate obligatory charity due before Eid prayer — per person in your household.</p>
                </div>
                <button
                  onClick={() => setZakatFitrOpen(o => !o)}
                  className="flex-shrink-0 px-4 py-2 bg-gold/20 border border-gold/30 text-gold rounded-xl text-xs font-semibold hover:bg-gold/30 transition-colors"
                >
                  {zakatFitrOpen ? 'Close' : 'Calculate →'}
                </button>
              </div>

              {zakatFitrOpen && (
                <div className="border-t border-gold/10 p-5 space-y-4">
                  <div>
                    <label className="text-xs text-cream/60 font-medium mb-2 block">Number of people in your household</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setZakatFitrPeople(p => Math.max(1, p - 1))}
                        className="w-9 h-9 rounded-xl border border-white/10 text-cream/60 hover:bg-white/5 transition-colors text-lg font-light"
                      >−</button>
                      <span className="text-2xl font-bold text-cream w-8 text-center">{zakatFitrPeople}</span>
                      <button
                        onClick={() => setZakatFitrPeople(p => p + 1)}
                        className="w-9 h-9 rounded-xl border border-white/10 text-cream/60 hover:bg-white/5 transition-colors text-lg font-light"
                      >+</button>
                      <span className="text-xs text-cream/40 ml-1">person{zakatFitrPeople > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
                    <p className="text-xs text-cream/50 mb-1">Estimated Zakat al-Fitr</p>
                    <p className="text-3xl font-bold text-cream">{fmtC(zakatFitrPeople * 12)}</p>
                    <p className="text-xs text-cream/40 mt-1">Based on ~12 USD per person · verify with your local mosque</p>
                    <p className="text-xs text-cream/30 mt-1">
                      Showing in {displayCurrency} ·{' '}
                      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="underline hover:text-cream/50 transition-colors">
                        change currency ↑
                      </button>
                    </p>
                  </div>

                  <p className="text-xs text-cream/30 leading-relaxed">
                    Zakat al-Fitr must be paid before Eid al-Fitr prayer. It purifies the fasting person from any shortcomings and provides food for the poor on the day of Eid.
                  </p>
                </div>
              )}
            </div>

            {/* Asset Breakdown */}
            <div>
              <h2 className="text-sm font-semibold text-cream mb-3">Asset Breakdown</h2>
              <ResultsBreakdown categories={result.categories} />
            </div>

            {hasLargeDebt && (
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                <p className="text-gold text-xs font-semibold mb-1">{t('debt_note_title')}</p>
                <p className="text-cream/60 text-xs leading-relaxed">{t('debt_note_desc')}</p>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="py-3 border border-white/10 text-cream/60 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy report'}
              </button>
              <PdfDownloadButton result={result} generatedAt={generatedAt} userName={userName || undefined} sessionLabel={sessionLabel || undefined} aiSummary={aiSummary || undefined} />
              <button
                onClick={handleDownloadIcs}
                className="py-3 border border-white/10 text-cream/60 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                Set Zakat reminder
              </button>
              <button
                onClick={() => router.push(`/${locale}/flow?new=1`)}
                className="py-3 bg-emerald/10 border border-emerald/30 text-emerald rounded-xl text-sm font-medium hover:bg-emerald/20 transition-colors"
              >
                {t('recalculate')}
              </button>
            </div>

            <p className="text-xs text-cream/20 text-center leading-relaxed pb-8">
              {t('disclaimer')}
            </p>
          </>
        )}
        </>}
      </div>
    </AppShell>
  )
}
