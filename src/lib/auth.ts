import { db } from './db'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Password hashing using Node crypto (PBKDF2) — no external deps
const ITERATIONS = 100000
const KEYLEN = 64
const SALT_LEN = 16

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, 'sha512')
    .toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const verify = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, 'sha512')
    .toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verify, 'hex'))
}

// Simple signed session token (no external JWT lib needed)
const SECRET = process.env.AUTH_SECRET || 'ai-shop-secret-change-me-' + (process.env.NODE_ENV || 'dev')

export function createSessionToken(userId: string): string {
  const payload = { userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 } // 7 days
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySessionToken(token: string): { userId: string; exp: number } | null {
  try {
    const [data, sig] = token.split('.')
    if (!data || !sig) return null
    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// Cookie options are in src/lib/cookie-options.ts (needs NextRequest for proto detection)

export async function getSession(req?: any) {
  // 1. Try Authorization header (Bearer token — for iframe contexts where cookies fail)
  if (req) {
    const authHeader = req.headers?.get('authorization') || req.headers?.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const payload = verifySessionToken(token)
      if (payload) {
        const user = await db.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true },
        })
        if (user) return user
      }
    }
  }
  // 2. Fall back to cookie
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload) return null
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true },
  })
  return user
}

export async function requireUser(req?: any) {
  const user = await getSession(req)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}
