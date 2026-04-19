'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface StepLayoutProps {
  step: number
  totalSteps: number
  title: string
  children: React.ReactNode
  explanationPanel: React.ReactNode
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  loading?: boolean
}

export function StepLayout({
  step,
  totalSteps,
  title,
  children,
  explanationPanel,
  onNext,
  onBack,
  nextLabel = 'Continue',
  loading = false,
}: StepLayoutProps) {
  const progress = Math.round((step / totalSteps) * 100)
  const prevStep = useRef(step)
  const [direction, setDirection] = useState<'right' | 'left'>('right')
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (prevStep.current !== step) {
      setDirection(step > prevStep.current ? 'right' : 'left')
      setAnimKey(k => k + 1)
      prevStep.current = step
    }
  }, [step])

  return (
    <div className="min-h-screen bg-navy">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-white/10">
        <div
          className="h-0.5 bg-gradient-to-r from-emerald to-gold transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 animate-fade-in">
        <Image src="/logo-icon.png" alt="Hisaably" width={40} height={40} />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <span className="text-xs text-cream/30 font-medium tabular-nums">
            {step} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 pt-5 animate-fade-in delay-50">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-400 ${
              i + 1 === step
                ? 'w-5 h-1.5 bg-gold'
                : i + 1 < step
                ? 'w-1.5 h-1.5 bg-emerald/60'
                : 'w-1.5 h-1.5 bg-white/15'
            }`}
          />
        ))}
      </div>

      {/* Content — animates on step change */}
      <div
        key={animKey}
        className={`max-w-2xl mx-auto px-6 py-8 ${direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
      >
        <h1 className="text-2xl font-bold text-cream mb-7">{title}</h1>

        <div className="mb-7">{children}</div>

        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="press px-6 py-3 border border-white/10 text-cream/70 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all duration-200"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            disabled={loading}
            className="press flex-1 px-6 py-3 bg-emerald text-white rounded-xl font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-all duration-200 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? 'Saving...' : nextLabel}</span>
            <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 animate-fade-up delay-200">
          {explanationPanel}
        </div>
      </div>
    </div>
  )
}
