import type { LivePrices, CryptoHolding } from './types'

export const GOLD_TROY_OZ_TO_GRAMS = 31.1035
export const SILVER_TROY_OZ_TO_GRAMS = 31.1035

const GOLD_API_URL = 'https://data-asg.goldprice.org/dbXRates/USD'
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price'

export function parseCoinGeckoPrices(
  raw: Record<string, { usd: number }>
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(raw).map(([id, data]) => [id, data.usd])
  )
}

async function fetchMetalPrices(): Promise<{ gold: number; silver: number }> {
  try {
    const res = await fetch(GOLD_API_URL, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Metal price fetch failed')
    const data = await res.json()
    const goldPerOz: number = data.items?.[0]?.xauPrice ?? data.xauPrice
    const silverPerOz: number = data.items?.[0]?.xagPrice ?? data.xagPrice
    return {
      gold: goldPerOz / GOLD_TROY_OZ_TO_GRAMS,
      silver: silverPerOz / SILVER_TROY_OZ_TO_GRAMS,
    }
  } catch {
    // Fallback prices if API is down
    return { gold: 98.0, silver: 0.97 }
  }
}

async function fetchCryptoPrices(
  holdings: CryptoHolding[]
): Promise<Record<string, number>> {
  if (holdings.length === 0) return {}
  const ids = holdings.map(h => h.coin).join(',')
  const url = `${COINGECKO_URL}?ids=${ids}&vs_currencies=usd`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Crypto price fetch failed')
  const data = await res.json()
  return parseCoinGeckoPrices(data)
}

export async function fetchLivePrices(
  cryptoHoldings: CryptoHolding[]
): Promise<LivePrices> {
  const [metals, crypto] = await Promise.all([
    fetchMetalPrices(),
    fetchCryptoPrices(cryptoHoldings),
  ])
  return {
    gold_usd_per_gram: metals.gold,
    silver_usd_per_gram: metals.silver,
    crypto_usd: crypto,
  }
}

export async function fetchUsdRate(currency: string): Promise<number> {
  if (!currency || currency === 'USD') return 1
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/USD`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('Exchange rate fetch failed')
    const data = await res.json()
    const rate = data.rates?.[currency]
    if (!rate) return 1
    return 1 / rate // rate is USD->currency, we want currency->USD
  } catch {
    return 1
  }
}
