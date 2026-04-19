import { calculateZakat } from '@/lib/zakat/calculate'
import type { ZakatAnswers, LivePrices } from '@/lib/zakat/types'

const mockPrices: LivePrices = {
  gold_usd_per_gram: 100,   // 85g nisab = $8,500
  silver_usd_per_gram: 0.5, // 612g nisab = $306
  crypto_usd: { bitcoin: 60000 },
}

describe('calculateZakat', () => {
  it('returns zakat = 0 when wealth is below gold nisab', () => {
    const answers: ZakatAnswers = { cash_amount: 5000 }
    const result = calculateZakat(answers, mockPrices)
    expect(result.nisab_met_gold).toBe(false)
    expect(result.zakat_amount_gold).toBe(0)
  })

  it('returns 2.5% when wealth meets gold nisab', () => {
    const answers: ZakatAnswers = { cash_amount: 10000 }
    const result = calculateZakat(answers, mockPrices)
    expect(result.nisab_met_gold).toBe(true)
    expect(result.zakat_amount_gold).toBeCloseTo(250)
  })

  it('meets silver nisab but not gold nisab', () => {
    const answers: ZakatAnswers = { cash_amount: 500 }
    const result = calculateZakat(answers, mockPrices)
    expect(result.nisab_met_silver).toBe(true)
    expect(result.nisab_met_gold).toBe(false)
    expect(result.zakat_amount_silver).toBeCloseTo(12.5)
    expect(result.zakat_amount_gold).toBe(0)
  })

  it('excludes jewelry gold from zakatable wealth', () => {
    const answers: ZakatAnswers = {
      gold_grams: 100,
      gold_is_jewelry: true,
      cash_amount: 10000,
    }
    const result = calculateZakat(answers, mockPrices)
    const goldCat = result.categories.find(c => c.category === 'Gold & Silver')
    expect(goldCat?.included).toBe(false)
    expect(result.total_zakatable_wealth).toBeCloseTo(10000)
  })

  it('deducts debts from total zakatable wealth', () => {
    const answers: ZakatAnswers = { cash_amount: 15000, debts_amount: 5000 }
    const result = calculateZakat(answers, mockPrices)
    expect(result.total_zakatable_wealth).toBeCloseTo(10000)
    expect(result.zakat_amount_gold).toBeCloseTo(250)
  })

  it('excludes receivables when not likely to be repaid', () => {
    const answers: ZakatAnswers = {
      cash_amount: 10000,
      receivables_amount: 5000,
      receivables_likely_repaid: false,
    }
    const result = calculateZakat(answers, mockPrices)
    expect(result.total_zakatable_wealth).toBeCloseTo(10000)
  })

  it('includes receivables when likely to be repaid', () => {
    const answers: ZakatAnswers = {
      cash_amount: 10000,
      receivables_amount: 5000,
      receivables_likely_repaid: true,
    }
    const result = calculateZakat(answers, mockPrices)
    expect(result.total_zakatable_wealth).toBeCloseTo(15000)
  })

  it('calculates crypto value from live prices', () => {
    const answers: ZakatAnswers = {
      crypto_holdings: [{ coin: 'bitcoin', symbol: 'BTC', amount: 0.1 }],
    }
    const result = calculateZakat(answers, mockPrices)
    const cryptoCat = result.categories.find(c => c.category === 'Crypto')
    expect(cryptoCat?.zakatable_value).toBeCloseTo(6000)
  })
})
