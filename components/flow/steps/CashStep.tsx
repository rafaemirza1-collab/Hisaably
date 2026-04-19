'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ZakatAnswers } from '@/lib/zakat/types'

interface Props {
  initial: Partial<ZakatAnswers>
  onChange: (answers: Partial<ZakatAnswers>) => void
  currency?: string
}

export function CashStep({ initial, onChange, currency = 'USD' }: Props) {
  const t = useTranslations('steps')
  const [amount, setAmount] = useState(initial.cash_amount?.toString() ?? '')

  function handleChange(val: string) {
    setAmount(val)
    onChange({ cash_amount: parseFloat(val) || 0 })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm text-cream/60">
        {currency === 'USD' ? t('cash_label') : `Total cash + bank balances (${currency})`}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm font-medium">{currency}</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={e => handleChange(e.target.value)}
          placeholder="0.00"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-16 pr-4 py-3 text-cream text-lg focus:outline-none focus:border-emerald transition-colors"
        />
      </div>
      <p className="text-xs text-cream/30">{t('cash_hint')}</p>
    </div>
  )
}
