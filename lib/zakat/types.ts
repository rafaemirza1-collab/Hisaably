export type NisabPreference = 'gold' | 'silver' | 'both'

export interface ZakatAnswers {
  // Step 1 — Cash
  cash_amount?: number
  cash_currency?: string

  // Step 2 — Gold & Silver
  gold_grams?: number
  gold_is_jewelry?: boolean
  silver_grams?: number
  silver_is_jewelry?: boolean

  // Step 3 — Crypto
  crypto_holdings?: CryptoHolding[]

  // Step 4 — Investments
  investments_value?: number
  investments_is_retirement?: boolean

  // Step 5 — Receivables
  receivables_amount?: number
  receivables_likely_repaid?: boolean

  // Step 6 — Debts
  debts_amount?: number

  // Nisab preference (set on Screen 0)
  nisab_preference?: NisabPreference
}

export interface CryptoHolding {
  coin: string        // e.g. 'bitcoin', 'ethereum' (CoinGecko ID), or 'custom'
  symbol: string      // e.g. 'BTC', 'ETH', or user-entered symbol
  amount: number
  manualPrice?: number  // only set for custom coins
}

export interface LivePrices {
  gold_usd_per_gram: number
  silver_usd_per_gram: number
  crypto_usd: Record<string, number>  // coinId -> USD price
}

export interface CategoryResult {
  category: string
  zakatable_value: number
  included: boolean
  note: string | null
}

export interface ZakatResult {
  nisab_gold_usd: number
  nisab_silver_usd: number
  total_zakatable_wealth: number
  nisab_met_gold: boolean
  nisab_met_silver: boolean
  zakat_amount_gold: number
  zakat_amount_silver: number
  categories: CategoryResult[]
  prices: LivePrices
}
