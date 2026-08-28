import { NextRequest } from 'next/server'

// Cookie options for cross-origin iframe/preview compatibility.
//
// The Z.ai preview panel serves the app over HTTPS but proxies through
// a Caddy gateway on HTTP (:81). The X-Forwarded-Proto header may say
// "http" even when the browser connection is HTTPS, so we can't rely on it.
//
// Solution: ALWAYS use sameSite:'none' + secure:true.
// - In the HTTPS preview: works perfectly (secure context).
// - On localhost HTTP: Chrome/Firefox treat localhost as a secure context,
//   so secure cookies work. (Safari may not, but that's an edge case for dev.)
//
// This is the standard approach for apps embedded in cross-origin iframes.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

// Keep the function for backward compat, but it always returns the same thing
export function getCookieOptions(_req: NextRequest) {
  return SESSION_COOKIE_OPTIONS
}
