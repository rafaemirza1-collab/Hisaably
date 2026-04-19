'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    router.push('/flow')
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="fixed inset-0 islamic-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="w-full max-w-sm relative">
        <div className="flex justify-center mb-10">
          <Image src="/logo-full.png" alt="Mizan" width={180} height={54} />
        </div>

        <h1 className="text-2xl font-bold text-cream mb-2">Calculate your Zakat</h1>
        <p className="text-cream/50 text-sm mb-8">Create a free account to get started</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-emerald transition-colors"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-cream/40 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-gold hover:text-gold/80 transition-colors">
            Log in
          </a>
        </p>
      </div>
    </main>
  )
}
