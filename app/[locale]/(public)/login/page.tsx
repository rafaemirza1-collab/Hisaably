'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push(`/${locale}/flow`)
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="absolute top-4 end-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="flex justify-center mb-10 animate-fade-in">
          <Image src="/logo-full.png" alt="Mizan" width={180} height={54} />
        </div>

        <h1 className="text-2xl font-bold text-cream mb-2 animate-fade-up delay-100">{t('login_title')}</h1>
        <p className="text-cream/50 text-sm mb-8 animate-fade-up delay-150">{t('login_subtitle')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-up delay-200">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-emerald focus:bg-white/8 transition-all duration-200"
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-emerald focus:bg-white/8 transition-all duration-200"
          />
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 animate-scale-in">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="press bg-emerald text-white rounded-xl px-4 py-3 font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-all duration-200 mt-1 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? t('logging_in') : t('login_button')}</span>
            <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        <p className="mt-6 text-sm text-cream/40 text-center animate-fade-in delay-300">
          {t('no_account')}{' '}
          <a href={`/${locale}/signup`} className="text-gold hover:text-gold/80 transition-colors">
            {t('get_started')}
          </a>
        </p>
      </div>
    </main>
  )
}
