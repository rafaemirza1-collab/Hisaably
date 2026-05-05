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

  // Catch-up math: remaining balance spread over months/periods left this year
  const totalPaid = entries.filter(e => e.type === 'payment').reduce((s, e) => s + e.amount, 0)
  const remaining = Math.max(0, annualZakat - totalPaid)
  const currentMonth = new Date().getMonth() // 0-indexed
  const monthsLeft = Math.max(1, 12 - currentMonth) // months from now to Dec inclusive
  const biweeklyPeriodsLeft = Math.max(1, Math.round(monthsLeft * 26 / 12))

  const monthlyTarget = schedule === 'monthly'
    ? Math.ceil(remaining / monthsLeft)
    : schedule === 'biweekly'
    ? Math.ceil(remaining / biweeklyPeriodsLeft)
    : remaining // lump sum = whatever's left

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
        {totalPaid > 0 && (
          <p style={{ fontSize: 12, color: '#F59E0B', marginTop: 4 }}>
            Catch-up target: {monthlyTarget.toLocaleString()} {currency}/{schedule === 'biweekly' ? 'bi-week' : 'month'} to finish by Dec
          </p>
        )}
      </div>

      {view === 'year' && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.4)', marginBottom: 8 }}>Payment schedule</p>
          <SchedulePicker
            value={schedule}
            annualZakat={annualZakat}
            currency={currency}
            onChange={handleScheduleChange}
            catchUpMonthly={Math.ceil(remaining / monthsLeft)}
            catchUpBiweekly={Math.ceil(remaining / biweeklyPeriodsLeft)}
            catchUpLump={remaining}
          />
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
