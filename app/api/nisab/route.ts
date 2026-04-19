import { NextResponse } from 'next/server'

let fxCache: { rates: Record<string, number>; fetchedAt: number } | null = null
let metalCache: { goldPerGram: number; silverPerGram: number; fetchedAt: number } | null = null
const CACHE_TTL = 60 * 60 * 1000

async function getFxRates(): Promise<Record<string, number>> {
  if (fxCache && Date.now() - fxCache.fetchedAt < CACHE_TTL) return fxCache.rates
  const res = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error('fx failed')
  const data = await res.json()
  fxCache = { rates: data.rates, fetchedAt: Date.now() }
  return fxCache.rates
}

async function getMetals(): Promise<{ goldPerGram: number; silverPerGram: number }> {
  if (metalCache && Date.now() - metalCache.fetchedAt < CACHE_TTL) return metalCache

  const TROY_OZ = 31.1035

  // Source 1: metals-api via frankfurter-style free endpoint (metals.live)
  try {
    const res = await fetch('https://api.metals.live/v1/spot', {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      // Returns array: [{ gold: 3200.5 }, { silver: 32.1 }, ...]
      const goldEntry = Array.isArray(data) ? data.find((d: Record<string, number>) => 'gold' in d) : null
      const silverEntry = Array.isArray(data) ? data.find((d: Record<string, number>) => 'silver' in d) : null
      const goldPerOz = goldEntry?.gold
      const silverPerOz = silverEntry?.silver
      if (goldPerOz > 100 && silverPerOz > 0.5) {
        metalCache = {
          goldPerGram: goldPerOz / TROY_OZ,
          silverPerGram: silverPerOz / TROY_OZ,
          fetchedAt: Date.now(),
        }
        return metalCache
      }
    }
  } catch { /* try next */ }

  // Source 2: goldprice.org
  try {
    const res = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const goldPerOz = data.items?.[0]?.xauPrice ?? data.xauPrice
      const silverPerOz = data.items?.[0]?.xagPrice ?? data.xagPrice
      if (goldPerOz > 100 && silverPerOz > 0.5) {
        metalCache = {
          goldPerGram: goldPerOz / TROY_OZ,
          silverPerGram: silverPerOz / TROY_OZ,
          fetchedAt: Date.now(),
        }
        return metalCache
      }
    }
  } catch { /* try next */ }

  // Source 3: frankfurter.app supports XAU (gold) via ECB rates
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=XAU&to=USD,XAG', {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      // data.rates.USD = price of 1 troy oz gold in USD
      // data.rates.XAG = price of 1 troy oz gold in silver oz
      const goldPerOz = data.rates?.USD
      const goldToSilverRatio = data.rates?.XAG // oz of silver per oz of gold
      if (goldPerOz > 100 && goldToSilverRatio > 1) {
        const silverPerOz = goldPerOz / goldToSilverRatio
        metalCache = {
          goldPerGram: goldPerOz / TROY_OZ,
          silverPerGram: silverPerOz / TROY_OZ,
          fetchedAt: Date.now(),
        }
        return metalCache
      }
    }
  } catch { /* fall through to hardcoded */ }

  // Last resort: hardcoded prices — update this if prices drift significantly
  // Gold ~$4800/oz, Silver ~$80/oz as of April 2026
  metalCache = {
    goldPerGram: 154.0,
    silverPerGram: 2.57,
    fetchedAt: Date.now(),
  }
  return metalCache
}

// Warm cache on startup
getFxRates().catch(() => {})
getMetals().catch(() => {})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const currency = searchParams.get('currency') ?? 'USD'

  try {
    const [metals, rates] = await Promise.all([getMetals(), getFxRates()])
    const rate = currency === 'USD' ? 1 : (rates[currency] ?? 1)

    return NextResponse.json({
      nisab_silver: Math.round(612 * metals.silverPerGram * rate),
      nisab_gold: Math.round(85 * metals.goldPerGram * rate),
      currency,
    })
  } catch {
    // All APIs down — use hardcoded with live-ish FX approximations
    const fallbackRates: Record<string, number> = {
      INR: 84, PKR: 278, GBP: 0.79, EUR: 0.92, CAD: 1.36,
      AED: 3.67, SAR: 3.75, BDT: 110, MYR: 4.7, IDR: 16000,
      TRY: 32, EGP: 49, NGN: 1550, KZT: 450, AUD: 1.53,
    }
    const rate = currency === 'USD' ? 1 : (fallbackRates[currency] ?? 1)
    return NextResponse.json({
      nisab_silver: Math.round(1573 * rate),
      nisab_gold: Math.round(13090 * rate),
      currency,
    })
  }
}
