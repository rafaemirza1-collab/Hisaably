import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'

const PROTECTED_PATHS = ['/flow', '/results', '/home']

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Determine locale from path
  const pathnameLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  const locale = pathnameLocale ?? defaultLocale

  // Strip locale prefix to get the clean path
  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname

  // Run next-intl middleware for locale routing
  const intlResponse = intlMiddleware(request)

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some(p => pathWithoutLocale.startsWith(p))
  if (!isProtected) return intlResponse

  // Auth check
  const response = intlResponse ?? NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)', '/'],
}
