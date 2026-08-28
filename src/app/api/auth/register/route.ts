import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSessionToken } from '@/lib/auth'
import { getCookieOptions } from '@/lib/cookie-options'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, phone } = body
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email: String(email).toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email: String(email).toLowerCase(),
        passwordHash: hashPassword(password),
        phone: phone || null,
        role: 'CUSTOMER',
        preferences: { create: {} },
        cart: { create: {} },
        wishlist: { create: {} },
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, phone: true },
    })
    const token = createSessionToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('session', token, getCookieOptions(req))
    return NextResponse.json({ user, token }) // also return token for localStorage (iframe fallback)
  } catch (e) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
