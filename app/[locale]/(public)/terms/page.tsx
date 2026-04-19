'use client'

import { useLocale } from 'next-intl'

function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.29, background: 'linear-gradient(145deg,#1A3560,#0B1A36)', border: '1px solid rgba(212,175,106,.28)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 20 20" fill="none">
        <path d="M10 2 L16 10 L10 18 L4 10 Z" stroke="#D4AF6A" strokeWidth="1.2"/>
        <path d="M2 10 L10 6 L18 10 L10 14 Z" stroke="#E8CE97" strokeWidth="1.2" opacity=".7"/>
        <circle cx="10" cy="10" r="1" fill="#D4AF6A"/>
      </svg>
    </div>
  )
}

export default function TermsPage() {
  const locale = useLocale()

  return (
    <>
      <style suppressHydrationWarning>{`
        :root { --navy-900:#070F22; --gold:#D4AF6A; --gold-soft:#E8CE97; --cream:#F4EEDF; --cream-60:rgba(244,238,223,.62); --line:rgba(212,175,106,.14); }
        .tp-body { background: var(--navy-900); color: var(--cream); font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; }
        .tp-wrap { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .tp-serif { font-family: 'Libre Caslon Text', Georgia, serif; }
        .tp-h2 { font-family: 'Libre Caslon Text', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--cream); margin: 48px 0 16px; letter-spacing: -.01em; }
        .tp-p { font-size: 15px; color: var(--cream-60); line-height: 1.75; margin: 0 0 16px; }
        .tp-ul { font-size: 15px; color: var(--cream-60); line-height: 1.75; margin: 0 0 16px; padding-left: 20px; }
        .tp-ul li { margin-bottom: 8px; }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="tp-body">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg,#060D1F 0%,#0A1830 40%)' }} />

        {/* Nav */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)', background: 'rgba(7,15,34,.85)', borderBottom: '1px solid rgba(212,175,106,.08)' }}>
          <div className="tp-wrap" style={{ maxWidth: 1100 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
              <a href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <BrandMark size={24} />
                <span className="tp-serif" style={{ fontSize: 17, color: 'var(--cream)' }}>Hisaably</span>
              </a>
              <a href={`/${locale}/about`} style={{ fontSize: 13, color: 'var(--cream-60)', textDecoration: 'none' }}>← Back to About</a>
            </div>
          </div>
        </div>

        <div className="tp-wrap" style={{ position: 'relative', zIndex: 1, padding: '64px 32px 96px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Legal</p>
          <h1 className="tp-serif" style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, color: 'var(--cream)', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-.02em' }}>Terms of Use</h1>
          <p className="tp-p" style={{ color: 'rgba(244,238,223,.4)', marginBottom: 48 }}>Last updated: April 2026</p>

          <h2 className="tp-h2">What Hisaably is</h2>
          <p className="tp-p">Hisaably is an AI-powered Zakat assistant designed to help Muslims calculate their annual Zakat obligation. It is an educational and informational tool built on classical Islamic scholarship across the four Sunni madhahib.</p>
          <p className="tp-p">Hisaably is <strong style={{ color: 'var(--cream)' }}>not a fatwa</strong> and does not constitute a religious ruling specific to your personal situation. For complex or unusual circumstances, you should consult a qualified Islamic scholar.</p>

          <h2 className="tp-h2">Using Hisaably</h2>
          <ul className="tp-ul">
            <li>You must be at least 13 years of age to create an account</li>
            <li>You are responsible for the accuracy of the information you enter</li>
            <li>You may not use Hisaably for any unlawful purpose</li>
            <li>You may not attempt to reverse-engineer, copy, or replicate Hisaably&apos;s systems</li>
            <li>One account per person — you may not share accounts</li>
          </ul>

          <h2 className="tp-h2">Accuracy and liability</h2>
          <p className="tp-p">Hisaably makes every effort to provide accurate Zakat calculations based on established Islamic jurisprudence and live market data. However, we make no guarantee that calculations are free from error or are appropriate for every individual&apos;s unique circumstances.</p>
          <p className="tp-p">Hisaably is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any financial decisions made based on Hisaably&apos;s output. The obligation to verify your Zakat rests with you and, if needed, a qualified scholar.</p>

          <h2 className="tp-h2">Intellectual property</h2>
          <p className="tp-p">All content, design, and code within Hisaably is the intellectual property of its creators. You may not reproduce, distribute, or create derivative works from Hisaably&apos;s content without explicit written permission.</p>

          <h2 className="tp-h2">Accounts and termination</h2>
          <p className="tp-p">We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us. Upon deletion, your data will be removed within 30 days in accordance with our Privacy Policy.</p>

          <h2 className="tp-h2">Changes to these terms</h2>
          <p className="tp-p">We may update these terms from time to time. Continued use of Hisaably after changes are posted constitutes acceptance of the updated terms. We will notify registered users of material changes by email.</p>

          <h2 className="tp-h2">Contact</h2>
          <p className="tp-p">Questions about these terms can be directed to <a href="mailto:rafaemirza1@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>rafaemirza1@gmail.com</a>.</p>

          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--line)', display: 'flex', gap: 24 }}>
            <a href={`/${locale}/privacy`} style={{ fontSize: 14, color: 'var(--cream-60)', textDecoration: 'none' }}>Privacy policy →</a>
            <a href={`/${locale}/about`} style={{ fontSize: 14, color: 'var(--cream-60)', textDecoration: 'none' }}>About Hisaably →</a>
          </div>
        </div>
      </div>
    </>
  )
}
