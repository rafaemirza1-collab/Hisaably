import { parseCoinGeckoPrices, GOLD_TROY_OZ_TO_GRAMS, SILVER_TROY_OZ_TO_GRAMS } from '@/lib/zakat/prices'

describe('parseCoinGeckoPrices', () => {
  it('extracts USD prices by coin ID', () => {
    const raw = {
      bitcoin: { usd: 65000 },
      ethereum: { usd: 3200 },
    }
    const result = parseCoinGeckoPrices(raw)
    expect(result).toEqual({ bitcoin: 65000, ethereum: 3200 })
  })

  it('returns empty object for empty input', () => {
    expect(parseCoinGeckoPrices({})).toEqual({})
  })
})

describe('constants', () => {
  it('GOLD_TROY_OZ_TO_GRAMS is 31.1035', () => {
    expect(GOLD_TROY_OZ_TO_GRAMS).toBeCloseTo(31.1035)
  })

  it('SILVER_TROY_OZ_TO_GRAMS is 31.1035', () => {
    expect(SILVER_TROY_OZ_TO_GRAMS).toBeCloseTo(31.1035)
  })
})
