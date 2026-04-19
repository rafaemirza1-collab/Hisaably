'use client'

import { useState, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// ── Icons ────────────────────────────────────────────────
function IcoHome() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M3 12v9h18v-9"/></svg>
}
function IcoResult() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
}
function IcoHistory() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
}
function IcoPlus() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
}
function IcoInfo() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>
}
function IcoLogout() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function IcoMenu() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function IcoClose() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

// BrandMark
function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.29,
      background: 'linear-gradient(145deg,#1A3560,#0B1A36)',
      border: '1px solid rgba(212,175,106,.3)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
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

interface AppShellProps {
  children: React.ReactNode
  locale: string
  userName?: string
}

const SIDEBAR_W = 224

function AppShellInner({ children, locale, userName }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
  }

  function isActive(path: string, exact = false) {
    if (exact) return pathname === path
    return pathname === path || pathname.startsWith(path + '/')
  }

  // Nav items
  const isHistoryTab = pathname === `/${locale}/results` && searchParams.get('tab') === 'history'
  const topItems = [
    { icon: <IcoHome />, label: 'Dashboard', href: `/${locale}/home`, active: isActive(`/${locale}/home`, true) },
    { icon: <IcoResult />, label: 'My Result', href: `/${locale}/results`, active: isActive(`/${locale}/results`, true) && !isHistoryTab },
    { icon: <IcoHistory />, label: 'History', href: `/${locale}/results?tab=history`, active: isHistoryTab },
    { icon: <IcoPlus />, label: 'New calc', href: `/${locale}/flow`, active: isActive(`/${locale}/flow`), emerald: true },
  ]

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 0' }}>

      {/* Brand */}
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(212,175,106,.1)' }}>
        <a href={`/${locale}`} onClick={onNavClick} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
          <BrandMark size={28} />
          <span style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 18, color: '#F4EEDF' }}>Mizan</span>
        </a>
        {userName && (
          <p style={{ fontSize: 12, color: 'rgba(244,238,223,.38)', paddingLeft: 2, letterSpacing: '.01em' }}>
            {userName}
          </p>
        )}
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {topItems.map(item => (
          <a
            key={item.label}
            href={item.href}
            onClick={onNavClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              position: 'relative', overflow: 'hidden',
              color: item.active ? '#F4EEDF' : item.emerald ? 'rgba(16,185,129,.8)' : 'rgba(244,238,223,.55)',
              background: item.active
                ? 'linear-gradient(90deg, rgba(212,175,106,.12), rgba(212,175,106,.04))'
                : 'transparent',
              border: item.active ? '1px solid rgba(212,175,106,.18)' : '1px solid transparent',
              transition: 'all .18s',
            }}
            onMouseEnter={e => {
              if (!item.active) {
                e.currentTarget.style.background = item.emerald ? 'rgba(16,185,129,.07)' : 'rgba(244,238,223,.05)'
                e.currentTarget.style.color = item.emerald ? '#10B981' : '#F4EEDF'
              }
            }}
            onMouseLeave={e => {
              if (!item.active) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = item.emerald ? 'rgba(16,185,129,.8)' : 'rgba(244,238,223,.55)'
              }
            }}
          >
            {item.active && (
              <span style={{
                position: 'absolute', left: 0, top: 6, bottom: 6, width: 2,
                background: '#D4AF6A', borderRadius: 2,
              }} />
            )}
            <span style={{ color: item.active ? '#D4AF6A' : 'inherit', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Bottom group */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(212,175,106,.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <a
          href={`/${locale}/about`}
          onClick={onNavClick}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: 'rgba(244,238,223,.55)', transition: 'color .18s, background .18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,238,223,.05)'; e.currentTarget.style.color = '#F4EEDF' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(244,238,223,.55)' }}
        >
          <IcoInfo />About Mizan
        </a>

        <div style={{ padding: '4px 12px' }}>
          <LanguageSwitcher />
        </div>

        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'rgba(244,238,223,.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left', transition: 'color .18s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F4EEDF' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,238,223,.4)' }}
        >
          <IcoLogout />Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .shell-sidebar { display: none !important; }
          .shell-main { margin-left: 0 !important; }
          .shell-topbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .shell-topbar { display: none !important; }
          .shell-drawer { display: none !important; }
        }
        .shell-nav-item-hover:hover { background: rgba(244,238,223,.05) !important; color: #F4EEDF !important; }
        @keyframes shell-drawer-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .shell-drawer-open { animation: shell-drawer-in .22s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* ── Desktop sidebar ── */}
      <aside className="shell-sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: SIDEBAR_W,
        background: 'linear-gradient(180deg, #0D1F3E 0%, #070F22 100%)',
        borderRight: '1px solid rgba(212,175,106,.12)',
        zIndex: 100,
        overflowY: 'auto',
      }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="shell-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 56, background: 'rgba(7,15,34,.92)',
        borderBottom: '1px solid rgba(212,175,106,.1)',
        backdropFilter: 'blur(12px)',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 100,
      }}>
        <a href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <BrandMark size={24} />
          <span style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 16, color: '#F4EEDF' }}>Mizan</span>
        </a>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,238,223,.7)', padding: 4 }}
        >
          <IcoMenu />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="shell-drawer" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="shell-drawer-open" style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: SIDEBAR_W + 20,
            background: 'linear-gradient(180deg, #0D1F3E 0%, #070F22 100%)',
            borderRight: '1px solid rgba(212,175,106,.15)',
          }}>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,238,223,.5)', padding: 4 }}
            >
              <IcoClose />
            </button>
            <SidebarContent onNavClick={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main
        className="shell-main"
        style={{
          marginLeft: SIDEBAR_W,
          minHeight: '100vh',
          background: 'radial-gradient(900px 500px at 70% -5%, rgba(212,175,106,.06), transparent 60%), radial-gradient(700px 450px at 5% 30%, rgba(16,185,129,.04), transparent 60%), linear-gradient(180deg, #060D1F 0%, #0A1830 40%)',
          position: 'relative',
        }}
      >
        {/* Islamic pattern overlay */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A24A' fill-opacity='0.022'%3E%3Cpath d='M30 0l7.5 13h15L45 26l7.5 13H37.5L30 52l-7.5-13H7.5L15 26 7.5 13h15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Mobile top padding */}
        <div className="shell-topbar" style={{ height: 56, display: 'block' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>
    </>
  )
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={null}>
      <AppShellInner {...props} />
    </Suspense>
  )
}
