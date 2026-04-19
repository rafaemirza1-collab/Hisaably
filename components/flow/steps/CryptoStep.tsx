'use client'

import { useState, useEffect } from 'react'
import type { ZakatAnswers, CryptoHolding } from '@/lib/zakat/types'

const SUPPORTED_COINS = [
  { id: 'bitcoin',        symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum',       symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether',         symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin',    symbol: 'BNB', name: 'BNB' },
  { id: 'solana',         symbol: 'SOL', name: 'Solana' },
  { id: 'ripple',         symbol: 'XRP', name: 'XRP' },
  { id: 'cardano',        symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin',       symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'chainlink',      symbol: 'LINK', name: 'Chainlink' },
  { id: 'litecoin',       symbol: 'LTC', name: 'Litecoin' },
  { id: 'custom',         symbol: '???', name: 'Other / Custom coin' },
]

interface Props {
  initial: Partial<ZakatAnswers>
  onChange: (answers: Partial<ZakatAnswers>) => void
  currency?: string
}

export function CryptoStep({ initial, onChange, currency = 'USD' }: Props) {
  const [holdings, setHoldings] = useState<CryptoHolding[]>(initial.crypto_holdings ?? [])
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [pricesLoading, setPricesLoading] = useState(false)
  const [fxRate, setFxRate] = useState(1) // USD -> user currency

  useEffect(() => {
    async function fetchPrices() {
      setPricesLoading(true)
      try {
        const ids = SUPPORTED_COINS.filter(c => c.id !== 'custom').map(c => c.id).join(',')
        const [cryptoRes, fxRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`),
          currency !== 'USD'
            ? fetch(`https://open.er-api.com/v6/latest/USD`)
            : Promise.resolve(null),
        ])
        if (!cryptoRes.ok) throw new Error('Failed')
        const data = await cryptoRes.json()
        const priceMap: Record<string, number> = {}
        for (const coin of SUPPORTED_COINS) {
          if (coin.id !== 'custom') priceMap[coin.id] = data[coin.id]?.usd ?? 0
        }
        setPrices(priceMap)

        if (fxRes && fxRes.ok) {
          const fxData = await fxRes.json()
          const rate = fxData.rates?.[currency] ?? 1
          setFxRate(rate)
        }
      } catch {
        // silently fail
      } finally {
        setPricesLoading(false)
      }
    }
    fetchPrices()
  }, [currency])

  function addHolding() {
    const usedIds = holdings.map(h => h.coin)
    const next = SUPPORTED_COINS.find(c => !usedIds.includes(c.id)) ?? SUPPORTED_COINS[0]
    const isCustom = next.id === 'custom'
    const updated = [...holdings, { coin: next.id, symbol: isCustom ? '' : next.symbol, amount: 0, manualPrice: isCustom ? 0 : undefined }]
    setHoldings(updated)
    onChange({ crypto_holdings: updated })
  }

  function updateCoin(index: number, coinId: string) {
    const coin = SUPPORTED_COINS.find(c => c.id === coinId) ?? SUPPORTED_COINS[0]
    const isCustom = coin.id === 'custom'
    const updated = holdings.map((h, i) =>
      i === index ? { ...h, coin: coin.id, symbol: isCustom ? '' : coin.symbol, manualPrice: isCustom ? (h.manualPrice ?? 0) : undefined } : h
    )
    setHoldings(updated)
    onChange({ crypto_holdings: updated })
  }

  function updateAmount(index: number, value: string) {
    const amount = parseFloat(value) || 0
    const updated = holdings.map((h, i) => i === index ? { ...h, amount } : h)
    setHoldings(updated)
    onChange({ crypto_holdings: updated })
  }

  function updateManualPrice(index: number, value: string) {
    const manualPrice = parseFloat(value) || 0
    const updated = holdings.map((h, i) => i === index ? { ...h, manualPrice } : h)
    setHoldings(updated)
    onChange({ crypto_holdings: updated })
  }

  function updateSymbol(index: number, value: string) {
    const updated = holdings.map((h, i) => i === index ? { ...h, symbol: value.toUpperCase() } : h)
    setHoldings(updated)
    onChange({ crypto_holdings: updated })
  }

  function removeHolding(index: number) {
    const updated = holdings.filter((_, i) => i !== index)
    setHoldings(updated)
    onChange({ crypto_holdings: updated })
  }

  function getDisplayValue(holding: CryptoHolding) {
    const usdPrice = holding.coin === 'custom' ? (holding.manualPrice ?? 0) : (prices[holding.coin] ?? 0)
    return holding.amount * usdPrice * fxRate
  }

  function getUsdPrice(holding: CryptoHolding) {
    return holding.coin === 'custom' ? (holding.manualPrice ?? 0) : (prices[holding.coin] ?? 0)
  }

  const totalDisplay = holdings.reduce((sum, h) => sum + getDisplayValue(h), 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Live price ticker */}
      {Object.keys(prices).length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {SUPPORTED_COINS.filter(c => c.id !== 'custom').slice(0, 6).map(coin => (
            <div key={coin.id} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
              <p className="text-xs font-semibold text-cream">{coin.symbol}</p>
              <p className="text-xs text-gold mt-0.5">
                {currency} {((prices[coin.id] ?? 0) * fxRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
          {pricesLoading && (
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <p className="text-xs text-cream/30">Loading prices...</p>
            </div>
          )}
        </div>
      )}

      {/* Holdings */}
      {holdings.length === 0 ? (
        <p className="text-sm text-cream/40 py-2">No crypto added yet. Click below to add your holdings.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {holdings.map((h, i) => {
            const isCustom = h.coin === 'custom'
            const displayValue = getDisplayValue(h)
            const usdPrice = getUsdPrice(h)
            const displayPrice = usdPrice * fxRate
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex gap-3 items-center mb-2">
                  <select
                    value={h.coin}
                    onChange={e => updateCoin(i, e.target.value)}
                    className="bg-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-emerald transition-colors"
                  >
                    {SUPPORTED_COINS.map(c => (
                      <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={h.amount || ''}
                    onChange={e => updateAmount(i, e.target.value)}
                    placeholder="Amount"
                    className="flex-1 bg-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
                  />
                  <button
                    onClick={() => removeHolding(i)}
                    className="text-cream/30 hover:text-red-400 text-sm transition-colors px-1"
                  >
                    ✕
                  </button>
                </div>

                {isCustom && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={h.symbol}
                      onChange={e => updateSymbol(i, e.target.value)}
                      placeholder="Ticker (e.g. MATIC)"
                      maxLength={10}
                      className="w-32 bg-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={h.manualPrice || ''}
                      onChange={e => updateManualPrice(i, e.target.value)}
                      placeholder="Price per coin (USD)"
                      className="flex-1 bg-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
                    />
                  </div>
                )}

                <div className="flex justify-between text-xs text-cream/40 mt-2">
                  {isCustom ? (
                    <span>Manual price · not verified</span>
                  ) : (
                    <span>1 {h.symbol} = {currency} {displayPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  )}
                  {h.amount > 0 && displayValue > 0 && (
                    <span className="text-gold font-medium">
                      ≈ {currency} {displayValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total */}
      {holdings.length > 0 && totalDisplay > 0 && (
        <div className="flex justify-between items-center border-t border-white/10 pt-3">
          <span className="text-sm text-cream/50">Total crypto value</span>
          <span className="text-sm font-semibold text-gold">
            {currency} {totalDisplay.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <button
        onClick={addHolding}
        className="mt-1 w-full py-3 border border-dashed border-white/20 text-cream/50 rounded-xl text-sm hover:border-emerald/50 hover:text-emerald transition-colors"
      >
        + Add crypto holding
      </button>

      <p className="text-xs text-cream/30">
        Supports {SUPPORTED_COINS.length - 1} coins with live prices · Add any other coin manually · Up to {SUPPORTED_COINS.length} holdings
      </p>
    </div>
  )
}
