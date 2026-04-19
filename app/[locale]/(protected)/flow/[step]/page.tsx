'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
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

const TOTAL_STEPS = 6

export default function FlowStepPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const t = useTranslations('flow')
  const locale = useLocale()
  const step = parseInt(params.step as string)
  const sessionId = searchParams.get('sessionId') ?? ''

  const STEP_TITLES: Record<number, string> = {
    1: t('step1_title'),
    2: t('step2_title'),
    3: t('step3_title'),
    4: t('step4_title'),
    5: t('step5_title'),
    6: t('step6_title'),
  }

  const [answers, setAnswers] = useState<Partial<ZakatAnswers>>({})
  const [stepAnswers, setStepAnswers] = useState<Partial<ZakatAnswers>>({})
  const [explanationCache, setExplanationCache] = useState<Record<number, string>>({})
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const currency = (answers.cash_currency ?? searchParams.get('currency') ?? 'USD')

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
      router.push(`/${locale}/flow/${step + 1}?sessionId=${sessionId}&currency=${currency}`)
    } else {
      router.push(`/${locale}/flow/review?sessionId=${sessionId}`)
    }
  }

  function handleBack() {
    if (step > 1) {
      router.push(`/${locale}/flow/${step - 1}?sessionId=${sessionId}&currency=${currency}`)
    } else {
      router.push(`/${locale}/flow`)
    }
  }

  function renderStep() {
    const props = { initial: answers, onChange: setStepAnswers, currency }
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
    router.push(`/${locale}/flow`)
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
