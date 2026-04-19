'use client'

import { useState } from 'react'
import type { ZakatAnswers } from '@/lib/zakat/types'

const TROY_OZ_TO_GRAMS = 31.1035

interface Props {
  initial: Partial<ZakatAnswers>
  onChange: (answers: Partial<ZakatAnswers>) => void
  currency?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GoldStep({ initial, onChange, currency = 'USD' }: Props) {
  const [unit, setUnit] = useState<'g' | 'oz'>('g')
  const [goldInput, setGoldInput] = useState(initial.gold_grams?.toString() ?? '')
  const [goldJewelry, setGoldJewelry] = useState(initial.gold_is_jewelry ?? false)
  const [silverInput, setSilverInput] = useState(initial.silver_grams?.toString() ?? '')
  const [silverJewelry, setSilverJewelry] = useState(initial.silver_is_jewelry ?? false)

  function toGrams(val: string) {
    const n = parseFloat(val) || 0
    return unit === 'oz' ? n * TROY_OZ_TO_GRAMS : n
  }

  function switchUnit(newUnit: 'g' | 'oz') {
    if (newUnit === unit) return
    // Convert displayed values to new unit
    const goldGrams = parseFloat(goldInput) || 0
    const silverGrams = parseFloat(silverInput) || 0
    if (newUnit === 'oz') {
      setGoldInput(goldGrams > 0 ? (goldGrams / TROY_OZ_TO_GRAMS).toFixed(4) : '')
      setSilverInput(silverGrams > 0 ? (silverGrams / TROY_OZ_TO_GRAMS).toFixed(4) : '')
    } else {
      setGoldInput(goldGrams > 0 ? (goldGrams * TROY_OZ_TO_GRAMS).toFixed(2) : '')
      setSilverInput(silverGrams > 0 ? (silverGrams * TROY_OZ_TO_GRAMS).toFixed(2) : '')
    }
    setUnit(newUnit)
  }

  function emitGold(val: string, jewelry: boolean) {
    onChange({
      gold_grams: unit === 'oz' ? (parseFloat(val) || 0) * TROY_OZ_TO_GRAMS : parseFloat(val) || 0,
      gold_is_jewelry: jewelry,
      silver_grams: toGrams(silverInput),
      silver_is_jewelry: silverJewelry,
    })
  }

  function emitSilver(val: string, jewelry: boolean) {
    onChange({
      gold_grams: toGrams(goldInput),
      gold_is_jewelry: goldJewelry,
      silver_grams: unit === 'oz' ? (parseFloat(val) || 0) * TROY_OZ_TO_GRAMS : parseFloat(val) || 0,
      silver_is_jewelry: jewelry,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Unit toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-cream/50 mr-1">Unit:</span>
        {(['g', 'oz'] as const).map(u => (
          <button
            key={u}
            onClick={() => switchUnit(u)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              unit === u
                ? 'bg-emerald text-white'
                : 'border border-white/10 text-cream/50 hover:border-white/30'
            }`}
          >
            {u === 'g' ? 'Grams (g)' : 'Troy oz'}
          </button>
        ))}
      </div>

      {/* Gold */}
      <div className="flex flex-col gap-3">
        <label className="text-sm text-cream/60 font-medium">Gold ({unit})</label>
        <input
          type="number" min="0" step="any"
          value={goldInput}
          onChange={e => { setGoldInput(e.target.value); emitGold(e.target.value, goldJewelry) }}
          placeholder="0"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream text-lg focus:outline-none focus:border-emerald transition-colors"
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={goldJewelry}
            onChange={e => { setGoldJewelry(e.target.checked); emitGold(goldInput, e.target.checked) }}
            className="w-4 h-4 accent-emerald"
          />
          <span className="text-sm text-cream/60">This is worn jewelry (typically excluded from Zakat)</span>
        </label>
      </div>

      {/* Silver */}
      <div className="flex flex-col gap-3">
        <label className="text-sm text-cream/60 font-medium">Silver ({unit})</label>
        <input
          type="number" min="0" step="any"
          value={silverInput}
          onChange={e => { setSilverInput(e.target.value); emitSilver(e.target.value, silverJewelry) }}
          placeholder="0"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream text-lg focus:outline-none focus:border-emerald transition-colors"
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={silverJewelry}
            onChange={e => { setSilverJewelry(e.target.checked); emitSilver(silverInput, e.target.checked) }}
            className="w-4 h-4 accent-emerald"
          />
          <span className="text-sm text-cream/60">This is worn jewelry</span>
        </label>
      </div>

      <p className="text-xs text-cream/30">
        Nisab: 85g gold ({(85 / TROY_OZ_TO_GRAMS).toFixed(2)} oz) · 612g silver ({(612 / TROY_OZ_TO_GRAMS).toFixed(2)} oz)
      </p>
    </div>
  )
}
