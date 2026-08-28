import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSessionToken } from '@/lib/auth'
import { getCookieOptions } from '@/lib/cookie-options'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    // Ensure cart & wishlist exist
    await db.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
    await db.wishlist.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
    const token = createSessionToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('session', token, getCookieOptions(req))
    return NextResponse.json({
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: user.phone },
      token, // also return token for localStorage-based auth (iframe fallback)
    })
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
