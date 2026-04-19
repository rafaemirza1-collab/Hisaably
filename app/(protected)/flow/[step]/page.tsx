'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { StepLayout } from '@/components/flow/StepLayout'
import { ExplanationPanel } from '@/components/flow/ExplanationPanel'
import { AskNoor } from '@/components/flow/AskNoor'
import { CashStep } from '@/components/flow/steps/CashStep'
import { GoldStep } from '@/components/flow/steps/GoldStep'
import { CryptoStep } from '@/components/flow/steps/CryptoStep'
import { InvestmentsStep } from '@/components/flow/steps/InvestmentsStep'
import { ReceivablesStep } from '@/components/flow/steps/ReceivablesStep'
import { DebtsStep } from '@/components/flow/steps/DebtsStep'
import type { ZakatAnswers } from '@/lib/zakat/types'

const STEP_TITLES: Record<number, string> = {
  1: 'Cash & Bank Balances',
  2: 'Gold & Silver',
  3: 'Cryptocurrency',
  4: 'Investments & Stocks',
  5: 'Money Owed To You',
  6: 'Your Debts',
}

const TOTAL_STEPS = 6

export default function FlowStepPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const step = parseInt(params.step as string)
  const sessionId = searchParams.get('sessionId') ?? ''

  const [answers, setAnswers] = useState<Partial<ZakatAnswers>>({})
  const [stepAnswers, setStepAnswers] = useState<Partial<ZakatAnswers>>({})
  const [explanationCache, setExplanationCache] = useState<Record<number, string>>({})
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSession() {
      const res = await fetch('/api/zakat/session')
      const { session } = await res.json()
      if (session) setAnswers(session.answers as ZakatAnswers)
    }
    loadSession()
  }, [])

  const handleExplanationLoaded = useCallback((text: string) => {
    setExplanationCache(prev => ({ ...prev, [step]: text }))
  }, [step])

  async function handleNext() {
    setLoading(true)
    await fetch('/api/zakat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, step, answers: stepAnswers }),
    })
    setLoading(false)

    if (step < TOTAL_STEPS) {
      router.push(`/flow/${step + 1}?sessionId=${sessionId}`)
    } else {
      router.push(`/flow/review?sessionId=${sessionId}`)
    }
  }

  function handleBack() {
    if (step > 1) {
      router.push(`/flow/${step - 1}?sessionId=${sessionId}`)
    } else {
      router.push('/flow')
    }
  }

  function renderStep() {
    const props = { initial: answers, onChange: setStepAnswers }
    switch (step) {
      case 1: return <CashStep {...props} />
      case 2: return <GoldStep {...props} />
      case 3: return <CryptoStep {...props} />
      case 4: return <InvestmentsStep {...props} />
      case 5: return <ReceivablesStep {...props} />
      case 6: return <DebtsStep {...props} />
      default: return null
    }
  }

  if (!STEP_TITLES[step]) {
    router.push('/flow')
    return null
  }

  return (
    <StepLayout
      step={step}
      totalSteps={TOTAL_STEPS}
      title={STEP_TITLES[step]}
      onNext={handleNext}
      onBack={handleBack}
      loading={loading}
      explanationPanel={
        <>
          <ExplanationPanel
            step={step}
            cachedExplanation={explanationCache[step]}
            onExplanationLoaded={handleExplanationLoaded}
          />
          <AskNoor
            questionsUsed={questionsUsed}
            onQuestionAsked={() => setQuestionsUsed(q => q + 1)}
          />
        </>
      }
    >
      {renderStep()}
    </StepLayout>
  )
}
