import { buildSessionUpdate, mergeAnswers } from '@/lib/session'

describe('buildSessionUpdate', () => {
  it('returns update object with current_step and answers merged', () => {
    const existing = { cash: 1000, gold_grams: 50 }
    const newAnswers = { cash: 2000 }
    const result = buildSessionUpdate(2, existing, newAnswers)

    expect(result).toEqual({
      current_step: 2,
      answers: { cash: 2000, gold_grams: 50 },
    })
  })

  it('adds new answer keys that did not exist before', () => {
    const existing = { cash: 1000 }
    const newAnswers = { crypto_btc: 0.5 }
    const result = buildSessionUpdate(3, existing, newAnswers)

    expect(result.answers).toEqual({ cash: 1000, crypto_btc: 0.5 })
  })
})

describe('mergeAnswers', () => {
  it('merges two answer objects, new values overwrite old', () => {
    const result = mergeAnswers({ a: 1, b: 2 }, { b: 99, c: 3 })
    expect(result).toEqual({ a: 1, b: 99, c: 3 })
  })

  it('returns empty object when both inputs are empty', () => {
    expect(mergeAnswers({}, {})).toEqual({})
  })
})
