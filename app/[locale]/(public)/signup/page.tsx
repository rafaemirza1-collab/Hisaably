'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function SignupPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Save the name to their profile immediately
    if (displayName.trim()) {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName.trim() }),
      }).catch(() => {})
    }

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

      <div className="w-full max-w-sm relative">
        <div className="flex justify-center mb-10">
          <Image src="/logo-full.png" alt="Hisaably" width={180} height={54} />
        </div>

        <h1 className="text-2xl font-bold text-cream mb-2">{t('signup_title')}</h1>
        <p className="text-cream/50 text-sm mb-8">{t('signup_subtitle')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="What should we call you?"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={50}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
          />
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
          />
          <input
            type="password"
            placeholder={t('password_min')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
          />
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald text-white rounded-xl px-4 py-3 font-semibold hover:bg-emerald/90 disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? t('creating') : t('create_button')}
          </button>
        </form>

        <p className="mt-6 text-sm text-cream/40 text-center">
          {t('have_account')}{' '}
          <a href={`/${locale}/login`} className="text-gold hover:text-gold/80 transition-colors">
            {t('login_link')}
          </a>
        </p>
      </div>
    </main>
  )
}
