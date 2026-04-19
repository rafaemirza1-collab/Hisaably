'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ZakatAnswers } from '@/lib/zakat/types'

interface Props {
  initial: Partial<ZakatAnswers>
  onChange: (answers: Partial<ZakatAnswers>) => void
  currency?: string
}

export function DebtsStep({ initial, onChange, currency = 'USD' }: Props) {
  const t = useTranslations('steps')
  const [amount, setAmount] = useState(initial.debts_amount?.toString() ?? '')

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm text-cream/60">
        {currency === 'USD' ? t('debts_label') : `Short-term debts you owe (${currency})`}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm font-medium">{currency}</span>
        <input
          type="number" min="0" step="0.01"
          value={amount}
          onChange={e => { setAmount(e.target.value); onChange({ debts_amount: parseFloat(e.target.value) || 0 }) }}
          placeholder="0.00"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-16 pr-4 py-3 text-cream text-lg focus:outline-none focus:border-emerald transition-colors"
        />
      </div>
      <p className="text-xs text-cream/30">{t('debts_hint')}</p>
    </div>
  )
}
