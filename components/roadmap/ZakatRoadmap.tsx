'use client'
import { useState, useCallback, useEffect } from 'react'
import { RoadmapYearView } from './RoadmapYearView'
import { RoadmapMonthView } from './RoadmapMonthView'
import { SchedulePicker } from './SchedulePicker'
import { AddEntryModal } from './AddEntryModal'

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

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function ZakatRoadmap({ sessionId, annualZakat, currency, initialSchedule = 'monthly', initialEntries = [] }: Props) {
  const [schedule, setSchedule] = useState<Schedule>(initialSchedule)
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [view, setView] = useState<'year' | 'month'>('year')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  // backlog modal: log a payment for a missed month
  const [backlogMonth, setBacklogMonth] = useState<number | null>(null)
  const year = new Date().getFullYear()
  const today = new Date()
  const currentMonth = today.getMonth() // 0-indexed, e.g. April = 3

  // --- Core derived values (recalculate on every entry change) ---
  const payments = entries.filter(e => e.type === 'payment')
  const totalPaid = payments.reduce((s, e) => s + e.amount, 0)
  const remaining = Math.max(0, annualZakat - totalPaid)

  // Which past months (before current month) had zero payments logged?
  const paidMonthSet = new Set(payments.map(p => {
    const d = new Date(p.entry_date)
    return d.getFullYear() === year ? d.getMonth() : -1
  }))
  const missedMonths = Array.from({ length: currentMonth }, (_, i) => i)
    .filter(m => !paidMonthSet.has(m))

  // Remaining months from current month to December (inclusive)
  const monthsLeft = Math.max(1, 12 - currentMonth)
  // Bi-weekly periods: count actual days from today to Dec 31, divide by 14
  const dec31 = new Date(year, 11, 31)
  const daysLeft = Math.ceil((dec31.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const biweeklyPeriodsLeft = Math.max(1, Math.floor(daysLeft / 14))

  // Per-period catch-up target based on remaining balance and time left
  const catchUpMonthly = Math.ceil(remaining / monthsLeft)
  const catchUpBiweekly = Math.ceil(remaining / biweeklyPeriodsLeft)
  const catchUpLump = remaining

  const perPeriodTarget = schedule === 'monthly'
    ? catchUpMonthly
    : schedule === 'biweekly'
    ? catchUpBiweekly
    : catchUpLump

  // Sync entries when initialEntries change (e.g. after parent refetch)
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

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

  // Date string for the first of a given month
  function firstOfMonth(m: number) {
    return `${year}-${String(m + 1).padStart(2, '0')}-01`
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,.06), rgba(13,31,62,.8))', border: '1px solid rgba(16,185,129,.2)', borderRadius: 20, padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#10B981', marginBottom: 4 }}>Zakat Roadmap</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#F4EEDF', margin: 0 }}>{year} · {annualZakat.toLocaleString()} {currency}</p>
      </div>

      {/* Missed months alert — shown at the top whenever there are missed months */}
      {missedMonths.length > 0 && view === 'year' && (
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B', marginBottom: 6 }}>
            ⚠️ {missedMonths.length} missed month{missedMonths.length > 1 ? 's' : ''} detected
          </p>
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.6)', marginBottom: 10, lineHeight: 1.5 }}>
            No payments were logged for <strong style={{ color: '#F4EEDF' }}>{missedMonths.map(m => MONTH_NAMES[m]).join(', ')}</strong>. Your target has been recalculated to {perPeriodTarget.toLocaleString()} {currency}/{schedule === 'biweekly' ? 'bi-week' : 'month'} to catch up by December.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.5)', marginBottom: 10 }}>
            Did you actually pay in any of those months? Log it and your target will adjust automatically.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {missedMonths.map(m => (
              <button
                key={m}
                onClick={() => setBacklogMonth(m)}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(245,158,11,.4)', background: 'rgba(245,158,11,.12)', color: '#F59E0B', cursor: 'pointer', fontWeight: 600 }}
              >
                Log {MONTH_NAMES[m]} payment
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schedule picker */}
      {view === 'year' && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.4)', marginBottom: 8 }}>Payment schedule</p>
          <SchedulePicker
            value={schedule}
            annualZakat={annualZakat}
            currency={currency}
            onChange={handleScheduleChange}
            catchUpMonthly={catchUpMonthly}
            catchUpBiweekly={catchUpBiweekly}
            catchUpLump={catchUpLump}
          />
        </div>
      )}

      {/* Calendar views */}
      {view === 'year' ? (
        <RoadmapYearView
          year={year}
          entries={entries}
          monthlyTarget={perPeriodTarget}
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
          monthlyTarget={perPeriodTarget}
          onRefresh={fetchEntries}
          onBack={() => setView('year')}
        />
      )}

      {/* Backlog payment modal for missed months */}
      {backlogMonth !== null && (
        <AddEntryModal
          date={firstOfMonth(backlogMonth)}
          sessionId={sessionId}
          currency={currency}
          onClose={() => setBacklogMonth(null)}
          onSaved={fetchEntries}
        />
      )}
    </div>
  )
}
