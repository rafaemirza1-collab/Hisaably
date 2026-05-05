'use client'

type Schedule = 'monthly' | 'biweekly' | 'lump'

interface Props {
  value: Schedule
  annualZakat: number
  currency: string
  onChange: (s: Schedule) => void
}

const OPTIONS = [
  { value: 'monthly' as Schedule,  label: 'Monthly',   desc: (n: number, c: string) => `12 payments of ${Math.ceil(n / 12).toLocaleString()} ${c}` },
  { value: 'biweekly' as Schedule, label: 'Bi-weekly', desc: (n: number, c: string) => `26 payments of ${Math.ceil(n / 26).toLocaleString()} ${c}` },
  { value: 'lump' as Schedule,     label: 'Lump sum',  desc: (n: number, c: string) => `One payment of ${n.toLocaleString()} ${c}` },
]

export function SchedulePicker({ value, annualZakat, currency, onChange }: Props) {
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
          <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{o.desc(annualZakat, currency)}</div>
        </button>
      ))}
    </div>
  )
}
