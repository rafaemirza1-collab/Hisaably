'use client'
import { useState, useCallback } from 'react'
import { RoadmapYearView } from './RoadmapYearView'
import { RoadmapMonthView } from './RoadmapMonthView'
import { SchedulePicker } from './SchedulePicker'

type Schedule = 'monthly' | 'biweekly' | 'lump'

export interface JournalEntry {
  id: string
  entry_date: string
  amount: number
  note: string | null
  type: 'payment' | 'reminder'
}

interface Props {
  sessionId: string
  annualZakat: number
  currency: string
  initialSchedule?: Schedule
  initialEntries?: JournalEntry[]
}

export function ZakatRoadmap({ sessionId, annualZakat, currency, initialSchedule = 'monthly', initialEntries = [] }: Props) {
  const [schedule, setSchedule] = useState<Schedule>(initialSchedule)
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [view, setView] = useState<'year' | 'month'>('year')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const year = new Date().getFullYear()

  const monthlyTarget = schedule === 'monthly'
    ? Math.ceil(annualZakat / 12)
    : schedule === 'biweekly'
    ? Math.ceil(annualZakat / 26) * 2
    : annualZakat

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/zakat/journal?sessionId=${sessionId}`)
    setEntries(await res.json())
  }, [sessionId])

  async function handleScheduleChange(s: Schedule) {
    setSchedule(s)
    await fetch('/api/zakat/schedule', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, schedule: s }),
    })
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,.06), rgba(13,31,62,.8))', border: '1px solid rgba(16,185,129,.2)', borderRadius: 20, padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#10B981', marginBottom: 4 }}>Zakat Roadmap</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#F4EEDF', margin: 0 }}>{year} · {annualZakat.toLocaleString()} {currency}</p>
      </div>

      {view === 'year' && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.4)', marginBottom: 8 }}>Payment schedule</p>
          <SchedulePicker value={schedule} annualZakat={annualZakat} currency={currency} onChange={handleScheduleChange} />
        </div>
      )}

      {view === 'year' ? (
        <RoadmapYearView
          year={year}
          entries={entries}
          monthlyTarget={monthlyTarget}
          annualZakat={annualZakat}
          currency={currency}
          onSelectMonth={m => { setSelectedMonth(m); setView('month') }}
        />
      ) : (
        <RoadmapMonthView
          year={year}
          month={selectedMonth}
          entries={entries}
          sessionId={sessionId}
          currency={currency}
          monthlyTarget={monthlyTarget}
          onRefresh={fetchEntries}
          onBack={() => setView('year')}
        />
      )}
    </div>
  )
}
