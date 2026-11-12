import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSessionToken } from '@/lib/auth'
import { getCookieOptions } from '@/lib/cookie-options'
import { cookies } from 'next/headers'

// Use the shared OTP store
const g = globalThis as unknown as {
  __buywise_otpStore?: Map<string, { code: string; expiresAt: number; attempts: number }>
}
const otpStore = g.__buywise_otpStore || new Map()

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, verification code, and new password are required' }, { status: 400 })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const cleanOtp = String(otp).trim()

    const record = otpStore.get(normalizedEmail)

    if (!record) {
      return NextResponse.json(
        { error: 'No verification code requested or code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail)
      return NextResponse.json(
        { error: 'The verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (record.attempts >= 5) {
      otpStore.delete(normalizedEmail)
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a fresh verification code.' },
        { status: 429 }
      )
    }

    if (record.code !== cleanOtp) {
      record.attempts += 1
      const remaining = 5 - record.attempts
      return NextResponse.json(
        { error: `Invalid verification code. ${remaining} attempts remaining.` },
        { status: 400 }
      )
    }

    // OTP is valid! Find user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 })
    }

    // Hash new password using PBKDF2
    const passwordHash = hashPassword(newPassword)

    // Update password in database
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    // Consume the OTP
    otpStore.delete(normalizedEmail)

    // Ensure cart & wishlist exist
    await db.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
    await db.wishlist.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })

    // Create session and set cookie
    const token = createSessionToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('session', token, getCookieOptions(req))

    // Create security notification
    try {
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'SECURITY',
          title: 'Password changed successfully',
          body: 'Your Buywise account password was successfully updated.',
        },
      })
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      ok: true,
      message: 'Password reset successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    })
  } catch (err: any) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 })
  }
}
