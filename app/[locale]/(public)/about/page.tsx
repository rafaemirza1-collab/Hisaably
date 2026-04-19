'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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

function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>
}

export default function AboutPage() {
  const locale = useLocale()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

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

  return (
    <>
      <style suppressHydrationWarning>{`
        :root {
          --navy-900:#070F22; --navy-800:#0A1830; --navy-700:#0E2142;
          --line:rgba(212,175,106,.14); --line-strong:rgba(212,175,106,.28);
          --cream:#F4EEDF; --cream-60:rgba(244,238,223,.62); --cream-40:rgba(244,238,223,.42); --cream-25:rgba(244,238,223,.25);
          --gold:#D4AF6A; --gold-soft:#E8CE97; --gold-deep:#B38D43;
          --emerald:#10B981; --emerald-deep:#059669;
          --panel:#0B1A36; --panel-2:#0D1F3E;
        }
        .ab-body { background: var(--navy-900); color: var(--cream); font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .ab-serif { font-family: 'Libre Caslon Text', Georgia, serif; }
        .ab-wrap { max-width: 1100px; margin: 0 auto; padding: 0 32px; }
        @media (max-width: 720px) { .ab-wrap { padding: 0 20px; } }
        .ab-nav-link { color: rgba(244,238,223,.62); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
        .ab-nav-link:hover { color: var(--cream); }
        .ab-pill { display: inline-flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .18em; color: var(--gold); padding: 8px 14px; border: 1px solid var(--line-strong); border-radius: 999px; background: linear-gradient(180deg, rgba(212,175,106,.08), rgba(212,175,106,.03)); }
        .ab-card { background: linear-gradient(180deg, #0D1F3E, #0B1A36); border: 1px solid var(--line); border-radius: 18px; padding: 28px; transition: border-color .25s; }
        .ab-card:hover { border-color: var(--line-strong); }
        .ab-card.gold-card { background: linear-gradient(135deg, rgba(212,175,106,.09), rgba(13,31,62,.6) 60%); border-color: var(--line-strong); }
        .ab-feat-chip { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: rgba(212,175,106,.1); border: 1px solid var(--line-strong); color: var(--gold); flex-shrink: 0; }
        .ab-step-num { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-family: 'Libre Caslon Text', serif; font-size: 18px; font-weight: 700; color: var(--gold); background: rgba(212,175,106,.08); border: 1px solid var(--line-strong); flex-shrink: 0; }
        .ab-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(180deg,#10B981 0%,#0E9E70 100%); color: #04251B; font-weight: 700; font-size: 14px; border-radius: 12px; text-decoration: none; border: 1px solid #0E9E70; transition: opacity .2s; }
        .ab-btn-primary:hover { opacity: .9; }
        .ab-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: rgba(212,175,106,.06); color: var(--gold-soft); font-weight: 600; font-size: 14px; border-radius: 12px; text-decoration: none; border: 1px solid var(--line-strong); transition: background .2s; }
        .ab-btn-ghost:hover { background: rgba(212,175,106,.12); }
        .ab-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(212,175,106,.3), transparent); margin: 0; }
        @keyframes ab-fade-up { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .ab-fade-up { animation: ab-fade-up .55s cubic-bezier(.22,1,.36,1) both; }
        .ab-d1 { animation-delay: 0ms; }
        .ab-d2 { animation-delay: 100ms; }
        .ab-d3 { animation-delay: 200ms; }
        .ab-d4 { animation-delay: 300ms; }
        .ab-d5 { animation-delay: 400ms; }
      `}</style>

      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="ab-body" style={{ minHeight: '100vh', position: 'relative' }}>

        {/* Page background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(1000px 600px at 80% -5%, rgba(212,175,106,.07), transparent 60%), radial-gradient(800px 500px at 5% 30%, rgba(16,185,129,.04), transparent 60%), linear-gradient(180deg,#060D1F 0%,#0A1830 30%,#0A1830 100%)',
        }} />
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: .025,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23D4AF6A' stroke-width='.6'><path d='M40 4 L52 18 L70 18 L58 32 L64 50 L40 40 L16 50 L22 32 L10 18 L28 18 Z'/><circle cx='40' cy='40' r='2'/></g></svg>")`,
          backgroundSize: '80px 80px',
        }} />

        {/* ─── NAV ─── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'saturate(1.2) blur(14px)', WebkitBackdropFilter: 'saturate(1.2) blur(14px)',
          background: 'linear-gradient(180deg, rgba(7,15,34,.85), rgba(7,15,34,.55))',
          borderBottom: '1px solid rgba(212,175,106,.08)',
        }}>
          <div className="ab-wrap">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                <a href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--cream)' }}>
                  <BrandMark size={26} />
                  <span className="ab-serif" style={{ fontSize: 18 }}>Hisaably</span>
                </a>
                <nav style={{ display: 'flex', gap: 24 }}>
                  <a href={`/${locale}/about#mission`} className="ab-nav-link">Mission</a>
                  <a href={`/${locale}/about#how`} className="ab-nav-link">How it works</a>
                  <a href={`/${locale}/about#features`} className="ab-nav-link">Features</a>
                  <a href={`/${locale}/privacy`} className="ab-nav-link">Privacy</a>
                  <a href={`/${locale}/terms`} className="ab-nav-link">Terms</a>
                </nav>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LanguageSwitcher />
                {isLoggedIn ? (
                  <>
                    {userName && <span style={{ fontSize: 13, color: 'var(--cream-60)' }}>Hi, {userName}</span>}
                    <a href={`/${locale}/home`} style={{
                      background: 'linear-gradient(180deg,#10B981 0%,#0E9E70 100%)', color: '#04251B',
                      fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 10,
                      textDecoration: 'none', border: '1px solid #0E9E70',
                    }}>Dashboard →</a>
                  </>
                ) : (
                  <>
                    <a href={`/${locale}/login`} style={{ color: 'var(--cream)', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 10, textDecoration: 'none', border: '1px solid var(--line)', background: 'rgba(13,31,62,.5)' }}>Log in</a>
                    <a href={`/${locale}/signup`} style={{ background: 'linear-gradient(180deg,#10B981 0%,#0E9E70 100%)', color: '#04251B', fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 10, textDecoration: 'none' }}>Get started</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── HERO ─── */}
        <section style={{ position: 'relative', padding: '80px 0 96px', zIndex: 1 }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .1,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23D4AF6A' stroke-width='.6'><path d='M40 4 L52 18 L70 18 L58 32 L64 50 L40 40 L16 50 L22 32 L10 18 L28 18 Z'/><circle cx='40' cy='40' r='2'/></g></svg>")`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at 70% 50%, #000 0%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, #000 0%, transparent 65%)',
          }} />
          <div className="ab-wrap" style={{ textAlign: 'center' }}>
            <div className="ab-fade-up ab-d1" style={{ marginBottom: 24 }}>
              <span className="ab-pill">About Hisaably</span>
            </div>
            <h1 className="ab-serif ab-fade-up ab-d2" style={{
              fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.06, letterSpacing: '-0.02em',
              color: 'var(--cream)', fontWeight: 400, maxWidth: 780, margin: '0 auto 24px',
            }}>
              Your personal <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>Zakat assistant</em> — not just a calculator
            </h1>
            <p className="ab-fade-up ab-d3" style={{ fontSize: 18, color: 'var(--cream-60)', maxWidth: 580, margin: '0 auto 20px', lineHeight: 1.65 }}>
              Hisaably is an AI-powered assistant built by Muslims who believe you deserve more than a number. It guides you through every ruling, explains every line, and answers your questions — grounded in classical Islamic scholarship.
            </p>
            {/* Quranic quote */}
            <div className="ab-fade-up ab-d4" style={{ margin: '32px auto 0', maxWidth: 520, padding: '24px 28px', border: '1px solid var(--line-strong)', borderRadius: 18, background: 'linear-gradient(180deg, rgba(212,175,106,.06), rgba(13,31,62,.4))' }}>
              <p style={{ fontFamily: 'serif', fontSize: 22, color: 'var(--gold-soft)', lineHeight: 1.6, marginBottom: 12 }} dir="rtl">
                خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُم
              </p>
              <p style={{ fontSize: 13, color: 'var(--cream-60)', fontStyle: 'italic', marginBottom: 4 }}>
                &ldquo;Take from their wealth a charity by which you purify them&rdquo;
              </p>
              <p style={{ fontSize: 12, color: 'rgba(244,238,223,.35)' }}>— Surah At-Tawbah 9:103</p>
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── MISSION ─── */}
        <section id="mission" style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Why we built this</p>
                <h2 className="ab-serif" style={{ fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.15, color: 'var(--cream)', fontWeight: 400, marginBottom: 24, letterSpacing: '-.015em' }}>
                  Every Muslim deserves a clear, <em style={{ fontStyle:'italic', color:'var(--gold-soft)' }}>confident</em> answer
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--cream-60)', fontSize: 15, lineHeight: 1.7 }}>
                  <p>
                    Zakat is one of the five pillars of Islam — an obligation that purifies wealth and supports those in need. Yet for many Muslims, calculating it correctly feels uncertain. Which assets count? What&apos;s the nisab today? Can I deduct my debts? What does my madhab say?
                  </p>
                  <p>
                    We built Hisaably because existing tools either oversimplify or overwhelm. A traditional calculator gives you a form to fill in. Hisaably gives you a <em style={{ fontStyle:'italic', color:'var(--cream)' }}>guided conversation</em> — an AI assistant that thinks through your situation with you, explains every ruling, and helps you plan your giving with confidence.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: '✦', title: 'AI-powered, not just automated', desc: 'Hisaably uses AI to guide you through every category, answer your follow-up questions, and explain rulings — the way a knowledgeable friend would.' },
                  { icon: '📖', title: 'Grounded in fiqh', desc: 'Built on classical scholarship across all four Sunni madhahib. Where schools disagree, Hisaably shows you both positions and lets you choose.' },
                  { icon: '⚖', title: 'Transparent to the dirham', desc: 'Every calculation shows its working. You see every included asset, every deduction, and exactly why the 2.5% rule applies — or doesn\'t.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="ab-card" style={{ display: 'flex', gap: 18, padding: '22px 24px' }}>
                    <div className="ab-feat-chip">{icon}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', marginBottom: 6 }}>{title}</p>
                      <p style={{ fontSize: 13, color: 'var(--cream-60)', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>The process</p>
              <h2 className="ab-serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', color: 'var(--cream)', fontWeight: 400, letterSpacing: '-.01em' }}>
                How Hisaably guides you through Zakat
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { n: '01', title: 'A guided conversation, not a form', body: 'Your AI assistant walks you through each asset category — explaining what counts, how it\'s valued, and what your madhab says. No guessing, no Googling rulings mid-way.' },
                { n: '02', title: 'Live nisab + transparent calculation', body: 'Hisaably checks live gold and silver prices daily, applies the 2.5% rule, deducts eligible debts, and shows you every step — including why any asset is included or excluded.' },
                { n: '03', title: 'Plan your giving with confidence', body: 'See a full breakdown, track previous years, download a PDF, and ask your AI assistant any follow-up question — from distribution channels to edge cases in your situation.' },
              ].map(({ n, title, body }) => (
                <div key={n} className="ab-card" style={{ padding: '32px 28px 36px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -10, right: -8, fontFamily: "'Libre Caslon Text',serif", fontSize: 80, color: 'rgba(212,175,106,.05)', fontWeight: 700, lineHeight: 1, userSelect: 'none' }}>{n}</div>
                  <div className="ab-step-num" style={{ marginBottom: 20 }}>{n}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--cream)', marginBottom: 12, letterSpacing: '-.01em' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--cream-60)', lineHeight: 1.65 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── FEATURES ─── */}
        <section id="features" style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>What Hisaably does</p>
                <h2 className="ab-serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', color: 'var(--cream)', fontWeight: 400, letterSpacing: '-.01em', marginBottom: 20, lineHeight: 1.2 }}>
                  An assistant that calculates,<br />explains, and <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>plans</em>
                </h2>
                <p style={{ fontSize: 15, color: 'var(--cream-60)', lineHeight: 1.7, marginBottom: 36 }}>
                  Hisaably isn&apos;t just a form you fill in once. It&apos;s a full Zakat companion — calculating your obligation, explaining every ruling in plain language, and helping you plan and track your giving over time.
                </p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <a href={isLoggedIn ? `/${locale}/home` : `/${locale}/flow`} className="ab-btn-primary">
                    {isLoggedIn ? 'Go to dashboard' : 'Calculate my Zakat'} →
                  </a>
                  {!isLoggedIn && (
                    <a href={`/${locale}/signup`} className="ab-btn-ghost">Create account</a>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'AI assistant guides you through every category',
                  'Unlimited follow-up questions — answered with scholarly sources',
                  'Helps you plan how and when to distribute your Zakat',
                  'Live silver & gold nisab — updated daily',
                  'Debt deduction calculated by your madhab',
                  'Silver & gold nisab shown side-by-side',
                  'Full history — track your Zakat year over year',
                  'One-page PDF report, downloadable anytime',
                  'Hawl reminders so you never miss a year',
                  'Supports Hanafi, Maliki, Shafi\'i and Hanbali',
                  '20+ display currencies supported',
                  'Private — your data is never sold or shared',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: 'linear-gradient(180deg, rgba(13,31,62,.7), rgba(11,26,54,.8))', border: '1px solid var(--line)', borderRadius: 12 }}>
                    <span style={{ color: 'var(--emerald)', flexShrink: 0, marginTop: 1 }}><IconCheck /></span>
                    <span style={{ fontSize: 14, color: 'var(--cream-60)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── WHAT IS ZAKAT ─── */}
        <section id="zakat" style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap">
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>The obligation</p>
              <h2 className="ab-serif" style={{ fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.15, color: 'var(--cream)', fontWeight: 400, marginBottom: 32, letterSpacing: '-.015em' }}>
                What is <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>Zakat?</em>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--cream-60)', fontSize: 15.5, lineHeight: 1.75 }}>
                <p>Zakat (زكاة) is one of the Five Pillars of Islam — an annual obligatory act of worship in which a Muslim gives a portion of their qualifying wealth to those in need. The word itself means both <em style={{ color: 'var(--cream)', fontStyle: 'italic' }}>purification</em> and <em style={{ color: 'var(--cream)', fontStyle: 'italic' }}>growth</em> — giving Zakat purifies the wealth you keep and purifies the soul of the one who gives.</p>
                <p>It is mentioned alongside prayer (salah) over 80 times in the Quran, underscoring how central it is to a Muslim&apos;s relationship with Allah and with their community. The Quran describes eight categories of people who are entitled to receive Zakat: the poor, the needy, those in debt, travellers in need, those working to collect and distribute it, new Muslims, those working to free themselves from slavery, and those working in the cause of Allah (Surah At-Tawbah 9:60).</p>
                <p>Zakat is not the same as voluntary charity (sadaqah). It is a precise obligation — calculated annually, based on specific asset categories, and subject to scholarly rulings. Getting it right matters. That is why Hisaably exists.</p>
                <div className="ab-card gold-card" style={{ marginTop: 8, padding: '24px 28px' }}>
                  <p style={{ fontFamily: 'serif', fontSize: 22, color: 'var(--gold-soft)', lineHeight: 1.6, marginBottom: 10, direction: 'rtl', textAlign: 'right' }}>وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ</p>
                  <p style={{ fontSize: 13, color: 'var(--cream-60)', fontStyle: 'italic', marginBottom: 4 }}>&ldquo;Establish prayer and give Zakat&rdquo;</p>
                  <p style={{ fontSize: 12, color: 'rgba(244,238,223,.35)' }}>— Surah Al-Baqarah 2:43, one of 32 direct commands to give Zakat in the Quran</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── NISAB EXPLAINED ─── */}
        <section id="nisab" style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap">
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>The threshold</p>
              <h2 className="ab-serif" style={{ fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.15, color: 'var(--cream)', fontWeight: 400, marginBottom: 32, letterSpacing: '-.015em' }}>
                Nisab <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>explained</em>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--cream-60)', fontSize: 15.5, lineHeight: 1.75 }}>
                <p>The nisab is the minimum amount of wealth a Muslim must possess before Zakat becomes obligatory. It is based on the value of gold or silver as defined in classical Islamic scholarship — not an arbitrary number, but a divinely-guided threshold designed to ensure Zakat falls only on those with genuine surplus wealth.</p>
                <p>There are two nisab thresholds:</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '24px 0' }}>
                {[
                  { metal: 'Silver nisab', amount: '612 grams of silver', detail: 'This is the lower threshold. The majority of scholars today recommend using the silver nisab because it is more inclusive — it means more Muslims fulfil the obligation and more people receive its benefit.', tag: 'Most scholars recommend' },
                  { metal: 'Gold nisab', amount: '85 grams of gold', detail: 'This is the higher threshold. Using gold nisab means fewer people reach the minimum, so fewer are obligated to pay. Some scholars prefer this to avoid obligating those with modest wealth.', tag: 'More restrictive' },
                ].map(({ metal, amount, detail, tag }) => (
                  <div key={metal} className="ab-card" style={{ padding: '24px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>{tag}</p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--cream)', marginBottom: 6 }}>{metal}</p>
                    <p style={{ fontSize: 14, color: 'var(--gold-soft)', marginBottom: 14, fontFamily: "'Libre Caslon Text', serif" }}>{amount}</p>
                    <p style={{ fontSize: 13, color: 'var(--cream-60)', lineHeight: 1.65 }}>{detail}</p>
                  </div>
                ))}
              </div>
              <div style={{ color: 'var(--cream-60)', fontSize: 15.5, lineHeight: 1.75 }}>
                <p>The nisab value in your currency changes daily as gold and silver prices fluctuate. Hisaably fetches live spot prices every day so the threshold used in your calculation is always accurate — never a stale estimate from months ago.</p>
                <p style={{ marginTop: 16 }}>Zakat is also only due if your wealth has remained above the nisab for a full lunar year (hawl). If your wealth dips below nisab at any point during the year, the clock resets. Hisaably tracks this and reminds you when your hawl anniversary approaches.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── THE FOUR MADHAHIB ─── */}
        <section id="madhahib" style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap">
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Schools of law</p>
              <h2 className="ab-serif" style={{ fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.15, color: 'var(--cream)', fontWeight: 400, marginBottom: 16, letterSpacing: '-.015em' }}>
                The four <em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>madhahib</em>
              </h2>
              <p style={{ fontSize: 15.5, color: 'var(--cream-60)', lineHeight: 1.75, marginBottom: 32 }}>A madhab (مذهب) is a school of Islamic jurisprudence — a systematic methodology for deriving legal rulings from the Quran and Sunnah. All four Sunni madhahib are valid and authoritative. They agree on the fundamentals of Zakat but differ on specific details. Hisaably adjusts its calculation based on your chosen madhab.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'Hanafi', founder: 'Imam Abu Hanifa (699–767 CE)', regions: 'Turkey, South Asia, Central Asia, Egypt', zakat: 'Worn gold and silver jewellery is included in zakatable wealth. All debts — short-term and long-term — may be deducted before calculating Zakat. The nisab is calculated using silver.' },
                  { name: 'Maliki', founder: 'Imam Malik ibn Anas (711–795 CE)', regions: 'North Africa, West Africa, parts of the Gulf', zakat: 'Worn jewellery used regularly is generally exempt. Only short-term debts (due within the year) may be deducted. Both gold and silver nisab are used, depending on the scholar.' },
                  { name: "Shafi'i", founder: 'Imam Al-Shafi\'i (767–820 CE)', regions: 'Southeast Asia, East Africa, parts of the Middle East', zakat: 'Worn jewellery intended for personal adornment is exempt. Only immediate short-term debts may be deducted. Silver nisab is standard but gold nisab is also applied.' },
                  { name: 'Hanbali', founder: 'Imam Ahmad ibn Hanbal (780–855 CE)', regions: 'Saudi Arabia, Qatar, parts of Syria and Iraq', zakat: 'Worn jewellery is generally included as zakatable wealth. Short-term debts are deductible. The madhab tends toward caution — if in doubt, include the asset.' },
                ].map(({ name, founder, regions, zakat }) => (
                  <div key={name} className="ab-card" style={{ padding: '26px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>{name}</p>
                        <p style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 2 }}>{founder}</p>
                        <p style={{ fontSize: 12, color: 'rgba(244,238,223,.4)' }}>Predominant in: {regions}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--cream-60)', lineHeight: 1.65, borderTop: '1px solid rgba(212,175,106,.1)', paddingTop: 14 }}><strong style={{ color: 'var(--cream)' }}>Zakat specifics:</strong> {zakat}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(244,238,223,.4)', lineHeight: 1.65, marginTop: 24, fontStyle: 'italic' }}>Not sure which madhab you follow? Hisaably defaults to the most common scholarly opinion and clearly shows where different schools diverge, so you can make an informed choice.</p>
            </div>
          </div>
        </section>

        <div className="ab-divider" />

        {/* ─── FINAL CTA ─── */}
        <section style={{ padding: '96px 0', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(212,175,106,.07), transparent 65%)',
          }} />
          <div className="ab-wrap" style={{ position: 'relative' }}>
            <span className="ab-pill" style={{ marginBottom: 28, display: 'inline-flex' }}>
              <span style={{ width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--gold)' }} />
              Ready when you are
            </span>
            <h2 className="ab-serif" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', color: 'var(--cream)', fontWeight: 400, letterSpacing: '-.02em', marginBottom: 20, lineHeight: 1.1 }}>
              Meet your Zakat assistant.<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>Give with confidence.</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--cream-60)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.65 }}>
              In five minutes, Hisaably will guide you through your full Zakat — explaining every ruling, answering every question, and helping you plan your giving.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              {isLoggedIn ? (
                <>
                  <a href={`/${locale}/home`} className="ab-btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>Go to dashboard →</a>
                  <a href={`/${locale}/flow?new=1`} className="ab-btn-ghost" style={{ fontSize: 16, padding: '16px 32px' }}>New calculation</a>
                </>
              ) : (
                <>
                  <a href={`/${locale}/flow`} className="ab-btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>Calculate my Zakat →</a>
                  <a href={`/${locale}/signup`} className="ab-btn-ghost" style={{ fontSize: 16, padding: '16px 32px' }}>Create free account</a>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="ab-divider" />
        <footer style={{ padding: '32px 0', position: 'relative', zIndex: 1 }}>
          <div className="ab-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BrandMark size={22} />
              <span className="ab-serif" style={{ fontSize: 15, color: 'var(--cream)' }}>Hisaably</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(244,238,223,.25)', textAlign: 'center' }}>Built by Muslims, for Muslims · Used across 20+ countries</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href={`/${locale}`} style={{ fontSize: 12, color: 'rgba(244,238,223,.35)', textDecoration: 'none' }}>Home</a>
              <a href={`/${locale}/about`} style={{ fontSize: 12, color: 'rgba(244,238,223,.35)', textDecoration: 'none' }}>About</a>
              <a href={`/${locale}/flow`} style={{ fontSize: 12, color: 'rgba(244,238,223,.35)', textDecoration: 'none' }}>Calculator</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
