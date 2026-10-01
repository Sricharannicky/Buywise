'use client'

import { SmartImage } from './smart-image'

// Backward-compatible wrapper — accepts the old `images` JSON string format
// and extracts the first local/URL path, then delegates to SmartImage.
interface ProductImageProps {
  name: string
  images: string // JSON array like ["/products/slug.jpg"] or legacy formats
  className?: string
  priority?: boolean
}

export function ProductImage({ name, images, className = '', priority = false }: ProductImageProps) {
  let src: string | null = null
  try {
    const parsed = JSON.parse(images)
    if (Array.isArray(parsed)) {
      // Find first entry that's a local path or URL
      src = parsed.find((p: string) => typeof p === 'string' && (p.startsWith('/') || p.startsWith('http'))) || null
    }
  } catch {
    // Not JSON — check if it's a direct path/URL
    if (typeof images === 'string' && (images.startsWith('/') || images.startsWith('http'))) {
      src = images
    }
  }
  return <SmartImage src={src} alt={name} fallbackLabel={name} className={className} priority={priority} />
}

// Category image — delegates to SmartImage
export function CategoryImage({ name, imageUrl, className = '' }: { name: string; imageUrl?: string | null; className?: string }) {
  // Accept local paths (/categories/...) or URLs; reject emojis and raw text
  const src = imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http')) ? imageUrl : null
  return <SmartImage src={src} alt={name} fallbackLabel={name} className={className} />
}

// Keep CategoryIcon for backward compat — but now renders nothing (use CategoryImage instead)
export function CategoryIcon({ emoji, className = '' }: { emoji?: string | null; className?: string }) {
  return null
}
