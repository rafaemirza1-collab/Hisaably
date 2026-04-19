'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface Message {
  role: 'user' | 'assistant'
  streamed: string   // full received text
  displayed: string  // typewriter-visible text
  done: boolean
}

interface AskNoorProps {
  questionsUsed: number
  onQuestionAsked: () => void
}

function formatText(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cream">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export function AskNoor({ onQuestionAsked }: AskNoorProps) {
  const t = useTranslations('ai')
  const locale = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typewriterRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Drive typewriter for each assistant message
  useEffect(() => {
    messages.forEach((msg, i) => {
      if (msg.role !== 'assistant') return
      if (msg.displayed.length >= msg.streamed.length) return

      if (typewriterRefs.current.has(i)) return // already ticking

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

  async function handleAsk() {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', streamed: question, displayed: question, done: true }])

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'question', question, locale }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    const msgIndex = messages.length + 1

    setMessages(prev => [...prev, { role: 'assistant', streamed: '', displayed: '', done: false }])
    setLoading(false)

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[msgIndex] = { ...updated[msgIndex], streamed: fullText }
          return updated
        })
      }
    }

    setMessages(prev => {
      const updated = [...prev]
      if (updated[msgIndex]) updated[msgIndex] = { ...updated[msgIndex], done: true }
      return updated
    })
    onQuestionAsked()
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-cream/40 mb-3">{t('ask_title')}</p>

      {messages.length > 0 && (
        <div className="space-y-3 mb-3 max-h-64 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald text-white'
                  : 'bg-white/5 border border-white/10 text-cream/70'
              }`}>
                {msg.role === 'assistant' ? (
                  <>
                    <span dangerouslySetInnerHTML={{ __html: formatText(msg.displayed) || t('loading') }} />
                    {msg.displayed.length < msg.streamed.length && (
                      <span className="inline-block w-0.5 h-3 bg-gold ml-0.5 align-middle animate-pulse" />
                    )}
                  </>
                ) : msg.displayed}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder={t('ask_placeholder')}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
        />
        <button
          onClick={handleAsk}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-emerald text-white rounded-xl text-sm font-medium hover:bg-emerald/90 disabled:opacity-50 transition-colors"
        >
          {loading ? t('loading') : t('ask_button')}
        </button>
      </div>
    </div>
  )
}
