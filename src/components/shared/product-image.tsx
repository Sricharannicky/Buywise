'use client'

import { parseImages } from '@/lib/format'

// Deterministic gradient from a seed string
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

export function ProductImage({ name, images, className = '' }: { name: string; images: string; className?: string }) {
  const emoji = parseImages(images)[0] || '📦'
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length]
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <span className="select-none drop-shadow-sm" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }} aria-hidden>
        {emoji}
      </span>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />
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
