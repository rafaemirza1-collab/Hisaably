'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ZakatAnswers } from '@/lib/zakat/types'

interface Props {
  initial: Partial<ZakatAnswers>
  onChange: (answers: Partial<ZakatAnswers>) => void
  currency?: string
}

export function ReceivablesStep({ initial, onChange, currency = 'USD' }: Props) {
  const t = useTranslations('steps')
  const [amount, setAmount] = useState(initial.receivables_amount?.toString() ?? '')
  const [likelyRepaid, setLikelyRepaid] = useState(initial.receivables_likely_repaid ?? true)

  function emit(updates: Partial<ZakatAnswers>) {
    onChange({ receivables_amount: parseFloat(amount) || 0, receivables_likely_repaid: likelyRepaid, ...updates })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm text-cream/60">
        {currency === 'USD' ? t('receivables_label') : `Money others owe you (${currency})`}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm font-medium">{currency}</span>
        <input
          type="number" min="0" step="0.01"
          value={amount}
          onChange={e => { setAmount(e.target.value); emit({ receivables_amount: parseFloat(e.target.value) || 0 }) }}
          placeholder="0.00"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-16 pr-4 py-3 text-cream text-lg focus:outline-none focus:border-emerald transition-colors"
        />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={likelyRepaid}
          onChange={e => { setLikelyRepaid(e.target.checked); emit({ receivables_likely_repaid: e.target.checked }) }}
          className="w-4 h-4 accent-emerald"
        />
        <span className="text-sm text-cream/60">I expect this to be repaid</span>
      </label>
    </div>
  )
}
