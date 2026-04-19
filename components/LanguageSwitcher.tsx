'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '@/i18n'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  hi: 'हिंदी',
  bn: 'বাংলা',
  fr: 'Français',
  es: 'Español',
  tr: 'Türkçe',
  fa: 'فارسی',
  kk: 'Қазақша',
  uz: "O'zbek",
  ru: 'Русский',
  zh: '中文',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  function openDropdown() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(o => !o)
  }

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/')
    if (locales.includes(segments[1] as typeof locales[number])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/'))
    setOpen(false)
  }

  const dropdown = mounted && open ? createPortal(
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        onClick={() => setOpen(false)}
      />
      <div
        style={{
          position: 'absolute',
          top: dropdownPos.top,
          right: dropdownPos.right,
          zIndex: 9999,
          background: '#0A1830',
          borderColor: 'rgba(212,175,106,.2)',
        }}
        className="border rounded-xl shadow-2xl min-w-[160px] max-h-80 overflow-y-auto"
      >
        {locales.map(l => (
          <button
            key={l}
            onClick={() => switchLocale(l)}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 block ${
              l === locale ? 'text-gold' : 'text-cream/70'
            }`}
          >
            {LOCALE_NAMES[l]}
          </button>
        ))}
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="flex items-center gap-1.5 rounded-lg text-sm" style={{ padding:'7px 14px', border:'1px solid rgba(212,175,106,.14)', color:'rgba(244,238,223,.45)', fontSize:12, transition:'color .2s, border-color .2s', background:'none' }}
        aria-label="Select language"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
        <span>{LOCALE_NAMES[locale]}</span>
      </button>
      {dropdown}
    </div>
  )
}
