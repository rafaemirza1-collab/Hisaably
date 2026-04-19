'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { AppShell } from '@/components/AppShell'
import { PdfDownloadButton } from '@/components/results/PdfDownloadButton'
import type { ZakatResult } from '@/lib/zakat/types'

interface Session {
  id: string
  result_json: (ZakatResult & { display_currency?: string }) | null
  answers: {
    display_name?: string
    session_label?: string
    cash_currency?: string
  } | null
  created_at: string
  is_official: boolean | null
}

function fmtAmount(n: number, currency: string) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export default function HomePage() {
  const locale = useLocale()
  const [name, setName] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, sessionRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/zakat/session'),
        ])
        const { display_name } = await profileRes.json()
        if (display_name) setName(display_name)

        const { session } = await sessionRes.json()
        if (session?.status === 'complete') setSession(session)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const rj = session?.result_json
  const zakatAmount = rj?.zakat_amount_silver ?? (rj as unknown as Record<string, unknown>)?.zakat_due as number | undefined
  const meetsNisab = rj?.nisab_met_silver || rj?.nisab_met_gold
  const currency = session?.answers?.cash_currency ?? 'USD'
  const label = session?.answers?.session_label
  const sessionDate = session?.created_at
    ? new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  return (
    <AppShell locale={locale} userName={name}>
      <style>{`
        .dash-action { background: linear-gradient(180deg, rgba(13,31,62,.7), rgba(11,26,54,.8)); border: 1px solid rgba(212,175,106,.14); border-radius: 14px; padding: 20px; transition: border-color .2s, transform .2s; text-decoration: none; display: block; }
        .dash-action:hover { border-color: rgba(212,175,106,.3); transform: translateY(-1px); }
        .dash-action.emerald:hover { border-color: rgba(16,185,129,.3); }
        .dash-btn-primary { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px; text-align: center; background: #10B981; color: #fff; border-radius: 12px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; text-decoration: none; transition: background .2s; }
        .dash-btn-primary:hover { background: #059669; }
        .dash-btn-ghost { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px; text-align: center; background: rgba(244,238,223,.04); color: rgba(244,238,223,.7); border: 1px solid rgba(212,175,106,.2); border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; text-decoration: none; transition: background .2s, border-color .2s; }
        .dash-btn-ghost:hover { background: rgba(244,238,223,.08); border-color: rgba(212,175,106,.35); }
        @keyframes dash-fade-up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .dash-fade-up { animation: dash-fade-up .45s cubic-bezier(.22,1,.36,1) both; }
        .dd1 { animation-delay: 0ms; } .dd2 { animation-delay: 80ms; } .dd3 { animation-delay: 160ms; } .dd4 { animation-delay: 240ms; }
      `}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '52px 24px 48px' }}>

        {/* Greeting pill */}
        <div className="dash-fade-up dd1" style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '.18em', color: '#D4AF6A',
            padding: '7px 14px', border: '1px solid rgba(212,175,106,.28)', borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(212,175,106,.08), rgba(212,175,106,.03))',
          }}>
            <span style={{ width: 4, height: 4, background: '#D4AF6A', borderRadius: '50%', boxShadow: '0 0 8px #D4AF6A' }} />
            Assalamu Alaikum{name ? `, ${name}` : ''}
          </span>
        </div>

        <h1 className="dash-fade-up dd2" style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif",
          fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 400, color: '#F4EEDF',
          marginBottom: 36, lineHeight: 1.15, letterSpacing: '-0.02em',
        }}>
          Your <em style={{ fontStyle: 'italic', color: '#E8CE97' }}>Zakat</em> dashboard
        </h1>

        {/* Zakat card */}
        {loading ? (
          <div className="dash-fade-up dd3" style={{ marginBottom: 16, borderRadius: 20, padding: '28px', background: 'linear-gradient(180deg, rgba(13,31,62,.8), rgba(11,26,54,.9))', border: '1px solid rgba(212,175,106,.14)', minHeight: 110, display: 'flex', alignItems: 'center' }}>
            <p style={{ color: 'rgba(244,238,223,.35)', fontSize: 14 }}>Loading…</p>
          </div>
        ) : session && zakatAmount != null ? (
          <div className="dash-fade-up dd3" style={{
            marginBottom: 16, borderRadius: 20, padding: '28px 28px 24px',
            background: meetsNisab
              ? 'linear-gradient(135deg, rgba(16,185,129,.11), rgba(13,31,62,.7) 60%)'
              : 'linear-gradient(135deg, rgba(212,175,106,.08), rgba(13,31,62,.7) 60%)',
            border: `1px solid ${meetsNisab ? 'rgba(16,185,129,.28)' : 'rgba(212,175,106,.24)'}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -10, fontSize: 120, color: meetsNisab ? 'rgba(16,185,129,.05)' : 'rgba(212,175,106,.05)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>⚖</div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: meetsNisab ? '#10B981' : '#D4AF6A', marginBottom: 10 }}>
              {meetsNisab ? 'Zakat is due this year' : 'Your Zakat'}
            </p>
            {label && <p style={{ color: 'rgba(244,238,223,.5)', fontSize: 13, marginBottom: 8 }}>&ldquo;{label}&rdquo;</p>}
            {meetsNisab ? (
              <p style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: '#F4EEDF', lineHeight: 1.05, marginBottom: 6, letterSpacing: '-0.02em' }}>
                {fmtAmount(zakatAmount, currency)}
              </p>
            ) : (
              <p style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 22, color: 'rgba(244,238,223,.6)', marginBottom: 6 }}>Below nisab — no Zakat due</p>
            )}
            {sessionDate && <p style={{ color: 'rgba(244,238,223,.3)', fontSize: 12, marginBottom: 22 }}>{sessionDate}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`/${locale}/results`} className="dash-btn-primary" style={{ flex: 1 }}>View result →</a>
              <a href={`/${locale}/results`} className="dash-btn-ghost" style={{ flex: 1 }}>Ask Hisaably →</a>
            </div>
          </div>
        ) : (
          <div className="dash-fade-up dd3" style={{ marginBottom: 16, borderRadius: 20, padding: '32px 28px', background: 'linear-gradient(180deg, rgba(13,31,62,.7), rgba(11,26,54,.8))', border: '1px dashed rgba(212,175,106,.2)', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Libre Caslon Text',serif", fontSize: 22, color: 'rgba(244,238,223,.4)', marginBottom: 8 }}>No calculation yet</p>
            <p style={{ fontSize: 13, color: 'rgba(244,238,223,.3)', marginBottom: 24 }}>Takes about 5 minutes. Know what you owe this year.</p>
            <a href={`/${locale}/flow?new=1`} className="dash-btn-primary" style={{ maxWidth: 220, margin: '0 auto' }}>Start now →</a>
          </div>
        )}

        {/* Quick actions */}
        <div className="dash-fade-up dd4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <a href={`/${locale}/flow?new=1`} className="dash-action emerald" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, color: '#10B981', marginBottom: 8 }}>+</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F4EEDF', marginBottom: 2 }}>New calc</p>
            <p style={{ fontSize: 11, color: 'rgba(244,238,223,.4)' }}>Start fresh</p>
          </a>
          <a href={`/${locale}/results?tab=history`} className="dash-action" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, color: '#D4AF6A', marginBottom: 8 }}>☷</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F4EEDF', marginBottom: 2 }}>History</p>
            <p style={{ fontSize: 11, color: 'rgba(244,238,223,.4)' }}>All calcs</p>
          </a>
          <div className="dash-action" style={{ cursor: 'default', textAlign: 'center' }}>
            <p style={{ fontSize: 22, color: 'rgba(244,238,223,.45)', marginBottom: 8 }}>↓</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F4EEDF', marginBottom: 6 }}>PDF</p>
            {session && rj ? (
              <PdfDownloadButton
                result={rj}
                generatedAt={sessionDate}
                userName={name || undefined}
                sessionLabel={session.answers?.session_label}
              />
            ) : (
              <p style={{ fontSize: 11, color: 'rgba(244,238,223,.3)' }}>No result yet</p>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(244,238,223,.18)', marginTop: 40, letterSpacing: '.1em' }}>
          Built by Muslims, for Muslims
        </p>
      </div>
    </AppShell>
  )
}
