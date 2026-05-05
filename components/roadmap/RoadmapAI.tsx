'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface JournalEntry {
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
  entries: JournalEntry[]
  schedule: string
  perPeriodTarget: number
  missedMonths: number[]
  fxRate?: number
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface Message {
  role: 'user' | 'assistant'
  text: string
  streaming?: boolean
}

function buildContext(
  annualZakat: number,
  currency: string,
  entries: JournalEntry[],
  schedule: string,
  perPeriodTarget: number,
  missedMonths: number[],
  fxRate: number,
): string {
  const today = new Date()
  const year = today.getFullYear()
  const payments = entries.filter(e => e.type === 'payment')
  const reminders = entries.filter(e => e.type === 'reminder')
  const totalPaid = payments.reduce((s, e) => s + e.amount, 0)
  const remaining = Math.max(0, annualZakat - totalPaid)
  const pct = annualZakat > 0 ? Math.round((totalPaid / annualZakat) * 100) : 0

  // Per-month breakdown
  const byMonth: Record<number, number> = {}
  for (const p of payments) {
    const d = new Date(p.entry_date)
    if (d.getFullYear() === year) {
      byMonth[d.getMonth()] = (byMonth[d.getMonth()] ?? 0) + p.amount
    }
  }
  const monthBreakdown = Object.entries(byMonth)
    .map(([m, amt]) => `${MONTH_NAMES[Number(m)]}: ${amt.toLocaleString()} ${currency}`)
    .join(', ')

  // Time left
  const dec31 = new Date(year, 11, 31)
  const daysLeft = Math.ceil((dec31.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const monthsLeft = Math.max(1, 12 - today.getMonth())
  const biweeksLeft = Math.max(1, Math.floor(daysLeft / 14))

  const missedLine = missedMonths.length > 0
    ? `Missed months (no payments logged): ${missedMonths.map(m => MONTH_NAMES[m]).join(', ')}.`
    : 'No missed months.'

  const reminderLine = reminders.length > 0
    ? `Upcoming reminders: ${reminders.filter(r => new Date(r.entry_date) >= today).map(r => `${r.entry_date}${r.note ? ` (${r.note})` : ''}`).join(', ')}.`
    : ''

  const currencyNote = fxRate !== 1
    ? `NOTE: The user is viewing amounts in ${currency} (converted from USD at rate ${fxRate.toFixed(4)}). All amounts below are already in ${currency}. Do NOT suggest they have overpaid — the payment amounts are correct in ${currency} terms.`
    : ''

  return `You are an intelligent Zakat payment assistant with FULL access to this user's roadmap data. Here is their exact situation as of ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}:
${currencyNote}

ANNUAL ZAKAT OBLIGATION: ${annualZakat.toLocaleString()} ${currency}
TOTAL PAID SO FAR: ${totalPaid.toLocaleString()} ${currency} (${pct}% complete)
REMAINING TO PAY: ${remaining.toLocaleString()} ${currency}
PAYMENT SCHEDULE: ${schedule}
CURRENT TARGET: ${perPeriodTarget.toLocaleString()} ${currency} per ${schedule === 'biweekly' ? 'bi-week' : schedule === 'lump' ? 'lump sum' : 'month'}
MONTHS LEFT IN YEAR: ${monthsLeft}
BI-WEEKLY PERIODS LEFT: ${biweeksLeft}
DAYS LEFT IN YEAR: ${daysLeft}
${monthBreakdown ? `PAYMENT HISTORY BY MONTH: ${monthBreakdown}` : 'PAYMENT HISTORY: No payments logged yet.'}
${missedLine}
${reminderLine}

You know EXACTLY what they paid each month, what's left, and how much time they have. Give specific, personalized advice — not generic. Use real numbers. Be encouraging but honest. Keep answers concise (2-4 sentences). Only discuss Zakat.`
}

function formatText(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F4EEDF">$1</strong>')
    .replace(/\n/g, '<br/>')
}

const SUGGESTIONS = [
  'Am I on track to pay my Zakat this year?',
  'How much do I need to pay each month to catch up?',
  'What months am I behind on and what should I do?',
  'Give me a payment plan for the rest of the year',
]

export function RoadmapAI({ annualZakat, currency, entries, schedule, perPeriodTarget, missedMonths, fxRate = 1 }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = messagesRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')
    setLoading(true)
    setOpen(true)

    const context = buildContext(annualZakat, currency, entries, schedule, perPeriodTarget, missedMonths, fxRate)

    setMessages(prev => [...prev, { role: 'user', text }])

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'question', question: text, zakatContext: context }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let full = ''

    setMessages(prev => [...prev, { role: 'assistant', text: '', streaming: true }])
    setLoading(false)

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, text: full }
          return updated
        })
      }
    }

    setMessages(prev => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, streaming: false }
      return updated
    })
  }, [loading, annualZakat, currency, entries, schedule, perPeriodTarget, missedMonths, fxRate])

  return (
    <div style={{ marginTop: 20, background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#A78BFA', marginBottom: 2 }}>AI Roadmap Advisor</p>
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.4)', margin: 0 }}>Knows your full payment history · asks me anything</p>
        </div>
        <span style={{ fontSize: 18, color: '#A78BFA' }}>{open ? '−' : '+'}</span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid rgba(139,92,246,.15)' }}>
          {/* Suggestion chips — only before first message */}
          {messages.length === 0 && (
            <div style={{ padding: '14px 18px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                  style={{
                    fontSize: 12, padding: '7px 12px', borderRadius: 10,
                    border: '1px solid rgba(139,92,246,.25)', background: 'rgba(139,92,246,.08)',
                    color: 'rgba(244,238,223,.7)', cursor: 'pointer', textAlign: 'left',
                    opacity: loading ? .5 : 1,
                  }}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div ref={messagesRef} style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', borderRadius: 12, padding: '10px 14px', fontSize: 13, lineHeight: 1.55,
                    background: msg.role === 'user' ? '#10B981' : 'rgba(255,255,255,.05)',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,.08)' : 'none',
                    color: msg.role === 'user' ? '#fff' : 'rgba(244,238,223,.85)',
                  }}>
                    {msg.role === 'assistant' ? (
                      <>
                        <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) || '…' }} />
                        {msg.streaming && <span style={{ display: 'inline-block', width: 2, height: 13, background: '#A78BFA', marginLeft: 3, verticalAlign: 'middle', animation: 'pulse 1s infinite' }} />}
                      </>
                    ) : msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 18px', borderTop: messages.length > 0 ? '1px solid rgba(255,255,255,.05)' : 'none', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input.trim())}
              placeholder="Ask about your Zakat payments…"
              style={{
                flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#F4EEDF', outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage(input.trim())}
              disabled={loading || !input.trim()}
              style={{
                padding: '9px 16px', borderRadius: 10, border: 'none',
                background: '#8B5CF6', color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', opacity: loading || !input.trim() ? .5 : 1,
              }}
            >{loading ? '…' : 'Ask'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
