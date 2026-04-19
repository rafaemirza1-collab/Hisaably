'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ZakatResult } from '@/lib/zakat/types'

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#059669' },
  logoBlock: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoSymbol: { fontSize: 18, color: '#059669' },
  logoText: { fontSize: 16, fontWeight: 'bold', color: '#059669', letterSpacing: 0.5 },
  titleBlock: { marginLeft: 0 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 2 },
  subtitle: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  metaBlock: { alignItems: 'flex-end' },
  metaText: { fontSize: 8, color: '#9ca3af' },

  sectionTitle: { fontSize: 9, fontWeight: 'bold', color: '#059669', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  nisabRow: { flexDirection: 'row', gap: 8, marginTop: 0 },
  nisabCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 4, padding: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  nisabLabel: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  nisabValue: { fontSize: 11, fontWeight: 'bold', color: '#111827' },
  nisabSub: { fontSize: 7, color: '#9ca3af', marginTop: 1 },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 9, color: '#374151' },
  value: { fontSize: 9, color: '#111827', fontWeight: 'bold' },

  zakatBox: { backgroundColor: '#f0fdf4', borderRadius: 6, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#d1fae5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zakatLeft: {},
  zakatLabel: { fontSize: 8, color: '#065f46', marginBottom: 2 },
  zakatWealth: { fontSize: 9, color: '#374151', marginBottom: 6 },
  zakatDueLabel: { fontSize: 8, color: '#065f46', marginBottom: 2 },
  zakatAmount: { fontSize: 24, fontWeight: 'bold', color: '#059669' },
  zakatSub: { fontSize: 8, color: '#6b7280', marginTop: 2 },

  summaryBox: { backgroundColor: '#fffbeb', borderRadius: 4, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#fde68a' },
  summaryLabel: { fontSize: 8, color: '#92400e', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  summaryText: { fontSize: 8.5, color: '#1f2937', lineHeight: 1.5 },

  divider: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 14, marginBottom: 6 },
  footer: { fontSize: 7, color: '#9ca3af', lineHeight: 1.4 },
})

interface Props {
  result: ZakatResult
  generatedAt: string
  userName?: string
  sessionLabel?: string
  aiSummary?: string
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function truncateSummary(text: string, maxChars = 420): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + '...'
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/^#+\s*/gm, '')
}

export function ZakatPDF({ result, generatedAt, userName, sessionLabel, aiSummary }: Props) {
  const meetsNisab = result.nisab_met_silver || result.nisab_met_gold
  const cleanSummary = aiSummary ? truncateSummary(stripMarkdown(aiSummary)) : undefined

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoBlock}>
              <Text style={styles.logoSymbol}>⚖</Text>
              <Text style={styles.logoText}>MIZAN</Text>
            </View>
            <Text style={styles.title}>Zakat Report{userName ? `, ${userName}` : ''}</Text>
            {sessionLabel && <Text style={styles.subtitle}>{`"${sessionLabel}"`}</Text>}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>{generatedAt}</Text>
            <Text style={styles.metaText}>hisaably.app</Text>
          </View>
        </View>

        {/* Nisab thresholds */}
        <Text style={styles.sectionTitle}>Nisab Thresholds Today</Text>
        <View style={styles.nisabRow}>
          <View style={styles.nisabCard}>
            <Text style={styles.nisabLabel}>Silver Nisab</Text>
            <Text style={styles.nisabValue}>${fmt(result.nisab_silver_usd)}</Text>
            <Text style={styles.nisabSub}>612g of silver</Text>
          </View>
          <View style={styles.nisabCard}>
            <Text style={styles.nisabLabel}>Gold Nisab</Text>
            <Text style={styles.nisabValue}>${fmt(result.nisab_gold_usd)}</Text>
            <Text style={styles.nisabSub}>85g of gold</Text>
          </View>
        </View>

        {/* Asset breakdown */}
        <Text style={styles.sectionTitle}>Asset Breakdown</Text>
        {result.categories.map(cat => (
          <View key={cat.category} style={styles.row}>
            <Text style={styles.label}>{cat.category}{cat.note ? ` (${cat.note})` : ''}</Text>
            <Text style={styles.value}>
              {cat.included ? `$${fmt(Math.abs(cat.zakatable_value))}` : '—'}
            </Text>
          </View>
        ))}

        {/* Zakat result box */}
        <View style={styles.zakatBox}>
          <View style={styles.zakatLeft}>
            <Text style={styles.zakatLabel}>Total Zakatable Wealth</Text>
            <Text style={styles.zakatWealth}>${fmt(result.total_zakatable_wealth)}</Text>
            <Text style={styles.zakatDueLabel}>{meetsNisab ? 'Zakat Due (Silver Nisab · 2.5%)' : 'Zakat Status'}</Text>
            {meetsNisab ? (
              <Text style={styles.zakatAmount}>${fmt(result.zakat_amount_silver)}</Text>
            ) : (
              <Text style={[styles.zakatAmount, { color: '#6b7280', fontSize: 14 }]}>Below nisab — no Zakat due</Text>
            )}
            {result.zakat_amount_gold !== result.zakat_amount_silver && meetsNisab && (
              <Text style={styles.zakatSub}>Gold nisab basis: ${fmt(result.zakat_amount_gold)}</Text>
            )}
          </View>
        </View>

        {/* AI summary */}
        {cleanSummary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Hisaably Summary</Text>
            <Text style={styles.summaryText}>{cleanSummary}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.divider} />
        <Text style={styles.footer}>
          This report is for personal reference only. Consult a qualified scholar for your specific situation. Hisaably does not issue fatwas. All amounts in USD unless otherwise stated.
        </Text>
      </Page>
    </Document>
  )
}
