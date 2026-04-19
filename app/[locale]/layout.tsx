import type { Metadata } from 'next'
import { Inter, Noto_Sans_Arabic } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { locales, RTL_LOCALES, type Locale } from '@/i18n'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '600', '700'],
})

// Shared Google Fonts head tags rendered via metadata link — loaded in <head> by Next.js
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"

export const metadata: Metadata = {
  title: 'Hisaably — Zakat Assistant',
  description: 'A guided AI Zakat assistant that explains every step clearly.',
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  if (!locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()
  const isRTL = (RTL_LOCALES as readonly string[]).includes(locale)

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${notoArabic.variable} ${isRTL ? 'font-arabic' : 'font-inter'} bg-navy`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
