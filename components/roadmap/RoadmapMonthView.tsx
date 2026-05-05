'use client'
import { useState } from 'react'
import { AddEntryModal } from './AddEntryModal'
import { ISLAMIC_EVENT_MAP } from './islamicDates'

interface Entry { id: string; entry_date: string; amount: number; note: string | null; type: 'payment' | 'reminder' }
interface Props {
  year: number; month: number; entries: Entry[]; sessionId: string; currency: string
  monthlyTarget: number; onRefresh: () => Promise<void>; onBack: () => void
}

export function RoadmapMonthView({ year, month, entries, sessionId, currency, monthlyTarget, onRefresh, onBack }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const entryMap = new Map<string, Entry[]>()
  for (const e of entries) {
    const key = e.entry_date.slice(0, 10)
    if (!entryMap.has(key)) entryMap.set(key, [])
    entryMap.get(key)!.push(e)
  }

  const monthEntries = entries.filter(e => {
    const d = new Date(e.entry_date)
    return d.getFullYear() === year && d.getMonth() === month
  })
  const monthTotal = monthEntries.filter(e => e.type === 'payment').reduce((s, e) => s + e.amount, 0)
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  // Collect all Islamic events in this month for the legend below calendar
  const islamicThisMonth: { date: string; name: string; emoji: string }[] = []

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>← Year view</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F4EEDF', margin: 0 }}>{monthName}</h3>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>{monthTotal.toLocaleString()} {currency}</span>
            <span style={{ fontSize: 12, color: 'rgba(244,238,223,.3)' }}> / {monthlyTarget.toLocaleString()} target</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'rgba(244,238,223,.3)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEntries = entryMap.get(dateStr) ?? []
          const hasPayment = dayEntries.some(e => e.type === 'payment')
          const hasReminder = dayEntries.some(e => e.type === 'reminder')
          const isToday = dateStr === new Date().toISOString().slice(0, 10)
          const islamicEvents = ISLAMIC_EVENT_MAP[dateStr] ?? []
          const isIslamicDay = islamicEvents.length > 0
          const isEid = islamicEvents.some(e => e.name.includes('Eid'))
          const isRamadan = islamicEvents.some(e => e.name.includes('Ramadan') || e.name.includes('Laylat') || e.name.includes('Shab'))
          const isArafah = islamicEvents.some(e => e.name.includes('Arafah'))

          // Collect for legend
          for (const ev of islamicEvents) islamicThisMonth.push({ date: dateStr, ...ev })

          let islamicColor = '#C084FC' // purple default
          if (isEid) islamicColor = '#FBBF24'
          else if (isArafah) islamicColor = '#F97316'
          else if (isRamadan) islamicColor = '#A78BFA'

          return (
            <button key={i} onClick={() => setSelectedDate(dateStr)} style={{
              aspectRatio: '1', borderRadius: 8,
              border: isToday ? '1px solid rgba(16,185,129,.5)' : isIslamicDay ? `1px solid ${islamicColor}44` : '1px solid transparent',
              background: isEid ? 'rgba(251,191,36,.08)' : isIslamicDay ? 'rgba(192,132,252,.07)' : hasPayment ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.03)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 2,
            }}>
              <span style={{ fontSize: 12, color: isToday ? '#10B981' : isEid ? '#FBBF24' : isIslamicDay ? '#C084FC' : '#F4EEDF', fontWeight: isToday || isIslamicDay ? 700 : 400, lineHeight: 1 }}>
                {islamicEvents[0]?.emoji ?? ''}{day}
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                {hasPayment && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />}
                {hasReminder && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />}
                {isIslamicDay && <span style={{ width: 4, height: 4, borderRadius: '50%', background: islamicColor, display: 'inline-block' }} />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Islamic events legend for this month */}
      {islamicThisMonth.length > 0 && (
        <div style={{ marginTop: 16, background: 'rgba(192,132,252,.07)', border: '1px solid rgba(192,132,252,.2)', borderRadius: 12, padding: '12px 14px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#C084FC', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Islamic Events</p>
          {islamicThisMonth.map((ev, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{ev.emoji}</span>
              <span style={{ fontSize: 12, color: '#F4EEDF', fontWeight: 600 }}>{ev.name}</span>
              <span style={{ fontSize: 11, color: 'rgba(244,238,223,.4)', marginLeft: 'auto' }}>
                {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {monthEntries.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'rgba(244,238,223,.3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Entries</p>
          {monthEntries.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div>
                <span style={{ fontSize: 11, color: e.type === 'payment' ? '#10B981' : '#F59E0B', fontWeight: 600, textTransform: 'uppercase', marginRight: 8 }}>{e.type}</span>
                <span style={{ fontSize: 13, color: 'rgba(244,238,223,.7)' }}>{new Date(e.entry_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {e.note && <span style={{ fontSize: 12, color: 'rgba(244,238,223,.4)', marginLeft: 8 }}>· {e.note}</span>}
              </div>
              {e.type === 'payment' && <span style={{ fontSize: 14, fontWeight: 600, color: '#F4EEDF' }}>{e.amount.toLocaleString()} {currency}</span>}
            </div>
          ))}
        </div>
      )}

      {selectedDate && (
        <AddEntryModal date={selectedDate} sessionId={sessionId} currency={currency} onClose={() => setSelectedDate(null)} onSaved={onRefresh} />
      )}
    </>
  )
}
