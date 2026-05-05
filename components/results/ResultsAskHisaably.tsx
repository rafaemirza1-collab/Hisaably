'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface Message {
  role: 'user' | 'assistant'
  streamed: string
  displayed: string
  done: boolean
}

interface JournalEntry {
  entry_date: string
  amount: number
  note: string | null
  type: 'payment' | 'reminder'
}

interface Props {
  zakatAmount?: number
  currency?: string
  userName?: string
  madhab?: string
  annualZakat?: number
  journalEntries?: JournalEntry[]
  paymentSchedule?: string
  sessionCreatedAt?: string
}

function formatText(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cream">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

function fmtAmount(n: number, currency: string) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function buildZakatContext(
  zakatAmount: number | undefined,
  annualZakat: number | undefined,
  currency: string,
  userName: string | undefined,
  journalEntries: JournalEntry[],
  paymentSchedule: string | undefined,
  sessionCreatedAt: string | undefined,
): string | undefined {
  if (!zakatAmount || zakatAmount <= 0) return undefined

  const payments = journalEntries.filter(e => e.type === 'payment')
  const reminders = journalEntries.filter(e => e.type === 'reminder')
  const totalPaid = payments.reduce((s, e) => s + e.amount, 0)
  const annual = annualZakat ?? zakatAmount
  const remaining = Math.max(0, annual - totalPaid)

  let hawlLine = ''
  if (sessionCreatedAt) {
    const hawlEnd = new Date(new Date(sessionCreatedAt).getTime() + 354 * 24 * 60 * 60 * 1000)
    const daysLeft = Math.max(0, Math.round((hawlEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    const monthsLeft = Math.round(daysLeft / 30)
    hawlLine = ` Their hawl ends in approximately ${monthsLeft} months (${daysLeft} days), on ${hawlEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
  }

  let historyLine = ''
  if (payments.length > 0) {
    const paymentSummary = payments
      .map(p => `${new Date(p.entry_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${p.amount.toLocaleString()} ${currency}${p.note ? ` (${p.note})` : ''}`)
      .join('; ')
    historyLine = ` Payment history: ${paymentSummary}.`
  } else {
    historyLine = ' They have not logged any payments yet.'
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const paidMonths = new Set(payments.map(p => {
    const d = new Date(p.entry_date)
    return `${d.getFullYear()}-${d.getMonth()}`
  }))
  const missedMonths: string[] = []
  for (let m = 0; m < currentMonth; m++) {
    if (!paidMonths.has(`${currentYear}-${m}`)) {
      missedMonths.push(new Date(currentYear, m, 1).toLocaleDateString('en-US', { month: 'long' }))
    }
  }
  const missedLine = missedMonths.length > 0 ? ` They missed payments in: ${missedMonths.join(', ')}.` : ''

  const scheduleLine = paymentSchedule ? ` Their chosen payment schedule is ${paymentSchedule}.` : ''

  const upcomingReminders = reminders.filter(r => new Date(r.entry_date) >= new Date())
  const reminderLine = upcomingReminders.length > 0
    ? ` They have upcoming reminders: ${upcomingReminders.map(r => `${r.entry_date}${r.note ? `: ${r.note}` : ''}`).join(', ')}.`
    : ''

  return `The user${userName ? ` (${userName})` : ''} owes ${zakatAmount.toLocaleString()} ${currency} in Zakat this year (annual total: ${annual.toLocaleString()} ${currency}). They have paid ${totalPaid.toLocaleString()} ${currency} so far, leaving ${remaining.toLocaleString()} ${currency} still to pay.${hawlLine}${scheduleLine}${historyLine}${missedLine}${reminderLine} When giving advice, be specific: calculate realistic payment amounts based on remaining balance and days left. Call out missed months by name. Be encouraging but honest.`
}

export function ResultsAskHisaably({ zakatAmount, currency = 'USD', userName, madhab, annualZakat, journalEntries = [], paymentSchedule, sessionCreatedAt }: Props) {
  const t = useTranslations('ai')
  const locale = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typewriterRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const amtLabel = zakatAmount ? fmtAmount(zakatAmount, currency) : ''

  const SUGGESTIONS = zakatAmount && zakatAmount > 0 ? [
    `Can I spread my Zakat payments across the year instead of paying all at once?`,
    `Which types of charities and causes qualify for my Zakat?`,
    `Can I give food or goods instead of money for Zakat?`,
    `How do I find eligible Zakat recipients in my local community?`,
  ] : [
    `Does Zakat apply to money in a pension or retirement account?`,
    `What is the difference between Zakat and Sadaqah?`,
    `Does my mortgage count as a deductible debt for Zakat?`,
    `How does Zakat work if my wealth fluctuates throughout the year?`,
  ]

  const zakatContext = buildZakatContext(zakatAmount, annualZakat, currency, userName, journalEntries, paymentSchedule, sessionCreatedAt)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    messages.forEach((msg, i) => {
      if (msg.role !== 'assistant') return
      if (msg.displayed.length >= msg.streamed.length) return
      if (typewriterRefs.current.has(i)) return

      function tick() {
        setMessages(prev => {
          const updated = [...prev]
          const m = updated[i]
          if (!m || m.role !== 'assistant') return prev
          const next = Math.min(m.displayed.length + 4, m.streamed.length)
          updated[i] = { ...m, displayed: m.streamed.slice(0, next) }
          return updated
        })
        setMessages(prev => {
          const m = prev[i]
          if (m && m.role === 'assistant' && m.displayed.length < m.streamed.length) {
            const t = setTimeout(tick, 12)
            typewriterRefs.current.set(i, t)
          } else {
            typewriterRefs.current.delete(i)
          }
          return prev
        })
      }

      const t = setTimeout(tick, 12)
      typewriterRefs.current.set(i, t)
    })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { role: 'user', streamed: text, displayed: text, done: true }
    setMessages(prev => {
      const next = [...prev, userMsg]
      return next
    })

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'question', question: text, zakatContext, madhab, locale }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    setMessages(prev => [...prev, { role: 'assistant', streamed: '', displayed: '', done: false }])
    setLoading(false)

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], streamed: fullText }
          }
          return updated
        })
      }
    }

    setMessages(prev => {
      const updated = [...prev]
      const lastIdx = updated.length - 1
      if (updated[lastIdx]?.role === 'assistant') {
        updated[lastIdx] = { ...updated[lastIdx], done: true }
      }
      return updated
    })
  }, [loading, zakatContext, locale])

  function handleAsk() {
    sendMessage(input.trim())
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10" style={{ flexShrink: 0 }}>
        <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">{t('ask_title')}</p>
        {zakatAmount && zakatAmount > 0 ? (
          <button
            onClick={() => sendMessage(`I owe ${amtLabel} in Zakat. Help me plan how to pay it — what are my options?`)}
            disabled={loading}
            className="mt-2 w-full py-2.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold rounded-xl hover:bg-emerald/20 disabled:opacity-50 transition-colors"
          >
            Help me plan how to pay my Zakat ({amtLabel}) →
          </button>
        ) : (
          <p className="text-cream/40 text-xs mt-0.5">{t('ask_placeholder')}</p>
        )}
      </div>

      {/* Suggestion chips — only before first message */}
      {messages.length === 0 && (
        <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2" style={{ flexShrink: 0 }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs bg-white/5 border border-white/10 text-cream/50 rounded-lg px-3 py-2 hover:border-emerald/30 hover:text-cream/80 transition-colors text-left disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={messagesContainerRef} className="px-5 py-4 space-y-4 overflow-y-auto" style={{ flex: 1, minHeight: 0, maxHeight: '360px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald text-white'
                  : 'bg-white/5 border border-white/10 text-cream/80'
              }`}>
                {msg.role === 'assistant' ? (
                  <>
                    <span dangerouslySetInnerHTML={{ __html: formatText(msg.displayed) || t('loading') }} />
                    {msg.displayed.length < msg.streamed.length && (
                      <span className="inline-block w-0.5 h-3.5 bg-gold ml-0.5 align-middle animate-pulse" />
                    )}
                  </>
                ) : msg.displayed}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="e.g. Does my mortgage count as debt?"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-emerald text-white rounded-xl text-sm font-medium hover:bg-emerald/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading ? t('loading') : t('ask_button')}
          </button>
        </div>
        <p className="text-xs text-cream/20 mt-2">Unlimited questions · Zakat scope only</p>
      </div>
    </div>
  )
}
