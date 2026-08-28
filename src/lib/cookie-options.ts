import { NextRequest } from 'next/server'

// Cookie options that work in preview iframes (cross-origin).
// sameSite:'none' + secure:true allows the cookie to be sent with
// cross-origin fetch requests, which is essential when the app is
// embedded in an iframe (e.g. the Z.ai preview panel).
// We detect HTTPS via the X-Forwarded-Proto header (set by the gateway)
// and only set secure:true when the connection is HTTPS.
export function getCookieOptions(req: NextRequest) {
  const forwardedProto = req.headers.get('x-forwarded-proto') || ''
  const isHttps = forwardedProto === 'https' || req.nextUrl.protocol === 'https:'
  return {
    httpOnly: true,
    sameSite: isHttps ? ('none' as const) : ('lax' as const),
    secure: isHttps,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }
}

// Default options for cases where we don't have the request (e.g. logout)
// Use the most permissive settings that work in HTTPS preview contexts.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}
