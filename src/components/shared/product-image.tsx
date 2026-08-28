'use client'

import { useState, useEffect } from 'react'
import { parseImages } from '@/lib/format'

// Deterministic gradient for emoji fallback (only shown if real image fails permanently)
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

interface ProductImageProps {
  name: string
  images: string // JSON array: [realUrl?, emojiFallback?]
  className?: string
  priority?: boolean
}

export function ProductImage({ name, images, className = '', priority = false }: ProductImageProps) {
  const parsed = parseImages(images)
  // Find the first entry that is a real URL
  const realUrl = parsed.find((p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://')))
  const emoji = parsed.find((p) => typeof p === 'string' && !p.startsWith('http')) || '📦'
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length]

  // No real URL → emoji fallback immediately
  if (!realUrl || errored) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
        <span className="select-none drop-shadow-sm" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }} aria-hidden>
          {emoji}
        </span>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />
      </div>
    )
  }

  // Real image with shimmer skeleton while loading
  return (
    <div className={`relative overflow-hidden bg-muted/40 ${className}`}>
      {!loaded && (
        <div className="shimmer absolute inset-0 bg-muted" />
      )}
      <img
        src={realUrl}
        alt={name}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// Category image — renders a real photo if imageUrl is a URL, otherwise the emoji
export function CategoryIcon({ emoji, className = '' }: { emoji?: string | null; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {emoji || '🏷️'}
    </span>
  )
}

// Category image component — shows real photo or gradient+emoji fallback
export function CategoryImage({ name, imageUrl, className = '' }: { name: string; imageUrl?: string | null; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const isUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length]

  if (!isUrl || errored) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
        <span className="select-none text-4xl md:text-5xl" aria-hidden>
          {imageUrl || '🏷️'}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden bg-muted/40 ${className}`}>
      {!loaded && <div className="shimmer absolute inset-0 bg-muted" />}
      <img
        src={imageUrl!}
        alt={name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
