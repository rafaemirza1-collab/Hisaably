'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

// ---------- Icons ----------
function IconWallet(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 7a2 2 0 0 1 2-2h12"/><circle cx="16" cy="13" r="1.3"/></svg>
}
function IconScale(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M5 6l-3 7a4 4 0 0 0 6 0L5 6z"/><path d="M19 6l3 7a4 4 0 0 1-6 0l3-7z"/><path d="M5 6l14-2"/><path d="M7 21h10"/></svg>
}

function IconShield(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
}
function IconGlobe(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>
}
function IconBook(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 0 2 2h12"/></svg>
}
function IconCoin(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>
}
function IconChat(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 10h8M8 13h5"/></svg>
}
function IconCalendar(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
}
function IconSparkles(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8L12 3z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7L19 16z"/></svg>
}

function IconCheck(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>
}
function IconPlus(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
}
function IconArrow(p: React.SVGProps<SVGSVGElement>) {
  return <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
}

// ---------- Brand mark ----------
function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.29,
      background: 'linear-gradient(145deg,#1A3560,#0B1A36)',
      border: '1px solid rgba(212,175,106,.28)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06), 0 1px 0 rgba(0,0,0,.4)',
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 20 20" fill="none">
        <path d="M10 2 L16 10 L10 18 L4 10 Z" stroke="#D4AF6A" strokeWidth="1.2"/>
        <path d="M2 10 L10 6 L18 10 L10 14 Z" stroke="#E8CE97" strokeWidth="1.2" opacity=".7"/>
        <circle cx="10" cy="10" r="1" fill="#D4AF6A"/>
      </svg>
    </div>
  )
}

// ---------- Stage panels ----------
function StageEnter() {
  const rows = [
    { name: 'Cash & bank accounts', sub: 'USD equivalent across all accounts', val: '$48,200.00' },
    { name: 'Gold & jewellery', sub: '38g · valued at live spot price', val: '$3,412.00' },
    { name: 'Silver', sub: '120g · at $1.12 / g', val: '$134.40' },
    { name: 'Crypto holdings', sub: 'BTC, ETH, stablecoins', val: '$4,820.00' },
    { name: 'Investments & stocks', sub: 'Zakat applied on tradable value', val: '$12,430.00' },
    { name: 'Business inventory', sub: 'Resale value of stock', val: '$9,800.00' },
    { name: 'Debts you owe', sub: 'Short-term liabilities', val: '−$12,500.00', neg: true },
  ]
  return (
    <div style={{ padding: '28px 30px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(244,238,223,.42)', marginBottom: 16 }}>
        <span>Enter your assets · Step 1 of 3</span>
        <span style={{ color: '#D4AF6A', letterSpacing: '.1em' }}>7 categories</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center',
            padding: '10px 14px', background: 'rgba(212,175,106,.03)',
            border: '1px solid rgba(212,175,106,.14)', borderRadius: 10,
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#F4EEDF', fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(244,238,223,.42)', marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: r.neg ? '#EF9F9F' : '#F4EEDF', fontVariantNumeric: 'tabular-nums' }}>{r.val}</div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 14, padding: '14px 16px', borderRadius: 10,
        background: 'linear-gradient(90deg, rgba(16,185,129,.08), rgba(16,185,129,.02))',
        border: '1px solid rgba(16,185,129,.2)',
      }}>
        <span style={{ fontSize: 13, color: 'rgba(244,238,223,.62)' }}>Net zakatable wealth</span>
        <span style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontSize: 22, color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>$66,296.40</span>
      </div>
    </div>
  )
}

