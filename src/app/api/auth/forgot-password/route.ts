import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Persistent in-memory OTP store across hot reloads
const g = globalThis as unknown as {
  __buywise_otpStore?: Map<string, { code: string; expiresAt: number; attempts: number }>
}
if (!g.__buywise_otpStore) {
  g.__buywise_otpStore = new Map()
}
const otpStore = g.__buywise_otpStore!

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please check your spelling or sign up.' },
        { status: 404 }
      )
    }

    // Generate 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    otpStore.set(normalizedEmail, {
      code,
      expiresAt,
      attempts: 0,
    })

    // Create an in-app security notification for the user
    try {
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'SECURITY',
          title: 'Password Reset OTP',
          body: `Your verification code is ${code}. It expires in 10 minutes.`,
        },
      })
    } catch {
      // Non-blocking notification creation
    }

    console.log(`[Buywise Auth] Generated Password Reset OTP for ${normalizedEmail}: ${code}`)

    return NextResponse.json({
      ok: true,
      message: 'A 6-digit verification code has been sent to your email.',
      devCode: code, // For instant development testing and friendly UX
    })
  } catch (err: any) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 })
  }
}
