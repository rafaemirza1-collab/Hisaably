'use client'

interface Entry { id: string; entry_date: string; amount: number; type: 'payment' | 'reminder' }
interface Props { year: number; entries: Entry[]; monthlyTarget: number; annualZakat: number; currency: string; onSelectMonth: (m: number) => void }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function RoadmapYearView({ year, entries, monthlyTarget, annualZakat, currency, onSelectMonth }: Props) {
  const totalPaid = entries.filter(e => e.type === 'payment').reduce((s, e) => s + e.amount, 0)
  const pct = Math.min(100, (totalPaid / annualZakat) * 100)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'rgba(244,238,223,.5)' }}>Total paid this year</span>
          <span style={{ fontSize: 13, color: '#F4EEDF', fontWeight: 600 }}>{totalPaid.toLocaleString()} / {annualZakat.toLocaleString()} {currency}</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
        <p style={{ fontSize: 12, color: 'rgba(244,238,223,.3)', marginTop: 6 }}>
          {Math.round(pct)}% complete · {annualZakat - totalPaid > 0 ? `${(annualZakat - totalPaid).toLocaleString()} ${currency} remaining` : 'Fully paid — MashaAllah!'}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {MONTHS.map((name, i) => {
          const monthPaid = entries.filter(e => {
            const d = new Date(e.entry_date)
            return e.type === 'payment' && d.getFullYear() === year && d.getMonth() === i
          }).reduce((s, e) => s + e.amount, 0)
          const monthPct = Math.min(100, (monthPaid / monthlyTarget) * 100)
          const hasReminder = entries.some(e => {
            const d = new Date(e.entry_date)
            return d.getFullYear() === year && d.getMonth() === i && e.type === 'reminder'
          })
          const isCurrentMonth = new Date().getMonth() === i && new Date().getFullYear() === year
          const isPast = new Date(year, i + 1, 0) < new Date()

          return (
            <button key={i} onClick={() => onSelectMonth(i)} style={{
              background: monthPaid > 0 ? 'rgba(16,185,129,.1)' : isCurrentMonth ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.025)',
              border: `1px solid ${isCurrentMonth ? 'rgba(16,185,129,.4)' : monthPaid > 0 ? 'rgba(16,185,129,.2)' : 'rgba(255,255,255,.06)'}`,
              borderRadius: 12, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: isCurrentMonth ? '#10B981' : '#F4EEDF' }}>{name}</span>
                {hasReminder && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />}
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${monthPct}%`, background: '#10B981', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 11, color: monthPaid > 0 ? '#10B981' : isPast ? 'rgba(244,238,223,.25)' : 'rgba(244,238,223,.4)' }}>
                {monthPaid > 0 ? `${monthPaid.toLocaleString()} ${currency}` : isPast ? 'Missed' : `${monthlyTarget.toLocaleString()} target`}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