function StageResult() {
  return (
    <div style={{ padding: '28px 30px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(244,238,223,.42)', marginBottom: 16 }}>
        <span>Your Zakat · Step 2 of 3</span>
        <span style={{ color: '#D4AF6A' }}>Calculated just now</span>
      </div>
      <div style={{
        textAlign: 'center', padding: '24px 20px 20px',
        background: 'radial-gradient(ellipse at top, rgba(212,175,106,.14), transparent 70%)',
        border: '1px solid rgba(212,175,106,.28)', borderRadius: 14, marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.2em', color: '#D4AF6A', marginBottom: 8, fontWeight: 600 }}>Zakat due · 1446 AH</div>
        <div style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontSize: 56, lineHeight: 1, color: '#E8CE97', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 6 }}>$1,657.41</div>
        <div style={{ fontSize: 13, color: 'rgba(244,238,223,.62)' }}>2.5% of <strong style={{ color: '#F4EEDF' }}>$66,296.40</strong> net zakatable wealth</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#10B981' }}>
          <IconCheck /> Above nisab — Zakat is obligatory
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { k: 'Silver nisab (used)', v: '$348', d: 'Live · lower threshold' },
          { k: 'Gold nisab (ref)', v: '$8,912', d: 'Live · updated 2 min ago' },
        ].map((tile, i) => (
          <div key={i} style={{ padding: '12px 14px', border: '1px solid rgba(212,175,106,.14)', borderRadius: 10, background: 'rgba(13,31,62,.5)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(244,238,223,.42)', marginBottom: 4 }}>{tile.k}</div>
            <div style={{ fontFamily: "'Libre Caslon Text',Georgia,serif", fontSize: 19, color: '#F4EEDF' }}>{tile.v}</div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>{tile.d}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(212,175,106,.04)', border: '1px solid rgba(212,175,106,.14)', borderRadius: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'rgba(244,238,223,.62)' }}>
        <span>Zakatable wealth <span style={{ color: '#D4AF6A' }}>×</span> 2.5%</span>
        <span style={{ color: '#D4AF6A' }}>= $1,657.41</span>
      </div>
    </div>
  )
}

function StageWhy() {
  const inc = [
    { t: 'Cash & bank', d: 'Savings, current accounts, and wallet cash in USD equivalent.', amt: '$48,200.00' },
    { t: 'Gold & silver', d: 'Physical metals valued at live spot prices, net of purity.', amt: '$3,546.40' },
    { t: 'Crypto & stocks', d: 'Held at market value on the hawl date.', amt: '$17,250.00' },
  ]
  const exc = [
    { t: 'Primary residence', d: 'Your home is exempt from Zakat.' },
    { t: 'Daily-use jewellery', d: "Shafi'i & Maliki: exempt. Hanafi: optional — included above." },
  ]
  return (
    <div style={{ padding: '28px 30px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(244,238,223,.42)', marginBottom: 14 }}>
        <span>Understand why · Step 3 of 3</span>
        <span style={{ color: '#D4AF6A' }}>Silver nisab · Hanafi</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {inc.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', border: '1px solid rgba(16,185,129,.24)', borderRadius: 10, background: 'rgba(16,185,129,.04)' }}>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,.14)', color: '#10B981', border: '1px solid rgba(16,185,129,.3)' }}>IN</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13, color: '#F4EEDF', fontWeight: 500, marginBottom: 2 }}>
                <span>{r.t}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(244,238,223,.62)' }}>{r.amt}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(244,238,223,.42)', lineHeight: 1.45 }}>{r.d}</div>
            </div>
          </div>
        ))}
        {exc.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', border: '1px solid rgba(212,175,106,.14)', borderRadius: 10, background: 'rgba(13,31,62,.5)', opacity: .72 }}>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, background: 'rgba(244,238,223,.04)', color: 'rgba(244,238,223,.42)', border: '1px solid rgba(212,175,106,.14)' }}>OUT</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#F4EEDF', fontWeight: 500, marginBottom: 2 }}>{r.t}</div>
              <div style={{ fontSize: 12, color: 'rgba(244,238,223,.42)', lineHeight: 1.45 }}>{r.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(212,175,106,.05)', border: '1px solid rgba(212,175,106,.14)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <IconBook style={{ color: '#D4AF6A', marginTop: 1, flexShrink: 0, width: 16, height: 16 }} />
        <div style={{ fontSize: 12, color: 'rgba(244,238,223,.62)', lineHeight: 1.55 }}><strong style={{ color: '#F4EEDF' }}>Deductions applied:</strong> $12,500 in short-term debts subtracted before the 2.5% rule, per the majority fiqh position.</div>
      </div>
    </div>
  )
}

const STEPS = [
  { t: 'Tell Mizan about your wealth', d: 'Your assistant guides you through each asset category — no guessing what to include.' },
  { t: 'Get your precise Zakat amount', d: 'Live nisab, debt deductions, madhab-aware rulings — shown transparently, line by line.' },
  { t: 'Ask anything, get real answers', d: 'Follow-up questions answered by AI with scholarly grounding — not generic help text.' },
]

