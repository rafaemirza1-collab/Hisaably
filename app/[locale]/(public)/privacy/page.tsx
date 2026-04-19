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

export default function PrivacyPage() {
  const locale = useLocale()

  return (
    <>
      <style suppressHydrationWarning>{`
        :root { --navy-900:#070F22; --gold:#D4AF6A; --gold-soft:#E8CE97; --cream:#F4EEDF; --cream-60:rgba(244,238,223,.62); --line:rgba(212,175,106,.14); --line-strong:rgba(212,175,106,.28); }
        .pp-body { background: var(--navy-900); color: var(--cream); font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; }
        .pp-wrap { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .pp-serif { font-family: 'Libre Caslon Text', Georgia, serif; }
        .pp-h2 { font-family: 'Libre Caslon Text', Georgia, serif; font-size: 22px; font-weight: 400; color: var(--cream); margin: 48px 0 16px; letter-spacing: -.01em; }
        .pp-p { font-size: 15px; color: var(--cream-60); line-height: 1.75; margin: 0 0 16px; }
        .pp-ul { font-size: 15px; color: var(--cream-60); line-height: 1.75; margin: 0 0 16px; padding-left: 20px; }
        .pp-ul li { margin-bottom: 8px; }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="pp-body">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg,#060D1F 0%,#0A1830 40%)' }} />

        {/* Nav */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)', background: 'rgba(7,15,34,.85)', borderBottom: '1px solid rgba(212,175,106,.08)' }}>
          <div className="pp-wrap" style={{ maxWidth: 1100 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
              <a href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <BrandMark size={24} />
                <span className="pp-serif" style={{ fontSize: 17, color: 'var(--cream)' }}>Hisaably</span>
              </a>
              <a href={`/${locale}/about`} style={{ fontSize: 13, color: 'var(--cream-60)', textDecoration: 'none' }}>← Back to About</a>
            </div>
          </div>
        </div>

        <div className="pp-wrap" style={{ position: 'relative', zIndex: 1, padding: '64px 32px 96px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Legal</p>
          <h1 className="pp-serif" style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, color: 'var(--cream)', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-.02em' }}>Privacy Policy</h1>
          <p className="pp-p" style={{ color: 'rgba(244,238,223,.4)', marginBottom: 48 }}>Last updated: April 2026</p>

          <h2 className="pp-h2">What we collect</h2>
          <p className="pp-p">When you create a Hisaably account, we collect your email address and any display name you choose to provide. When you use the Zakat calculator, we store the financial information you enter — asset values, debt amounts, your selected currency and madhab — in order to save your results and history.</p>
          <p className="pp-p">We do not collect payment information directly. If you subscribe to a paid plan, payments are processed by Stripe, which has its own privacy policy.</p>

          <h2 className="pp-h2">How we use your data</h2>
          <ul className="pp-ul">
            <li>To calculate and save your Zakat results across sessions</li>
            <li>To provide your calculation history and PDF exports</li>
            <li>To power the Ask Hisaably AI assistant, which uses your result data to answer follow-up questions</li>
            <li>To send you hawl reminders if you opt in</li>
            <li>To improve the accuracy and quality of Hisaably&apos;s calculations</li>
          </ul>

          <h2 className="pp-h2">What we never do</h2>
          <ul className="pp-ul">
            <li>We never sell your personal data to third parties</li>
            <li>We never use your financial data for advertising</li>
            <li>We never share your data with data brokers</li>
            <li>We never use your information for any purpose beyond operating Hisaably</li>
          </ul>

          <h2 className="pp-h2">Data storage and security</h2>
          <p className="pp-p">Your data is stored securely using Supabase, a SOC 2 compliant infrastructure provider. Data is encrypted in transit (TLS) and at rest. We follow industry-standard security practices and access controls.</p>

          <h2 className="pp-h2">AI and your data</h2>
          <p className="pp-p">The Ask Hisaably feature uses AI to answer your Zakat questions. Your calculation data may be included in the context sent to the AI model to generate relevant answers. This data is not used to train AI models and is not retained by the AI provider beyond the scope of your query.</p>

          <h2 className="pp-h2">Your rights</h2>
          <p className="pp-p">You may request deletion of your account and all associated data at any time by contacting us at <a href="mailto:rafaemirza1@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>rafaemirza1@gmail.com</a>. We will process deletion requests within 30 days.</p>

          <h2 className="pp-h2">Cookies</h2>
          <p className="pp-p">Hisaably uses only essential cookies required for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>

          <h2 className="pp-h2">Contact</h2>
          <p className="pp-p">If you have any questions about this privacy policy or how your data is handled, please contact us at <a href="mailto:rafaemirza1@gmail.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>rafaemirza1@gmail.com</a>.</p>

          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--line)', display: 'flex', gap: 24 }}>
            <a href={`/${locale}/terms`} style={{ fontSize: 14, color: 'var(--cream-60)', textDecoration: 'none' }}>Terms of use →</a>
            <a href={`/${locale}/about`} style={{ fontSize: 14, color: 'var(--cream-60)', textDecoration: 'none' }}>About Hisaably →</a>
          </div>
        </div>
      </div>
    </>
  )
}
