import type { Json } from '@/lib/supabase/types'

export type Answers = Record<string, Json>

export function mergeAnswers(existing: Answers, incoming: Answers): Answers {
  return { ...existing, ...incoming }
}

export function buildSessionUpdate(
  step: number,
  existingAnswers: Answers,
  newAnswers: Answers
): { current_step: number; answers: Answers } {
  return {
    current_step: step,
    answers: mergeAnswers(existingAnswers, newAnswers),
  }
}
