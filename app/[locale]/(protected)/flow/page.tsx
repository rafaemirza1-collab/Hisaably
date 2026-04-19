'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { AppShell } from '@/components/AppShell'
import type { NisabPreference } from '@/lib/zakat/types'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
]

export default function FlowWelcomePage() {
  const router = useRouter()
  const t = useTranslations('flow')
  const locale = useLocale()
  const [nisab, setNisab] = useState<NisabPreference>('silver')
  const [currency, setCurrency] = useState('USD')
  const [madhab, setMadhab] = useState('not_sure')
  const [loading, setLoading] = useState(false)
  const [nisabSilver, setNisabSilver] = useState<number | null>(null)
  const [nisabGold, setNisabGold] = useState<number | null>(null)
  const [calcLabel, setCalcLabel] = useState('')
  const [profileName, setProfileName] = useState('')

  const MADHABS = [
    { value: 'hanafi', label: 'Hanafi', desc: 'Worn gold/silver jewelry exempt · All debts deductible' },
    { value: 'maliki', label: 'Maliki', desc: 'Worn jewelry included · Short-term debts only' },
    { value: 'shafii', label: "Shafi'i", desc: 'Worn jewelry included · Short-term debts only' },
    { value: 'hanbali', label: 'Hanbali', desc: 'Worn jewelry included · Short-term debts only' },
    { value: 'not_sure', label: "I'm not sure", desc: "We'll use the most common scholarly opinion" },
  ]

  // On mount: check for existing session + load saved name
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const forceNew = params.get('new') === '1'

    async function init() {
      // Load saved profile name (display only, not editable here)
      try {
        const profileRes = await fetch('/api/user/profile')
        const { display_name } = await profileRes.json()
        if (display_name) setProfileName(display_name)
      } catch { /* ignore */ }

      // Redirect to results if already completed (unless forcing new)
      if (!forceNew) {
        try {
          const res = await fetch('/api/zakat/session')
          const { session } = await res.json()
          if (session?.status === 'complete') {
            router.replace(`/${locale}/results`)
          }
        } catch { /* stay on page */ }
      }
    }
    init()
  }, [locale, router])

  useEffect(() => {
    setNisabSilver(null)
    setNisabGold(null)
    async function fetchPrices() {
      try {
        const res = await fetch(`/api/nisab?currency=${currency}`)
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        setNisabSilver(data.nisab_silver)
        setNisabGold(data.nisab_gold)
      } catch {
        setNisabSilver(null)
        setNisabGold(null)
      }
    }
    fetchPrices()
  }, [currency])

  async function handleBegin() {
    setLoading(true)
    const res = await fetch('/api/zakat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 0,
        answers: {
          nisab_preference: nisab,
          cash_currency: currency,
          display_name: profileName,
          session_label: calcLabel.trim(),
          madhab,
        },
        nisabPreference: nisab,
      }),
    })
    const { session } = await res.json()
    router.push(`/${locale}/flow/1?sessionId=${session.id}&currency=${currency}`)
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const options = [
    {
      value: 'silver' as NisabPreference,
      label: t('silver_label'),
      desc: nisabSilver !== null
        ? `612g of silver (${currency} ${fmt(nisabSilver)}) — most scholars recommend this`
        : `612g of silver (loading...) — most scholars recommend this`,
    },
    {
      value: 'gold' as NisabPreference,
      label: t('gold_label'),
      desc: nisabGold !== null
        ? `85g of gold (${currency} ${fmt(nisabGold)}) — more restrictive`
        : `85g of gold (loading...) — more restrictive`,
    },
    { value: 'both' as NisabPreference, label: t('both_label'), desc: t('both_desc') },
  ]

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]

  return (
    <AppShell locale={locale} userName={profileName}>
      <style>{`
        .flow-page .bg-emerald\\/10 { background:rgba(16,185,129,.1) !important; }
        .flow-page .bg-emerald { background:#10B981 !important; }
        .flow-page .text-emerald { color:#10B981 !important; }
        .flow-page .border-emerald { border-color:#10B981 !important; }
        .flow-page .text-gold { color:#D4AF6A !important; }
        .flow-page .text-cream { color:#F4EEDF !important; }
        .flow-page .text-cream\\/70 { color:rgba(244,238,223,.7) !important; }
        .flow-page .text-cream\\/50 { color:rgba(244,238,223,.5) !important; }
        .flow-page .text-cream\\/40 { color:rgba(244,238,223,.4) !important; }
        .flow-page .text-cream\\/30 { color:rgba(244,238,223,.3) !important; }
        .flow-page .text-cream\\/20 { color:rgba(244,238,223,.2) !important; }
        .flow-page .bg-white\\/5 { background:rgba(244,238,223,.04) !important; }
        .flow-page .bg-white\\/10 { background:rgba(244,238,223,.07) !important; }
        .flow-page .border-white\\/10 { border-color:rgba(212,175,106,.14) !important; }
        .flow-page .border-white\\/5 { border-color:rgba(212,175,106,.08) !important; }
        .flow-page .rounded-2xl { border-radius:18px !important; }
        .flow-page .rounded-xl { border-radius:14px !important; }
        .flow-page input, .flow-page select { background:rgba(13,31,62,.8) !important; border-color:rgba(212,175,106,.2) !important; color:#F4EEDF !important; }
        .flow-page input::placeholder { color:rgba(244,238,223,.2) !important; }
        .flow-page input:focus, .flow-page select:focus { border-color:#10B981 !important; }
        .flow-page select option { background:#0A1830; }
      `}</style>
      <div className="flow-page flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-lg">
          <p className="text-gold text-sm font-semibold uppercase tracking-wide mb-3 animate-fade-in">{t('greeting')}{profileName ? `, ${profileName}` : ''}</p>
          <h1 className="text-3xl font-bold text-cream mb-3 animate-fade-up delay-50">{t('title')}</h1>
          <p className="text-cream/50 mb-10 animate-fade-up delay-100">{t('subtitle')}</p>

          {/* Calculation label */}
          <div className="mb-6 animate-fade-up delay-150">
            <p className="text-sm font-semibold text-cream/70 mb-3">Give this calculation a name <span className="text-cream/30 font-normal">(optional — e.g. &ldquo;Ramadan 2026&rdquo;)</span></p>
            <input
              type="text"
              value={calcLabel}
              onChange={e => setCalcLabel(e.target.value)}
              placeholder="e.g. Ramadan 2026"
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald transition-colors placeholder-cream/20"
            />
          </div>

          {/* Currency selector */}
          <div className="mb-8 animate-fade-up delay-200">
            <p className="text-sm font-semibold text-cream/70 mb-3">{t('currency_question')}</p>
            <div className="relative">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-emerald transition-colors appearance-none cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-navy">
                    {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-cream/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {currency !== 'USD' && (
              <p className="text-xs text-cream/30 mt-2">
                Your amounts in {selectedCurrency.name} will be converted to USD for calculation using live exchange rates.
              </p>
            )}
          </div>

          <p className="text-sm font-semibold text-cream/70 mb-4 animate-fade-up delay-200">{t('nisab_question')}</p>

          <div className="flex flex-col gap-3 mb-10">
            {options.map((opt, i) => (
              <label
                key={opt.value}
                className={`flex items-start gap-4 border rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-up ${
                  nisab === opt.value
                    ? 'border-emerald bg-emerald/10'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/4'
                }`}
                style={{ animationDelay: `${250 + i * 60}ms` }}
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

          <p className="text-sm font-semibold text-cream/70 mb-4 animate-fade-up">Which school of Islamic law do you follow?</p>
          <div className="flex flex-col gap-3 mb-10">
            {MADHABS.map((m, i) => (
              <label
                key={m.value}
                className={`flex items-start gap-4 border rounded-xl p-4 cursor-pointer transition-all duration-200 animate-fade-up ${
                  madhab === m.value
                    ? 'border-gold/60 bg-gold/5'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/4'
                }`}
                style={{ animationDelay: `${300 + i * 50}ms` }}
              >
                <input
                  type="radio"
                  name="madhab"
                  value={m.value}
                  checked={madhab === m.value}
                  onChange={() => setMadhab(m.value)}
                  className="mt-0.5 accent-emerald"
                />
                <div>
                  <p className="font-semibold text-cream">{m.label}</p>
                  <p className="text-sm text-cream/40 mt-0.5">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleBegin}
            disabled={loading}
            className="press w-full py-4 bg-emerald text-white rounded-xl text-base font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-all duration-200 animate-fade-up delay-400 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? t('starting') : t('begin')}</span>
            <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </AppShell>
  )
}
