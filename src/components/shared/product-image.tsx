'use client'

import { useState } from 'react'
import { parseImages } from '@/lib/format'

// Deterministic gradient for emoji fallback
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
  images: string // JSON array: [realUrl?, emojiFallback]
  className?: string
  priority?: boolean
}

export function ProductImage({ name, images, className = '', priority = false }: ProductImageProps) {
  const parsed = parseImages(images)
  const realUrl = parsed[0]
  const emoji = parsed[1] || parsed[0] || '📦'
  const isUrl = realUrl && (realUrl.startsWith('http://') || realUrl.startsWith('https://'))
  const [errored, setErrored] = useState(false)
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length]

  // No real URL or it failed → render emoji gradient placeholder
  if (!isUrl || errored) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
        <span className="select-none drop-shadow-sm" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }} aria-hidden>
          {emoji}
        </span>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />
      </div>
    )
  }

  // Real image with lazy loading + async decode for smooth UX
  return (
    <div className={`relative overflow-hidden bg-muted/30 ${className}`}>
      <img
        src={realUrl}
        alt={name}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setErrored(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  )
}

export function CategoryIcon({ emoji, className = '' }: { emoji?: string | null; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {emoji || '🏷️'}
    </span>
  )
}
