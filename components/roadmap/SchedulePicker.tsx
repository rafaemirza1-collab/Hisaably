'use client'

type Schedule = 'monthly' | 'biweekly' | 'lump'

interface Props {
  value: Schedule
  annualZakat: number
  currency: string
  onChange: (s: Schedule) => void
  catchUpMonthly?: number
  catchUpBiweekly?: number
  catchUpLump?: number
}

export function SchedulePicker({ value, annualZakat, currency, onChange, catchUpMonthly, catchUpBiweekly, catchUpLump }: Props) {
  const monthly = catchUpMonthly ?? Math.ceil(annualZakat / 12)
  const biweekly = catchUpBiweekly ?? Math.ceil(annualZakat / 26)
  const lump = catchUpLump ?? annualZakat

  const OPTIONS = [
    { value: 'monthly' as Schedule,  label: 'Monthly',   amount: monthly,  suffix: '/month' },
    { value: 'biweekly' as Schedule, label: 'Bi-weekly', amount: biweekly, suffix: '/bi-week' },
    { value: 'lump' as Schedule,     label: 'Lump sum',  amount: lump,     suffix: ' total' },
  ]

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {OPTIONS.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          padding: '8px 16px', borderRadius: 12,
          border: `1px solid ${value === o.value ? '#10B981' : 'rgba(255,255,255,.1)'}`,
          background: value === o.value ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.04)',
          color: value === o.value ? '#10B981' : 'rgba(244,238,223,.6)',
          fontSize: 13, fontWeight: value === o.value ? 600 : 400, cursor: 'pointer', textAlign: 'left',
        }}>
          <div>{o.label}</div>
          <div style={{ fontSize: 11, opacity: .85, marginTop: 2, color: value === o.value ? '#10B981' : '#F59E0B' }}>
            {o.amount.toLocaleString()} {currency}{o.suffix}
          </div>
        </button>
      ))}
    </div>
  )
}
