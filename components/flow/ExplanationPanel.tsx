'use client'

import { useEffect, useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface ExplanationPanelProps {
  step: number
  cachedExplanation?: string
  onExplanationLoaded?: (text: string) => void
}

function formatHtml(text: string) {
  return text
    .replace(/^#{1,3}\s+(.+)$/gm, '<span class="font-semibold text-cream">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cream">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- /gm, '· ')
    .replace(/\n/g, '<br/>')
}

export function ExplanationPanel({
  step,
  cachedExplanation,
  onExplanationLoaded,
}: ExplanationPanelProps) {
  const t = useTranslations('ai')
  const locale = useLocale()
  const [streamedText, setStreamedText] = useState(cachedExplanation ?? '')
  const [displayedText, setDisplayedText] = useState(cachedExplanation ?? '')
  const [loading, setLoading] = useState(!cachedExplanation)
  const [streaming, setStreaming] = useState(false)
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const displayedLenRef = useRef(cachedExplanation?.length ?? 0)

  // Typewriter: whenever streamedText grows, advance displayedText
  useEffect(() => {
    if (streamedText.length <= displayedLenRef.current) return
    const target = streamedText

    function tick() {
      displayedLenRef.current = Math.min(displayedLenRef.current + 4, target.length)
      setDisplayedText(target.slice(0, displayedLenRef.current))
      if (displayedLenRef.current < target.length) {
        typewriterRef.current = setTimeout(tick, 12)
      }
    }

    if (typewriterRef.current) clearTimeout(typewriterRef.current)
    typewriterRef.current = setTimeout(tick, 12)

    return () => { if (typewriterRef.current) clearTimeout(typewriterRef.current) }
  }, [streamedText])

  useEffect(() => {
    if (cachedExplanation) {
      setStreamedText(cachedExplanation)
      setDisplayedText(cachedExplanation)
      displayedLenRef.current = cachedExplanation.length
      setLoading(false)
      return
    }

    let cancelled = false
    displayedLenRef.current = 0

    async function fetchExplanation() {
      setLoading(true)
      setStreamedText('')
      setDisplayedText('')
      setStreaming(true)

      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'step', step, locale }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (!reader) return

      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done || cancelled) break
        fullText += decoder.decode(value)
        setStreamedText(fullText)
      }

      setStreaming(false)
      onExplanationLoaded?.(fullText)
    }

    fetchExplanation()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cachedExplanation, onExplanationLoaded])

  const isDone = !loading && !streaming && displayedText.length === streamedText.length

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-fade-up">
      <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">
        {t('hisaably_explains')}
      </p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-2/3" />
        </div>
      ) : (
        <p className="text-cream/70 text-sm leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: formatHtml(displayedText) }} />
          {!isDone && (
            <span className="inline-block w-0.5 h-3.5 bg-gold ml-0.5 align-middle animate-pulse" />
          )}
        </p>
      )}
    </div>
  )
}
