import type { CategoryResult } from '@/lib/zakat/types'

interface Props {
  categories: CategoryResult[]
}

export function ResultsBreakdown({ categories }: Props) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {categories.map(cat => (
        <div
          key={cat.category}
          className={`flex justify-between items-start px-5 py-4 border-b border-white/5 last:border-0 ${!cat.included ? 'opacity-30' : ''}`}
        >
          <div>
            <p className="text-sm font-medium text-cream">{cat.category}</p>
            {cat.note && <p className="text-xs text-cream/40 mt-0.5">{cat.note}</p>}
          </div>
          <p className={`text-sm font-medium ${cat.zakatable_value < 0 ? 'text-red-400' : 'text-gold'}`}>
            {cat.included
              ? `${cat.zakatable_value < 0 ? '-' : ''}$${Math.abs(cat.zakatable_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'}
          </p>
        </div>
      ))}
    </div>
  )
}