export default function LandingPage() {
  const locale = useLocale()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [nisabSilver, setNisabSilver] = useState<number | null>(null)
  const [nisabGold, setNisabGold] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const DURATION = 5600

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)
        if (user) {
          fetch('/api/user/profile').then(r => r.json()).then(({ display_name }) => {
            if (display_name) setUserName(display_name)
          }).catch(() => {})
        }
      } catch { /* ignore */ }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    async function fetchNisab() {
      try {
        const res = await fetch('/api/nisab?currency=USD')
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        setNisabSilver(data.nisab_silver)
        setNisabGold(data.nisab_gold)
      } catch {
        setNisabSilver(350)
        setNisabGold(8900)
      }
    }
    fetchNisab()
  }, [])

  useEffect(() => {
    if (paused) return
    const start = Date.now()
    const tick = setInterval(() => {
      const p = (Date.now() - start) / DURATION
      if (p >= 1) {
        setProgress(0)
        setStep(s => (s + 1) % STEPS.length)
      } else {
        setProgress(p)
      }
    }, 60)
    return () => clearInterval(tick)
  }, [step, paused])

  const fmtN = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

  const faqs = [
    { q: "Is Mizan's calculation scholar-reviewed?", a: "Our methodology is built on classical fiqh across the four Sunni madhahib. Where schools disagree, Mizan shows you the positions and lets you choose." },
    { q: 'Do you use gold or silver nisab?', a: "Both — and you choose. Many scholars prefer silver nisab as it's the lower threshold and benefits more recipients. Mizan defaults to silver but shows you both figures." },
    { q: 'Is my financial data safe?', a: "Yes. When you create an account, data is encrypted and never sold, never shared, never used for ads." },
    { q: 'Does Mizan cost anything?', a: "Calculating is free. A small paid tier unlocks history, PDF exports, and unlimited Ask-Mizan questions — but the core calculator always stays free." },
    { q: "What if I don't know all my numbers exactly?", a: "That's fine. Mizan lets you use rough estimates and flags where precision matters most. You can revise any category and recalculate instantly." },
  ]

  const calculateHref = `/${locale}/flow`
  const signupHref = `/${locale}/signup`
  const loginHref = `/${locale}/login`
  const dashboardHref = `/${locale}/home`

  return (
    <>
      {/* Global styles */}
      <style suppressHydrationWarning>{`
        :root {
          --navy-900:#070F22; --navy-800:#0A1830; --navy-700:#0E2142;
          --line:rgba(212,175,106,.14); --line-strong:rgba(212,175,106,.28);
          --cream:#F4EEDF; --cream-60:rgba(244,238,223,.62); --cream-40:rgba(244,238,223,.42); --cream-25:rgba(244,238,223,.25);
          --gold:#D4AF6A; --gold-soft:#E8CE97; --gold-deep:#B38D43;
          --emerald:#10B981; --emerald-deep:#059669;
          --panel:#0B1A36; --panel-2:#0D1F3E;
        }
        .lp-body { background: var(--navy-900); color: var(--cream); font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .lp-serif { font-family: 'Libre Caslon Text', Georgia, serif; }
        .lp-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .lp-wrap { max-width: 1240px; margin: 0 auto; padding: 0 32px; }
        @media (max-width: 720px) { .lp-wrap { padding: 0 20px; } }
        .lp-step-pill {
          position: relative; display: flex; align-items: center; gap: 16px;
          padding: 16px 18px; border: 1px solid var(--line); border-radius: 14px;
          background: rgba(13,31,62,.35); cursor: pointer; width: 100%; text-align: left;
          color: inherit; font-family: inherit; transition: border-color .25s, background .25s;
          overflow: hidden;
        }
        .lp-step-pill:hover { border-color: var(--line-strong); background: rgba(19,40,79,.45); }
        .lp-step-pill.active { border-color: var(--line-strong); background: linear-gradient(90deg, rgba(212,175,106,.1), rgba(13,31,62,.4)); }
        .lp-step-pill .n {
          flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
          font-family: 'Libre Caslon Text', serif; font-size: 14px; color: rgba(244,238,223,.62); font-weight: 700;
          background: rgba(244,238,223,.04); border: 1px solid var(--line); transition: all .25s;
        }
        .lp-step-pill.active .n { background: rgba(212,175,106,.14); border-color: var(--line-strong); color: var(--gold); }
        .lp-step-pill .bar {
          position: absolute; left: 0; bottom: 0; height: 2px;
          background: linear-gradient(90deg, var(--gold) 0%, var(--gold-soft) 100%);
          transition: width .1s linear;
        }
        .lp-feat { background: linear-gradient(180deg, #0D1F3E, #0B1A36); border: 1px solid var(--line); border-radius: 16px; padding: 28px; transition: border-color .25s; }
        .lp-feat:hover { border-color: var(--line-strong); }
        .lp-feat.hero-feat { background: linear-gradient(135deg, rgba(212,175,106,.09), rgba(13,31,62,.6) 60%); border-color: var(--line-strong); }
        .lp-faq-body { max-height: 0; overflow: hidden; transition: max-height .35s ease; }
        .lp-faq-body.open { max-height: 300px; }
        @keyframes lp-floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes lp-floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .lp-pulse { animation: lp-pulse 2s ease-in-out infinite; }
        .lp-float-a { animation: lp-floatA 6s ease-in-out infinite; }
        .lp-float-b { animation: lp-floatB 7s ease-in-out infinite; }
        @media (max-width: 1080px) { .lp-float-cards { display: none !important; } }
        .lp-stage-panel { position: absolute; inset: 0; opacity: 0; transform: translateY(10px); pointer-events: none; transition: opacity .38s cubic-bezier(.22,1,.36,1), transform .38s cubic-bezier(.22,1,.36,1); }
        .lp-stage-panel.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .lp-step-card { background: linear-gradient(180deg, #0D1F3E, #0B1A36); border: 1px solid var(--line); border-radius: 18px; padding: 32px 30px 36px; position: relative; overflow: hidden; transition: border-color .25s, transform .25s; }
        .lp-step-card:hover { border-color: var(--line-strong); transform: translateY(-2px); }
      `}</style>

      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <main className="lp-body" style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Page background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(1100px 640px at 82% -10%, rgba(212,175,106,.08), transparent 60%), radial-gradient(900px 560px at 10% 20%, rgba(16,185,129,.05), transparent 60%), linear-gradient(180deg,#060D1F 0%,#0A1830 28%,#0A1830 72%,#060D1F 100%)',
        }} />

        {/* ─── NAV ─── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'saturate(1.2) blur(14px)', WebkitBackdropFilter: 'saturate(1.2) blur(14px)',
          background: 'linear-gradient(180deg, rgba(7,15,34,.85), rgba(7,15,34,.55))',
          borderBottom: '1px solid rgba(212,175,106,.08)',
        }}>
          <div className="lp-wrap">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
              {/* Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <a href={isLoggedIn ? dashboardHref : `/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--cream)' }}>
                  <BrandMark size={28} />
                  <span className="lp-serif" style={{ fontSize: 20 }}>Mizan</span>
                </a>
                <nav style={{ display: 'flex', gap: 28 }}>
                  {[['#how', 'How it works'], ['#why', 'Why Mizan'], ['#faq', 'FAQ'], [`/${locale}/about`, 'About']].map(([href, label]) => (
                    <a key={href} href={href} style={{ color: 'var(--cream-60)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--cream-60)')}
                    >{label}</a>
                  ))}
                </nav>
              </div>
              {/* Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {nisabSilver && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cream-60)', padding: '6px 12px', borderRadius: 999, border: '1px solid var(--line)', background: 'rgba(13,31,62,.5)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 0 4px rgba(16,185,129,.12)', display: 'inline-block' }} />
                    Live nisab connected
                  </span>
                )}
                {isLoggedIn ? (
                  <>
                    {userName && <span style={{ fontSize: 13, color: 'var(--cream-60)' }}>Hi, {userName}</span>}
                    <a href={dashboardHref} style={{
                      background: 'linear-gradient(180deg,#10B981 0%,#0E9E70 100%)', color: '#04251B',
                      fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 10,
                      textDecoration: 'none', border: '1px solid #0E9E70',
                    }}>Dashboard →</a>
                  </>
                ) : (
                  <a href={loginHref} style={{ color: 'var(--cream)', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 10, textDecoration: 'none', border: '1px solid var(--line)', background: 'rgba(13,31,62,.5)', transition: 'all .2s' }}>Log in</a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── HERO ─── */}
        <section style={{ position: 'relative', padding: '72px 0 96px', zIndex: 1 }}>
          {/* Islamic pattern mask */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .08,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23D4AF6A' stroke-width='.6'><path d='M40 4 L52 18 L70 18 L58 32 L64 50 L40 40 L16 50 L22 32 L10 18 L28 18 Z'/><circle cx='40' cy='40' r='2'/></g></svg>")`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at 80% 30%, #000 0%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 80% 30%, #000 0%, transparent 60%)',
          }} />
          <div className="lp-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 80, alignItems: 'center' }}>
              {/* Left */}
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--gold)',
                  padding: '8px 14px', border: '1px solid var(--line-strong)', borderRadius: 999,
                  background: 'linear-gradient(180deg, rgba(212,175,106,.08), rgba(212,175,106,.03))',
                }}>
                  <span style={{ width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--gold)' }} />
                  AI Zakat assistant
                </span>

                <h1 className="lp-serif" style={{
                  fontSize: 'clamp(44px, 5.6vw, 72px)', lineHeight: 1.04, letterSpacing: '-0.02em',
                  margin: '22px 0 24px', color: 'var(--cream)', fontWeight: 400,
                }}>
                  Know exactly <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>what you owe</em>, and why.
                </h1>

                <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--cream-60)', maxWidth: 560, marginBottom: 36 }}>
                  Mizan is an AI Zakat assistant — not just a calculator. It walks you through every category, explains every ruling, and answers your follow-up questions in plain language.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
                  {isLoggedIn ? (
                    <>
                      <a href={dashboardHref} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'linear-gradient(180deg,#10B981 0%,#0E9E70 100%)',
                        color: '#04251B', fontWeight: 700, fontSize: 15, padding: '16px 24px',
                        borderRadius: 12, textDecoration: 'none', border: '1px solid #0E9E70',
                        boxShadow: '0 1px 0 rgba(255,255,255,.18) inset, 0 10px 24px -10px rgba(16,185,129,.5)',
                      }}>Go to dashboard <IconArrow /></a>
                      <a href={`/${locale}/flow?new=1`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'rgba(244,238,223,.04)', color: 'var(--cream)',
                        padding: '16px 22px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 15,
                        border: '1px solid var(--line)',
                      }}>New calculation</a>
                    </>
                  ) : (
                    <>
                      <a href={calculateHref} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'linear-gradient(180deg,#10B981 0%,#0E9E70 100%)',
                        color: '#04251B', fontWeight: 700, fontSize: 15, padding: '16px 24px',
                        borderRadius: 12, textDecoration: 'none', border: '1px solid #0E9E70',
                        boxShadow: '0 1px 0 rgba(255,255,255,.18) inset, 0 10px 24px -10px rgba(16,185,129,.5)',
                      }}>Calculate my Zakat <IconArrow /></a>
                      <a href={signupHref} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'rgba(244,238,223,.04)', color: 'var(--cream)',
                        padding: '16px 22px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 15,
                        border: '1px solid var(--line)',
                      }}>Create account</a>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'rgba(244,238,223,.42)', fontSize: 13, flexWrap: 'wrap', marginBottom: 32 }}>
                  <span><span style={{ color: 'var(--emerald)', fontWeight: 700, marginRight: 6 }}>✓</span>Built by Muslims, for Muslims</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cream-25)', display: 'inline-block' }} />
                  <span><span style={{ color: 'var(--emerald)', fontWeight: 700, marginRight: 6 }}>✓</span>Live gold &amp; silver nisab</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cream-25)', display: 'inline-block' }} />
                  <span><span style={{ color: 'var(--emerald)', fontWeight: 700, marginRight: 6 }}>✓</span>Used in 20+ countries</span>
                </div>

                {/* Step pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}>
                  {STEPS.map((s, i) => (
                    <button key={i}
                      className={`lp-step-pill${i === step ? ' active' : ''}`}
                      onClick={() => { setStep(i); setProgress(0) }}>
                      <span className="n">0{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="lp-serif" style={{ fontSize: 17, color: 'var(--cream)', margin: '0 0 2px', letterSpacing: '-0.005em', fontWeight: 400 }}>{s.t}</p>
                        <p style={{ fontSize: 13, color: i === step ? 'rgba(244,238,223,.62)' : 'rgba(244,238,223,.42)', lineHeight: 1.45, margin: 0 }}>{s.d}</p>
                      </div>
                      <span className="bar" style={{ width: i === step ? `${progress * 100}%` : (i < step ? '100%' : '0%') }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right — app frame */}
              <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

                {/* Quranic quote — above the frame */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <p style={{
                    fontFamily: "'Amiri', serif", fontSize: 28, color: 'var(--gold-soft)',
                    lineHeight: 1.7, margin: '0 0 8px', direction: 'rtl',
                    textShadow: '0 0 40px rgba(212,175,106,.25)',
                    letterSpacing: '.02em',
                  }}>
                    خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُم
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(244,238,223,.35)', fontStyle: 'italic', margin: 0, letterSpacing: '.02em' }}>
                    &ldquo;Take from their wealth a charity, by which you purify them&rdquo; — 9:103
                  </p>
                </div>

                <div style={{ position: 'relative' }}>
                  {/* Glow */}
                  <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(closest-side, rgba(212,175,106,.14), transparent 70%)', filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none' }} />

                  {/* Floating cards */}
                  <div className="lp-float-cards" style={{ position: 'absolute', top: -20, right: -28, zIndex: 2 }}>
                    <div className="lp-float-a" style={{ padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(180deg,#12284C,#0B1A36)', border: '1px solid var(--line-strong)', boxShadow: '0 12px 28px -12px rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--cream)' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: 'var(--gold)', background: 'rgba(212,175,106,.1)' }}><IconCoin style={{ width: 14, height: 14 }} /></span>
                      <div>
                        <div style={{ fontSize: 10, color: 'rgba(244,238,223,.42)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 1 }}>Silver nisab · live</div>
                        <div className="lp-mono" style={{ fontSize: 13, color: 'var(--gold-soft)' }}>{nisabSilver ? fmtN(nisabSilver) : '$348'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="lp-float-cards" style={{ position: 'absolute', bottom: 30, left: -32, zIndex: 2 }}>
                    <div className="lp-float-b" style={{ padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(180deg,#12284C,#0B1A36)', border: '1px solid var(--line-strong)', boxShadow: '0 12px 28px -12px rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--cream)' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: 'var(--gold)', background: 'rgba(212,175,106,.1)' }}><IconShield style={{ width: 14, height: 14 }} /></span>
                      <div>
                        <div style={{ fontSize: 10, color: 'rgba(244,238,223,.42)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 1 }}>Transparent breakdown</div>
                        <div style={{ fontSize: 13, color: 'var(--emerald)' }}>Every line shown</div>
                      </div>
                    </div>
                  </div>

                  {/* App frame */}
                  <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(180deg,#0F2448 0%,#0B1A36 100%)', border: '1px solid var(--line-strong)', borderRadius: 20, boxShadow: '0 30px 80px -30px rgba(0,0,0,.6)', overflow: 'hidden' }}>
                    {/* Chrome bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(212,175,106,.05), transparent)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {[0,1,2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(244,238,223,.14)', display: 'inline-block' }} />)}
                        <span className="lp-mono" style={{ fontSize: 12, color: 'rgba(244,238,223,.42)', fontWeight: 500, marginLeft: 8 }}>mizan.app / calculate</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, letterSpacing: '.02em' }}>
                        <span className="lp-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 0 4px rgba(16,185,129,.2)', display: 'inline-block' }} />
                        LIVE
                      </div>
                    </div>
                    {/* Stage */}
                    <div style={{ position: 'relative', minHeight: 540 }}>
                      <div className={`lp-stage-panel${step === 0 ? ' show' : ''}`}><StageEnter /></div>
                      <div className={`lp-stage-panel${step === 1 ? ' show' : ''}`}><StageResult /></div>
                      <div className={`lp-stage-panel${step === 2 ? ' show' : ''}`}><StageWhy /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRUST STRIP ─── */}
        <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg,rgba(13,31,62,.4),rgba(10,24,48,.2))', padding: '28px 0', position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 32, alignItems: 'center' }}>
              {[
                { Icon: IconShield, t: 'Built by Muslims' },
                { Icon: IconSparkles, t: 'AI-powered assistant' },
                { Icon: IconBook, t: 'Plain-language fiqh' },
                { Icon: IconGlobe, t: 'Used in 20+ countries' },
                { Icon: IconCoin, t: 'Live nisab — updated daily' },
              ].map(({ Icon, t: label }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--cream-60)', fontSize: 13, fontWeight: 500 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', background: 'rgba(212,175,106,.08)', border: '1px solid var(--line)', color: 'var(--gold)', flexShrink: 0 }}><Icon style={{ width: 14, height: 14 }} /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" style={{ padding: '112px 0', position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ maxWidth: 680, marginBottom: 56 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.22em', color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>How it works</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: 1.1, letterSpacing: '-0.015em', color: 'var(--cream)', margin: '0 0 18px', fontWeight: 400 }}>
                Your assistant does the thinking. <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>You make the decision.</em>
              </h2>
              <p style={{ fontSize: 17, color: 'var(--cream-60)', lineHeight: 1.6, maxWidth: 600, margin: 0 }}>Mizan isn&apos;t a form you fill in. It&apos;s a guided conversation — your personal Zakat assistant that explains every step and answers every question.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {[
                { Icon: IconWallet, t: 'Tell Mizan about your wealth', d: "Cash, gold, silver, crypto, investments — your assistant guides you through each category, explaining what counts and why.", meta: 'avg. 4 min 12 sec' },
                { Icon: IconScale, t: 'Get a precise, sourced result', d: 'Live nisab thresholds, debt deductions, madhab-aware rulings — Mizan applies all of it and shows its working, line by line.', meta: 'calculated in real time' },
                { Icon: IconSparkles, t: 'Ask anything, get answers', d: "\"Does my jewellery count?\" \"Can I deduct my mortgage?\" Your AI assistant answers follow-up questions with scholarly sources — not generic FAQs.", meta: 'powered by AI' },
              ].map(({ Icon, t: title, d, meta }, i) => (
                <div key={i} className="lp-step-card">
                  <div style={{ fontFamily: "'Libre Caslon Text',serif", fontSize: 14, fontWeight: 700, color: 'var(--gold)', width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(212,175,106,.08)', border: '1px solid var(--line-strong)', marginBottom: 22, letterSpacing: '.02em' }}>0{i + 1}</div>
                  <Icon style={{ marginBottom: 20, color: 'var(--gold-soft)', width: 24, height: 24 }} />
                  <h3 className="lp-serif" style={{ fontSize: 24, fontWeight: 400, margin: '0 0 10px', color: 'var(--cream)', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--cream-60)', lineHeight: 1.6, margin: 0 }}>{d}</p>
                  <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px dashed rgba(212,175,106,.12)', fontSize: 12, color: 'rgba(244,238,223,.42)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, background: 'rgba(212,175,106,.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--gold)' }}>{meta}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHY MIZAN ─── */}
        <section id="why" style={{ paddingBottom: 112, position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ maxWidth: 680, marginBottom: 56 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.22em', color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>Why Mizan</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: 1.1, letterSpacing: '-0.015em', color: 'var(--cream)', margin: '0 0 18px', fontWeight: 400 }}>
                Not a calculator. <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>An assistant.</em>
              </h2>
              <p style={{ fontSize: 17, color: 'var(--cream-60)', lineHeight: 1.6, margin: 0 }}>Calculators give you a form. Mizan gives you a conversation — guiding you through every ruling, explaining every number, and helping you plan your giving with confidence.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridAutoRows: 'minmax(200px,auto)', gap: 20 }}>
              <div className="lp-feat hero-feat" style={{ gridColumn: 'span 2' }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(212,175,106,.14)', border: '1px solid var(--line)', color: 'var(--gold)', marginBottom: 20 }}><IconSparkles /></span>
                <h4 className="lp-serif" style={{ fontSize: 26, fontWeight: 400, color: 'var(--cream)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>An AI that explains every ruling — in plain language</h4>
                <p style={{ fontSize: 14.5, color: 'var(--cream-60)', lineHeight: 1.55, margin: 0 }}>Mizan doesn&apos;t just give you a number — it tells you why. Ask follow-up questions about any asset, any deduction, or any ruling. Your assistant answers with scholarly grounding across all four madhahib.</p>
                <span style={{ display: 'inline-block', marginTop: 16, fontSize: 11, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Hanafi · Shafi&apos;i · Maliki · Hanbali aware</span>
              </div>
              {[
                { Icon: IconCoin, t: 'Live market-linked nisab', d: 'Gold and silver thresholds update from live spot prices. No stale numbers, no guesswork.' },
                { Icon: IconScale, t: 'Helps you plan your giving', d: 'See what you owe broken down by category, track previous years, and decide when and how to distribute — all in one place.' },
                { Icon: IconChat, t: 'Ask Mizan, anything', d: '"Does my retirement account count?" — your AI assistant answers real Zakat questions patiently, any time.' },
                { Icon: IconCalendar, t: 'Hawl reminders', d: "We remind you when the lunar year comes around, so your next Zakat isn't an afterthought." },
              ].map(({ Icon, t: title, d }, i) => (
                <div key={i} className="lp-feat">
                  <span style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(212,175,106,.08)', border: '1px solid var(--line)', color: 'var(--gold)', marginBottom: 20 }}><Icon /></span>
                  <h4 className="lp-serif" style={{ fontSize: 21, fontWeight: 400, color: 'var(--cream)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h4>
                  <p style={{ fontSize: 14.5, color: 'var(--cream-60)', lineHeight: 1.55, margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── EXAMPLE ─── */}
        <section id="example" style={{ paddingBottom: 112, position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 72, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.22em', color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>An actual breakdown</div>
                <h2 className="lp-serif" style={{ fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: 1.1, letterSpacing: '-0.015em', color: 'var(--cream)', margin: '0 0 18px', fontWeight: 400 }}>
                  No black boxes. <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>Every dirham accounted for.</em>
                </h2>
                <p style={{ fontSize: 17, color: 'var(--cream-60)', lineHeight: 1.6, marginBottom: 32 }}>
                  This is what Mizan gives back to you — a complete, category-by-category breakdown with live nisab, the reasoning behind each number, and a PDF you can keep.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                  {['Every asset type categorised and valued', 'Nisab thresholds checked against your totals', 'Debts subtracted with clear justification', 'Final 2.5% applied transparently', 'Printable PDF + shareable receipt'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', fontSize: 15, color: 'var(--cream-60)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.4)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2, color: 'var(--emerald)' }}><IconCheck /></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href={isLoggedIn ? `/${locale}/results` : calculateHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(244,238,223,.04)', color: 'var(--cream)', padding: '14px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 15, border: '1px solid var(--line)' }}>
                  {isLoggedIn ? 'View my result' : 'See a full sample report'} <IconArrow />
                </a>
              </div>
              {/* Preview card (static) */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(closest-side, rgba(212,175,106,.18), transparent 70%)', filter: 'blur(20px)', zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(180deg,#0F2448 0%,#0B1A36 100%)', border: '1px solid var(--line-strong)', borderRadius: 20, boxShadow: '0 30px 80px -30px rgba(0,0,0,.6)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg,rgba(212,175,106,.05),transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {[0,1,2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(244,238,223,.14)', display: 'inline-block' }} />)}
                      <span className="lp-mono" style={{ fontSize: 12, color: 'rgba(244,238,223,.42)', marginLeft: 8 }}>mizan.app / your-zakat</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <span className="lp-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 0 4px rgba(16,185,129,.2)', display: 'inline-block' }} />LIVE
                    </span>
                  </div>
                  <div style={{ padding: '26px 28px 28px' }}>
                    <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(244,238,223,.42)', marginBottom: 10 }}>Your Zakat for 1446 AH · due in 42 days</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 22 }}>
                      <span className="lp-serif" style={{ fontSize: 52, lineHeight: 1, color: 'var(--gold-soft)', fontWeight: 400, letterSpacing: '-0.02em' }}>2,847.50</span>
                      <span className="lp-mono" style={{ fontSize: 14, color: 'rgba(244,238,223,.42)', fontWeight: 500, letterSpacing: '.08em' }}>USD</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                      {[
                        { k: 'Silver nisab', v: nisabSilver ? fmtN(nisabSilver) : '~$350' },
                        { k: 'Gold nisab', v: nisabGold ? fmtN(nisabGold) : '~$8,900' },
                      ].map((c, i) => (
                        <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', background: 'linear-gradient(180deg,rgba(212,175,106,.06),rgba(212,175,106,.02))' }}>
                          <div style={{ fontSize: 11, color: 'rgba(244,238,223,.42)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>{c.k}</div>
                          <div className="lp-serif" style={{ fontSize: 20, color: 'var(--cream)' }}>{c.v}</div>
                          <div style={{ fontSize: 11, color: 'var(--emerald)', marginTop: 2 }}>↑ live · updated now</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        ['Cash & bank accounts', '$48,200.00'],
                        ['Gold & jewellery (38g)', '$3,412.00'],
                        ['Investments & stocks', '$12,430.00'],
                        ['Business inventory', '$9,800.00'],
                        ['Debts you owe', '−$12,500.00', true],
                      ].map(([k, v, neg], i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px dashed rgba(244,238,223,.08)' : 0, fontSize: 14 }}>
                          <span style={{ color: neg ? '#EF9F9F' : 'rgba(244,238,223,.62)' }}>{k}</span>
                          <span className="lp-mono" style={{ color: neg ? '#EF9F9F' : 'var(--cream)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--line-strong)', marginTop: 4 }}>
                        <span style={{ color: 'var(--cream)', fontWeight: 600, fontSize: 14 }}>Zakat due (2.5%)</span>
                        <span className="lp-serif" style={{ fontSize: 18, color: 'var(--gold)' }}>$2,847.50</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 22, padding: '14px 16px', background: 'rgba(212,175,106,.04)', border: '1px solid var(--line)', borderRadius: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--cream-60)', fontStyle: 'italic', maxWidth: 180 }}>&ldquo;Take from their wealth a charity, by which you purify them&rdquo;</span>
                      <span style={{ fontFamily: "'Amiri',serif", color: 'var(--gold-soft)', fontSize: 18, lineHeight: 1.4, direction: 'rtl', flex: 1, textAlign: 'right' }}>خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" style={{ paddingBottom: 112, position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ maxWidth: 680, margin: '0 auto 48px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.22em', color: 'var(--gold)', fontWeight: 600, marginBottom: 16 }}>Questions, answered</div>
              <h2 className="lp-serif" style={{ fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: 1.1, letterSpacing: '-0.015em', color: 'var(--cream)', margin: 0, fontWeight: 400 }}>
                Things people <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>actually ask</em>.
              </h2>
            </div>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
              {faqs.map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
                    background: 'transparent', border: 0, padding: '28px 4px', cursor: 'pointer', color: 'var(--cream)',
                    fontFamily: "'Libre Caslon Text',serif", fontSize: 21, fontWeight: 400, textAlign: 'left', letterSpacing: '-0.005em',
                  }}>
                    <span>{item.q}</span>
                    <IconPlus style={{ color: 'var(--gold)', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .3s' }} />
                  </button>
                  <div className={`lp-faq-body${openFaq === i ? ' open' : ''}`} style={{ fontSize: 15.5, color: 'var(--cream-60)', lineHeight: 1.65 }}>
                    <p style={{ margin: 0, padding: '0 4px 28px' }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section style={{ paddingBottom: 112, position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#0E2448 0%,#0B1A36 60%,#13284F 100%)', border: '1px solid var(--line-strong)', borderRadius: 24, padding: '72px 64px' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .12, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23D4AF6A' stroke-width='.6'><path d='M40 4 L52 18 L70 18 L58 32 L64 50 L40 40 L16 50 L22 32 L10 18 L28 18 Z'/></g></svg>")`, maskImage: 'radial-gradient(ellipse at 100% 50%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 100% 50%, #000 0%, transparent 70%)' }} />
              <h2 className="lp-serif" style={{ position: 'relative', fontSize: 'clamp(32px,4vw,52px)', margin: '0 0 14px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.1 }}>
                Give, with <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>certainty</em>.
              </h2>
              <p style={{ position: 'relative', fontSize: 17, color: 'var(--cream-60)', margin: '0 0 32px', maxWidth: 560, lineHeight: 1.6 }}>
                Mizan is your personal Zakat assistant. In five minutes, you&apos;ll have a precise figure, a full explanation, and an AI ready to answer every question — so you give with confidence, not doubt.
              </p>
              <div style={{ position: 'relative', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href={isLoggedIn ? dashboardHref : calculateHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(180deg,#10B981 0%,#0E9E70 100%)', color: '#04251B', fontWeight: 700, fontSize: 15, padding: '16px 24px', borderRadius: 12, textDecoration: 'none', border: '1px solid #0E9E70', boxShadow: '0 1px 0 rgba(255,255,255,.18) inset, 0 10px 24px -10px rgba(16,185,129,.5)' }}>
                  {isLoggedIn ? 'Go to dashboard' : 'Calculate my Zakat'} <IconArrow />
                </a>
                {!isLoggedIn && (
                  <a href={signupHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(244,238,223,.04)', color: 'var(--cream)', padding: '16px 22px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 15, border: '1px solid var(--line)' }}>Create account</a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{ padding: '56px 0 64px', borderTop: '1px solid var(--line)', position: 'relative', zIndex: 1 }}>
          <div className="lp-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <BrandMark size={28} />
                  <span className="lp-serif" style={{ fontSize: 20 }}>Mizan</span>
                </div>
                <p style={{ margin: 0, maxWidth: 320, color: 'var(--cream-60)', fontSize: 14, lineHeight: 1.6 }}>A calm, careful Zakat assistant — built by Muslims for Muslims. Trusted with your niyyah, your numbers, and your deen.</p>
              </div>
              {[
                { h: 'Product', links: [['Start calculation', calculateHref], ['Ask Mizan AI', isLoggedIn ? `/${locale}/results` : signupHref], ['PDF reports', isLoggedIn ? `/${locale}/results` : signupHref], ['History', isLoggedIn ? `/${locale}/results?tab=history` : signupHref]] },
                { h: 'Learn', links: [['What is Zakat?', `/${locale}/about#zakat`], ['Nisab explained', `/${locale}/about#nisab`], ['The four madhahib', `/${locale}/about#madhahib`], ['FAQ', '#faq']] },
                { h: 'Company', links: [['About Mizan', `/${locale}/about`], ['Privacy policy', `/${locale}/privacy`], ['Terms of use', `/${locale}/terms`], ['Contact us', 'mailto:rafaemirza1@gmail.com']] },
              ].map(({ h, links }, i) => (
                <div key={i}>
                  <h5 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--gold)', fontWeight: 600, margin: '0 0 18px' }}>{h}</h5>
                  {links.map(([label, href], j) => (
                    <a key={j} href={href} style={{ display: 'block', color: 'var(--cream-60)', textDecoration: 'none', fontSize: 14, padding: '6px 0', transition: 'color .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--cream-60)')}
                    >{label}</a>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid var(--line)', color: 'rgba(244,238,223,.42)', fontSize: 12.5, gap: 16, flexWrap: 'wrap' }}>
              <span>© 2026 Mizan. Educational tool — not a fatwa. Consult a qualified scholar for rulings specific to your situation.</span>
              <span style={{ fontFamily: "'Amiri',serif", fontSize: 15, color: 'var(--gold-soft)' }}>بِسْمِ اللَّهِ</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
