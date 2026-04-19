import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'ar', 'ur', 'hi', 'bn', 'fr', 'es', 'tr', 'fa', 'kk', 'uz', 'ru', 'zh'] as const
export const defaultLocale = 'en' as const
export const RTL_LOCALES = ['ar', 'ur', 'fa'] as const

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : null
  if (!validLocale) notFound()
  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  }
})
