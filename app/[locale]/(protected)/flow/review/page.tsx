'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { ZakatAnswers } from '@/lib/zakat/types'

export default function ReviewPage() {
  const t = useTranslations('review')
  const locale = useLocale()
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
    if (url) window.location.href = `/${locale}/results`
    else setDevLoading(false)
  }

  async function handleUnlock() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  const summaryRows = [
    { label: t('cash'), value: answers?.cash_amount ?? 0 },
    { label: t('gold'), value: (answers?.gold_is_jewelry ? 0 : answers?.gold_grams ?? 0) },
    { label: t('crypto'), value: (answers?.crypto_holdings?.length ?? 0) > 0 ? t('crypto_added') : t('crypto_none') },
    { label: t('investments'), value: answers?.investments_value ?? 0 },
    { label: t('receivables'), value: answers?.receivables_amount ?? 0 },
    { label: t('debts'), value: answers?.debts_amount ?? 0 },
  ]

  return (
    <main className="min-h-screen bg-navy">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 relative">
        <Image src="/logo-icon.png" alt="Mizan" width={48} height={48} />
        <LanguageSwitcher />
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12 relative">
        <h1 className="text-2xl font-bold text-cream mb-2">{t('title')}</h1>
        <p className="text-cream/50 mb-8">{t('subtitle')}</p>

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

        <div className="relative border border-white/10 rounded-xl p-6 mb-8 overflow-hidden bg-white/5">
          <div className="blur-sm select-none">
            <p className="text-xs text-cream/40 uppercase tracking-wide mb-1">{t('zakat_due_label')}</p>
            <p className="text-4xl font-bold text-cream">{t('zakat_blurred')}</p>
            <p className="text-sm text-cream/30 mt-1">{t('zakat_nisab_note')}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-semibold text-gold">{t('unlock_teaser')}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-emerald/20 rounded-xl p-6">
          <p className="text-cream font-semibold text-center mb-1">{t('unlock_title')}</p>
          <p className="text-cream/40 text-sm text-center mb-5">{t('unlock_desc')}</p>

          <div className="space-y-2 mb-6">
            {[t('value_1'), t('value_2'), t('value_3')].map(v => (
              <div key={v} className="flex items-center gap-2">
                <span className="text-emerald text-xs">✓</span>
                <span className="text-cream/70 text-sm">{v}</span>
              </div>
            ))}
          </div>

          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-cream">$15</p>
            <p className="text-cream/40 text-xs mt-0.5">{t('per_year')}</p>
          </div>

          <button
            onClick={handleUnlock}
            disabled={loading}
            className="press w-full py-4 bg-emerald text-white rounded-xl font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-colors relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? t('redirecting') : t('unlock_button')}</span>
            <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <p className="text-xs text-cream/30 mt-3 text-center">{t('cancel_note')}</p>

          {/* DEV ONLY — remove before launch */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleDevUnlock}
              disabled={devLoading}
              className="w-full py-3 border border-dashed border-white/20 text-cream/30 rounded-xl text-sm hover:border-white/30 hover:text-cream/50 disabled:opacity-50 transition-colors"
            >
              {devLoading ? t('dev_loading') : t('dev_button')}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
