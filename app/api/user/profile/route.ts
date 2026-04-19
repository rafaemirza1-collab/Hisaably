import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use untyped client since local types are out of sync with actual DB schema
function createRawClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}

export async function GET() {
  const supabase = createRawClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({ display_name: data?.display_name ?? null })
}

export async function PATCH(request: Request) {
  const supabase = createRawClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { display_name } = await request.json() as { display_name: string }
  if (!display_name?.trim()) return new Response('Bad request', { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('users')
    .update({ display_name: display_name.trim() })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
