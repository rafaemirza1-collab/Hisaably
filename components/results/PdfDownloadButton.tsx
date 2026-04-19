'use client'

import { useEffect, useState } from 'react'
import type { ZakatResult } from '@/lib/zakat/types'

interface Props {
  result: ZakatResult
  generatedAt: string
  userName?: string
  sessionLabel?: string
  aiSummary?: string
}

export function PdfDownloadButton({ result, generatedAt, userName, sessionLabel, aiSummary }: Props) {
  const [ready, setReady] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [PDFDownloadLink, setPDFDownloadLink] = useState<React.ComponentType<any> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ZakatPDF, setZakatPDF] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    Promise.all([
      import('@react-pdf/renderer'),
      import('./ZakatPDF'),
    ]).then(([pdf, zakatModule]) => {
      setPDFDownloadLink(() => pdf.PDFDownloadLink)
      setZakatPDF(() => zakatModule.ZakatPDF)
      setReady(true)
    })
  }, [])

  if (!ready || !PDFDownloadLink || !ZakatPDF) {
    return (
      <button className="flex-1 py-3 border border-white/10 text-cream/40 rounded-xl text-sm transition-colors text-center" disabled>
        ↓ Download PDF
      </button>
    )
  }

  return (
    <PDFDownloadLink
      document={<ZakatPDF result={result} generatedAt={generatedAt} userName={userName} sessionLabel={sessionLabel} aiSummary={aiSummary} />}
      fileName={`hisaably-zakat-${new Date().getFullYear()}${sessionLabel ? `-${sessionLabel.replace(/\s+/g, '-').toLowerCase()}` : ''}.pdf`}
      className="flex-1 py-3 border border-white/10 text-cream/60 rounded-xl text-sm hover:bg-white/5 transition-colors text-center"
    >
      {({ loading: pdfLoading }: { loading: boolean }) => pdfLoading ? 'Preparing...' : '↓ Download PDF'}
    </PDFDownloadLink>
  )
}
