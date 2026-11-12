import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionToken, hashPassword } from '@/lib/auth'
import { getCookieOptions } from '@/lib/cookie-options'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // If clientId is missing or is the default demo placeholder
  if (!clientId || clientId === 'demo-google-client-id') {
    return NextResponse.redirect(`${origin}/?auth_modal=true&google_setup=needed`)
  }

  const redirectUri = `${origin}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { credential, email: inputEmail, firstName: inputFirstName, lastName: inputLastName } = body

    let email = inputEmail
    let firstName = inputFirstName
    let lastName = inputLastName

    // If a Google ID Token (credential) is passed from Google Identity Services
    if (credential) {
      try {
        // Try verifying with Google's public tokeninfo endpoint
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
          signal: AbortSignal.timeout(3500),
        })
        if (res.ok) {
          const info = await res.json()
          if (info.email) {
            email = info.email
            firstName = info.given_name || info.name?.split(' ')[0] || 'Google'
            lastName = info.family_name || info.name?.split(' ').slice(1).join(' ') || 'User'
          }
        }
      } catch {
        // Fallback: parse JWT payload directly if network request times out
        try {
          const payloadBase64 = credential.split('.')[1]
          if (payloadBase64) {
            const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
            if (decoded.email) {
              email = decoded.email
              firstName = decoded.given_name || decoded.name?.split(' ')[0] || 'Google'
              lastName = decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || 'User'
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Valid email is required for Google Sign-In' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    firstName = (firstName || 'Google').trim()
    lastName = (lastName || 'User').trim()

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Create new user with a random secure password hash
      const randomPassword = crypto.randomBytes(32).toString('hex')
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(randomPassword),
          firstName,
          lastName,
          role: 'CUSTOMER',
        },
      })
    } else {
      // Update names if user didn't have full name set
      if (!user.firstName || user.firstName === 'Google') {
        user = await db.user.update({
          where: { id: user.id },
          data: { firstName: firstName || user.firstName, lastName: lastName || user.lastName },
        })
      }
    }

    // Ensure cart & wishlist exist
    await db.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
    await db.wishlist.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })

    // Create session token and set cookie
    const token = createSessionToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('session', token, getCookieOptions(req))

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token, // For localStorage fallback (cross-origin / iframe)
    })
  } catch (e: any) {
    console.error('Google login error:', e?.message || e)
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 500 })
  }
}
