import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_OPTIONS } from '@/lib/cookie-options'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set('session', '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
  return NextResponse.json({ ok: true })
}
