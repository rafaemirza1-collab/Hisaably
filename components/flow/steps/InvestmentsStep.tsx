'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ZakatAnswers } from '@/lib/zakat/types'

interface Props {
  initial: Partial<ZakatAnswers>
  onChange: (answers: Partial<ZakatAnswers>) => void
  currency?: string
}

export function InvestmentsStep({ initial, onChange, currency = 'USD' }: Props) {
  const t = useTranslations('steps')
  const [value, setValue] = useState(initial.investments_value?.toString() ?? '')
  const [isRetirement, setIsRetirement] = useState(initial.investments_is_retirement ?? false)

  function emit(updates: Partial<ZakatAnswers>) {
    onChange({ investments_value: parseFloat(value) || 0, investments_is_retirement: isRetirement, ...updates })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm text-cream/60">
        {currency === 'USD' ? t('investments_label') : `Current market value of stocks/funds (${currency})`}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm font-medium">{currency}</span>
        <input
          type="number" min="0" step="0.01"
          value={value}
          onChange={e => { setValue(e.target.value); emit({ investments_value: parseFloat(e.target.value) || 0 }) }}
          placeholder="0.00"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-16 pr-4 py-3 text-cream text-lg focus:outline-none focus:border-emerald transition-colors"
        />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isRetirement}
          onChange={e => { setIsRetirement(e.target.checked); emit({ investments_is_retirement: e.target.checked }) }}
          className="w-4 h-4 accent-emerald"
        />
        <span className="text-sm text-cream/60">These are in a retirement account (401k, IRA, pension, etc.)</span>
      </label>
    </div>
  )
}
