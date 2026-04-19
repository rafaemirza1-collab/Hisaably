import type { ZakatAnswers, ZakatResult, CategoryResult, LivePrices } from './types'

const GOLD_NISAB_GRAMS = 85
const SILVER_NISAB_GRAMS = 612
const ZAKAT_RATE = 0.025

export function calculateZakat(
  answers: ZakatAnswers,
  prices: LivePrices
): ZakatResult {
  const categories: CategoryResult[] = []

  // --- Cash ---
  const cash = answers.cash_amount ?? 0
  categories.push({
    category: 'Cash & Bank',
    zakatable_value: cash,
    included: cash > 0,
    note: null,
  })

  // --- Gold & Silver ---
  const goldGrams = answers.gold_is_jewelry ? 0 : (answers.gold_grams ?? 0)
  const silverGrams = answers.silver_is_jewelry ? 0 : (answers.silver_grams ?? 0)
  const goldValue = goldGrams * prices.gold_usd_per_gram
  const silverValue = silverGrams * prices.silver_usd_per_gram
  const metalValue = goldValue + silverValue
  const metalNote = answers.gold_is_jewelry
    ? 'Jewelry excluded per scholarly opinion'
    : null
  categories.push({
    category: 'Gold & Silver',
    zakatable_value: metalValue,
    included: metalValue > 0,
    note: metalNote,
  })

  // --- Crypto ---
  const cryptoHoldings = answers.crypto_holdings ?? []
  const cryptoValue = cryptoHoldings.reduce((sum, h) => {
    const price = h.coin === 'custom' ? (h.manualPrice ?? 0) : (prices.crypto_usd[h.coin] ?? 0)
    return sum + h.amount * price
  }, 0)
  categories.push({
    category: 'Crypto',
    zakatable_value: cryptoValue,
    included: cryptoValue > 0,
    note: null,
  })

  // --- Investments ---
  const investmentsValue = answers.investments_value ?? 0
  const investmentsNote = answers.investments_is_retirement
    ? 'Retirement accounts: consult a scholar for your madhab ruling'
    : null
  categories.push({
    category: 'Investments',
    zakatable_value: investmentsValue,
    included: investmentsValue > 0,
    note: investmentsNote,
  })

  // --- Receivables ---
  const receivables =
    answers.receivables_likely_repaid ? (answers.receivables_amount ?? 0) : 0
  categories.push({
    category: 'Money Owed To You',
    zakatable_value: receivables,
    included: receivables > 0,
    note: !answers.receivables_likely_repaid && (answers.receivables_amount ?? 0) > 0
      ? 'Excluded: marked as unlikely to be repaid'
      : null,
  })

  // --- Debts (deductible) ---
  const debts = answers.debts_amount ?? 0
  categories.push({
    category: 'Debts Owed',
    zakatable_value: -debts,
    included: debts > 0,
    note: debts > 0 ? 'Deducted from total zakatable wealth' : null,
  })

  // --- Totals ---
  const totalZakatable = categories.reduce((sum, c) => sum + c.zakatable_value, 0)
  const clampedTotal = Math.max(0, totalZakatable)

  const nisabGold = GOLD_NISAB_GRAMS * prices.gold_usd_per_gram
  const nisabSilver = SILVER_NISAB_GRAMS * prices.silver_usd_per_gram

  const nisabMetGold = clampedTotal >= nisabGold
  const nisabMetSilver = clampedTotal >= nisabSilver

  return {
    nisab_gold_usd: nisabGold,
    nisab_silver_usd: nisabSilver,
    total_zakatable_wealth: clampedTotal,
    nisab_met_gold: nisabMetGold,
    nisab_met_silver: nisabMetSilver,
    zakat_amount_gold: nisabMetGold ? clampedTotal * ZAKAT_RATE : 0,
    zakat_amount_silver: nisabMetSilver ? clampedTotal * ZAKAT_RATE : 0,
    categories,
    prices,
  }
}
