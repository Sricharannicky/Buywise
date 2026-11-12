import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionToken, hashPassword } from '@/lib/auth'
import { getCookieOptions } from '@/lib/cookie-options'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const origin = req.nextUrl.origin

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=no_code_provided`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_google_client_id`)
  }

  const redirectUri = `${origin}/api/auth/google/callback`

  try {
    // 1. Exchange authorization code for tokens
    const tokenParams: Record<string, string> = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }
    if (clientSecret) {
      tokenParams.client_secret = clientSecret
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenParams),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Google token exchange failed:', errText)
      return NextResponse.redirect(`${origin}/?auth_error=token_exchange_failed`)
    }

    const tokenData = await tokenRes.json()
    const { id_token, access_token } = tokenData

    let email = ''
    let firstName = 'Google'
    let lastName = 'User'

    // 2. Fetch user profile from Google userinfo API or decode id_token
    if (access_token) {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        if (profileRes.ok) {
          const profile = await profileRes.json()
          if (profile.email) {
            email = profile.email
            firstName = profile.given_name || profile.name?.split(' ')[0] || 'Google'
            lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || 'User'
          }
        }
      } catch (profileErr) {
        console.error('Error fetching Google profile:', profileErr)
      }
    }

    // Fallback: parse id_token payload if userinfo didn't resolve email
    if (!email && id_token) {
      try {
        const payloadBase64 = id_token.split('.')[1]
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
          if (decoded.email) {
            email = decoded.email
            firstName = decoded.given_name || decoded.name?.split(' ')[0] || firstName
            lastName = decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || lastName
          }
        }
      } catch {
        // ignore
      }
    }

    if (!email) {
      return NextResponse.redirect(`${origin}/?auth_error=no_email_returned_by_google`)
    }

    const normalizedEmail = email.trim().toLowerCase()
    firstName = firstName.trim()
    lastName = lastName.trim()

    // 3. Find or create user in SQLite database
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
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
      if (!user.firstName || user.firstName === 'Google') {
        user = await db.user.update({
          where: { id: user.id },
          data: { firstName, lastName },
        })
      }
    }

    // Ensure cart & wishlist exist
    await db.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
    await db.wishlist.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })

    // 4. Create session token and set cookie
    const sessionToken = createSessionToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, getCookieOptions(req))

    return NextResponse.redirect(`${origin}/?google_auth_success=true&user=${encodeURIComponent(user.firstName)}`)
  } catch (e: any) {
    console.error('Google callback error:', e?.message || e)
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(e?.message || 'auth_failed')}`)
  }
}
