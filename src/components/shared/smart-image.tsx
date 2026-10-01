'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// Deterministic soft gradient for the loading/error fallback (first-letter, never emoji)
const GRADIENTS = [
  'from-emerald-100 to-teal-50',
  'from-amber-100 to-orange-50',
  'from-rose-100 to-pink-50',
  'from-violet-100 to-purple-50',
  'from-cyan-100 to-sky-50',
  'from-lime-100 to-green-50',
  'from-fuchsia-100 to-pink-50',
  'from-yellow-100 to-amber-50',
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

interface SmartImageProps {
  src?: string | null
  alt: string
  className?: string
  /** Label for the fallback (usually the product/category name). First letter is shown. */
  fallbackLabel?: string
  /** Use eager loading for above-the-fold images (hero, first products) */
  priority?: boolean
  /** Object fit class — defaults to object-cover */
  fit?: string
}

/**
 * One reusable image component for the entire site.
 * - Always renders a real <img> element (never text/emoji as the image)
 * - Shows a shimmer skeleton while loading
 * - On error, shows a soft gradient with the first letter (never emoji, never URL text)
 * - Uses object-cover with a fixed aspect ratio (set via className)
 */
export function SmartImage({ src, alt, className = '', fallbackLabel, priority = false, fit = 'object-cover' }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const label = fallbackLabel || alt || '?'
  const gradient = GRADIENTS[hash(label) % GRADIENTS.length]

  // No src, or error → first-letter gradient fallback
  if (!src || errored) {
    return (
      <div className={cn('relative flex items-center justify-center overflow-hidden bg-gradient-to-br', gradient, className)}>
        <span className="select-none text-2xl font-bold text-muted-foreground/40" aria-hidden>
          {label.charAt(0).toUpperCase()}
        </span>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted/30', className)}>
      {!loaded && <div className="shimmer absolute inset-0 bg-muted" />}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn('h-full w-full transition-all duration-500 group-hover:scale-105', fit, loaded ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}
